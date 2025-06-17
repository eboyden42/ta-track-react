import { NavLink, Outlet } from "react-router-dom";
import "./Layout.scss"

export default function Layout() {
    return (
        <>
        <div className="nav-container">
            <nav>
                <div className="left-tabs">
                    <NavLink to="/">
                        Home
                    </NavLink>
                </div>
                <div className="right-tabs">
                    <NavLink className="about" to="/about">
                        About
                    </NavLink>
                    <NavLink className="login" to="/login">
                        Login
                    </NavLink>
                </div>
            </nav>
        </div>
        <Outlet />
        </>
    )
}