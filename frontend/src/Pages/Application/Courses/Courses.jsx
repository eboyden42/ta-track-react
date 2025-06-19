import CourseService from "../CourseService/CourseService";

export default function Courses() {

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

    return (
        <>
        <ul>
            {CourseServiceList}
        </ul>
        </>
    )
}