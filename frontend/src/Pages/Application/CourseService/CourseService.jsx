import "./CourseService.scss"

export default function CourseService({title, gradescope_id}) {
    return (
        <>
        <div className="service-box">
            <h2>{title}</h2>
            <h3>{gradescope_id}</h3>
        </div>
        </>
    )

}