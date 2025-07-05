import "./CourseService.scss"
import { MdDeleteForever } from "react-icons/md";
import { useEffect, useState } from "react"
import { io } from 'socket.io-client'

export default function CourseService({id, update, children}) {

    const socket = io(import.meta.env.VITE_API_URL)
    const [status, setStatus] = useState("")

    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_URL}/api/status`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({course_id: id})
        })
        .then(res => res.json())
        .then(data => {
            if (data.status) {
                setStatus(handleStatusUpdates(data.status))
            } else {
                throw new Error("Failed fetching status");
            }
        })
        .catch(err => console.log(err))
    }, [])

    useEffect(() => {
    
        socket.on('started_ta_scrape', (data) => {
            setStatus(handleStatusUpdates(data))
        })

        socket.on('scrape_done', (data) => {
            setStatus(handleStatusUpdates(data))
        });

        socket.on('scrape_failed', (data) => {
            console.error('Scraping failed for:', data.course)
            setStatus(handleStatusUpdates(data))
        });

    return () => {
      socket.off('started_ta_scrape')
      socket.off('scrape_done')
      socket.off('scrape_failed')
    }
  }, [])

    function handleDelete(e) {
        e.preventDefault()
        fetch(`${import.meta.env.VITE_API_URL}/api/delete_course`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({id: id})
        })
        .then(res => res.json())
        .then(data => {
            const message =  data.message
            console.log(message)
            if (message === "Course deleted successfully") {
                // upadate course list
                update()
            }
        })
    }

    function handleTAScrape(e) {
        e.preventDefault()
        fetch(`${import.meta.env.VITE_API_URL}/api/scrape_tas`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({id: id})
        })
        .then(data => data.json())
        .then(data => console.log(data.message))
        .catch(err => console.log(err))
    }

    function handleStatusUpdates(status) {
        switch (status) {
            case 'scrape_not_started':
                return 'Pending start'
            case 'started_ta_scrape':
                return 'Scraping TA data'
            case 'scrape_done':
                return 'Finished scraping TA data'
            case 'scrape_failed':
                return "Error scraping TA data: Ensure correct gradescope course ID"

        }
    }

    const statusComponent = <h3>Status: {status}</h3>

    return (
        <>
        <div className="service-box">
            <div className="left-items">
                {children}
                {statusComponent}
            </div>
            <div className="right-items">
                <button className="delete-btn" onClick={handleDelete}>
                    <MdDeleteForever />
                </button>
                <button onClick={handleTAScrape}>
                    Scrape TAs
                </button>
            </div>
        </div>
        </>
    )

}