import os

import redis
from celery import Celery

redis_url = os.environ.get('REDIS_URL', 'redis://localhost:6379/0')
redis_client = redis.from_url(redis_url)

celery_app = Celery(
    'duckling_tasks',
    broker=redis_url,
    backend=redis_url
)

