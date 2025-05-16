from typing import Annotated

import sqlalchemy as sa

from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session

from models import TextClassifierModel, TextClassifierDataset
from resources.model import ModelResource
from routers.models.router import router
from services.db import get_db
from utils.responses import ListItemResponse


@router.get('/datasets/{dataset_id}/models/')
def list_models(dataset_id: int, session: Annotated[Session, Depends(get_db)]):
    dataset = session.execute(
        sa.select(TextClassifierDataset.id)
        .where(TextClassifierDataset.id == dataset_id)
    ).scalar_one_or_none()
    if dataset is None:
        raise HTTPException(status_code=404, detail="Dataset not found")

    models = session.execute(
        sa.select(TextClassifierModel)
        .where(TextClassifierModel.dataset_id == dataset_id)
        .order_by(TextClassifierModel.created_at.desc())
        .order_by(TextClassifierModel.status)
    ).scalars().all()

    return ListItemResponse(items=[ModelResource.from_sql(model) for model in models])
