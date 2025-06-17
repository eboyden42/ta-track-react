import { NavLink, Outlet } from "react-router-dom";

export default function Layout() {
    return (
        <>
        <div className="nav-container">
            <nav>
                <NavLink to="/">
                    Home
                </NavLink>
                <NavLink to="/about">
                    About
                </NavLink>
                <NavLink to="/login">
                    Login
                </NavLink>
            </nav>
            <Outlet />
        </div>
        </>
    )
}