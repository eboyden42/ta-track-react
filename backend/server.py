from flask import Flask, jsonify, request, session
from flask_cors import CORS
from dotenv import load_dotenv
# import scrape
import sys
import os
from database.encryption.hashing import hash_password
from database.encryption.encrypt import encrypt_data, decrypt_data
from database import driver

load_dotenv()
app = Flask(__name__)
app.secret_key = os.environ.get("COOKIES_KEY")
CORS(app, supports_credentials=True)


@app.route('/api/data')
def get_data():
    return jsonify({'message': 'Connection successful...'})

# @app.route('/api/gradescope/login', methods=['POST'])
# def gradescope_login():
#     print("Running login function...")
#     global username, password, courseID, driver
#     data = request.get_json()
#     username = data.get('username')
#     password = data.get('password')
#     courseID = data.get('courseid')

#     try:
#         driver = scrape.login(username, password)
#         if "account" in driver.current_url:
#             return jsonify({'message' : "true"})
#         else:
#             return jsonify({'message' : "false"})
#     except:
#         return jsonify({'message' : "false"})

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

@app.route("/api/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({'message': 'Logged out'})


@app.route('/api/update_gs_user', methods=['POST'])   
def encrypt():
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

@app.route('/api/get_courses', methods=['POST'])
def get_courses():
    data = request.get_json()
    username = data.get('username')

    courses = driver.get_courses(username=username)

    if courses:
        return jsonify({'courses': courses})
    else:
        return jsonify({'message': 'No courses found'}), 404

@app.route('/api/add_course', methods=['POST'])
def add_course():   
    data = request.get_json()
    username = data.get('username')
    course_id = data.get('course_id')
    course_name = data.get('course_name')

    driver.add_course(username=username, course_id=course_id, course_name=course_name)

    return jsonify({'message': 'Course added successfully'})

@app.route('/api/delete_course', methods=['POST'])
def delete_course():
    data = request.get_json()
    course_id = data.get('id')
    try:
        driver.delete_course(course_id)
        return jsonify({'message': 'Course deleted successfully'})
    except Exception as e:
        return jsonify({'message': f'Error deleting course: {str(e)}'}), 500



@app.after_request
def add_csp(response):
    response.headers['Content-Security-Policy'] = (
        "default-src 'self'; "
        "script-src 'self'; "
        "style-src 'self' 'unsafe-inline'; "
        "img-src 'self' data:; "
        "connect-src 'self' ; " # add .env path to backend
        "object-src 'none'; "
        "base-uri 'none';"
    )

    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['Referrer-Policy'] = 'no-referrer'
    response.headers['Permissions-Policy'] = 'geolocation=(), microphone=()'

    return response

# @app.route('/api/talist', methods=['GET'])
# def getTas():
#     global driver, courseID, ta_list
#     print("Getting TAs for "+str(courseID))
#     ta_list = scrape.get_tas(courseID, driver)
#     return jsonify({'message' : ta_list})


# @app.route('/api/worksheets', methods=['GET'])
# def getWorksheets():
#     global driver, courseID
#     print("Getting worksheets for "+str(courseID))
#     ws_list = scrape.getWorksheetLinks(driver, courseID)
#     return jsonify({'message': ws_list})

# @app.route('/api/questions', methods=['POST'])
# def getTAQuestions():
#     global ta_list, driver
#     data = request.get_json()
#     ws_item = data.get('ws_item')
#     print("Getting data from " + ws_item[0] + "...")
#     questions = scrape.get_questions(ws_item, driver)
#     for question in questions:
#         scrape.count_questions_graded(ta_list, question, driver)
#     return jsonify({'message': ta_list})


if __name__ == '__main__':
    app.run(debug=True)
