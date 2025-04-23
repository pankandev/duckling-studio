import datetime

import sqlalchemy as sa
from sqlalchemy.orm import declarative_base, mapped_column, Mapped

from models.sqlalchemy_utils import IdInteger

SQLModelBase = declarative_base()


class TimestampMixin:
    created_at: Mapped[datetime.datetime] = mapped_column(sa.DateTime, server_default=sa.func.now())
    updated_at: Mapped[datetime.datetime] = mapped_column(sa.DateTime, server_default=sa.func.now(), server_onupdate=sa.func.now())


class IdMixin:
    id: Mapped[int] = mapped_column(IdInteger, primary_key=True)
