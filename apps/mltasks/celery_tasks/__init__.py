import celery_tasks.train_classifier_model
from celery_tasks.app import celery_app

__all__ = ["celery_app"]
