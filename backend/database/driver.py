import psycopg2
import os
from dotenv import load_dotenv
from .encryption import hashing

load_dotenv()  # Load environment variables from .env file

conn = psycopg2.connect(
    host=os.environ.get("HOST"), 
    dbname=os.environ.get("NAME"), 
    user=os.environ.get("DB_USER"), 
    password=os.environ.get("PASSWORD")
)
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

def check_user_login(password: str, username:str) -> str:
    cursor.execute("SELECT password_hash FROM users WHERE username = %s", (username,))
    stored_hash = cursor.fetchone()
    if stored_hash:
        if hashing.check_password(password, stored_hash[0]):
            return "verified"
        return "failed"
    else:
        return "username not found"
    


def add_user(username: str, password_hash: str):
    cursor.execute("INSERT INTO users (username, password_hash) VALUES (%s, %s)", (username, password_hash))
    conn.commit()

def close():
    cursor.close()
    conn.close()

def commit():
    conn.commit()