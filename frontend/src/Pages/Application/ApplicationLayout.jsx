import { FaRegUserCircle, FaUser, FaUserAltSlash } from "react-icons/fa"
import { IoIosExit } from "react-icons/io";
import "./ApplicationLayout.scss"
import { UserContext } from "../../App";
import { useContext, useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import TAGuideLogo from "../../assets/TAGuide.png"

export default function ApplicationLayout() {

    // Access user state and setter from context
    const { user, setUser } = useContext(UserContext)
    // State to control profile dropdown visibility
    const [showDropdown, setShowDropdown] = useState(false);

    // React Router navigation hook
    const navigate = useNavigate()
    
    useEffect(() => {
        // Attempt to restore session from cookies
        fetch(`${import.meta.env.VITE_API_URL}/api/session_check`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: "include",
        })
        .then(res => {
            if (!res.ok) throw new Error("Not logged in")
                return res.json()
        })
        .then(data => {
            // Session found, update user context and redirect
            console.log("Session persisted...")
            setUser(data.user)
            // navigate("/user")
        })
        .catch(() => console.log("User not logged in"))
    }, [])
    
    // Toggle profile dropdown menu
    function openDropdown(e) {
        e.preventDefault();
        setShowDropdown((prev) => !prev)
    }

    // Navigate to user profile page and close dropdown
    function handleProfile() {
        navigate("/user/profile") 
        setShowDropdown(false)
    }

    // Log out user, clear context, close dropdown, and redirect to login
    function handleLogout() {
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
                <NavLink to="/user">
                    <img src={TAGuideLogo} alt="TAGuide Logo" className="logo"/>
                </NavLink>
                <NavLink to="/user">Dashboard</NavLink>
                <NavLink to="/user/courses">Courses</NavLink>
                <NavLink to="/user/info">Info</NavLink>
            </div>
            <div className="right-tabs">
                {/* Profile section with dropdown */}
                <div className="profile" onClick={openDropdown} >
                    <span>
                        {user ? user.username : "Login"}
                    </span>
                    <FaRegUserCircle />
                    {showDropdown && (
                        <div className="profile-dropdown">
                            {/* Profile button */}
                            <button onClick={handleProfile}>
                                <FaUser />
                                {" Profile"}
                            </button>
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