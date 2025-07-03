import { useParams } from "react-router-dom"
import { useEffect } from "react";

export default function CourseCard() {

    const params = useParams()
    const course_pk = params.id;

    useEffect(() => {
        
    }, [])

    return (
        <h1>{params.id}</h1>
    )
}