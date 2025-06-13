import { useEffect, useState } from 'react';
import LoginPage from './LoginPage';
import Account from './Account'

export default function App() {
  // Login status 
  const [loginStatus, setLoginStatus] = useState(false)

  // Handle login submit, update login status
  function handleSubmit(event) {
    console.log("Authenticating...")
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const username = formData.get("username")
    const password = formData.get("password")
    const courseid = formData.get("courseid")

    fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, courseid }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data)
        setLoginStatus(data.message === "true" ? true : false);
      })
      .catch((err) => console.error('Error:', err));
}

  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(data => console.log(data.message));
  }, []);

  return (
    <>
      {!loginStatus ? <LoginPage handleSubmit={handleSubmit}/> : <Account /> }
    </>
  )
}

