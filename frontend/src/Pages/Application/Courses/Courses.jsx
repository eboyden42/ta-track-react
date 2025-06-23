import CourseService from "../CourseService/CourseService";
import React, { useState, useContext, useEffect } from 'react';
import { UserContext } from "../../../App";

export default function Courses() {
    // Access user state from context
    const { user } = useContext(UserContext);

    // State to manage course addition form
    const [courseTitle, setCourseTitle] = useState("");
    const [courseID, setCourseID] = useState("");
    const [isValidID, setIsValidID] = useState(true);

    // State to manage course list
    const [courses, setCourses] = useState([]);

    // Generate CourseService components from courses array
    const CourseServiceList = courses.map(course => 
    <li key={course[0]}>
        <CourseService title={course[2]} gradescope_id={course[1]} />
    </li>
    )   

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

    // Function to handle form submission, validates input and sends a POST request to add a new course to postgres.
    function handleSubmit(e) {
        e.preventDefault()
        if (!isValidID) {
            alert("Please enter a valid 6-digit course ID.")
            return;
        }
        if (courseTitle.trim() === "" || courseID === null) {
            alert("Please fill in all fields.")
            return;
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
            fetchCourses() // Refresh the course list after adding a new course
        })
        .catch(error => console.error("Error adding course:", error));
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
        }

        if (id.length !== 6 || !/^\d+$/.test(id)) {
            setIsValidID(false)
            return;
        } else {
            setIsValidID(true)
        }
    }

    return (
        <>
        <h1>Courses</h1>
        <p>Please enter information for a gradescope course you wish to begin tracking. An incorrect Course ID can cause problems so be sure to copy and paste it directly.</p>
        <form onSubmit={handleSubmit}>
                <div>
                    <label>
                        Course Title:
                        <input
                            type="text"
                            value={courseTitle}
                            onChange={handleTitleChange}
                            autoComplete="APMA 3100, APMA 1110, etc."
                        />
                    </label>
                </div>
                <div>
                    <label>
                        Course ID:
                        <input
                            type="number"
                            value={courseID}
                            onChange={handleIDChange}
                            autoComplete="9240248, 9543247, etc."
                        />
                    </label>
                    {!isValidID && <span>Please enter a valid 6-digit course ID.</span>}   
                </div>
                <button type="submit">
                    Submit
                </button>
            </form>
        <ul>
            {CourseServiceList}
        </ul>
        </>
    )
}