import { useContext, useEffect, useState } from "react"
import "./LoginPage.scss"
import Application from "../Application/ApplicationLayout"
import { UserContext } from "../../App"
import { useNavigate } from "react-router-dom"

export default function LoginPage() {

  // User context
  const {user, setUser} = useContext(UserContext)

  // Navigation
  const navigate = useNavigate()

  // Handle login submit, update login status
  function handleSubmit(event) {
    console.log("Authenticating...")
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const username = formData.get("username")
    const password = formData.get("password")

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
      .catch((err) => console.error('Error:', err));
}

    return (
        <>
        {!user ? 
        <div className="login-container">
            <form onSubmit={handleSubmit} className="login-form" >
                <label htmlFor="username">Username</label>
                    <input type="text" placeholder="username" name="username" id="username" />
                <label htmlFor="passoword">Password</label>
                    <input type="password" name="password" id="password" />
                <button>Login</button>
            </form>
        </div> : 
         null
        }
        </>
    )
}