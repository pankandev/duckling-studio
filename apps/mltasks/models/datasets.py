import uuid

import sqlalchemy as sa
from sqlalchemy.orm import Mapped, relationship, column_property, mapped_column

from models.base import SQLModelBase, IdMixin, TimestampMixin
from models.sqlalchemy_utils import IdInteger, IdUUID, generate_uuid4


class TextClassifierDataset(SQLModelBase, IdMixin, TimestampMixin):
    """
    A dataset that holds labeled texts that will be used to train a new classifier.
    """

    __tablename__ = "text_classifier_datasets"

    display_name: Mapped[str] = mapped_column(sa.Column(sa.String(1024), nullable=False))
    """
    The human-readable name of this dataset.
    """

    labels: Mapped[list['TextClassifierDatasetLabel']] = relationship()

class TextClassifierDatasetItem(SQLModelBase, IdMixin, TimestampMixin):
    """
    A dataset text item. This is a labeled text that will be used to train a new classifier.
    """

    __tablename__ = "text_classifier_dataset_items"

    dataset_id: Mapped[int] = mapped_column(sa.Column(IdInteger, sa.ForeignKey(TextClassifierDataset.id), nullable=False))
    """
    The dataset this item belongs to.
    """

    text_content: Mapped[str] = mapped_column(sa.Column(sa.String(), nullable=False))
    """
    The text that will be classified.
    """

    dataset_label_id: Mapped[uuid.UUID] = mapped_column(sa.Column(IdUUID, nullable=True))
    """
    The ID of the label this item is classified as.
    """

    label: Mapped['TextClassifierDatasetLabel'] = relationship(
        'TextClassifierDatasetLabel',
        foreign_keys=[dataset_id, dataset_label_id],
    )
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
                'text_classifier_dataset_labels.dataset_id',
                'text_classifier_dataset_labels.dataset_label_id'
            ]
        ),
        sa.Index(
            'text_classifier_dataset_items_dataset_id_created_at_idx',
            dataset_id,
            sa.desc('created_at')
        )
    )


class TextClassifierDatasetLabel(SQLModelBase, IdMixin, TimestampMixin):
    """
    A dataset item label. Text items will be labeled with one of these labels.
    """

    __tablename__ = "text_classifier_dataset_labels"

    dataset_id: Mapped[int] = mapped_column(sa.Column(IdInteger, sa.ForeignKey(TextClassifierDataset.id), nullable=False))
    """
    The dataset this label is associated with.
    """

    dataset_label_id: Mapped[uuid.UUID] = mapped_column(sa.Column(IdUUID, nullable=False, server_default=generate_uuid4()))
    """
    The dataset label id. This is unique per dataset.
    """

    label: Mapped[str] = mapped_column(sa.Column(sa.String(256), nullable=False))
    """
    The label name.
    """

    color: Mapped[str] = mapped_column(sa.Column(sa.String(256), nullable=True))
    """
    The color associated with this label.
    """

    dataset: Mapped[TextClassifierDataset] = relationship(
        TextClassifierDataset,
        back_populates='labels'
    )

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

    __table_args__ = (
        sa.UniqueConstraint(
            dataset_id,
            dataset_label_id
        ),
    )

