import { UserContext } from "../../../App"
import { useContext, useState, useEffect, act } from "react"
import { NavLink, Outlet } from "react-router-dom"
import { IoClose } from "react-icons/io5";
import "./Dashboard.scss"

export default function Dashboard() {

    // Get user context
    const { user } = useContext(UserContext)

    // State to manage course list
    const [courses, setCourses] = useState([])
    const [activeCourse, setActiveCourse] = useState(0)

    // State to manage course addition form
    const [showForm, setShowForm] = useState(false)
    const [courseTitle, setCourseTitle] = useState("")
    const [courseID, setCourseID] = useState("")
    const [isValidID, setIsValidID] = useState(true)

    // Fetch courses when user is available
    useEffect(() => {
        if (!user) {
            return
        }

        fetchCourses()
    }, [user])

    // Function to fetch courses from the server, updates the courses state
    // and handles errors if any occur during the fetch operation.
    function fetchCourses() {
        fetch(`${import.meta.env.VITE_API_URL}/api/get_courses`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username: user.username }),
        }).then((response) => response.json())
        .then((data) => {
            if (data.courses && data.courses.length > 0) {
                console.log("Courses fetched successfully:", data.courses)
                setCourses(data.courses)
            } else {
                console.log("No courses found for this user.")
            }
        })
        .catch((error) => {
            console.error("Error fetching courses:", error)
        })
    }

    // Handles showing popup for add course form
    function handleAddCourse(e) {
        e.preventDefault()
        setShowForm(prev => !prev)
    }

     // Function to handle form submission, validates input and sends a POST request to add a new course to postgres.
    function handleSubmit(e) {
        e.preventDefault()
        if (!isValidID) {
            alert("Please enter a valid 6-digit course ID.")
            return
        }
        if (courseTitle.trim() === "" || courseID === null) {
            alert("Please fill in all fields.")
            return
        }

        fetch(`${import.meta.env.VITE_API_URL}/api/add_course`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                username: user.username,
                course_id: courseID,
                course_name: courseTitle,
            }),
        })
        .then(response => response.json())
        .then(data => {
            console.log(data)
            setCourseID("")
            setCourseTitle("")
            setShowForm(false)
            fetchCourses() // Refresh the course list after adding a new course
        })
        .catch(error => console.error("Error adding course:", error))
    }

    // Handlers for input changes
    function handleTitleChange(e) {
        setCourseTitle(e.target.value)
    }

    // Function to handle course ID input change, validates the input and updates the state.
    function handleIDChange(e) {
        const id = e.target.value
        setCourseID(id)
        
        if (id === "" || isNaN(id)) {
            setIsValidID(true)
            return
        }

        if (id.length !== 6 || !/^\d+$/.test(id)) {
            setIsValidID(false)
            return
        } else {
            setIsValidID(true)
        }
    }

    const courseList = courses.map( (course, index) => {

        const course_pk = course[0]
        const gradescope_id = course[1]
        const title = course[2]
        const status = course[3]

        return (
            <div className="course-link-container" key={course_pk}>
                <NavLink to={`/user/dashboard/${course_pk}`} className={({isActive}) => {
                    if (isActive) {
                        setActiveCourse(index)
                    }
                    return isActive ? "active-tab" : null
                    }}>
                    {title}
                </NavLink>
            </div>
        )        
    })

    return (
        <main className="dashboard-page">
            <div className="course-bar">
                <button className="add-course-btn" onClick={handleAddCourse}>+ Add Course</button>
                {courseList}
            </div>
            {
                showForm ? <>
                <div className="course-form-container">
                <div className="course-form-modal">
                    <button className="close-btn" onClick={handleAddCourse}><IoClose /></button>
                <p>
                    Please enter information for a gradescope course you wish to begin tracking.
                    An incorrect Course ID can cause problems so be sure to copy and paste it directly.
                </p>
                <form className="course-form" onSubmit={handleSubmit}>
                    <label>
                        Course Title:
                        <input
                            type="text"
                            value={courseTitle}
                            onChange={handleTitleChange}
                            placeholder="APMA 3100, APMA 1110, etc."
                            autoComplete="APMA 3100, APMA 1110, etc."
                        />
                    </label>
                    <label>
                        Course ID:
                        <input
                            type="number"
                            value={courseID}
                            onChange={handleIDChange}
                            autoComplete="9240248, 9543247, etc."
                            />
                    </label>
                    <button className="submit" type="submit">Submit</button>
                </form>
                <h3 className="error-message">
                    { !isValidID ? "Please enter a valid 6-digit course ID." : ""}
                </h3>
                </div>
                </div>
                </> : null
            }
            <Outlet context={{course: courses[activeCourse], update: fetchCourses}} />
        </main>
    )
}