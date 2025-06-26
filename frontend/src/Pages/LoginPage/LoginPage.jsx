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

  // Navigation
  const navigate = useNavigate()

  // Handle login submit, update login status
  function handleLoginSubmit(event) {
    console.log("Authenticating...")
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const username = formData.get("username")
    const password = formData.get("password")

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
          setUser(data.user)
          navigate("/user")
          break
        case "failed":
          console.log("Incorrect username or password")
          break
        case "username not found":
          console.log("Username not found")
          break
      }
    })
  }

  function handleSignupSubmit(event) {
    console.log("Signing up...")
    event.preventDefault()
    const formData = new FormData(event.currentTarget) 
    const username = formData.get("username")
    const password = formData.get("password")

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
          <h3>Don't have an account? <span className="switch-login" onClick={() => setIsLogin(false)}>Sign up</span></h3>
          </>
          :
          <>
          <h1>Choose an username and password you'll remember.</h1>
          <h3>Already have an account? <span className="switch-login" onClick={() => setIsLogin(true)}>Login</span></h3>
          </>
        }
        </div>
        <hr className="divider"/>
        <div className="login-container">
            <form onSubmit={isLogin ? handleLoginSubmit : handleSignupSubmit} className="login-form" >
                  <input type="text" placeholder="username" name="username" />
                  <input type="password" name="password" />
                <button className="login">{isLogin ? "Login" : "Sign Up"}</button>
            </form>
        </div>
        </main>
    )
}