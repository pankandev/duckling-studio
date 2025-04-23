import datetime

import sqlalchemy as sa

from sqlalchemy.orm import declarative_base, MappedColumn

from models.sqlalchemy_utils import IdInteger

SQLModelBase = declarative_base()


class TimestampMixin:
    created_at: MappedColumn[datetime.datetime] = sa.Column(sa.DateTime, server_default=sa.func.now())
    updated_at: MappedColumn[datetime.datetime] = sa.Column(sa.DateTime, server_default=sa.func.now(), server_onupdate=sa.func.now())

class IdMixin:
    id: MappedColumn[int] = sa.Column(IdInteger, primary_key=True)
