import psycopg2
import os
from dotenv import load_dotenv
from database.encryption import hashing, encrypt

load_dotenv()

def get_db_connection():
    try:
        return psycopg2.connect(
            host=os.environ.get("HOST"), 
            dbname=os.environ.get("NAME"), 
            user=os.environ.get("DB_USER"), 
            password=os.environ.get("PASSWORD")
        )
    except Exception as e:
        print(f"Error connecting to database: {e}")
        raise e

def reset_connection():
    global conn, cursor
    try:
        if cursor:
            cursor.close()
        if conn:
            if conn.closed == 0:  # if connection is still open
                conn.rollback()  # rollback any pending transaction
                conn.close()
        conn = get_db_connection()
        cursor = conn.cursor()
    except Exception as e:
        print(f"Error resetting connection: {e}")
        raise e

# Initialize connection and cursor
conn = get_db_connection()
cursor = conn.cursor()

def create_tables():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    schema_path = os.path.join(base_dir, "sql", "schema.sql")
    with open(schema_path, "r") as f:
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

def add_course(user_id: int, gradescope_id: int, course_name: str):
    try:
        course_pk = get_id_from_gs_id_or_create(gradescope_id)

        cursor.execute(
            "INSERT INTO user_courses (user_id, course_id, status, name) VALUES (%s, %s, %s, %s)",
            (user_id, course_pk, "scrape_not_started", course_name)
        )

        conn.commit()
    except Exception as e:
        conn.rollback()
        raise e

# given a gradescope id, either returns the existing course with that id, or creates a new course, and returns that id
def get_id_from_gs_id_or_create(gradescope_id: int):
    cursor.execute("SELECT id FROM courses WHERE gradescope_id = %s", (gradescope_id,))
    existing_course = cursor.fetchone()

    if existing_course:
        # course already exists, return id
        return existing_course[0]
    else:
        # create new course, and return it's id
        cursor.execute(
            "INSERT INTO courses (gradescope_id) VALUES (%s)",
            (gradescope_id,)
        )
        conn.commit()
        cursor.execute("SELECT id FROM courses WHERE gradescope_id = %s", (gradescope_id,))
        return cursor.fetchone()[0]

def delete_course(id: int):
    try:
        cursor.execute("DELETE FROM ta_question_stats WHERE question_id IN (SELECT id FROM questions WHERE assignment_id IN (SELECT id FROM assignments WHERE course_id = %s))", (id,))
        cursor.execute("DELETE FROM tas WHERE course_id = %s", (id,))
        cursor.execute("DELETE FROM user_courses WHERE course_id = %s", (id,))
        cursor.execute("DELETE FROM questions WHERE assignment_id IN (SELECT id FROM assignments WHERE course_id = %s)", (id,))
        cursor.execute("DELETE FROM assignments WHERE course_id = %s", (id,))
        cursor.execute("DELETE FROM courses WHERE id = %s", (id,))
    except Exception as e:
        conn.rollback()
        raise e
    conn.commit()

def get_courses(username: str):
    try:
        cursor.execute(
            "SELECT courses.id, courses.gradescope_id, user_courses.name, user_courses.status FROM courses JOIN user_courses ON courses.id = user_courses.course_id JOIN users ON user_courses.user_id = users.id WHERE users.username = %s",
            (username,)
        )
        return cursor.fetchall()
    except Exception as e:
        conn.rollback()  
        return None

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

def update_course_title_by_id(id: int, title: str):
    cursor.execute("UPDATE user_courses SET name = %s WHERE course_id = %s", (title, id))
    conn.commit()

def update_gs_id_by_id(id: int, gs_id: int):
    cursor.execute("UPDATE courses SET gradescope_id = %s WHERE id = %s", (gs_id, id))
    conn.commit()

def add_assignment(course_pk: int, name: str, gradescope_id: int, percent_graded: str, ws_link: str):
    cursor.execute(
        "INSERT INTO assignments (course_id, gradescope_id,  name, percent_graded, ws_link) VALUES (%s, %s, %s, %s, %s)",
        (course_pk, gradescope_id, name, percent_graded, ws_link)
    )
    conn.commit()

def get_assignments_by_course_id(course_id: int):
    cursor.execute("SELECT * FROM assignments WHERE course_id = %s", (course_id,))
    return cursor.fetchall()

def add_question(assignment_id: int, question_link: str):
    cursor.execute(
        "INSERT INTO questions (assignment_id, qs_link) VALUES (%s, %s)",
        (assignment_id, question_link)
    )
    conn.commit()

def get_tas_by_course_id(course_id: int):
    cursor.execute("SELECT * FROM tas WHERE course_id = %s", (course_id,))
    return cursor.fetchall()

def get_questions_by_assignment_id(assignment_id: int):
    cursor.execute("SELECT * FROM questions WHERE assignment_id = %s", (assignment_id,))
    return cursor.fetchall()

def add_ta_question_stats(ta_id: int, question_id: int, count: int):
    cursor.execute(
        "INSERT INTO ta_question_stats (ta_id, question_id, graded_count) VALUES (%s, %s, %s)",
        (ta_id, question_id, count)
    )
    conn.commit()

def update_assignment_percent_graded(assignment_id: int, percent_graded: str):
    cursor.execute("UPDATE assignments SET percent_graded = %s WHERE id = %s", (percent_graded, assignment_id))
    conn.commit()

def clear_assignment_data(assignment_id: int):
    cursor.execute("DELETE FROM ta_question_stats WHERE question_id IN (SELECT id FROM questions WHERE assignment_id = %s)", (assignment_id,))
    conn.commit()

def close():
    cursor.close()
    conn.close()

def commit():
    conn.commit()