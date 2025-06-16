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

def delete_tables():
    cursor.execute("DELETE * FROM users")
    conn.commit()

def get_hashed_pass(username: str) -> str:
    cursor.execute("SELECT password_hash FROM users WHERE username = %s", (username,))
    result = cursor.fetchone()
    if result:
        return result[0]
    return None

def check_user_exists(username: str) -> bool:
    cursor.execute("SELECT * FROM users WHERE username = %s", (username,))
    result = cursor.fetchone()
    if result:
        return True
    else:
        return False

def check_user_login(check_pass: str, real_pass:str) -> bool:


def add_user(username: str, password_hash: str):
    cursor.execute("INSERT INTO users (username, password_hash) VALUES (%s, %s)", (username, password_hash))
    conn.commit()

def close():
    cursor.close()
    conn.close()

def commit():
    conn.commit()