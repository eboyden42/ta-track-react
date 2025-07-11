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

    # check if login credentials are correct

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


    driver.update_status_by_id(course_id=course_pk, status="ta_scrape_done")
    sendMessage(socketio, f"Finished scraping TAs for course {gradescope_id}")   
    socketio.emit('ta_scrape_done', {'course': gradescope_id})

    # ________________________ Get Worksheet Submission Links ________________________

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

            sendMessage(socketio, f"Found link: {assignment_name} - {href} with percent graded: {percent_graded}")

            ws_submission_links.append((assignment_name, href, percent_graded))
            driver.add_assignment(course_pk=course_pk, name=assignment_name, gradescope_id=gradescope_id, percent_graded=percent_graded, ws_link=href)
        except:
            sendMessage(socketio, "No link found in this row")

    driver.update_status_by_id(course_id=course_pk, status="worksheet_links_scraped")
    socketio.emit('worksheet_links_scraped', {'course': gradescope_id, 'links': ws_submission_links})

    # ________________________ End of Worksheet Submission Links _____________________________

    # ________________________ Scraping Questions For Each Assignment ________________________

    question_links = []

    for (assignment_name, href, percent_graded) in ws_submission_links:
        web_driver.get(href)

        rows = web_driver.find_elements(By.CSS_SELECTOR, 'table.gradingDashboard tbody tr')

        for row in rows:
            try:
                # Find the <a> tag inside the row
                link_element = row.find_element(By.CSS_SELECTOR, 'a.gradingDashboard--listAllLink')

                # Extract the href attribute
                href = link_element.get_attribute("href")

                question_links.append(href)
                sendMessage(socketio, f"Found question link: {href} for assignment {assignment_name}")
            except:
                sendMessage(socketio, f"No link found in this row")
    # Close the WebDriver
    web_driver.quit()   

def get_config_info(course_pk: int, user_id: int, socketio):
    # get course by the primary key
    course = None
    try:
        course = driver.get_course_by_id(course_pk)
        if not course or not course[1]:
            error_msg = f"Course not found with ID {course_pk}"
            displayErrorMessage(socketio, course_pk, error_msg)
            return
    except:
        error_msg = f"Course not found with ID {course_pk}"
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

def url_exists(url):
    try:
        response = requests.head(url, allow_redirects=True, timeout=5)
        return response.status_code == 200
    except requests.RequestException:
        return False