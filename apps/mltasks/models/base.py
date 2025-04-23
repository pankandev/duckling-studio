import sqlalchemy as sa

from sqlalchemy.orm import declarative_base

from models.sqlalchemy_utils import IdInteger

SQLModelBase = declarative_base()


class TimestampMixin:
    created_at = sa.Column(sa.DateTime, server_default=sa.func.now())
    updated_at = sa.Column(sa.DateTime, server_default=sa.func.now(), server_onupdate=sa.func.now())

class IdMixin:
    id = sa.Column(IdInteger, primary_key=True)
