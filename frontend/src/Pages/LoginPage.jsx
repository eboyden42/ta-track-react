import "./LoginPage.scss"

export default function LoginPage() {

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
      body: JSON.stringify({ username, password }),
    })
      .then((res) => res.json())
      .then((data) => {
        // reroute based on response
        console.log(data)
      })
      .catch((err) => console.error('Error:', err));
}


    return (
        <>
        <div className="login-container">
            <form onSubmit={handleSubmit} className="login-form" >
                <label htmlFor="username">Username</label>
                    <input type="text" placeholder="username" name="username" id="username" />
                <label htmlFor="passoword">Password</label>
                    <input type="password" name="password" id="password" />
                <button>Login</button>
            </form>
        </div>
        </>
    )
}