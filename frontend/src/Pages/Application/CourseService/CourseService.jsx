import "./CourseService.scss"
import { MdDeleteForever } from "react-icons/md";
import { useEffect } from "react"
import { io } from 'socket.io-client'

export default function CourseService({id, update, status, children}) {

    const socket = io(import.meta.env.VITE_API_URL)

    

    useEffect(() => {
    
        socket.on('started_ta_scrape', (data) => {
            console.log('TA scraping started for course', data.course)
        })

        socket.on('scrape_done', (data) => {
            console.log('Scraping complete for course:', data.course);
        // You can update state, notify user, etc.
        });

        socket.on('scrape_failed', (data) => {
            console.error('Scraping failed for:', data.course);
        });

    return () => {
      socket.off('started_ta_scrape');
      socket.off('scrape_done');
      socket.off('scrape_failed');
    };
  }, []);

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