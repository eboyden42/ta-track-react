import { FaRegUserCircle, FaUser, FaUserAltSlash } from "react-icons/fa"
import { IoIosExit } from "react-icons/io";
import "./ApplicationLayout.scss"
import { UserContext } from "../../App";
import { useContext, useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import TAGuideLogo from "../../assets/TAGuide.png"

export default function ApplicationLayout() {

    const { user, setUser } = useContext(UserContext)
    const [showDropdown, setShowDropdown] = useState(false)
    const navigate = useNavigate()
    
    // Toggle profile dropdown menu
    function openDropdown(e) {
        e.preventDefault();
        setShowDropdown((prev) => !prev)
    }

    // Log out user, clear context, close dropdown, and redirect to login
    function handleLogout() {
        sessionStorage.setItem('isReload', 'false')
        fetch(`${import.meta.env.VITE_API_URL}/api/logout`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" }
        })
        .then(res => res.json())
        .then(() => {
            setUser(null);
            setShowDropdown(false);
            navigate("/login");
        })
        .catch(err => {
            console.error("Logout failed", err);
        });
        setShowDropdown(false)
    }

    return (
        <>
        {/* Navigation bar */}
        <nav>
            <div className="left-tabs">
                {/* Main navigation links */}
                <NavLink to="/user/dashboard">
                    <img src={TAGuideLogo} alt="TAGuide Logo" className="logo"/>
                </NavLink>
                <NavLink to="/user/dashboard">Dashboard</NavLink>
                <NavLink to="/user/info">Configuration</NavLink>
                <NavLink to="/user/getting-started">Getting Started</NavLink>
            </div>
            <div className="right-tabs">
                {/* Profile section with dropdown */}
                <div className={"profile" + (showDropdown ? " clicked" : "")} onClick={openDropdown} >
                    <span>
                        {user ? user.username : "Login"}
                    </span>
                    <FaRegUserCircle />
                    {showDropdown && (
                        <div className="profile-dropdown">
                            {/* Logout button */}
                            <button onClick={handleLogout}>
                                <IoIosExit />
                                {" Logout"}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
        {/* Render child routes */}
        <Outlet />
        </>
    )
}