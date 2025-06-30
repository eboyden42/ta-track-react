import "./CourseService.scss"
import { MdDeleteForever } from "react-icons/md";

export default function CourseService({id, update, status, children}) {

    console.log(status)

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
                // upadate
                update()
            }
        })
    }

    return (
        <>
        <div className="service-box">
            <div className="left-items">
                {children}
            </div>
            <div className="right-items">
                <button className="delete-btn" onClick={handleDelete}>
                    <MdDeleteForever />
                </button>
            </div>
        </div>
        </>
    )

}