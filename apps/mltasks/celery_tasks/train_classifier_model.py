import typing

from celery_tasks.app import celery_app
from celery_tasks.classifier_models.dataset import get_dataset
from celery_tasks.classifier_models.trainer import train_classifier_pipeline, TextClassifierConfiguration
from services.db import SessionLocal


@celery_app.task
def train_classifier_model(model_id: int):
    """Main task function to train a text classifier model."""

    # Get dataset and validate
    session = SessionLocal()
    dataset = get_dataset(session, model_id)
    labels = [typing.cast(str, label.label) for label in dataset.labels]
    session.close()

    train_classifier_pipeline(
        TextClassifierConfiguration(
            dataset_id=dataset.id,
            labels=labels
        )
    )
