import enum
import typing

from celery import Task

from celery_tasks.app import celery_app
from celery_tasks.classifier_models.dataset import get_dataset
from celery_tasks.classifier_models.trainer import train_classifier_pipeline, TextClassifierConfiguration
from services.db import SessionLocal


class ModelType(str, enum.Enum):
    TEXT_CLASSIFIER = "text_classifier"


@celery_app.task
def train_classifier_model(self: Task, model_id: int):
    """Main task function to train a text classifier model."""

    # Get dataset and validate
    session = SessionLocal()
    dataset = get_dataset(session, model_id)
    if dataset is None:
        self.update_state(
            state='FAILURE',
            meta={
                "error": {
                    "code": "dataset-not-found",
                    "message": "No dataset found",
                    "details": {
                        "model_id": model_id
                    }
                }
            }
        )
        session.close()
        return

    labels = [typing.cast(str, label.label) for label in dataset.labels]
    session.close()

    train_classifier_pipeline(
        TextClassifierConfiguration(
            run_name=f'text_classifier_model_{model_id}',
            dataset_id=dataset.id,
            labels=labels
        )
    )
