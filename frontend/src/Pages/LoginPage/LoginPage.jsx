import { useContext, useEffect, useState } from "react"
import "./LoginPage.scss"
import Application from "../Application/ApplicationLayout"
import { UserContext } from "../../App"
import { useNavigate } from "react-router-dom"

export default function LoginPage() {

  // User context
  const {user, setUser} = useContext(UserContext)

  // State for if user is loggin in or signing up
  const [isLogin, setIsLogin] = useState(true)

  // Controlled form for login/signup
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  // Error messages state
  const [userErrorMessage, setUserErrorMessage] = useState(null)
  const [passwordErrorMessage, setPasswordErrorMessage] = useState(null)

  // Navigation
  const navigate = useNavigate()

  // handle switch between login and signup
  function handleSwitchLogin() {
    setIsLogin(prev => !prev)
    setUsername("") // clear username on switch
    setPassword("") // clear password on switch

    setUserErrorMessage(null) // clear user error message on switch
    setPasswordErrorMessage(null) // clear password error message on switch
  }

  // Handle user state change
  function handleUsernameChange(e) {
    setUsername(e.target.value)
    if (!isLogin && e.target.value.length > 0) {
      // check if username already exists
      checkUsernameExists(e.target.value)
       .catch((err) => {
         console.error("Error checking username:", err);
       })
      
      // require username to be 8 or more characters for login
      if (e.target.value.length < 8) {
        setUserErrorMessage("Username must be at least 8 characters long")
      }
      // require username to be alphanumeric for login
      else if (!/^[a-zA-Z0-9]+$/.test(e.target.value)) {
        setUserErrorMessage("Username must be alphanumeric")
      } else {
        setUserErrorMessage(null)
      }

    } else {
      setUserErrorMessage(null)
    }
  }

  async function checkUsernameExists(username) {
    fetch(`${import.meta.env.VITE_API_URL}/api/check_username`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: "include",
      body: JSON.stringify({ username }),
    })
    .then((res) => res.json())
    .then((data) => {
      const message = data.message
      switch (message) {
        case "username taken":
          setUserErrorMessage("Username already exists")
          break
        case "username available":
          break
      }
    })
  }

  function handlePasswordChange(e) {
    setPassword(e.target.value)
    if (!isLogin && e.target.value.length > 0) {
      // require password to be 8 or more characters for login
      if (e.target.value.length < 8) {
        setPasswordErrorMessage("Password must be at least 8 characters long")
      } else {
        setPasswordErrorMessage(null)
      }
    }
  }

  // Handle login submit, update login status
  function handleLoginSubmit(e) {
    e.preventDefault()
    console.log("Authenticating...")

    logUserIn(username, password)
      .catch((err) => console.error('Error loggin in:', err));
  }

  async function logUserIn(username, password) {
    fetch(`${import.meta.env.VITE_API_URL}/api/user_login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: "include",
      body: JSON.stringify({ username, password }),
    })
    .then((res) => res.json())
    .then((data) => {
      // execute code based on response
      console.log(data)
      const message = data.message
      switch (message) {
        case "verified":
          setUser(data.user) // setting the user will trigger the useEffect in Layout, navigating to the dashboard
          break
        case "failed":
          setPasswordErrorMessage("Incorrect password")
          console.log("Incorrect username or password")
          break
        case "username not found":
          console.log("Username not found")
          break
      }
    })
  }

  function handleSignupSubmit(event) {
    event.preventDefault()
    console.log("Signing up...")

    fetch(`${import.meta.env.VITE_API_URL}/api/create_user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: "include",
      body: JSON.stringify({ username, password }),
    })
    .then((res) => res.json())
    .then((data) => {
      const message = data.message
      if (message === "user created") {
        logUserIn(username, password)
          .catch((err) => console.error("Error loggin in:", err));
      }
    })
    .catch((err) => console.error("Error creating user:", err));
  }    
    return (
        <main className="login-page">
        <div className="header">
          {isLogin ?
          <>
          <h1>Welcome back.</h1>
          <h3>Don't have an account? <span className="switch-login" onClick={handleSwitchLogin}>Sign up</span></h3>
          </>
          :
          <>
          <h1>Choose an username and password you'll remember.</h1>
          <h3>Already have an account? <span className="switch-login" onClick={handleSwitchLogin}>Login</span></h3>
          </>
        }
        </div>
        <hr className="divider"/>
        <div className="login-container">
            <form onSubmit={isLogin ? handleLoginSubmit : handleSignupSubmit} className="login-form" >
                  <input 
                  type="text" 
                  placeholder="username" 
                  name="username"
                  value={username}
                  onChange={handleUsernameChange}
                  />
                  <span className="error-message">{userErrorMessage}</span>
                  <input 
                  type="password" 
                  name="password"
                  value={password}
                  onChange={handlePasswordChange}
                  />
                  <span className="error-message">{passwordErrorMessage}</span>
                <button className="login">{isLogin ? "Login" : "Sign Up"}</button>
            </form>
        </div>
        </main>
    )
}