from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from database import driver
from database.encryption import encrypt
from selenium.webdriver.chrome.options import Options
import requests

def initial_scrape_task(course_pk: int, user_id: int, socketio):

    config = get_config_info(course_pk, user_id, socketio)

    gradescope_id = config['gradescope_id']
    gradescope_username = config['gradescope_username']
    gradescope_password = config['gradescope_password']
    user = config['user']
    course = config['course']


    # --------------------- BEGIN SCRAPING TASK HERE ----------------------

    # udpate driver to reflect that scraping is underway
    driver.update_status_by_id(course_id=course_pk, status="started_ta_scrape")
    socketio.emit('started_ta_scrape', {'course': gradescope_id})

    # _____________________ Initialize WebDriver ________________________

    web_driver = None

    options = Options()
    options.add_argument("--headless")  # Run Chrome in headless mode

    # Set up Selenium WebDriver
    web_driver = webdriver.Chrome(options=options)

    # __________________________ Login to Gradescope _________________________

    # Open the Gradescope login page
    web_driver.get('https://gradescope.com/login')

    # Find the login fields and enter credentials
    email_field = web_driver.find_element(By.ID, 'session_email')
    password_field = web_driver.find_element(By.ID, 'session_password')
    email_field.send_keys(gradescope_username)
    password_field.send_keys(gradescope_password)
    password_field.send_keys(Keys.RETURN)

    # Check if login credentials are correct

    sendMessage(socketio, str(web_driver.current_url))

    if str(web_driver.current_url) == 'https://www.gradescope.com/login':
        error_msg = "Login failed, please check your Gradescope credentials in Configuration"
        driver.update_status_by_id(course_id=course_pk, status='scrape_not_started') # reset status
        displayErrorMessage(socketio, course_pk, error_msg)
        return

    #___________________________ Check if Course Exists ___________________________


    # navigate to the TA page for the course
    web_driver.get(f'https://www.gradescope.com/courses/{gradescope_id}/memberships?role=2')

    sendMessage(socketio, f'https://www.gradescope.com/courses/{gradescope_id}/memberships?role=2')

    page_status = web_driver.find_element(By.ID, "dataTable-status")

    # Check if the course page exists by inspecting the page content
    # if page_status.text starts with "Showing", then the page was loaded successfully
    if not page_status.text.startswith("Showing"):
        error_msg = f"Gradescope course with ID {gradescope_id} does not exist or is inaccessible."
        driver.update_status_by_id(course_id=course_pk, status='scrape_not_started')
        displayErrorMessage(socketio, course_pk, error_msg)
        web_driver.quit()
        return

    # __________________________ Scrape TAs __________________________

    rows = web_driver.find_elements(By.CSS_SELECTOR, '#DataTables_Table_0 tbody tr')

    # Iterate through each row
    for row in rows:
        # Get the role <select> element
        role_select = row.find_element(By.CSS_SELECTOR, ".js-rosterRoleSelect")

        # Get the selected role value
        selected_role = role_select.find_element(By.CSS_SELECTOR, "option[selected]").get_attribute("value")

        # If role is TA (value = "2"), extract the name
        if selected_role == "2":
            name_element = row.find_element(By.CSS_SELECTOR, ".rosterNameColumn.sorting_1")
            name = name_element.text.strip()
            driver.add_ta(course_id=course_pk, name=name)
    
    # __________________________ End of TA Scraping __________________________

    # Update status
    driver.update_status_by_id(course_id=course_pk, status="ta_scrape_done")
    socketio.emit('ta_scrape_done', {'course': gradescope_id})

    # ________________________ Get Worksheet Submission Links ________________________

    # Update status
    driver.update_status_by_id(course_id=course_pk, status="scraping_worksheet_links")
    socketio.emit('scraping_worksheet_links', {'course': gradescope_id})

    ws_submission_links = []
    assignments_link = 'https://www.gradescope.com/courses/' + str(gradescope_id) + '/assignments'
    
    web_driver.get(assignments_link)

    rows = web_driver.find_elements(By.CSS_SELECTOR, '.table.table-assignments.with-points tbody tr')

    for row in rows:
        try:
            # Find the <a> tag inside the row
            link_element = row.find_element(By.CSS_SELECTOR, ".table--primaryLink a")

            # Extract the href attribute
            href = link_element.get_attribute("href") + '/grade'

            # Extract the text (name of the assignment)
            assignment_name = link_element.text

            # Extract the percent graded
            percent_graded = row.find_element(By.CLASS_NAME, "progressBar--captionPercent").text

            driver.add_assignment(course_pk=course_pk, name=assignment_name, gradescope_id=gradescope_id, percent_graded=percent_graded, ws_link=href)
        except:
            sendMessage(socketio, "No link found in this row")

    # ________________________ End of Worksheet Submission Links _____________________________

    driver.update_status_by_id(course_id=course_pk, status="worksheet_links_scraped")
    socketio.emit('worksheet_links_scraped', {'course': gradescope_id, 'links': ws_submission_links})

    # ________________________ Scraping Questions For Each Assignment ________________________

    # Update status
    driver.update_status_by_id(course_id=course_pk, status="scraping_questions")
    socketio.emit('scraping_questions', {'course': gradescope_id})

    question_links = []

    # Get the assignments for the course, need to query the database to get the assignment_pk
    # Same for TAs
    db_ws = driver.get_assignments_by_course_id(course_pk)
    course_tas = driver.get_tas_by_course_id(course_pk)

    for i in range(len(db_ws)):
        assignment_pk = db_ws[i][0] # Extract the assignment primary key
        assignment_name = db_ws[i][3] # Extract the assignment name
        href = db_ws[i][5] # Extract the worksheet link

        # Update status
        driver.update_status_by_id(course_id=course_pk, status=f"scraping_questions_for_assignment")
        socketio.emit('scraping_questions_for_assignment', {'course': gradescope_id, 'assignment_name': assignment_name})

        web_driver.get(href)

        rows = web_driver.find_elements(By.CSS_SELECTOR, 'table.gradingDashboard tbody tr')

        for row in rows:
            try:
                # Find the <a> tag inside the row
                link_element = row.find_element(By.CSS_SELECTOR, 'a.gradingDashboard--listAllLink')

                # Extract the href attribute
                href = link_element.get_attribute("href")

                question_links.append(href)

                driver.add_question(assignment_id=assignment_pk, question_link=href)
            except Exception as e:
                sendMessage(socketio, f"Error: No link found in this row... {str(e)}")

        # _________________________ End of Scraping Questions For Each Assignment ________________________

        # __________________________ Count Questions Graded by TAs _______________________________________

        driver.update_status_by_id(course_id=course_pk, status="counting_questions_graded")
        socketio.emit('counting_questions_graded', {'course': gradescope_id, 'assignment_name': assignment_name})

        # Call the scrape_assignment function
        scrape_assignment(assignment_pk=assignment_pk, assignment_name=assignment_name, course_pk=course_pk, socketio=socketio, web_driver=web_driver)
    
    #------------------------------- End of Initial Scrape ------------------------------------

    driver.update_status_by_id(course_id=course_pk, status="scrape_complete")
    socketio.emit('scrape_complete', {'course': gradescope_id})

    # Close the WebDriver
    web_driver.quit()   

    # Add ASP Scheduler task to check for updates
    
def get_config_info(course_pk: int, user_id: int, socketio):
    # get course by the primary key
    course = None
    try:
        course = driver.get_course_by_id(course_pk)
        if not course or not course[1]:
            error_msg = f"Course not found with ID {course_pk}"
            sendMessage(socketio, str(course))
            displayErrorMessage(socketio, course_pk, error_msg)
            return
    except Exception as e:
        error_msg = f"Course not found with ID {course_pk}"
        sendMessage(socketio, str(e))
        displayErrorMessage(socketio, course_pk, error_msg)
        return

    # get user by id
    user = None
    try:
        user = driver.get_user_by_id(user_id)
        if not user or not user[1]:
            error_msg = f"User not found with ID {user_id}"
            displayErrorMessage(socketio, course_pk, error_msg)
            return
    except:
        error_msg = f"User not found with ID {user_id}"
        displayErrorMessage(socketio, course_pk, error_msg)
        return

    # get gradescope info by id
    try:
        gs_user = driver.get_gradescope_info(user[1])
        if not gs_user['gradescope_username'] or not gs_user['gradescope_password_hash']:
            error_msg = f"Gradescope info not found for username {user[1]}"
            displayErrorMessage(socketio, course_pk, error_msg)
            return
    except:
        error_msg = f"Gradescope info not found for username {user[1]}, ensure correct info in Configuration"
        displayErrorMessage(socketio, course_pk, error_msg)
        return
    
    # extract important variables, decrypt gs info
    gradescope_id = course[1]
    gradescope_username = encrypt.decrypt_data(gs_user['gradescope_username'])
    gradescope_password = encrypt.decrypt_data(gs_user['gradescope_password_hash'])

    return {
        'gradescope_id': gradescope_id,
        'gradescope_username': gradescope_username,
        'gradescope_password': gradescope_password,
        'user': user,
        'course': course
    }

def displayErrorMessage(socketio, course_pk, error_msg):
    """
    Helper function to emit an error message to the client.
    """
    socketio.emit('scrape_failed', {'course': course_pk, 'error': error_msg})

def sendMessage(socketio, message):
    """
    Helper function to emit a message to the client.
    """
    socketio.emit('display_message', {'message': message})

def check_for_updates(course_pk: int, user_id: int, socketio):
    """
    Function to check for updates in the course.
    This function is scheduled to run periodically with apscheduler.
    """

    sendMessage(socketio, f"Checking for updates in course {course_pk}")
    
    config = get_config_info(course_pk, user_id, socketio)
    
    if not config:
        return

    gradescope_id = config['gradescope_id']
    gradescope_username = config['gradescope_username']
    gradescope_password = config['gradescope_password']
    
    # To check for updates, compare the stored percent_graded with the current percent graded for each assignment

    web_driver = None
    options = Options()
    options.add_argument("--headless")
    web_driver = webdriver.Chrome(options=options)

    # ---------- Login to Gradescope ----------

    web_driver.get('https://gradescope.com/login')

    # Find the login fields and enter credentials
    email_field = web_driver.find_element(By.ID, 'session_email')
    password_field = web_driver.find_element(By.ID, 'session_password')
    email_field.send_keys(gradescope_username)
    password_field.send_keys(gradescope_password)
    password_field.send_keys(Keys.RETURN)

    # check if login credentials are correct

    if str(web_driver.current_url) == 'https://www.gradescope.com/login':
        error_msg = "Login failed, please check your Gradescope credentials in Configuration"
        sendMessage(socketio, error_msg)
        web_driver.quit()
        return

    # Get assignments for the course
    assignments = driver.get_assignments_by_course_id(course_pk)

    assignments_link = 'https://www.gradescope.com/courses/' + str(gradescope_id) + '/assignments'
    
    web_driver.get(assignments_link)

    rows = web_driver.find_elements(By.CSS_SELECTOR, '.table.table-assignments.with-points tbody tr')

    for assignment, row in zip(assignments, rows):

        # Extract the percent graded from the row, and for each assignment in the database to compare
        current_percent_graded = assignment[4]
        percent_graded = row.find_element(By.CLASS_NAME, "progressBar--captionPercent").text

        if percent_graded != current_percent_graded:
            sendMessage(socketio, f"Percent graded changed for assignment {assignment[3]} from {current_percent_graded} to {percent_graded}")

            # Update the percent graded in the database
            driver.update_assignment_percent_graded(assignment_id=assignment[0], percent_graded=percent_graded)

            # Clear all entries for this assignment in ta_question_stats
            driver.clear_assignment_data(assignment_id=assignment[0])

            # Rescrape the assignment
            scrape_assignment(assignment_pk=assignment[0], assignment_name=assignment[3], course_pk=course_pk,socketio=socketio, web_driver=web_driver)
        else:
            sendMessage(socketio, f"Assignment {assignment[3]} has not changed, percent graded is still {current_percent_graded}")

def scrape_assignment(assignment_pk: int, assignment_name: str, course_pk: int, socketio, web_driver):
    """
    Function to scrape a specific assignment.
    This function is called when the percent graded for an assignment has changed.
    """

    # Get the questions for the assignment and the course tas, need to query the database to get the question_pk
    questions = driver.get_questions_by_assignment_id(assignment_id=assignment_pk)
    course_tas = driver.get_tas_by_course_id(course_pk)

    for j in range(len(questions)):
        sendMessage(socketio, f"Counting questions graded for question {j} of {len(questions)} for assignment {assignment_name}")

        # get question data
        question_pk = questions[j][0]
        question_link = questions[j][4]

        # set up TA question counters
        ta_questions = []
        for ta in course_tas:
            ta_questions.append({'name': ta[2], 'count': 0, 'ta_id': ta[0]})  # (ta name, # graded for this question, ta id)

        web_driver.get(question_link)

        try:
            rows = web_driver.find_elements(By.CSS_SELECTOR, '#question_submissions tbody tr')
            if len(rows) == 0:
                raise Exception("No submissions found for this question")
            for row in rows:
                name_cell = row.find_elements(By.TAG_NAME, 'td')[2]
                ta_name = name_cell.text
                for ta in ta_questions:
                    if ta['name'] in ta_name:  # if the ta names match, increment the questions graded
                        ta['count'] += 1
        except Exception as e:
            sendMessage(socketio, f"Error counting questions: {str(e)}")

        for ta in ta_questions:
            sendMessage(socketio, f"TA {ta['name']} graded {ta['count']} questions for question {question_pk}")
            try:
                driver.add_ta_question_stats(ta_id=ta['ta_id'], question_id=question_pk, count=ta['count'])
            except Exception as e:
                sendMessage(socketio, f"Error adding TA question stats: {str(e)}")
