import "./DefaultCard.scss"

export default function DefaultCard() {
    return (
        <div className="default-card">
            <div className="welcome-intro">
                <h2>Welcome to your Dashboard</h2>
                <hr />
                <p>Select a course from the sidebar to see your live updates and data visualization options.</p>
                <p>If you don't have any courses, add one with the <strong>+ Add Course</strong> button in the left navbar.</p>
                <p>New to TAGuide? Check out our <a href="/user/getting-started">getting started guide</a>.</p>
            </div>
        </div>
    )
}