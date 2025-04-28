import sqlalchemy as sa
from datasets import DatasetDict
from sqlalchemy.orm import Session, subqueryload
from torch.utils.data import IterableDataset
from transformers import (
    PreTrainedTokenizerBase
)

from models import TextClassifierDataset, TextClassifierDatasetItem
from models.datasets import TrainTestSplit
from models.models import TextClassifierModel
from services.app_error import AppError
from services.db import SessionLocal


def get_dataset(session: Session, model_id: int) -> TextClassifierDataset:
    """
    Retrieve the dataset associated with a given model ID.

    Parameters
    ----------
    session : Session
        SQLAlchemy database session.
    model_id : int
        ID of the model whose dataset is to be retrieved.

    Returns
    -------
    TextClassifierDataset
        Dataset associated with the model.

    Raises
    ------
    AppError
        If no model or dataset is found.
    """
    dataset = session.execute(
        sa.select(TextClassifierDataset)
        .select_from(TextClassifierModel)
        .where(TextClassifierModel.id == model_id)
        .join(TextClassifierDataset, TextClassifierModel.dataset_id == TextClassifierDataset.id)
        .options(subqueryload(TextClassifierDataset.labels))
    ).scalar_one_or_none()

    if dataset is None:
        raise AppError(
            error_code='not_found',
            status_code=404,
            details={"id": model_id},
            message=f"Model {model_id} not found"
        )

    return dataset


class PostgresDataset(IterableDataset):
    """
    Iterable Dataset that streams batches of text and labels from a Postgres database.

    Parameters
    ----------
    dataset_id : int
        ID of the dataset.
    split : TrainTestSplit
        Dataset split (TRAIN or TEST).
    tokenizer : PreTrainedTokenizerBase
        Tokenizer to encode the text.
    label2id : dict[str, int]
        Mapping from label strings to IDs.
    batch_size : int, optional
        Number of examples to load at a time (default is 100).
    """

    def __init__(
            self,
            dataset_id: int,
            split: TrainTestSplit,
            tokenizer: PreTrainedTokenizerBase,
            label2id: dict[str, int],
            batch_size: int = 100
    ):
        self._dataset_id = dataset_id
        self._split = split
        self._tokenizer = tokenizer
        self._batch_size = batch_size
        self._label2id = label2id

    def __iter__(self):
        """Iterate through the dataset items."""
        offset = 0

        while True:
            query = sa.text("""
                SELECT tcdi.text_content, tcdl.label
                FROM text_classifier_dataset_items tcdi
                LEFT JOIN text_classifier_dataset_labels tcdl
                    ON tcdi.dataset_label_id = tcdl.dataset_label_id AND tcdi.dataset_id = tcdl.dataset_id
                WHERE tcdi.dataset_id = :dataset_id
                    AND tcdi.split = :split
                    AND tcdi.dataset_label_id IS NOT NULL
                OFFSET :offset
                LIMIT :limit
            """)
            session = SessionLocal()
            rows = session.execute(
                query,
                {
                    "dataset_id": self._dataset_id,
                    "split": self._split.name,
                    "offset": offset,
                    "limit": self._batch_size
                }
            ).all()

            n = len(rows)
            if n == 0:
                session.close()
                break

            for text, label in rows:
                row = self._tokenizer(text, truncation=True, padding=True)
                row["label"] = self._label2id[label]
                yield row

            offset += n
            session.close()

    def __len__(self):
        """Return the number of dataset items."""
        session = SessionLocal()

        count = session.execute(
            sa.select(sa.func.count(TextClassifierDatasetItem.id))
            .where(TextClassifierDatasetItem.dataset_id == self._dataset_id)
            .where(TextClassifierDatasetItem.split == self._split)
            .where(TextClassifierDatasetItem.dataset_label_id.isnot(None))
        ).scalar_one_or_none()

        session.close()

        return count if count is not None else 0


def create_dataset_for_split(
    dataset_id: int,
    split: TrainTestSplit,
    tokenizer: PreTrainedTokenizerBase,
    label2id: dict[str, int]
) -> PostgresDataset:
    """
    Create a PostgresDataset for a specific split (TRAIN or TEST).

    Parameters
    ----------
    dataset_id : int
        ID of the dataset.
    split : TrainTestSplit
        Dataset split (TRAIN or TEST).
    tokenizer : PreTrainedTokenizerBase
        Tokenizer instance.
    label2id : dict[str, int]
        Label-to-ID mapping.

    Returns
    -------
    PostgresDataset
        Iterable dataset for the given split.
    """
    return PostgresDataset(dataset_id, split, tokenizer, label2id)


def load_dataset_items(dataset_id: int, tokenizer: PreTrainedTokenizerBase, label2id: dict[str, int]) -> DatasetDict:
    """
    Load dataset items for training and evaluation.

    Parameters
    ----------
    dataset_id : int
        ID of the dataset.
    tokenizer : PreTrainedTokenizerBase
        Tokenizer instance.
    label2id : dict[str, int]
        Label-to-ID mapping.

    Returns
    -------
    DatasetDict
        Dictionary containing train and test datasets.
    """
    train = create_dataset_for_split(dataset_id, TrainTestSplit.TRAIN, tokenizer, label2id)
    test = create_dataset_for_split(dataset_id, TrainTestSplit.TEST, tokenizer, label2id)
    return DatasetDict({"train": train, "test": test})
