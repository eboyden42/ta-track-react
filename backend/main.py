from flask import Flask, jsonify, request
import scrape

app = Flask(__name__)

driver = None
username = None
driver = None
courseID = None
ta_list = None


@app.route('/api/data')
def get_data():
    return jsonify({'message': 'Connection successful...'})

@app.route('/api/login', methods=['POST'])
def login():
    print("Running login function...")
    global username, password, courseID, driver
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    courseID = data.get('courseid')

    try:
        driver = scrape.login(username, password)
        if "account" in driver.current_url:
            return jsonify({'message' : "true"})
        else:
            return jsonify({'message' : "false"})
    except:
        return jsonify({'message' : "false"})


@app.route('/api/talist', methods=['GET'])
def getTas():
    global driver, courseID, ta_list
    print("Getting TAs for "+str(courseID))
    ta_list = scrape.get_tas(courseID, driver)
    return jsonify({'message' : ta_list})


@app.route('/api/worksheets', methods=['GET'])
def getWorksheets():
    global driver, courseID
    print("Getting worksheets for "+str(courseID))
    ws_list = scrape.getWorksheetLinks(driver, courseID)
    return jsonify({'message': ws_list})

@app.route('/api/questions', methods=['POST'])
def getTAQuestions():
    global ta_list, driver
    data = request.get_json()
    ws_item = data.get('ws_item')
    print("Getting data from " + ws_item[0] + "...")
    questions = scrape.get_questions(ws_item, driver)
    for question in questions:
        scrape.count_questions_graded(ta_list, question, driver)
    return jsonify({'message': ta_list})


if __name__ == '__main__':
    app.run(debug=True)
