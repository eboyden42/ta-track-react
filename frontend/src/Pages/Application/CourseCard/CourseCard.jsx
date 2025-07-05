import { useParams, useOutletContext, useNavigate } from "react-router-dom"
import { IoSettings } from "react-icons/io5";
import { GoDotFill } from "react-icons/go";
import { useState, useEffect } from "react";
import { io } from 'socket.io-client'
import "./CourseCard.scss"

export default function CourseCard() {

    const navigate = useNavigate()
    const socket = io(import.meta.env.VITE_API_URL)

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

    // state for status and live updates
    const [isLoading, setIsLoading] = useState(true)
    const [statusMessage, setStatusMessage] = useState("Loading course data")

    // useEffect for updating status after inital load
    useEffect(() => {
        setStatusMessage(handleStatusUpdates(status))
    }, [status])

    // useEffect for live socket updates
    useEffect(() => {
    
        socket.on('started_ta_scrape', (data) => {
            setStatusMessage(handleStatusUpdates(data))
        })

        socket.on('scrape_done', (data) => {
            setStatusMessage(handleStatusUpdates(data))
        });

        socket.on('scrape_failed', (data) => {
            console.error('Scraping failed for:', data.course)
            setStatusMessage(handleStatusUpdates(data))
        });

    return () => {
      socket.off('started_ta_scrape')
      socket.off('scrape_done')
      socket.off('scrape_failed')
    }
  }, [])

    // deletes course from databse, updates course list, navigates back to dashboard
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
                console.log("updating")
                // upadate course list
                update()
                navigate("/user/dashboard")
            }
        })
    }

    function handleStatusUpdates(status) {
        switch (status) {
            case 'scrape_not_started':
                setIsLoading(false)   
                return 'Pending start'
            case 'started_ta_scrape':
                return 'Scraping TA data'
            case 'scrape_done':
                setIsLoading(false) 
                return 'Finished scraping TA data'
            case 'scrape_failed':
                setIsLoading(false) 
                return "Error scraping TA data: Ensure correct gradescope course ID"
            default:
                return 'Loading course data'
        }
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
        <div className="content-container">
            <div className="status-container">
                <div className="status">
                    <h2>{statusMessage}</h2>
                    { isLoading ? <div className="loader"></div> : null}
                </div>
            </div>
        </div>
        </main>
    )
}