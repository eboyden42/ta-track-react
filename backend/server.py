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


load_dotenv()
app = Flask(__name__)
app.secret_key = os.environ.get("COOKIES_KEY")
CORS(app, supports_credentials=True)
socketio = SocketIO(app, cors_allowed_origins="*")
thread_pool = ThreadPoolExecutor(max_workers=10)
scheduler = BackgroundScheduler() # default scheduler has a thread pool executor with a max worker count of 10, I think 10 is fine for now, but maybe it will need to be changed later
scheduler.start()

# Initialize the database connection, this route is just for testing the connection
@app.route('/api/data')
def get_data():
    return jsonify({'message': 'Connection successful...'})

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
    # Get JSON data from the request
    data = request.get_json()
    # Extract username and password from the data
    username = data.get('username')
    password = data.get('password')

    # Hash the password for secure storage
    password_hash = hash_password(password)
    # Add the user to the database with the hashed password
    driver.add_user(username=username, password_hash=password_hash)
    # Close the database connection
    return jsonify({'message': 'user created'})

# Route for user login
@app.route('/api/user_login', methods=["POST"])
def user_login():
    # Get login data
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    response = driver.check_user_login(password=password, username=username)
    user_id = driver.get_user_id(username=username)

    if response == "verified":
        session['user_id'] = user_id
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
    username = data.get('username')
    gradescope_username = encrypt_data(data.get('gradescope_username'))
    gradescope_password_hash = encrypt_data(data.get('gradescope_password'))

    driver.update_gradescope_info(
        username=username,
        gradescope_username=gradescope_username,
        gradescope_password=gradescope_password_hash
    )

    return jsonify({'message': 'Gradescope info updated successfully'})

# Route to get Gradescope user info
@app.route('/api/get_gs_info', methods=['POST'])
def get_gs_info():
    data = request.get_json()
    username = data.get('username')

    gs_info = driver.get_gradescope_info(username=username)

    if gs_info and gs_info['gradescope_username'] and gs_info['gradescope_password_hash']:
        return jsonify({
            'gradescope_username': decrypt_data(gs_info['gradescope_username']),
            'gradescope_password': decrypt_data(gs_info['gradescope_password_hash'])
        })
    else:
        return jsonify({'message': 'No Gradescope info found'}), 404

# Route to get the courses for a user
@app.route('/api/get_courses', methods=['POST'])
def get_courses():
    data = request.get_json()
    username = data.get('username')

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

    # use thread pool to run the initial scrape task in a separate thread

    thread_pool.submit(initial_scrape_task, course_id, user_id, socketio)

    return jsonify({"message": "Scraping started"}), 202

# Route to schedule a periodic update check for a course
@app.route('/api/schedule_update', methods=['POST'])
def schedule_update():
    data = request.get_json()
    course_pk = data.get("id")
    user_id = session.get('user_id')

    # check if a job already exists for this course
    existing_job = scheduler.get_job(str(course_pk))
    if existing_job:
        return jsonify({"message": "Job already exists for this course"}), 202

    # schedule the update check task to run every 30 seconds (for development), change to every hour in production
    scheduler.add_job(
        check_for_updates, 
        'interval', 
        seconds=30, 
        args=[course_pk, user_id, socketio],
        id=str(course_pk)  # Use course_pk as the job ID
    )

    return jsonify({"message": "Schedule update started"}), 202

# Route to get the scrape status of a course
@app.route('/api/status', methods=['POST', 'OPTIONS'])
def get_scrape_status():
    if request.method == 'OPTIONS':
        # Allow the preflight request
        return '', 200
    data = request.get_json()
    course_id = data.get('id')
    status = driver.get_status_by_id(course_id)
    error_message = driver.get_error_message(course_id)

    if status:
        return jsonify({'status': status, 'error_message': error_message})
    return jsonify({'error': 'Course not found'}), 404
    # I want to change this later

# Route to update the title of a course
@app.route('/api/update_title', methods=['POST', 'OPTIONS'])
def update_title():
    if request.method == 'OPTIONS':
        # Allow the preflight request
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
        # Allow the preflight request
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
        # Allow the preflight request
        return '', 200
    data = request.get_json()
    course_id = data.get('id')
    error_message = driver.get_error_message(course_id)

    if error_message:
        return jsonify({'error_message': error_message})
    return jsonify({'error': 'Course not found'}), 404

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
    # app.run(debug=True)
    # serve(app, host='0.0.0.0', port=os.environ.get("PORT"))
