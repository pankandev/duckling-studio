import sqlalchemy as sa

from typing import Annotated

from fastapi import Depends
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from models import TextClassifierDatasetItem
from models.datasets import TrainTestSplit
from routers.datasets.router import router
from services.db import get_db


class TrainTestSplitRequest(BaseModel):
    train_percentage: float = Field(0.8, gt=0, lt=1)
    """
    Percentage of the dataset to use for training. Must be a number between 0 and 1.
    Default is 0.8 (80% training, 20% testing).
    """

    preserve_existing_splits: bool = False
    """
    If True, only items without an existing train/test assignment will be updated.
    If False (default), all items will be reassigned according to the new split ratio.
    """


class TrainTestSplitResponse(BaseModel):
    train_count: int
    test_count: int
    total_count: int


@router.post('/datasets/{dataset_id}/train-test-split')
def handle_train_test_split(
        dataset_id: int,
        request: TrainTestSplitRequest,
        session: Annotated[Session, Depends(get_db)]
) -> TrainTestSplitResponse:
    filter_: sa.ColumnElement[bool]
    if request.preserve_existing_splits:
        filter_ = sa.and_(TextClassifierDatasetItem.split.is_(None), TextClassifierDatasetItem.dataset_id == dataset_id)
    else:
        filter_ = TextClassifierDatasetItem.dataset_id == dataset_id
    total_count = session.query(sa.func.count(TextClassifierDatasetItem.id)).filter(filter_).scalar()

    # enumerate all valid rows randomly
    cte = session.query(
        TextClassifierDatasetItem.id,
        sa.func.row_number().over(order_by=sa.func.random()).label('row_number'),
        sa.literal(total_count).label('total'),
    ).filter(filter_).cte('rows')

    # assign train/test splits
    update_stmt = (
        sa
        .update(TextClassifierDatasetItem)
        .values(
            split=sa.case(
                ( # type: ignore
                    cte.c.row_number <= sa.func.floor(cte.c.total * request.train_percentage),
                    sa.cast(TrainTestSplit.TRAIN.name, sa.Enum(TrainTestSplit))
                ),
                else_=sa.cast(TrainTestSplit.TEST.name, sa.Enum(TrainTestSplit))
            )
        )
        .where(TextClassifierDatasetItem.id == cte.c.id)
    )
    session.execute(update_stmt)

    # count train/test items
    train_count = session.query(sa.func.count(TextClassifierDatasetItem.id)).filter(
        sa.and_(
            TextClassifierDatasetItem.split == TrainTestSplit.TRAIN,
            TextClassifierDatasetItem.dataset_id == dataset_id
        )
    ).scalar()

    test_count = session.query(sa.func.count(TextClassifierDatasetItem.id)).filter(
        sa.and_(
            TextClassifierDatasetItem.split == TrainTestSplit.TEST,
            TextClassifierDatasetItem.dataset_id == dataset_id
        )
    ).scalar()

    total_count = session.query(sa.func.count(TextClassifierDatasetItem.id)).filter(
        TextClassifierDatasetItem.dataset_id == dataset_id
    ).scalar()

    session.commit()

    return TrainTestSplitResponse(
        train_count=train_count,
        test_count=test_count,
        total_count=total_count
    )
