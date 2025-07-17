import { useParams, useOutletContext, useNavigate } from "react-router-dom"
import { IoSettings, IoClose } from "react-icons/io5";
import { GoDotFill } from "react-icons/go";
import { useState, useEffect } from "react";
import { io } from 'socket.io-client'
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
    
    // State to handle changing course title and id
    const [formType, setFormType] = useState("")
    const [showUpdateForm, setShowUpdateForm] = useState(false)
    const [newCourseTitle, setNewCourseTitle] = useState("")
    const [newCourseId, setNewCourseId] = useState("")
    const [isValidID, setIsValidID] = useState(true)
    
    // state for status and live updates
    const [isLoading, setIsLoading] = useState(true)
    const [statusMessage, setStatusMessage] = useState("Loading course data")
    const [showStatus, setShowStatus] = useState(true)
    
    // useEffect for updating status after inital load
    useEffect(() => {
        console.log(status)
        setStatusMessage(handleStatusUpdates(status))
        if (status === 'scrape_complete') {
            schedulePeriodicUpdates()
        }
        if (status === 'scrape_failed') {
            getErrorMessage()
        }
    }, [status, course_pk])
    
    // useEffect for live socket updates
    useEffect(() => {
        const socket = io(import.meta.env.VITE_API_URL)
        
        socket.on('started_ta_scrape', (data) => {
            if (data.course == course_pk) {
                setStatusMessage(handleStatusUpdates('started_ta_scrape'))
            }
        })
        
        socket.on('ta_scrape_done', (data) => {
            if (data.course == course_pk) {
                setStatusMessage(handleStatusUpdates('ta_scrape_done'))
            }
        })

        socket.on('scraping_worksheet_links', (data) => {
            if (data.course == course_pk) {
                setStatusMessage(handleStatusUpdates('scraping_worksheet_links'))
            }
        })

        socket.on('worksheet_links_scraped', (data) => {
            if (data.course == course_pk) {
                setStatusMessage(handleStatusUpdates('worksheet_links_scraped'))
            }
        })

        socket.on('scraping_questions', (data) => {
            if (data.course == course_pk) {
                setStatusMessage(handleStatusUpdates('scraping_questions'))
            }
        })

        socket.on('scraping_questions_for_assignment', (data) => {
            if (data.course == course_pk) {
                setStatusMessage(handleStatusUpdates('scraping_questions_for_assignment') + `: ${data.assignment_name}`)
            }
        })

        socket.on('scrape_failed', (data) => {
            if (data.course == course_pk) {
                console.error('Scraping failed for:', data.course, 'Error:', data.error)
                setIsLoading(false)
                setStatusMessage(data.error)
            }
        })

        socket.on('counting_questions_graded', (data) => {
            if (data.course == course_pk) {
                setStatusMessage(handleStatusUpdates('counting_questions_graded') + `: ${data.assignment_name}`)
            }
        })

        socket.on('scrape_complete', (data) => {
            if (data.course == course_pk) {
                setStatusMessage(handleStatusUpdates('scrape_complete'))
                schedulePeriodicUpdates()
            }
        })

        socket.on('display_message', (data) => {
            if (data.course === course_pk) {
                console.log('Message from server:', data.message)
            }   
        })

    return () => {
      socket.off('started_ta_scrape')
      socket.off('ta_scrape_done')
      socket.off('scraping_worksheet_links')
      socket.off('worksheet_links_scraped')
      socket.off('scrape_complete')
      socket.off('scrape_failed')
    }
  }, [])

    // deletes course from database, updates course list, navigates back to dashboard
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

    // takes in backend statuses and chages them to messages for display
    function handleStatusUpdates(status) {
        switch (status) {
            case 'scrape_not_started':
                setIsLoading(false)   
                return 'Pending start'
            case 'started_ta_scrape':
                setIsLoading(true)
                return 'Scraping TA data'
            case 'ta_scrape_done':
                setIsLoading(false)
                return 'Finished scraping TA data'
            case 'scraping_worksheet_links':
                setIsLoading(true)
                return 'Scraping worksheet links'
            case 'worksheet_links_scraped':
                setIsLoading(true)
                return 'Finished scraping worksheet links'
            case 'scraping_questions':
                setIsLoading(true)
                return 'Starting scraping questions'
            case 'scraping_questions_for_assignment':
                setIsLoading(true)
                return 'Scraping questions for assignment'
            case 'counting_questions_graded':
                setIsLoading(true)
                return 'Counting questions graded by TAs'
            case 'scrape_complete':
                setIsLoading(false)
                setShowStatus(false)
                return 'Scraping complete'
            case 'scrape_failed':
                setIsLoading(false)
                return "Error scraping TA data: Ensure correct gradescope course ID"
            default:
                return 'Loading course data'
        }
    }

    // Handles starting up inital ta scraping job
    function handleStartScraping(e) {
        e.preventDefault()
        setIsLoading(true)
        console.log(`Starting scraping for ${course_pk}`)
        fetch(`${import.meta.env.VITE_API_URL}/api/initial_scrape_task`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({id: course_pk})
        })
        .then(res => res.json())
        .then(data => {
            console.log(data.message)
        })
        .catch(err => console.error(err))
    }

    // Function to schedule periodic updates for the course
    function schedulePeriodicUpdates() {
        console.log("Scheduling periodic updates for course:", course_pk)
        fetch(`${import.meta.env.VITE_API_URL}/api/schedule_update`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({id: course_pk})
        })
        .then(res => res.json())
        .then(data => {
            console.log(data.message)
        })
        .catch(err => console.error(err))
    }

    function getErrorMessage() {
        fetch(`${import.meta.env.VITE_API_URL}/api/get_error_message`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({id: course_pk})
        })
        .then(res => res.json())
        .then(data => {
            console.log("Error message:", data)
            if (data.error_message) {
                console.log("Error message:", data.error_message)
                setStatusMessage(data.error_message)
            }
        })
        .catch(err => console.error(err))
    }

    // Function to handle course ID input change, validates the input and updates the state
    function handleIDChange(e) {
        const id = e.target.value
        setNewCourseId(id)
        
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

    function handleTitleUpdates(e) {
        e.preventDefault()
        console.log("Updating title")
        fetch(`${import.meta.env.VITE_API_URL}/api/update_title`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({course_pk, new_title: newCourseTitle})
        })
        .then(res => res.json())
        .then(data => {
            if (data.message) {
                console.log(data.message)
                setShowPopup(false)
                setShowUpdateForm(false)
                update()
            }
        })
        .catch(err => console.error(err))
    }

    function handleIdUpdates(e) {
        e.preventDefault()

        if (status !== 'scrape_not_started') {
            alert("You cannot update the course ID after scraping has started")
            setShowUpdateForm(false)
            return
        }

        console.log("Updating id")
        fetch(`${import.meta.env.VITE_API_URL}/api/update_gs_id`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({course_pk, new_gs_id: newCourseId})
        })
        .then(res => res.json())
        .then(data => {
            if (data.message) {
                console.log(data.message)
                setShowPopup(false)
                setShowUpdateForm(false)
                update()
            }
        })
        .catch(err => console.error(err))
    }
    

    return (
        <main className="course-card-page">
        {/* Header component */}
        <div className="header">
            <div className="left-items">
                <h3 className="title">{title}</h3>
                <GoDotFill />
                <h3 className="id">{gradescope_id}</h3>
                <button className="start-btn" onClick={handleStartScraping}>Start Scraping Job</button>
            </div>
            <div className="right-items">
                {/* Settings button */}
                <button className="settings-btn" onClick={() => setShowPopup(prev => !prev)}>
                    <IoSettings />
                </button>
            </div>
            {/* Settings popup */}
            { showPopup ?
            <div className="settings-popup">
                <button onClick={() => {
                    setFormType("title")
                    setShowUpdateForm(true)
                }
                }>Change title</button>
                <button onClick={() => {
                    setFormType("id")
                    setShowUpdateForm(true)
                }
                }>Change id</button>
                <button className="delete" onClick={handleDelete}>Delete course</button>
            </div> : null}
        </div>

        {/* Main content div */}
        <div className="content-container">

            {/* Status showing status updates */}
            {showStatus ? 
            <div className="status-container">
                <div className="status">
                    <h2>{statusMessage}</h2>
                    { isLoading ? <div className="loader"></div> : null}
                </div>
            </div> : null }

            {/* Popup form for updating title and gradescope id */}
            {showUpdateForm ? 
            <div className="change-data-popup">
                <div className="change-data-modal">
                     <button 
                        className="close-btn" 
                        onClick={() => setShowUpdateForm(false)}
                    >
                        <IoClose />
                    </button>
                    {formType === "title" ? "Enter your new course title:" : 
                    formType === "id" ? "Enter your new gradescope id:" : null }
                    
                    <form className="change-data-form">
                        {formType === "title" ? 
                        <input 
                            type="text"
                            value={newCourseTitle}
                            onChange={(e) => setNewCourseTitle(e.target.value)}
                            placeholder="CS 3100..."
                        />
                        : 
                        formType === "id" ? 
                        <input 
                            type="number"
                            value={newCourseId}
                            onChange={handleIDChange}
                            placeholder="454256, 956784, etc."
                        />
                        : null }
                        <button 
                            className="update"
                            onClick={formType === "title" ? handleTitleUpdates : handleIdUpdates}
                        >Update</button>
                    </form>
                    <h3 className="error-message">
                    { !isValidID ? "Please enter a valid 6-digit course ID." : ""}
                    </h3>
                </div>
            </div> : null }
        </div>
        </main>
    )
}