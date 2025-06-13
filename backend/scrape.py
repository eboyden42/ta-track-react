from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
import time
from selenium.webdriver.chrome.options import Options


# Takes a username and password, sign into a headless gradescope driver, return the driver
def login(username, password):
    options = Options()
    options.add_argument("--headless")  # Run Chrome in headless mode

    # Set up Selenium WebDriver
    driver = webdriver.Chrome(options=options)

    # Open the Gradescope login page
    driver.get('https://gradescope.com/login')

    # Find the login fields and enter credentials
    email_field = driver.find_element(By.ID, 'session_email')
    password_field = driver.find_element(By.ID, 'session_password')
    email_field.send_keys(username)
    password_field.send_keys(password)
    password_field.send_keys(Keys.RETURN)

    return driver

# Takes a driver with sign in permissions, and a CourseID, and returns a list of WS links and names
def getWorksheetLinks(driver, courseID):
    ws_submission_links = []
    course_link = 'https://www.gradescope.com/courses/' + str(courseID) + '/assignments'
    try:
        driver.get(course_link)
    except Exception as e:
        print("Could not find course.")
        print(e)
        return None

    rows = driver.find_elements(By.CSS_SELECTOR, '.table.table-assignments.with-points tbody tr')

    for row in rows:
        try:
            # Find the <a> tag inside the row
            link_element = row.find_element(By.CSS_SELECTOR, ".table--primaryLink a")

            # Extract the href attribute
            href = link_element.get_attribute("href") + '/grade'

            # Extract the text (e.g., "Worksheet 6.4b")
            link_text = link_element.text

            ws_submission_links.append([link_text, href])
        except:
            print("No link found in this row")

    return ws_submission_links

def get_questions(ws_link, driver):
    question_links = []
    driver.get(ws_link[1])
    rows = driver.find_elements(By.CSS_SELECTOR, 'table.gradingDashboard tbody tr')
    for row in rows:
        try:
            # Find the <a> tag inside the row
            link_element = row.find_element(By.CSS_SELECTOR, 'a.gradingDashboard--listAllLink')

            # Extract the href attribute
            href = link_element.get_attribute("href")

            question_links.append(href)
        except Exception as e:
            pass
    return question_links

def get_tas(courseID, driver):
    driver.get('https://www.gradescope.com/courses/' + str(courseID) + '/memberships?role=2')
    rows = driver.find_elements(By.CSS_SELECTOR, '#DataTables_Table_0 tbody tr')
    ta_names = []
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
            ta_names.append([name, 0])

    return ta_names

def count_questions_graded(ta_list, question_link, driver):
    driver.get(question_link)
    try:
        rows = driver.find_elements(By.CSS_SELECTOR, '#question_submissions tbody tr')
        if len(rows) == 0:
            return None
        for row in rows:
            # Get the text from the third <td> element (the one with the name)
            name_cell = row.find_elements(By.TAG_NAME, 'td')[2]  # The third td (index 2) contains the name

            for name in ta_list:
                if name[0] in name_cell.text:
                    name[1] += 1
            # Print the result
        print("--------------------")
        for name in ta_list:
            print(f"Problems graded by '{name[0]}':", name[1])
        print("--------------------")
    except Exception as e:
        print(e)