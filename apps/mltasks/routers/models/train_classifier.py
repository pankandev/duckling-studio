from typing import Annotated

import sqlalchemy as sa
from celery.result import AsyncResult
from fastapi import Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from celery_tasks.classifier_models.text_classifier_training_arguments import TextClassifierTrainingArguments
from celery_tasks.train_classifier_model import train_classifier_model, TextClassifierType
from models import TextClassifierDataset
from models.models import TextClassifierModel
from resources.model import ModelResource
from routers.models.router import router
from services.app_error import AppError
from services.db import get_db
from utils.responses import SingleItemResponse


class TrainModelRequest(BaseModel):
    type: TextClassifierType = TextClassifierType.HUGGING_FACE
    training_args: TextClassifierTrainingArguments | None = None


@router.post('/datasets/{dataset_id}/models/')
def train_classifier(dataset_id: int, body: TrainModelRequest, session: Annotated[Session, Depends(get_db)]):
    """
    Trains a classifier model based on a given dataset.
    """

    dataset = session.execute(
        sa.select(TextClassifierDataset.id).where(TextClassifierDataset.id == dataset_id)
    ).scalar_one_or_none()

    if dataset is None:
        raise AppError(
            error_code='not_found',
            status_code=404,
            details={"id": dataset_id},
            message=f"Dataset {dataset_id} not found"
        )
    model = session.execute(
        sa.insert(TextClassifierModel).values({
            TextClassifierModel.dataset_id: dataset_id,
        }).returning(TextClassifierModel)
    ).scalar_one()
    model_resource = ModelResource.from_sql(model)

    task: AsyncResult = train_classifier_model.delay(model.id, body.type, body.training_args)

    session.execute(
        sa.update(TextClassifierModel)
        .where(TextClassifierModel.id == model.id)
        .values({
            TextClassifierModel.celery_task_id: task.id
        })
    )
    session.commit()

    return SingleItemResponse(
        item=model_resource
    )
