import CourseService from "../CourseService/CourseService";
import React, { useState } from 'react';
import { UserContext } from "../../../App";
import { useContext } from 'react';

export default function Courses() {

    const { user } = useContext(UserContext);

    const [courseTitle, setCourseTitle] = useState("");
    const [courseID, setCourseID] = useState(null);
    const [isValidID, setIsValidID] = useState(true);

    const tempCourseData = [
        {
            title: "APMA 3100",
            gradescope_id: 9240248,
        },
        {
            title: "APMA 1110",
            gradescope_id: 9543247,
        }
    ]

    const CourseServiceList = tempCourseData.map(course => 
    <li>
        <CourseService title={course.title} gradescope_id={course.gradescope_id} />
    </li>
    )

    function handleSubmit(e) {
        e.preventDefault();
        if (!isValidID) {
            alert("Please enter a valid 6-digit course ID.");
            return;
        }
        if (courseTitle.trim() === "" || courseID === null) {
            alert("Please fill in all fields.");
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
        .then(data => console.log(data))
    }

    function handleTitleChange(e) {
        setCourseTitle(e.target.value)
    }

    function handleIDChange(e) {
        const id = e.target.value;
        setCourseID(id)
        // Validate ID to be a number and not empty
        if (id === "" || isNaN(id)) {
            setIsValidID(true);
        }

        if (id.length !== 6 || !/^\d+$/.test(id)) {
            setIsValidID(false);
            return;
        } else {
            setIsValidID(true);
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