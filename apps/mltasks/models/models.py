import enum
import typing
import uuid

import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column

from models import SQLModelBase, TextClassifierDataset
from models.base import IdMixin, TimestampMixin
from models.sqlalchemy_utils import IdUUID, IdInteger, generate_uuid4


class ModelStatus(str, enum.Enum):
    IDLE = 'idle'
    TRAINING = 'training'
    TRAINED = 'trained'
    FAILED = 'failed'


class TextClassifierModel(SQLModelBase, IdMixin, TimestampMixin):
    __tablename__ = 'text_classifier_models'

    dataset_id: Mapped[int] = mapped_column(IdInteger, sa.ForeignKey(TextClassifierDataset.id, ondelete='CASCADE'),
                                            nullable=False)
    dataset_model_id: Mapped[uuid.UUID] = mapped_column(IdUUID, nullable=False, server_default=generate_uuid4())

    status: Mapped[ModelStatus] = mapped_column(sa.Enum(ModelStatus), nullable=False,
                                                server_default=ModelStatus.IDLE.value, index=True)
    celery_task_id: Mapped[uuid.UUID] = mapped_column(IdUUID, nullable=True)


class TextClassifierModelMetric(SQLModelBase, IdMixin, TimestampMixin):
    __tablename__ = 'text_classifier_model_metrics'

    model_id: Mapped[int] = mapped_column(IdInteger, sa.ForeignKey(TextClassifierModel.id, ondelete='CASCADE'),
                                          nullable=False)

    name: Mapped[str] = mapped_column(sa.String(256), nullable=False, index=True)
    value: Mapped[typing.Any] = mapped_column(sa.JSON(), nullable=False)
