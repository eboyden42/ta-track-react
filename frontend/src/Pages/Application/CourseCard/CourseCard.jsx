import { useParams, useOutletContext, useNavigate } from "react-router-dom"
import { IoSettings } from "react-icons/io5";
import { GoDotFill } from "react-icons/go";
import { useState } from "react";
import "./CourseCard.scss"

export default function CourseCard() {

    const navigate = useNavigate()

    // use params to get course_pk 
    const params = useParams()
    const course_pk = params.id;

    // State for settings popup
    const [showPopup, setShowPopup] = useState(false)

    // Get course info from outlet contex
    const { course, update } = useOutletContext()
    let gradescope_id 
    let title 
    let status
    if (course) {
        gradescope_id = course[1]
        title = course[2]
        status = course[3]
    }


    function handleDelete(e) {
        e.preventDefault()
        fetch(`${import.meta.env.VITE_API_URL}/api/delete_course`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({id: course_pk})
        })
        .then(res => res.json())
        .then(data => {
            const message =  data.message
            console.log(message)
            if (message === "Course deleted successfully") {
                // upadate course list
                update()
                navigate("/user/dashboard")
            }
        })
    }
    

    return (
        <main className="course-card-page">
        <div className="header">
            <div className="left-items">
                <h3 className="title">{title}</h3>
                <GoDotFill />
                <h3 className="id">{gradescope_id}</h3>
                <button className="start-btn">Start Scraping Job</button>
            </div>
            <div className="right-items">
                <button className="settings-btn" onClick={() => setShowPopup(prev => !prev)}>
                    <IoSettings />
                </button>
            </div>
            { showPopup ?
            <div className="settings-popup">
                <button>Change title</button>
                <button>Change id</button>
                <button className="delete" onClick={handleDelete}>Delete course</button>
            </div> : null}
        </div>
        </main>
    )
}