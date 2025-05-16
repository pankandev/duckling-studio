import datetime
import typing

from pydantic import BaseModel

from models.models import ModelStatus, TextClassifierModel


class ModelResultResource(BaseModel):
    trainAccuracy: float
    evaluationAccuracy: float
    metrics: dict[str, typing.Any]


class ModelResource(BaseModel):
    id: int
    status: ModelStatus
    mlflowPath: str | None

    config: dict[str, typing.Any]
    createdAt: datetime.datetime
    updatedAt: datetime.datetime

    result: ModelResultResource | None = None

    @staticmethod
    def from_sql(model: TextClassifierModel) -> 'ModelResource':
        if model.status == ModelStatus.TRAINED:
            result = ModelResultResource(
                metrics={},
                trainAccuracy=0.0,
                evaluationAccuracy=0.0,
            )
        else:
            result = None
        return ModelResource(
            id=model.id,
            mlflowPath=None,
            config={},
            status=model.status,
            createdAt=model.created_at,
            updatedAt=model.updated_at,
            result=result,
        )
