import uuid

import sqlalchemy as sa
from sqlalchemy.orm import MappedColumn, relationship

from models.base import SQLModelBase, IdMixin, TimestampMixin
from models.sqlalchemy_utils import IdInteger, IdUUID, generate_uuid4


class TextClassifierDataset(SQLModelBase, IdMixin, TimestampMixin):
    """
    A dataset that holds labeled texts that will be used to train a new classifier.
    """

    __tablename__ = "text_classifier_datasets"

    display_name: MappedColumn[str] = sa.Column(sa.String(1024), nullable=False)
    """
    The human-readable name of this dataset.
    """


class TextClassifierDatasetLabel(SQLModelBase, IdMixin, TimestampMixin):
    """
    A dataset item label. Text items will be labeled with one of these labels.
    """

    __tablename__ = "text_classifier_dataset_labels"

    dataset_id: MappedColumn[int] = sa.Column(IdInteger, sa.ForeignKey(TextClassifierDataset.id), nullable=False)
    """
    The dataset this label is associated with.
    """

    dataset_label_id: MappedColumn[uuid.UUID] = sa.Column(IdUUID, nullable=False, server_default=generate_uuid4())
    """
    The dataset label id. This is unique per dataset.
    """

    label: MappedColumn[str] = sa.Column(sa.String(256), nullable=False)
    """
    The label name.
    """

    color: MappedColumn[str] = sa.Column(sa.String(256), nullable=True)
    """
    The color associated with this label.
    """

    __table_args__ = (
        sa.UniqueConstraint(
            dataset_id,
            dataset_label_id
        ),
    )


class TextClassifierDatasetItem(SQLModelBase, IdMixin, TimestampMixin):
    """
    A dataset text item. This is a labeled text that will be used to train a new classifier.
    """

    __tablename__ = "text_classifier_dataset_items"

    dataset_id: MappedColumn[int] = sa.Column(IdInteger, sa.ForeignKey(TextClassifierDataset.id), nullable=False)
    """
    The dataset this item belongs to.
    """

    text_content: MappedColumn[str] = sa.Column(sa.String(), nullable=False)
    """
    The text that will be classified.
    """

    dataset_label_id: MappedColumn[uuid.UUID] = sa.Column(IdUUID, nullable=True)
    """
    The ID of the label this item is classified as.
    """

    label: MappedColumn[TextClassifierDatasetLabel] = relationship(TextClassifierDatasetLabel, foreign_keys=[dataset_id, dataset_label_id])
    """
    The label this item is classified as.
    """

    __table_args__ = (
        sa.ForeignKeyConstraint(
            columns=[
                dataset_id,
                dataset_label_id
            ],
            refcolumns=[
                TextClassifierDatasetLabel.dataset_id,
                TextClassifierDatasetLabel.dataset_label_id
            ]
        ),
    )
