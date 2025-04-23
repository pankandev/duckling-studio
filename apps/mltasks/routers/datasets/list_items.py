import sqlalchemy as sa
from fastapi.params import Depends, Query
from sqlalchemy.orm import Session, joinedload

from models import TextClassifierDatasetItem
from resources.dataset import DatasetItemResource
from routers.datasets.router import router
from services.db import get_db
from utils.responses import ListItemResponse


@router.get('/datasets/{dataset_id}/items/', tags=['datasets'])
async def list_dataset_items(
        dataset_id: int,
        session: Session = Depends(get_db),
        offset: int = Query(0, ge=0, description="Starting position"),
        limit: int = Query(20, le=100, description="Maximum number of items to return.")):
    """
    Lists all the items in a dataset.

    :return: A list of items
    """

    return ListItemResponse(
        items=[
            DatasetItemResource.from_sql(item)
            for item in session.execute(
                sa
                .select(TextClassifierDatasetItem)
                .where(TextClassifierDatasetItem.dataset_id == dataset_id)
                .order_by(TextClassifierDatasetItem.created_at.desc())
                .offset(offset)
                .limit(limit)
                .options(
                    joinedload(TextClassifierDatasetItem.label)
                )
            )
            .scalars().all()
        ]
    )
