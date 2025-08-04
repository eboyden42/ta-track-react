from flask import Flask, jsonify, request, session
from flask_cors import CORS
from flask_socketio import SocketIO
from dotenv import load_dotenv
import os
from database.encryption.hashing import hash_password
from database.encryption.encrypt import encrypt_data, decrypt_data
from database import driver
from scrape import initial_scrape_task, check_for_updates
from concurrent.futures import ThreadPoolExecutor
from apscheduler.schedulers.background import BackgroundScheduler

# Load environment variables from .env file
load_dotenv()

# Initialize Flask app and configure CORS
app = Flask(__name__)
app.secret_key = os.environ.get("COOKIES_KEY")
CORS(app, supports_credentials=True)

# Initialize SocketIO 
socketio = SocketIO(app, cors_allowed_origins="*")

# Initialize thread pool executor and background scheduler
thread_pool = ThreadPoolExecutor(max_workers=10)
scheduler = BackgroundScheduler() # default scheduler has a thread pool executor with a max worker count of 10
scheduler.start()

# Create tables if they do not yet exist
driver.create_tables()

@app.route('/api/data')
def get_data():
    return jsonify({'message': 'Connected to server'})

# Route to check if an username exists in the database already
@app.route('/api/check_username', methods=['POST'])
def check_username():
    data = request.get_json()
    username = data.get('username')

    if driver.check_user_exists(username):
        return jsonify({'message': 'username taken'}), 409
    else:
        return jsonify({'message': 'username available'}), 200

# Route for user registration
@app.route('/api/create_user', methods=['POST'])
def create_user():
    data = request.get_json()
    
    username = data.get('username')

    password_hash = hash_password(data.get('password'))
    driver.add_user(username=username, password_hash=password_hash)

    return jsonify({'message': 'user created'})

# Route for user login
@app.route('/api/user_login', methods=["POST"])
def user_login():
    data = request.get_json()

    username = data.get('username')
    password = data.get('password')

    response = driver.check_user_login(password=password, username=username)
    user_id = driver.get_user_id(username=username)

    if response == "verified":
        session['user_id'] = user_id
        session['username'] = username
    return jsonify({
        'message': response,
        'user': {
            'id': user_id,
            'username': username,
        }   
    })

# Route to check if the user is logged in for persistent sessions
@app.route('/api/session_check', methods=["GET"])
def session_check():
    user_id = session.get('user_id')
    
    if user_id is None:
        return jsonify({'loggedIn': False}), 401

    user = driver.get_user_by_id(user_id)
    if user is None:
        return jsonify({'loggedIn': False}), 401

    return jsonify({
        'loggedIn': True,
        'user': {
            'id': user_id,
            'username': user[1]
        }
    })

# Route to log out the user
@app.route("/api/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({'message': 'Logged out'})

# Route to update Gradescope user info
@app.route('/api/update_gs_user', methods=['POST'])   
def update_gs_user():
    data = request.get_json()
    username = session.get('username')
    gradescope_username = encrypt_data(data.get('gradescope_username'))
    gradescope_password_hash = encrypt_data(data.get('gradescope_password'))
    try:
        driver.update_gradescope_info(
            username=username,
            gradescope_username=gradescope_username,
            gradescope_password=gradescope_password_hash
        )
    except Exception as e:
        return jsonify({'message': f'Error updating Gradescope info: {str(e)}'}), 500
    
    return jsonify({'message': 'Gradescope info updated successfully'})

# Route to get Gradescope user info
@app.route('/api/get_gs_info', methods=['POST'])
def get_gs_info():
    username = session.get('username')

    gs_info = driver.get_gradescope_info(username=username)

    if gs_info and gs_info['gradescope_username'] and gs_info['gradescope_password_hash']:
        return jsonify({
            'gradescope_username': decrypt_data(gs_info['gradescope_username']),
            'gradescope_password': decrypt_data(gs_info['gradescope_password_hash'])
        })
    else:
        return jsonify({'message': 'No Gradescope info found'}), 200

# Route to get the courses for a user
@app.route('/api/get_courses', methods=['POST'])
def get_courses():
    username = session.get('username')

    courses = driver.get_courses(username=username)

    if courses:
        return jsonify({'courses': courses})
    else:
        return jsonify({'courses': []}), 200

# Route to add a course for a user
@app.route('/api/add_course', methods=['POST'])
def add_course():   
    data = request.get_json()
    user_id = session.get('user_id')
    gradescope_id = data.get('gradescope_id')
    course_name = data.get('course_name')
    try:
        driver.add_course(user_id=user_id, gradescope_id=gradescope_id, course_name=course_name)
        return jsonify({'message': 'Course added successfully'})
    except Exception as e:
        return jsonify({'message': f'Error adding course: {str(e)}'}), 500

# Route to delete a course for a user
@app.route('/api/delete_course', methods=['POST'])
def delete_course():
    data = request.get_json()
    course_pk = data.get('id')

    # Remove the scheduled job for this course if it exists
    job = scheduler.get_job(str(course_pk))
    if job:
        scheduler.remove_job(str(course_pk))

    try:
        driver.delete_course(course_pk)
        return jsonify({'message': 'Course deleted successfully'})
    except Exception as e:
        return jsonify({'message': f'Error deleting course: {str(e)}'}), 500

# Route to start the initial scrape task for a course   
@app.route('/api/initial_scrape_task', methods=['POST'])
def start_scrape_task():
    data = request.get_json()
    course_id = data.get("id")
    user_id = session.get('user_id')

    thread_pool.submit(initial_scrape_task, course_id, user_id, socketio)

    return jsonify({"message": "Scraping started"}), 202

# Route to schedule a periodic update check for a course
@app.route('/api/schedule_update', methods=['POST'])
def schedule_update():
    data = request.get_json()
    course_pk = data.get("id")
    user_id = session.get('user_id')

    # Check if a job already exists for this course
    existing_job = scheduler.get_job(str(course_pk))
    if existing_job:
        return jsonify({"message": "Job already exists for this course"}), 202

    scheduler.add_job(
        check_for_updates, 
        'interval', 
        hours=1, 
        args=[course_pk, user_id, socketio],
        id=str(course_pk)  # Use course_pk as the job ID
    )

    return jsonify({"message": "Schedule update started"}), 202

# Route to get the scrape status of a course
@app.route('/api/status', methods=['POST', 'OPTIONS'])
def get_scrape_status():
    if request.method == 'OPTIONS':
        return '', 200
    data = request.get_json()
    course_id = data.get('id')
    status = driver.get_status_by_id(course_id)
    error_message = driver.get_error_message(course_id)

    if status:
        return jsonify({'status': status, 'error_message': error_message})
    return jsonify({'error': 'Course not found'}), 404

# Route to update the title of a course
@app.route('/api/update_title', methods=['POST', 'OPTIONS'])
def update_title():
    if request.method == 'OPTIONS':
        return '', 200
    data = request.get_json()
    course_pk = data.get('course_pk')
    new_title = data.get('new_title')
    try:
        driver.update_course_title_by_id(course_pk, new_title)
        return jsonify({'message': 'Course title updated successfully'})
    except Exception as e:
        return jsonify({'message': str(e)}), 404

# Route to update the Gradescope ID of a course
@app.route('/api/update_gs_id', methods=['POST', 'OPTIONS'])
def update_gs_id():
    if request.method == 'OPTIONS':
        return '', 200
    data = request.get_json()
    course_pk = data.get('course_pk')
    new_gs_id = data.get('new_gs_id')
    try:
        driver.update_gs_id_by_id(course_pk, new_gs_id)
        return jsonify({'message': 'Gradescope id updated successfully'})
    except:
        return jsonify({'message': 'Course not found'}), 404

# Route to get the error message of a course
@app.route('/api/get_error_message', methods=['POST', 'OPTIONS'])
def get_error_message():
    if request.method == 'OPTIONS':
        return '', 200
    data = request.get_json()
    course_id = data.get('id')
    error_message = driver.get_error_message(course_id)

    if error_message:
        return jsonify({'error_message': error_message})
    return jsonify({'error': 'Course not found'}), 404

# Route to get assignments for visualization
@app.route('/api/get_assignments', methods=['POST', 'OPTIONS'])
def get_assignments():
    if request.method == 'OPTIONS':
        return '', 200
    data = request.get_json()
    course_id = data.get('course_id')
    assignments = driver.get_assignments_by_course_id(course_id)
    if not assignments:
        return jsonify({'error': 'No assignments found for this course'}), 404

    assignments = [
        {
            'value': assignment[0],
            'label': assignment[3]
        } for assignment in assignments
    ]

    return jsonify({'assignments': assignments})

# Route to get TAs for visualization
@app.route('/api/get_tas', methods=['POST', 'OPTIONS'])
def get_tas():
    if request.method == 'OPTIONS':
        return '', 200
    data = request.get_json()
    course_id = data.get('course_id')
    tas = driver.get_tas_by_course_id(course_id)
    if not tas:
        return jsonify({'error': 'No TAs found for this course'}), 200

    tas = [
        {
            'value': ta[0],
            'label': ta[2]
        } for ta in tas
    ]

    return jsonify({'tas': tas})

# Route to get assignments and TAs for visualization
@app.route('/api/get_assignments_and_tas', methods=['POST', 'OPTIONS'])
def get_assignments_and_tas():
    if request.method == 'OPTIONS':
        return '', 200
    data = request.get_json()
    course_id = data.get('course_id')
    assignments = driver.get_assignments_by_course_id(course_id)
    tas = driver.get_tas_by_course_id(course_id)

    if not assignments or not tas:
        return jsonify({'error': 'No assignments or no TAs found for this course'}), 404

    assignments = [
        {
            'value': assignment[0],
            'label': assignment[3]
        } for assignment in assignments
    ]

    tas = [
        {
            'value': ta[0],
            'label': ta[2]
        } for ta in tas
    ]

    return jsonify({'assignments': assignments, 'tas': tas})

# Route to get pie chart data for visualization
@app.route('/api/get_pie_chart_data', methods=['POST', 'OPTIONS'])
def get_pie_chart_data():
    if request.method == 'OPTIONS':
        return '', 200
    
    data = request.get_json()
    course_id = data.get('course_id')
    assignment_ids = data.get('assignments')
    ta_ids = data.get('tas')

    try:
        pie_chart_data = driver.get_pie_chart_data(course_id, assignment_ids, ta_ids)
        if not pie_chart_data:
            return jsonify({'error': 'No data found for this course'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

    pie_chart_data = {
        'labels': [item[0] for item in pie_chart_data],
        'values': [item[1] for item in pie_chart_data],
    }

    return jsonify({'data': pie_chart_data})

# Route to get bar chart data for visualization (this route is also used to get the line chart data, since they share the same data structure)
@app.route('/api/get_bar_chart_data', methods=['POST', 'OPTIONS'])
def get_bar_chart_data():
    if request.method == 'OPTIONS':
        return '', 200
    
    data = request.get_json()
    course_id = data.get('course_id')
    assignment_ids = data.get('assignments')
    ta_ids = data.get('tas')

    try:
        bar_chart_data = driver.get_bar_chart_data(course_id, assignment_ids, ta_ids)
        if not bar_chart_data:
            return jsonify({'error': 'No data found for this course'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 200

    result_data = []

    unique_assignments = set()
    unique_tas = set()

    for i in range(len(bar_chart_data)):
        assignment_name = bar_chart_data[i][1]
        ta_name = bar_chart_data[i][0]
        assignment_id = bar_chart_data[i][3]

        unique_assignments.add((assignment_name, assignment_id))
        unique_tas.add(ta_name)

    for assignment in unique_assignments:
        assignment_name = assignment[0]
        assignment_id = assignment[1]
        result_data.append({
            'assignment': assignment_name,
            'data': {ta: 0 for ta in unique_tas},
            'id': assignment_id
        })

    for i in range(len(bar_chart_data)):
        assignment_name = bar_chart_data[i][1]
        ta_name = bar_chart_data[i][0]
        value = bar_chart_data[i][2]
        for item in result_data:
            if item['assignment'] == assignment_name:
                item['data'][ta_name] += value

    result_data.sort(key=lambda x: x['id'], reverse=True)

    return jsonify({'data': result_data})

@app.after_request
def add_csp(response):
    response.headers['Content-Security-Policy'] = (
        "default-src 'self'; "
        "script-src 'self'; "
        "style-src 'self' 'unsafe-inline'; "
        "img-src 'self' data:; "
        "connect-src 'self' ; "
        "object-src 'none'; "
        "base-uri 'none';"
    )

    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['Referrer-Policy'] = 'no-referrer'
    response.headers['Permissions-Policy'] = 'geolocation=(), microphone=()'

    return response

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000)
