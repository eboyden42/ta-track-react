import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()  # Load environment variables from .env file

db_password = os.environ.get("PASSWORD")
conn = psycopg2.connect(host="localhost", dbname="postgres", user="postgres", password=db_password)
cursor = conn.cursor()

def create_tables():
    with open("./sql/schema.sql", "r") as f:
        cursor.execute(f.read())
    conn.commit()

def add_user(username: str, password_hash: str):
    cursor.execute("INSERT INTO users (username, password_hash) VALUES (%s, %s)", (username, password_hash))
    conn.commit()

def close():
    cursor.close()
    conn.close()

def commit():
    conn.commit()