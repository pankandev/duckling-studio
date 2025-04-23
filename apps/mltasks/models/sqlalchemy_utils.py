import uuid

import sqlalchemy as sa
from sqlalchemy.engine.default import DefaultExecutionContext
from sqlalchemy.ext.compiler import compiles

IdInteger = sa.BigInteger().with_variant(sa.Integer(), "sqlite")
IdUUID = sa.UUID(as_uuid=True).with_variant(sa.String(256), "sqlite")




class generate_uuid4(sa.FunctionElement):
    pass


def generate_uuid_local(context: DefaultExecutionContext):
    if context.dialect.name == 'sqlite':
        return str(uuid.uuid4())
    return uuid.uuid4()


@compiles(generate_uuid4, 'postgresql')
def pg_generate_uuid4(element, compiler, **kw):
    return "uuid_generate_v4()"


@compiles(generate_uuid4, 'sqlite')
def sqlite_generate_uuid4(element, compiler, **kw):
    return None
