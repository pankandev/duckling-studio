import enum
import uuid

import sqlalchemy as sa
from sqlalchemy.orm import Mapped, relationship, column_property, mapped_column

from models.base import SQLModelBase, IdMixin, TimestampMixin
from models.sqlalchemy_utils import IdInteger, IdUUID, generate_uuid4


class TrainTestSplit(enum.Enum):
    TRAIN = "train"
    TEST = "test"


class TextClassifierDataset(SQLModelBase, IdMixin, TimestampMixin):
    """
    A dataset containing labeled texts used for training text classifiers.

    This model represents the container for a collection of labeled text examples
    that can be used to train, validate, and test text classification models.
    """

    __tablename__ = "text_classifier_datasets"

    display_name: Mapped[str] = mapped_column(sa.String(1024), nullable=False)
    """
    Human-readable name for the dataset that will be displayed in the UI.
    """

    labels: Mapped[list['TextClassifierDatasetLabel']] = relationship(order_by='TextClassifierDatasetLabel.id')
    """
    Collection of all possible classification labels defined for this dataset.
    """


class TextClassifierDatasetItem(SQLModelBase, IdMixin, TimestampMixin):
    """
    An individual text example with its assigned classification label.

    Each item represents a single text that has been or will be classified
    according to one of the labels defined in the parent dataset.
    """

    __tablename__ = "text_classifier_dataset_items"

    dataset_id: Mapped[int] = mapped_column(IdInteger, sa.ForeignKey(TextClassifierDataset.id, ondelete='CASCADE'),
                                            nullable=False)
    """
    Foreign key reference to the parent TextClassifierDataset this item belongs to.
    """

    text_content: Mapped[str] = mapped_column(sa.String(), nullable=False)
    """
    The actual text content to be classified during model training or inference.
    """

    dataset_label_id: Mapped[uuid.UUID] = mapped_column(IdUUID, nullable=True)
    """
    Foreign key reference to the specific label assigned to this text item.
    Can be null if the item hasn't been labeled yet.
    """

    split: Mapped[TrainTestSplit | None] = mapped_column(sa.Enum(TrainTestSplit), nullable=True)
    """
    Designates whether this item belongs to the training or test dataset split.
    Used to properly evaluate model performance on unseen data.
    """

    label: Mapped['TextClassifierDatasetLabel'] = relationship(
        'TextClassifierDatasetLabel',
        foreign_keys=[dataset_id, dataset_label_id],
    )
    """
    Relationship to the TextClassifierDatasetLabel object representing this item's classification.
    """

    __table_args__ = (
        sa.ForeignKeyConstraint(
            columns=[
                dataset_id,
                dataset_label_id
            ],
            refcolumns=[
                'text_classifier_dataset_labels.dataset_id',
                'text_classifier_dataset_labels.dataset_label_id'
            ],
            ondelete='SET NULL'
        ),
        sa.Index(
            'text_classifier_dataset_items_dataset_id_created_at_idx',
            dataset_id,
            sa.desc('created_at')
        )
    )


class TextClassifierDatasetLabel(SQLModelBase, IdMixin, TimestampMixin):
    """
    A classification category used to label text items within a dataset.

    Each label represents a distinct classification category that can be assigned
    to text items. Labels are specific to a particular dataset.
    """

    __tablename__ = "text_classifier_dataset_labels"

    dataset_id: Mapped[int] = mapped_column(IdInteger, sa.ForeignKey(TextClassifierDataset.id, ondelete='CASCADE'),
                                            nullable=False)
    """
    Foreign key reference to the parent TextClassifierDataset this label belongs to.
    """

    dataset_label_id: Mapped[uuid.UUID] = mapped_column(IdUUID, nullable=False, server_default=generate_uuid4())
    """
    Unique identifier for this label within its dataset.
    Uses UUID to ensure uniqueness across different datasets.
    """

    label: Mapped[str] = mapped_column(sa.String(256), nullable=False)
    """
    The text name of this classification label (e.g., "Positive", "Negative", "Spam").
    """

    color: Mapped[str] = mapped_column(sa.String(256), nullable=True)
    """
    Hex color code or color name used for visual representation of this label in the UI.
    """

    dataset: Mapped[TextClassifierDataset] = relationship(
        TextClassifierDataset,
        back_populates='labels'
    )
    """
    Relationship to the parent dataset this label belongs to.
    """

    item_count: Mapped[int] = column_property(
        sa.select(sa.func.count(TextClassifierDatasetItem.id))
        .where(
            sa.and_(
                TextClassifierDatasetItem.dataset_id == sa.orm.foreign(dataset_id),
                TextClassifierDatasetItem.dataset_label_id == sa.orm.foreign(dataset_label_id)
            )
        )
        .correlate_except(TextClassifierDatasetItem)
        .scalar_subquery()
    )
    """
    Computed property that counts how many text items have been assigned this label.
    This helps track label distribution across the dataset.
    """

    __table_args__ = (
        sa.UniqueConstraint(
            dataset_id,
            dataset_label_id
        ),
    )
