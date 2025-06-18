import { useContext } from "react"
import { NavLink, Outlet } from "react-router-dom"
import { UserContext } from "../../App"
import "./Layout.scss"

export default function Layout() {

    const { user } = useContext(UserContext)

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
                        {user ? user.username : "Login"}
                    </NavLink>
                </div>
            </nav>
        </div>
        <Outlet />
        </>
    )
}