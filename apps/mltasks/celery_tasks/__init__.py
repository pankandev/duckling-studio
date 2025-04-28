import logging
import os

import mlflow

import celery_tasks.train_classifier_model
from celery_tasks.app import celery_app

MLFLOW_TRACKING_SERVER_URL = os.environ.get("MLFLOW_TRACKING_SERVER_URL")
if MLFLOW_TRACKING_SERVER_URL is not None:
    mlflow.set_tracking_uri(uri=MLFLOW_TRACKING_SERVER_URL)
    logging.info(f"Set MLflow tracking server URL to {MLFLOW_TRACKING_SERVER_URL}")

__all__ = ["celery_app"]
