import sqlalchemy as sa
from fastapi.params import Depends
from sqlalchemy.orm import Session

from models import TextClassifierDataset
from resources.dataset import DatasetItemResource, DatasetResource
from routers.datasets.router import router
from services.app_error import AppError
from services.db import get_db
from utils.responses import SingleItemResponse


@router.delete('/datasets/{dataset_id}')
async def delete_dataset(
        dataset_id: int,
        session: Session = Depends(get_db),
):
    item = session.execute(
        sa.delete(TextClassifierDataset)
        .where(TextClassifierDataset.id == dataset_id)
        .returning(TextClassifierDataset)
    ).scalar_one_or_none()
    if item is None:
        raise AppError(
            error_code='not_found',
            status_code=404,
            details={"id": dataset_id},
            message=f"Dataset {dataset_id} not found"
        )
    resource = DatasetResource.from_sql(item)
    session.commit()


    return SingleItemResponse(
        item=resource
    )
