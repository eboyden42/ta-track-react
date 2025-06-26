from celery import Celery
import os
from dotenv import load_dotenv

load_dotenv()

celery = Celery(
    "ta_tracker",
    broker=os.getenv("CELERY_BROKER_URL"),
    backend=os.getenv("CELERY_RESULT_BACKEND")
)

celery.conf.update(
    task_track_started=True,
    task_time_limit=300,
)
