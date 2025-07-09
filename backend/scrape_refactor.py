from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from database import driver
from database.encryption import encrypt
from selenium.webdriver.chrome.options import Options
import requests

def get_tas(course_pk: int, user_id: int, socketio):

    config = get_config_info(course_pk, user_id, socketio)

    gradescope_id = config['gradescope_id']
    gradescope_username = config['gradescope_username']
    gradescope_password = config['gradescope_password']
    user = config['user']
    course = config['course']


    # --------------------- BEGIN SCRAPING TASK HERE ----------------------

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
    
    sendMessage(socketio, course_pk, str(web_driver.current_url))

    if str(web_driver.current_url) == 'https://www.gradescope.com/login':
        error_msg = "Login failed, please check your Gradescope credentials in Configuration"
        driver.update_status_by_id(course_id=course_pk, status='scrape_not_started') # reset status
        displayErrorMessage(socketio, course_pk, error_msg)
        return

    #___________________________ Check if Course Exists ___________________________


    # navigate to the TA page for the course
    web_driver.get(f'https://www.gradescope.com/courses/{gradescope_id}/memberships?role=2')

    sendMessage(socketio, course_pk, f'https://www.gradescope.com/courses/{gradescope_id}/memberships?role=2')

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



    driver.update_status_by_id(course_id=course_pk, status="scrape_done")
    socketio.emit('scrape_done', {'course': gradescope_id})

    # Close the WebDriver
    web_driver.quit()   

# get_tas(1, 2, None)

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

    # udpate driver to reflect that scraping is underway
    driver.update_status_by_id(course_id=course_pk, status="started_ta_scrape")
    socketio.emit('started_ta_scrape', {'course': gradescope_id})

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

def sendMessage(socketio, course_pk, message):
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