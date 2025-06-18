import CourseService from "./CourseService/CourseService";
import { UserContext } from "../../App";
import { useContext } from "react";
import { NavLink, Outlet } from "react-router-dom";

export default function ApplicationLayout() {

    const { user, setUser } = useContext(UserContext)

    return (
        <>
        <nav>
            <div className="left-tabs">
                <NavLink to="/user">
                    Dashboard
                </NavLink>
                <NavLink to="/user/courses">Courses</NavLink>
                <NavLink to="/user/info">Info</NavLink>
            </div>
            <NavLink className="login" to="/login">
                {user ? user.username : "Login"}
            </NavLink>
        </nav>
        <Outlet />
        <CourseService title="APMA 1110" gradescope_id="954324" />
        </>
    )
}