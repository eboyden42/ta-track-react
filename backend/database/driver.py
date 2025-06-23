import psycopg2
import os
from dotenv import load_dotenv
from .encryption import hashing, encrypt

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
    
def get_user_id(username: str) -> int:
    cursor.execute("SELECT id FROM users WHERE username = %s", (username,))
    user_id = cursor.fetchone()
    if user_id:
        return user_id
    return -1

def get_user_by_id(id: int):
    cursor.execute("SELECT * FROM users WHERE id = %s", (id,))
    response = cursor.fetchone()
    return response

def get_gradescope_info(username: str):
    cursor.execute("SELECT gradescope_username, gradescope_password_hash FROM users WHERE username = %s", (username,))
    response = cursor.fetchone()
    if response:
        return {"gradescope_username": response[0], "gradescope_password_hash": response[1]}
    return None

def update_gradescope_info(username: str, gradescope_username: str, gradescope_password: str):
    cursor.execute(
        "UPDATE users SET gradescope_username = %s, gradescope_password_hash = %s WHERE username = %s",
        (gradescope_username, gradescope_password, username)
    )
    conn.commit()   

def add_user(username: str, password_hash: str):
    cursor.execute("INSERT INTO users (username, password_hash) VALUES (%s, %s)", (username, password_hash))
    conn.commit()

def add_course(username: str, course_id: int, course_name: str):
    cursor.execute(
        "INSERT INTO courses (gradescope_id, name) VALUES (%s, %s)",
        (course_id, course_name)
    )
    cursor.execute(
        "INSERT INTO user_courses (user_id, course_id) VALUES ((SELECT id FROM users WHERE username = %s), (SELECT id FROM courses WHERE gradescope_id = %s))",
        (username, course_id)
    )
    conn.commit()

def close():
    cursor.close()
    conn.close()

def commit():
    conn.commit()