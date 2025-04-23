import uuid

import pandas as pd
import sqlalchemy as sa

import typing

from fastapi import APIRouter, UploadFile, File, Form, BackgroundTasks
from fastapi.params import Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from resources.dataset import DatasetResource, DatasetItemResource
from services.db import get_db
from models import TextClassifierDataset, TextClassifierDatasetItem, TextClassifierDatasetLabel
from utils.responses import SingleItemResponse, ListItemResponse

router = APIRouter()


class DatasetCreateResponse(BaseModel):
    dataset_id: int


def process_csv_into_dataset(dataset_id: int, csv_file: UploadFile):
    # TODO: save import processes in the database to track progress and errors.

    # load csv and check if it meets the right format
    df = pd.read_csv(csv_file.file)
    if 'text' not in df.columns:
        raise ValueError('CSV file must contain a "text" column')

    if 'label' not in df.columns:
        raise ValueError('CSV file must contain a "label" column')

    with get_db() as session:
        # insert all the labels
        label_ids_by_label: dict[str, uuid.UUID] = {}
        for label in df['label'].unique():
            if not isinstance(label, str):
                continue

            label_id = session.execute(
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
            label_ids_by_label[label] = label_id

        # insert all the items
        for _, row in df.iterrows():
            label_id = label_ids_by_label.get(row['label'])

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
        session: Session = Depends(get_db),
        display_name: str = Form(...),
        csv_file: typing.Optional[UploadFile] = File(None),
):
    """
    Creates a dataset.
    :param background_tasks: The background tasks
    :param session: The database session
    :param display_name: The name of the dataset
    :param csv_file: The CSV file. It must contain a 'text' column and a 'label' column

    :return: The created dataset.
    """

    # create dataset
    dataset = session.execute(
        sa.insert(
            TextClassifierDataset
        ).values({
            TextClassifierDataset.display_name: display_name,
        }).returning(TextClassifierDataset)
    ).scalar_one()

    # if csv file is provided, insert its data in the background
    if csv_file is not None:
        if csv_file.content_type != 'text/csv':
            raise ValueError('CSV file must be of type text/csv')
        background_tasks.add_task(process_csv_into_dataset, dataset.id, csv_file)

    # build response
    dataset_resource = DatasetResource.from_sql(dataset)
    session.commit()

    return SingleItemResponse(
        item=dataset_resource
    )


@router.get('/datasets')
async def list_datasets(session: Session = Depends(get_db)):
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


@router.get('/datasets/{dataset_id}/items/')
async def list_dataset_items(dataset_id: int, session: Session = Depends(get_db)):
    """
    Lists all the items in a dataset.
    :param dataset_id: The id of the dataset
    :param session: The database session

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
            ).scalars().all()
        ]
    )



class UpdateDatasetItemRequest(BaseModel):
    text_content: str | None = None
    """
    The text content of the item
    """

    label: str | None = None
    """
    The label of the item
    """

@router.patch('/dataset-items/{item_id}/')
async def update_dataset_item_label(dataset_id: int, item_id: int, update: UpdateDatasetItemRequest, session: Session = Depends(get_db)):
    """
    Updates the label of a dataset item.
    :param dataset_id: The id of the dataset
    :param item_id: The id of the item
    :param update: The update
    :param session: The database session

    :return: The updated item
    """

    update_dict: dict = {}
    if update.text_content is not None:
        update_dict[TextClassifierDatasetItem.text_content] = update.text_content

    if update.label is not None:
        update_dict[TextClassifierDatasetItem.dataset_label_id] = update.label

    item = session.execute(
        sa.update(TextClassifierDatasetItem)
        .where(TextClassifierDatasetItem.id == item_id)
        .values(update_dict)
        .returning(TextClassifierDatasetItem)
    ).scalar_one()
    session.commit()

    return SingleItemResponse(item=DatasetItemResource.from_sql(item))
