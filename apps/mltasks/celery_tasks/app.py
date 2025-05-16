import os

import redis
from celery import Celery
from kombu.serialization import register

from celery_tasks.pydanticserializer import pydantic_dumps, pydantic_loads

register(
    "pydantic",
    pydantic_dumps,
    pydantic_loads,
    content_type='application/x-pydantic',
    content_encoding='utf-8',
)

redis_url = os.environ.get('REDIS_URL', 'redis://localhost:6379/0')
redis_client = redis.from_url(redis_url)

celery_app = Celery(
    'duckling_tasks',
    broker=redis_url,
    backend=redis_url
)

celery_app.conf.update(
    task_serializer="pydantic",
    result_serializer="pydantic",
    event_serializer="pydantic",
    accept_content=["application/json", "application/x-pydantic"],
    result_accept_content=["application/json", "application/x-pydantic"],
)
