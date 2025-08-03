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
    try:
        with open(schema_path, "r") as f:
            cursor.execute(f.read())
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise e

def drop_all_tables():
    cursor.execute("""
        DROP TABLE IF EXISTS
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

def get_username_by_id(id: int) -> str:
    try:
        cursor.execute("SELECT username FROM users WHERE id = %s", (id,))
        response = cursor.fetchone()
        if response:
            return response[0]
    except Exception as e:
        raise e
    return None

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
    try:
        cursor.execute("INSERT INTO users (username, password_hash) VALUES (%s, %s)", (username, password_hash))
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise e

def add_course(user_id: int, gradescope_id: int, course_name: str):
    try:
        course_pk = get_id_from_gs_id(gradescope_id)

        cursor.execute(
            "INSERT INTO user_courses (user_id, course_id, status, name) VALUES (%s, %s, %s, %s)",
            (user_id, course_pk, "scrape_not_started", course_name)
        )

        conn.commit()
    except Exception as e:
        conn.rollback()
        raise e

# given a gradescope id, creates a new course for that id, and returns the new primary key
def get_id_from_gs_id(gradescope_id: int):
    # create new course, and return it's id
    cursor.execute(
        "INSERT INTO courses (gradescope_id) VALUES (%s) RETURNING id",
        (gradescope_id,)
    )
    course_pk = cursor.fetchone()[0]  # Fetch the returned id
    conn.commit()
    return course_pk

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
        clear = cursor.fetchall()  # Clear any previous results
    except:
        pass
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
    try:
        cursor.execute("UPDATE user_courses SET status = %s WHERE course_id = %s", (status, course_id))
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise e

def update_course_title_by_id(id: int, title: str):
    try:
        cursor.execute("UPDATE user_courses SET name = %s WHERE course_id = %s", (title, id))
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise e

def update_gs_id_by_id(id: int, gs_id: int):
    try:
        cursor.execute("UPDATE courses SET gradescope_id = %s WHERE id = %s", (gs_id, id))
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise e

def add_assignment(course_pk: int, name: str, gradescope_id: int, percent_graded: str, ws_link: str):
    try:
        cursor.execute(
            "INSERT INTO assignments (course_id, gradescope_id, name, percent_graded, ws_link) VALUES (%s, %s, %s, %s, %s)",
            (course_pk, gradescope_id, name, percent_graded, ws_link)
        )
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise e

def get_assignments_by_course_id(course_id: int):
    cursor.execute("SELECT * FROM assignments WHERE course_id = %s", (course_id,))
    return cursor.fetchall()

def add_question(assignment_id: int, question_link: str):
    try:
        cursor.execute(
            "INSERT INTO questions (assignment_id, qs_link) VALUES (%s, %s)",
            (assignment_id, question_link)
        )
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise e

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
    try:
        cursor.execute("UPDATE assignments SET percent_graded = %s WHERE id = %s", (percent_graded, assignment_id))
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise e

def clear_assignment_data(assignment_id: int):
    try:
        cursor.execute("DELETE FROM ta_question_stats WHERE question_id IN (SELECT id FROM questions WHERE assignment_id = %s)", (assignment_id,))
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise e

def set_error_message(course_pk: int, error_message: str):
    try:
        cursor.execute("UPDATE user_courses SET error_message = %s WHERE course_id = %s", (error_message, course_pk))
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise e
    
def get_error_message(course_pk: int):
    cursor.execute("SELECT error_message FROM user_courses WHERE course_id = %s", (course_pk,))
    result = cursor.fetchone()
    if result:
        return result[0]
    return None

def get_pie_chart_data(course_pk: int, assignment_pks: list, ta_pks: list):
    assignment_ids = ', '.join(map(str, assignment_pks))
    ta_ids = ', '.join(map(str, ta_pks))
    
    query = f"""
        SELECT tas.name, SUM(ta_question_stats.graded_count) AS total_graded
        FROM ta_question_stats
        JOIN tas ON ta_question_stats.ta_id = tas.id
        JOIN questions ON ta_question_stats.question_id = questions.id
        JOIN assignments ON questions.assignment_id = assignments.id
        WHERE assignments.course_id = %s
          AND assignments.id IN ({assignment_ids})
          AND tas.id IN ({ta_ids})
        GROUP BY tas.name;
    """

    try:
        cursor.execute(query, (course_pk,))
    except Exception as e:
        raise e
    return cursor.fetchall()

def get_bar_chart_data(course_pk: int, assignment_pks: list, ta_pks: list):
    assignment_ids = ', '.join(map(str, assignment_pks))
    ta_ids = ', '.join(map(str, ta_pks))
    
    query = f"""
        SELECT 
            tas.name AS ta_name,
            assignments.name AS assignment_name,
            SUM(ta_question_stats.graded_count) AS total_graded,
            assignments.id AS assignment_id
        FROM ta_question_stats
        JOIN tas ON ta_question_stats.ta_id = tas.id
        JOIN questions ON ta_question_stats.question_id = questions.id
        JOIN assignments ON questions.assignment_id = assignments.id
        WHERE assignments.course_id = %s
          AND assignments.id IN ({assignment_ids})
          AND tas.id IN ({ta_ids})
        GROUP BY tas.name, assignments.name, assignments.id
        ORDER BY assignments.id;
    """
    
    try:
        cursor.execute(query, (course_pk,))
        return cursor.fetchall()
    except Exception as e:
        raise e

def reset_course(course_pk: int):
    try:
        cursor.execute("DELETE FROM ta_question_stats WHERE question_id IN (SELECT id FROM questions WHERE assignment_id IN (SELECT id FROM assignments WHERE course_id = %s))", (course_pk,))
        cursor.execute("DELETE FROM tas WHERE course_id = %s", (course_pk,))
        cursor.execute("DELETE FROM questions WHERE assignment_id IN (SELECT id FROM assignments WHERE course_id = %s)", (course_pk,))
        cursor.execute("DELETE FROM assignments WHERE course_id = %s", (course_pk,))
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise e

def close():
    cursor.close()
    conn.close()

def commit():
    conn.commit()