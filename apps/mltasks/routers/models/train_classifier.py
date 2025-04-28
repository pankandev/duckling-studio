from typing import Annotated

import sqlalchemy as sa

from fastapi import Depends, BackgroundTasks
from sqlalchemy.orm import Session
from transformers import AutoTokenizer, Trainer, AutoModelForSequenceClassification

from celery_tasks.train_classifier_model import train_classifier_model
from models import TextClassifierDataset, TextClassifierDatasetItem
from models.models import TextClassifierModel
from resources.model import ModelResource
from routers.models.router import router
from services.app_error import AppError
from services.db import get_db, SessionLocal
from utils.responses import SingleItemResponse



@router.post('/datasets/{dataset_id}/train')
def train_classifier(
        dataset_id: int,
        session: Annotated[Session, Depends(get_db)],
        background_tasks: BackgroundTasks
):
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
        sa.insert(TextClassifierModel).returning(TextClassifierModel)
    ).scalar_one()
    model_resource = ModelResource.from_sql(model)
    session.commit()

    train_classifier_model.delay(model.id)

    return SingleItemResponse(
        item=model_resource
    )
