from flask import Flask, jsonify, request
# import scrape
import sys
import os
from database.encryption.hashing import hash_password
from database import driver

app = Flask(__name__)

username = None
courseID = None
ta_list = None


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
    return jsonify({'message': 'User created!'})


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
