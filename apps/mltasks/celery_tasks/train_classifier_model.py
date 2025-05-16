import enum
import typing

from celery import Task

import sqlalchemy as sa
from sqlalchemy.orm import Session

from celery_tasks.app import celery_app
from celery_tasks.classifier_models.dataset import get_dataset
from celery_tasks.classifier_models.text_classifier_training_arguments import TextClassifierTrainingArguments, TextClassifierConfiguration
from celery_tasks.classifier_models.trainer import train_classifier_pipeline, TrainingResult
from models import ModelStatus, TextClassifierModel
from services.db import SessionLocal


class TextClassifierType(str, enum.Enum):
    HUGGING_FACE = "hugging_face"

def _update_model_status(session: Session, model_id: int, status: ModelStatus):
    session.execute(
        sa.update(TextClassifierModel)
        .where(TextClassifierModel.id == model_id)
        .values({
            TextClassifierModel.status: status
        })
    )


@celery_app.task
class TrainClassifierTask(Task):

    def run(self: Task, model_id: int, model_type: TextClassifierType, training_args: TextClassifierTrainingArguments | None = None):
        """Train a text classifier model."""

        training_args = training_args if training_args is not None else TextClassifierTrainingArguments()

        session = SessionLocal()
        dataset = get_dataset(session, model_id)
        if dataset is None:
            _update_model_status(session, model_id, ModelStatus.FAILED)
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
            session.commit()
            session.close()
            return

        labels = [typing.cast(str, label.label) for label in dataset.labels]
        dataset_id = dataset.id

        _update_model_status(session, model_id, ModelStatus.TRAINING)
        session.commit()
        session.close()

        result: TrainingResult
        try:
            result = train_classifier_pipeline(
                TextClassifierConfiguration(
                    run_name=f'text_classifier_model_{model_id}',
                    dataset_id=dataset_id,
                    labels=labels,
                    training_args=training_args
                )
            )
        except Exception as e:
            session = SessionLocal()
            _update_model_status(session, model_id, ModelStatus.FAILED)
            session.commit()
            session.close()
            raise e

        session = SessionLocal()
        _update_model_status(session, model_id, ModelStatus.TRAINED)
        session.commit()
        session.close()


train_classifier_model = celery_app.register_task(TrainClassifierTask())
