from celery_app import celery
from scrape import fetch_course_data
from database import driver

@celery.task
def scrape_course(course_id):
    # scrape course data using the provided course ID
    pass # we will implement this later