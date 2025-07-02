from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from database import driver
from database.encryption import encrypt
from selenium.webdriver.chrome.options import Options

def get_tas(course_pk: int, user_id: int, socketio):
    course = driver.get_course_by_id(course_pk)
    gs_user = driver.get_gradescope_info(driver.get_user_by_id(user_id)[1])
        

    gradescope_id = course[1]
    gradescope_username = encrypt.decrypt_data(gs_user['gradescope_username'])
    gradescope_password = encrypt.decrypt_data(gs_user['gradescope_password_hash'])

    try:
        driver.update_status_by_id(course_id=course_pk, status="started_ta_scrape")
        socketio.emit('started_ta_scrape', {'course': gradescope_id})
        
        options = Options()
        options.add_argument("--headless")  # Run Chrome in headless mode

        # Set up Selenium WebDriver
        web_driver = webdriver.Chrome(options=options)

        # Open the Gradescope login page
        web_driver.get('https://gradescope.com/login')

        # Find the login fields and enter credentials
        email_field = web_driver.find_element(By.ID, 'session_email')
        password_field = web_driver.find_element(By.ID, 'session_password')
        email_field.send_keys(gradescope_username)
        password_field.send_keys(gradescope_password)
        password_field.send_keys(Keys.RETURN)

        web_driver.get('https://www.gradescope.com/courses/' + str(gradescope_id) + '/memberships?role=2')
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

        driver.update_status_by_id(course_id=course_pk, status="scrape_done")
        socketio.emit('scrape_done', {'course': gradescope_id})
    except:
        driver.update_status_by_id(course_id=course_pk, status="scrape_failed")
        socketio.emit('scrape_failed', {'course': gradescope_id})



