import psycopg2
import os
from dotenv import load_dotenv
from .encryption import hashing, encrypt

load_dotenv()

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

def drop_all_tables():
    cursor.execute("""
        DROP TABLE IF EXISTS 
            ta_question_history,
            ta_question_stats,
            tas,
            questions,
            assignments,
            user_courses,
            courses,
            users
        CASCADE;
    """)
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
        "INSERT INTO user_courses (user_id, course_id, status) VALUES ((SELECT id FROM users WHERE username = %s), (SELECT id FROM courses WHERE gradescope_id = %s), (%s))",
        (username, course_id, "scrape_not_started")
    )
    conn.commit()

def delete_course(id: int):
    try:
        cursor.execute("DELETE FROM user_courses WHERE course_id = %s", (id,))
        cursor.execute("DELETE FROM courses WHERE id = %s", (id,))
    except Exception as e:
        conn.rollback()
        raise e
    conn.commit()

def get_courses(username: str):
    cursor.execute(
        "SELECT courses.id, courses.gradescope_id, courses.name, user_courses.status FROM courses JOIN user_courses ON courses.id = user_courses.course_id JOIN users ON user_courses.user_id = users.id WHERE users.username = %s",
        (username,)
    )
    return cursor.fetchall()

def get_course_by_id(course_pk: int):
    cursor.execute("SELECT * FROM courses WHERE id = %s", (course_pk,))
    return cursor.fetchone()

# add emails later
def add_ta(course_id: int, name: str):
    cursor.execute("INSERT INTO tas (course_id, name) VALUES (%s, %s)", (course_id, name))
    conn.commit()

def get_status_by_id(course_id: int):
    cursor.execute("SELECT status FROM user_courses WHERE course_id = %s", (course_id,))
    return cursor.fetchone()

def update_status_by_id(course_id: int, status: str):
    cursor.execute("UPDATE user_courses SET status = %s WHERE course_id = %s", (status, course_id))
    conn.commit()

def close():
    cursor.close()
    conn.close()

def commit():
    conn.commit()