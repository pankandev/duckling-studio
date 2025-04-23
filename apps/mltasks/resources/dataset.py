from pydantic import BaseModel

from models import TextClassifierDataset, TextClassifierDatasetItem


class DatasetResource(BaseModel):
    id: int
    display_name: str

    @staticmethod
    def from_sql(dataset: TextClassifierDataset) -> 'DatasetResource':
        return DatasetResource(
            id=dataset.id,
            display_name=dataset.display_name
        )


class DatasetItemResource(BaseModel):
    id: int
    text_content: str
    label: str | None

    @staticmethod
    def from_sql(item: TextClassifierDatasetItem) -> 'DatasetItemResource':
        return DatasetItemResource(
            id=item.id,
            text_content=item.text_content,
            label=item.label.label if item.label is not None else None
        )
