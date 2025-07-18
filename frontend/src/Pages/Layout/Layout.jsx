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
      // if user is logged in navigate to the user page
      console.log(user)
      if (user) {
        navigate("/user/dashboard")
      }
    }, [user])

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