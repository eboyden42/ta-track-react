import "./CourseService.scss"
import { MdDeleteForever } from "react-icons/md";

export default function CourseService({id, update, status, children}) {

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