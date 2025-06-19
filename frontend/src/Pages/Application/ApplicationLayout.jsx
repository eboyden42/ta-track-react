import { FaRegUserCircle } from "react-icons/fa";
import "./ApplicationLayout.scss"
import { UserContext } from "../../App";
import { useContext, useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

export default function ApplicationLayout() {

    const { user, setUser } = useContext(UserContext)
    const [showDropdown, setShowDropdown] = useState(false);

    function handleProfileClick(e) {
        e.preventDefault();
        setShowDropdown((prev) => !prev);
    }

    function handleLogout() {
        // Add your logout logic here
        setShowDropdown(false);
    }

    
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

    return (
        <>
        <nav>
            <div className="left-tabs">
                <NavLink to="/user">Dashboard</NavLink>
                <NavLink to="/user/courses">Courses</NavLink>
                <NavLink to="/user/info">Info</NavLink>
            </div>
            <div className="right-tabs">
                <NavLink className="profile" to="/user">
                {
                    //update this with a profile and logout dropdown
                }
                    {user ? user.username : "Login"}
                    <FaRegUserCircle />
                    {showDropdown && (
                        <div className="profile-dropdown">
                            <NavLink to="/user/profile" onClick={() => setShowDropdown(false)}>Profile</NavLink>
                            <button onClick={handleLogout}>Logout</button>
                        </div>
                    )}
                </NavLink>
            </div>
        </nav>
        <Outlet />
        </>
    )
}