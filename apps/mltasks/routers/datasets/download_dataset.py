import datetime
import io
from io import TextIOWrapper
from typing import Annotated

import sqlalchemy as sa
from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session
from starlette.responses import StreamingResponse, FileResponse

from models import TextClassifierDatasetItem, TextClassifierDatasetLabel, TextClassifierDataset
from routers.datasets.router import router
from services.db import get_db


@router.post('/datasets/{dataset_id}/download/', tags=['datasets'])
async def download_dataset(
        dataset_id: int,
        session: Annotated[Session, Depends(get_db)]
):
    dataset_name = session.execute(
        sa.select(
            TextClassifierDataset.display_name
        ).where(
            TextClassifierDataset.id == dataset_id
        )
    ).scalar_one_or_none()
    if dataset_name is None:
        raise HTTPException(
            status_code=404,
            detail="Dataset not found"
        )

    query = (sa.select(
        TextClassifierDatasetItem.text_content.label('content'),
        TextClassifierDatasetLabel.label.label('label')
    )
    .join(TextClassifierDatasetLabel, TextClassifierDatasetItem.dataset_label_id == TextClassifierDatasetLabel.dataset_label_id)
    .where(TextClassifierDatasetItem.dataset_id == dataset_id).compile(
        compile_kwargs={"literal_binds": True}
    ))
    connection = session.connection().connection

    copy_query = f"COPY ({query}) TO STDOUT WITH CSV HEADER"
    csv_buffer = io.StringIO()
    cursor = connection.cursor()
    cursor.copy_expert(copy_query, csv_buffer)
    csv_buffer.seek(0)

    timestamp_str = datetime.datetime.now().strftime('%d-%m-%Y-%H%M%S')

    return StreamingResponse(
        iter([csv_buffer.getvalue()]),
        media_type='text/csv',
        headers={
            'Content-Disposition': f'attachment; filename="{dataset_name}_{timestamp_str}.csv"'
        }
    )
