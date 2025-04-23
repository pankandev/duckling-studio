import uuid
from typing import Annotated

import pandas as pd
import sqlalchemy as sa
from fastapi import UploadFile, File, Form, BackgroundTasks
from fastapi.params import Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from models import TextClassifierDataset, TextClassifierDatasetItem, TextClassifierDatasetLabel
from resources.dataset import DatasetResource
from routers.datasets.router import router
from services.app_error import AppError
from services.db import get_db, SessionLocal
from utils.responses import SingleItemResponse


class DatasetCreateResponse(BaseModel):
    dataset_id: int


def process_csv_into_dataset(dataset_id: int, df: pd.DataFrame):
    # TODO: save import processes in the database to track progress and errors.

    session = SessionLocal()

    # insert all the labels
    label_ids_by_label: dict[str, uuid.UUID] = {}
    for label in df['label'].unique():
        if not isinstance(label, str):
            continue

        this_label_id = session.execute(
            sa
            .insert(
                TextClassifierDatasetLabel
            )
            .values({
                TextClassifierDatasetLabel.dataset_id: dataset_id,
                TextClassifierDatasetLabel.label: label,
            })
            .returning(TextClassifierDatasetLabel.dataset_label_id)
        ).scalar_one()
        label_ids_by_label[label] = this_label_id

    # insert all the items
    for _, row in df.iterrows():
        row_label = row['label']
        if not isinstance(row_label, str):
            continue
        label_id = label_ids_by_label.get(row_label)

        session.execute(
            sa.insert(
                TextClassifierDatasetItem
            ).values({
                TextClassifierDatasetItem.dataset_id: dataset_id,
                TextClassifierDatasetItem.text_content: row['text'],
                TextClassifierDatasetItem.dataset_label_id: label_id,
            })
        )

    session.commit()


@router.post('/datasets')
async def create_new_dataset(
        background_tasks: BackgroundTasks,
        session: Annotated[Session, Depends(get_db)],
        display_name: Annotated[str, Form(...)],
        csv_file: Annotated[UploadFile | None, File(...)] = None,
):
    """
    Creates a dataset.
    :param background_tasks: The background tasks
    :param session: The database session
    :param display_name: The name of the dataset
    :param csv_file: The CSV file. It must contain a 'text' column and a 'label' column

    :return: The created dataset.
    """

    # if csv file is provided, insert its data in the background
    df: pd.DataFrame | None = None
    if csv_file is not None:
        if csv_file.content_type not in {'text/csv', 'application/vnd.ms-excel'}:
            raise AppError(
                status_code=400,
                error_code='bad_request',
                message='CSV file must be a CSV file',
                details={
                    'content_type': csv_file.content_type
                }
            )

        df = pd.read_csv(csv_file.file)

        if 'text' not in df.columns:
            raise AppError(
                status_code=400,
                error_code='bad_request',
                message='CSV file must contain a "text" column',
                details={
                    'columns': list(df.columns)
                }
            )

        if 'label' not in df.columns:
            raise AppError(
                status_code=400,
                error_code='bad_request',
                message='CSV file must contain a "label" column',
                details={
                    'columns': list(df.columns)
                }
            )

    # create dataset
    dataset = session.execute(
        sa.insert(
            TextClassifierDataset
        ).values({
            TextClassifierDataset.display_name: display_name,
        }).returning(TextClassifierDataset)
    ).scalar_one()
    if df is not None:
        background_tasks.add_task(process_csv_into_dataset, dataset.id, df)

    # build response
    dataset_resource = DatasetResource.from_sql(dataset)
    session.commit()

    return SingleItemResponse(
        item=dataset_resource
    )
