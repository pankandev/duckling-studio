from typing import Annotated

import sqlalchemy as sa
from fastapi.params import Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from models import TextClassifierDatasetItem, TextClassifierDatasetLabel
from resources.dataset import DatasetItemResource
from routers.datasets.router import router
from services.app_error import AppError
from services.db import get_db
from utils.responses import SingleItemResponse


class UpdateDatasetItemRequest(BaseModel):
    text_content: str | None = None
    """
    The text content of the item
    """

    label_id: str | None = None
    """
    The ID of the label to set the item to
    """


@router.patch('/dataset-items/{item_id}/')
async def update_dataset_item_label(
        item_id: int,
        update: UpdateDatasetItemRequest,
        session: Annotated[Session, Depends(get_db)]
):
    """
    Updates the label and/or text of a dataset item.

    :return: The updated item
    """

    update_dict: dict = {}
    if update.text_content is not None:
        update_dict[TextClassifierDatasetItem.text_content] = update.text_content

    if update.label_id is not None:
        update_dict[TextClassifierDatasetItem.dataset_label_id] = update.label_id

    if len(update_dict) == 0:
        raise AppError(
            error_code='No updated requested',
            status_code=400,
            message=f'No updates found',
            details={}
        )

    dataset_id = session.execute(
        sa.select(TextClassifierDatasetItem.dataset_id)
        .where(TextClassifierDatasetItem.id == item_id)
    ).scalar_one_or_none()
    if dataset_id is None:
        raise AppError(
            error_code='not_found',
            status_code=404,
            message=f'Item {item_id} not found',
            details={}
        )

    if update.label_id is not None:
        label = session.execute(
            sa.select(TextClassifierDatasetLabel.id)
            .where(TextClassifierDatasetLabel.dataset_id == dataset_id)
            .where(TextClassifierDatasetLabel.dataset_label_id == update.label_id)
        ).scalar_one_or_none()
        if label is None:
            raise AppError(
                error_code='not_found',
                status_code=404,
                message=f'Label {update.label_id} not found in dataset {dataset_id}',
                details={}
            )

    item = session.execute(
        sa.update(TextClassifierDatasetItem)
        .where(TextClassifierDatasetItem.id == item_id)
        .values(update_dict)
        .returning(TextClassifierDatasetItem)
    ).scalar_one()
    session.commit()

    return SingleItemResponse(item=DatasetItemResource.from_sql(item))
