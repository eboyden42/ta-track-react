import { FaRegUserCircle, FaUser, FaUserAltSlash } from "react-icons/fa"
import { IoIosExit } from "react-icons/io";
import "./ApplicationLayout.scss"
import { UserContext } from "../../App";
import { useContext, useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

export default function ApplicationLayout() {

    const { user, setUser } = useContext(UserContext)
    const [showDropdown, setShowDropdown] = useState(false);

    // Navigation
    const navigate = useNavigate()
    
    useEffect(() => {
        // if user is logged in simply navigate to the user page
        if (user) {
            navigate("/user")
        }
        
        // get user info with session cookies if possible
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
            console.log("Session persisted...")
            setUser(data.user)
            navigate("/user")
        })
        .catch(() => console.log("User not logged in"))
    }, [])
    
    function openDropdown(e) {
        e.preventDefault();
        setShowDropdown((prev) => !prev)
        console.log(showDropdown)
    }

    function handleProfile() {
        // add logic later
        setShowDropdown(false)
    }

    function handleLogout() {
        // Add your logout logic here
        setShowDropdown(false)
    }

    return (
        <>
        <nav>
            <div className="left-tabs">
                <NavLink to="/user">Dashboard</NavLink>
                <NavLink to="/user/courses">Courses</NavLink>
                <NavLink to="/user/info">Info</NavLink>
            </div>
            <div className="right-tabs">
                <div className="profile" onClick={openDropdown} >
                    <span>
                        {user ? user.username : "Login"}
                    </span>
                    <FaRegUserCircle />
                    {showDropdown && (
                        <div className="profile-dropdown">
                            <button onClick={handleProfile}>
                                <FaUser />
                                {" Profile"}
                            </button>
                            <button onClick={handleLogout}>
                                <IoIosExit />
                                {" Logout"}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
        <Outlet />
        </>
    )
}