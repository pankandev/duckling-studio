import datetime
import typing

from pydantic import BaseModel

from models.models import ModelStatus, TextClassifierModel, TextClassifierModelMetric


class ModelMetricResource(BaseModel):
    type: str
    value: float

    @classmethod
    def from_sql(cls, metric: TextClassifierModelMetric) -> 'ModelMetricResource':
        return ModelMetricResource(
            type=metric.name,
            value=metric.value,
        )


class ModelResultResource(BaseModel):
    metrics: list[ModelMetricResource]


class ModelResource(BaseModel):
    id: int
    status: ModelStatus
    mlflowRunId: str | None

    config: dict[str, typing.Any]
    createdAt: datetime.datetime
    updatedAt: datetime.datetime

    result: ModelResultResource | None = None

    @staticmethod
    def from_sql(model: TextClassifierModel) -> 'ModelResource':
        if model.status == ModelStatus.TRAINED:
            result = ModelResultResource(
                metrics=[
                    ModelMetricResource.from_sql(metric)
                    for metric in model.metrics
                ],
            )
        else:
            result = None
        return ModelResource(
            id=model.id,
            mlflowRunId=model.mlflow_run_id,
            config=model.config,
            status=model.status,
            createdAt=model.created_at,
            updatedAt=model.updated_at,
            result=result,
        )
