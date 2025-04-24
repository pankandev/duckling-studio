from typing import Annotated

import sqlalchemy as sa

from fastapi import Depends, BackgroundTasks
from sqlalchemy.orm import Session
from transformers import AutoTokenizer, Trainer, AutoModelForSequenceClassification

from models import TextClassifierDataset, TextClassifierDatasetItem
from models.models import TextClassifierModel
from resources.model import ModelResource
from routers.models.router import router
from services.app_error import AppError
from services.db import get_db, SessionLocal
from utils.responses import SingleItemResponse


def train_model(model_id: int):
    db = SessionLocal()

    # preprocess the text
    tokenizer = AutoTokenizer.from_pretrained("distilbert/distilbert-base-uncased")
    model = AutoModelForSequenceClassification.from_pretrained(
        "distilbert/distilbert-base-uncased", num_labels=2, id2label=id2label, label2id=label2id
    )
    trainer = Trainer(
        model=model,
        
    )
    tokenizer()

    db.close()



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

    background_tasks.add_task(train_model, model.id)

    return SingleItemResponse(
        item=model_resource
    )
