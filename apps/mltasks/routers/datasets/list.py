from typing import Annotated

import sqlalchemy as sa
from fastapi.params import Depends
from sqlalchemy.orm import Session

from models import TextClassifierDataset
from resources.dataset import DatasetResource
from routers.datasets.router import router
from services.db import get_db
from utils.responses import ListItemResponse


@router.get('/datasets')
async def list_datasets(
        session: Annotated[Session, Depends(get_db)]
):
    """
    Lists all the datasets in the database.
    :param session: The database session

    :return: A list of datasets
    """

    return ListItemResponse(
        items=[
            DatasetResource.from_sql(dataset)
            for dataset in session.execute(
                sa
                .select(TextClassifierDataset)
                .order_by(TextClassifierDataset.created_at.desc())
            ).scalars().all()
        ]
    )
