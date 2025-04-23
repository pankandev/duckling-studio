import uuid

from pydantic import BaseModel

from models import TextClassifierDataset, TextClassifierDatasetItem, TextClassifierDatasetLabel

class DatasetLabelLiteResource(BaseModel):
    id: uuid.UUID
    label: str

    @staticmethod
    def from_sql(label: TextClassifierDatasetLabel) -> 'DatasetLabelLiteResource':
        return DatasetLabelLiteResource(
            label=label.label,
            id=label.dataset_label_id,
        )

class DatasetLabelResource(DatasetLabelLiteResource):
    item_count: int

    @staticmethod
    def from_sql(label: TextClassifierDatasetLabel) -> 'DatasetLabelResource':
        return DatasetLabelResource(
            label=label.label,
            id=label.dataset_label_id,
            item_count=label.item_count
        )

class DatasetResource(BaseModel):
    id: int
    display_name: str
    labels: list[DatasetLabelResource]

    @staticmethod
    def from_sql(dataset: TextClassifierDataset) -> 'DatasetResource':
        return DatasetResource(
            id=dataset.id,
            display_name=dataset.display_name,
            labels=[DatasetLabelResource.from_sql(label) for label in dataset.labels]
        )


class DatasetItemResource(BaseModel):
    id: int
    text_content: str
    label: DatasetLabelLiteResource | None

    @staticmethod
    def from_sql(item: TextClassifierDatasetItem) -> 'DatasetItemResource':
        return DatasetItemResource(
            id=item.id,
            text_content=item.text_content,
            label=DatasetLabelLiteResource.from_sql(item.label) if item.label is not None else None
        )
