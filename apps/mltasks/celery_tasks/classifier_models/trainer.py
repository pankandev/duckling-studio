import dataclasses
import typing

import evaluate
import mlflow
import numpy as np
from datasets import DatasetDict
from transformers import (
    PreTrainedTokenizerBase,
    DataCollatorWithPadding,
    TrainingArguments,
    Trainer, AutoModelForSequenceClassification, AutoTokenizer
)
from transformers.integrations import MLflowCallback
from transformers.utils import logging as hf_logging

from celery_tasks.classifier_models.dataset import load_dataset_items


hf_logging.set_verbosity(hf_logging.WARNING)
hf_logging.disable_progress_bar()


def process_labels(labels: list[str]) -> tuple[list[str], dict[int, str], dict[str, int]]:
    """
    Process labels from a dataset into required formats for classification.

    Parameters
    ----------
    labels : list[str]
        The labels to process.

    Returns
    -------
    tuple
        - list of labels,
        - id-to-label mapping (dict),
        - label-to-id mapping (dict).
    """
    id2label = {i: label for i, label in enumerate(labels)}
    label2id = {label: i for i, label in enumerate(labels)}
    return labels, id2label, label2id


def compute_metrics(eval_pred: tuple[np.ndarray, np.ndarray]) -> dict[str, float]:
    """
    Compute evaluation metrics for the model predictions.

    Parameters
    ----------
    eval_pred : tuple[np.ndarray, np.ndarray]
        Tuple containing model predictions and true labels.

    Returns
    -------
    dict
        Computed metrics (accuracy).
    """
    accuracy = evaluate.load("accuracy")
    predictions, labels = eval_pred
    predictions = np.argmax(predictions, axis=1)

    return accuracy.compute(predictions=predictions, references=labels)


def create_trainer(model, tokenizer, dataset: DatasetDict) -> Trainer:
    """
    Create a HuggingFace Trainer object.

    Parameters
    ----------
    model : PreTrainedModel
        Pre-trained model for sequence classification.
    tokenizer : PreTrainedTokenizerBase
        Tokenizer for the model.
    dataset : DatasetDict
        HuggingFace DatasetDict with train and test splits.

    Returns
    -------
    Trainer
        HuggingFace Trainer instance.
    """
    data_collator = DataCollatorWithPadding(tokenizer=tokenizer)
    training_args = TrainingArguments(
        learning_rate=1e-5,
        per_device_train_batch_size=16,
        per_device_eval_batch_size=16,
        num_train_epochs=7,
        weight_decay=0.02,
        eval_strategy="epoch",
        save_strategy="epoch",
        load_best_model_at_end=True,
        push_to_hub=False,
        output_dir="./results"
    )

    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=dataset["train"],
        eval_dataset=dataset["test"],
        tokenizer=tokenizer,
        data_collator=data_collator,
        compute_metrics=compute_metrics,
    )

    return trainer

@dataclasses.dataclass
class TextClassifierTrainingArguments(TrainingArguments):
    learning_rate: float = 1e-5
    dropout: float = 0.1
    attention_dropout: float = 0.1
    weight_decay: float = 0.02
    num_train_epochs: int = 7
    model_name: str = "distilbert/distilbert-base-uncased"


@dataclasses.dataclass
class TextClassifierConfiguration:
    run_name: str
    dataset_id: int
    labels: list[str]
    training_args: TextClassifierTrainingArguments

    def to_dict_params(self) -> dict[str, typing.Any]:
        return {
            "dataset_id": self.dataset_id,
            "labels": self.labels,
            "learning_rate": self.training_args.learning_rate,
            "dropout": self.training_args.dropout,
            "attention_dropout": self.training_args.attention_dropout,
            "weight_decay": self.training_args.weight_decay,
            "num_train_epochs": self.training_args.num_train_epochs,
            "model_name": self.training_args.model_name
        }


def train_classifier_pipeline(config: TextClassifierConfiguration):
    """
    Train a classifier pipeline using a dataset from PostgreSQL.

    Parameters
    ---
    config : TextClassifierConfiguration
        Configuration for training.
    """

    config_training_args = config.training_args
    with mlflow.start_run(run_name=config.run_name):
        # Log configuration parameters
        mlflow.log_params(config.to_dict_params())

        # Process labels
        all_labels, id2label, label2id = process_labels(config.labels)

        # Load and prepare data
        tokenizer = AutoTokenizer.from_pretrained(config_training_args.model_name)
        hf_dataset = load_dataset_items(config.dataset_id, tokenizer, label2id)

        # Log labels
        mlflow.log_dict(label2id, "label2id.json")

        # load model
        model = AutoModelForSequenceClassification.from_pretrained(
            config_training_args.model_name,
            num_labels=len(all_labels),
            id2label=id2label,
            label2id=label2id,
            dropout=config_training_args.dropout,
            attention_dropout=config_training_args.attention_dropout,
        )

        # Log dataset info
        mlflow.log_dict({
            "train_size": len(hf_dataset["train"]),
            "test_size": len(hf_dataset["test"])
        }, "dataset_info.json")

        # Setup training
        data_collator = DataCollatorWithPadding(tokenizer=tokenizer)
        training_args = TrainingArguments(
            learning_rate=config_training_args.learning_rate,
            per_device_train_batch_size=16,
            per_device_eval_batch_size=16,
            num_train_epochs=config_training_args.num_train_epochs,
            weight_decay=config_training_args.weight_decay,
            eval_strategy="epoch",
            save_strategy="epoch",
            load_best_model_at_end=True,
            push_to_hub=False,
        )
        trainer: Trainer | Trainer = Trainer(
            model=model,
            args=training_args,
            train_dataset=hf_dataset["train"],
            eval_dataset=hf_dataset["test"],
            processing_class=tokenizer,
            data_collator=data_collator,
            compute_metrics=compute_metrics,
            callbacks=[
                MLflowCallback
            ]
        )

        # Train model
        trainer.train()

        if trainer.state.best_metric is not None:
            mlflow.log_metrics({
                "accuracy": trainer.state.best_metric,
            })

        if trainer.state.best_model_checkpoint is None:
            raise ValueError("No best checkpoint found.")

        mlflow.log_artifact(trainer.state.best_model_checkpoint, "best_model_checkpoint")
        mlflow.transformers.log_model(
            config_training_args.model_name,
            artifact_path="mlflow_model",
            task="text-classification",
        )

    return trainer.state.best_model_checkpoint
