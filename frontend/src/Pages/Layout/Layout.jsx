import { useContext, useEffect } from "react"
import { NavLink, Outlet, useNavigate } from "react-router-dom"
import { UserContext } from "../../App"
import "./Layout.scss"
import TAGuideLogo from "../../assets/TAGuide.png"

export default function Layout() {

    const { user, setUser } = useContext(UserContext)

    
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
        .catch((err) => console.log("User not logged in: ", err))
    }, [])

    return (
        <>
        <div className="nav-container">
            <nav>
                <div className="left-tabs">
                    <NavLink to="/">
                        <img src={TAGuideLogo} alt="TAGuide Logo" className="logo" />
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