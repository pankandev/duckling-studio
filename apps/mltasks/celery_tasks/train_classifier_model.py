import sqlalchemy as sa
from sqlalchemy.orm import load_only

from transformers import AutoTokenizer, AutoModelForSequenceClassification, TrainingArguments, Trainer
from transformers.pipelines.base import Dataset

from celery_tasks.app import celery_app
from models import TextClassifierDatasetLabel, TextClassifierDataset
from models.models import TextClassifierModel
from services.app_error import AppError
from services.db import SessionLocal



class PostgresDataset(Dataset):
    def __init__(self):
        self.text = text
        self.label = label


@celery_app.task
def train_classifier_model(model_id: int):
    session = SessionLocal()

    dataset = session.execute(
        sa.select(TextClassifierDataset)
        .select_from(TextClassifierModel)
        .where(TextClassifierModel.id == model_id)
        .join(TextClassifierDataset, TextClassifierModel.dataset_id == TextClassifierDataset.id)
        .options(
            load_only(TextClassifierDataset.labels),
            sa.joinedload(TextClassifierDataset.labels)
        )
    ).scalar_one_or_none()

    if dataset is None:
        raise AppError(
            error_code='not_found',
            status_code=404,
            details={"id": model_id},
            message=f"Model {model_id} not found"
        )

    # process labels
    labels: list[str] = [label.label for label in dataset.labels]
    id2label = {i: label for i, label in enumerate(labels)}
    label2id = {label: i for i, label in enumerate(labels)}

    # preprocess the text
    tokenizer = AutoTokenizer.from_pretrained("distilbert/distilbert-base-uncased")
    model = AutoModelForSequenceClassification.from_pretrained(
        "distilbert/distilbert-base-uncased",
        num_labels=len(labels),
        id2label=id2label,
        label2id=label2id
    )
    training_args = TrainingArguments(
        output_dir="my_awesome_model",
        learning_rate=2e-5,
        per_device_train_batch_size=16,
        per_device_eval_batch_size=16,
        num_train_epochs=2,
        weight_decay=0.01,
        eval_strategy="epoch",
        save_strategy="epoch",
        load_best_model_at_end=True,
        push_to_hub=False,
    )
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=TextClassifierDatasetItem,
        eval_dataset=TextClassifierDatasetItem
    )

    # train the model

    session.close()

