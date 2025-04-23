from typing import Annotated

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
        session: Annotated[Session, Depends(get_db)],
        offset: Annotated[int, Query(ge=0, description="Starting position")] = 0,
        limit: Annotated[int, Query(le=100, description="Maximum number of items to return.")] = 20
):
    """
    Lists all the items in a dataset.

    :return: A list of items
    """

    # TODO: Change to page_after_id query instead of offset. Offset is too slow for big datasets
    # reference: https://stackoverflow.com/questions/26625614/select-query-with-offset-limit-is-much-too-slow
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
