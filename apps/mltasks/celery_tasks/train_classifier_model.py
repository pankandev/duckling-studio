import enum
import typing

from celery import Task

from celery_tasks.app import celery_app
from celery_tasks.classifier_models.dataset import get_dataset
from celery_tasks.classifier_models.trainer import train_classifier_pipeline, TextClassifierConfiguration, \
    TextClassifierTrainingArguments
from services.db import SessionLocal


class TextClassifierType(str, enum.Enum):
    HUGGING_FACE = "hugging_face"


@celery_app.task
class TrainClassifierTask(Task):

    def run(self: Task, model_id: int, model_type: TextClassifierType, training_args: TextClassifierTrainingArguments | None = None):
        """Train a text classifier model."""

        training_args = training_args if training_args is not None else TextClassifierTrainingArguments()

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
                labels=labels,
                training_args=training_args
            )
        )


train_classifier_model = celery_app.register_task(TrainClassifierTask())
