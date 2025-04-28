import dataclasses

import evaluate
import numpy as np
from datasets import DatasetDict
from transformers import (
    PreTrainedTokenizerBase,
    DataCollatorWithPadding,
    TrainingArguments,
    Trainer, AutoModelForSequenceClassification, AutoTokenizer
)

from celery_tasks.classifier_models.dataset import load_dataset_items


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
class TextClassifierConfiguration:
    dataset_id: int
    labels: list[str]
    learning_rate: float = 1e-5
    dropout: float = 0.1
    attention_dropout: float = 0.1
    weight_decay: float = 0.02
    num_train_epochs: int = 7



def train_classifier_pipeline(config: TextClassifierConfiguration):
    # Process labels
    all_labels, id2label, label2id = process_labels(config.labels)

    # Load and prepare data
    tokenizer = AutoTokenizer.from_pretrained("distilbert/distilbert-base-uncased")
    hf_dataset = load_dataset_items(config.dataset_id, tokenizer, label2id)

    # load model
    model = AutoModelForSequenceClassification.from_pretrained(
        "distilbert/distilbert-base-uncased",
        num_labels=len(all_labels),
        id2label=id2label,
        label2id=label2id,
        dropout=config.dropout,
        attention_dropout=config.attention_dropout,
    )

    # Setup training
    data_collator = DataCollatorWithPadding(tokenizer=tokenizer)
    training_args = TrainingArguments(
        learning_rate=config.learning_rate,
        per_device_train_batch_size=16,
        per_device_eval_batch_size=16,
        num_train_epochs=config.num_train_epochs,
        weight_decay=config.weight_decay,
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
    )

    # Train model
    trainer.train()

    return trainer.state.best_model_checkpoint
