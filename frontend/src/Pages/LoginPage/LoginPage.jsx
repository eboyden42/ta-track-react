import { useEffect, useState } from "react"
import "./LoginPage.scss"
import Application from "../Application/Application"

export default function LoginPage() {

  const [user, setUser] = useState(null)

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

useEffect(() => {
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
    })
    .catch(() => console.log("User not logged in"))
}, [])

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
        <Application user={user} />
        }
        </>
    )
}