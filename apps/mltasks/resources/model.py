import datetime

from pydantic import BaseModel

from models.models import ModelStatus, TextClassifierModel


class ModelResource(BaseModel):
    status: ModelStatus
    created_at: datetime.datetime
    updated_at: datetime.datetime

    @staticmethod
    def from_sql(model: TextClassifierModel) -> 'ModelResource':
        return ModelResource(
            status=model.status,
            created_at=model.created_at,
            updated_at=model.updated_at
        )
