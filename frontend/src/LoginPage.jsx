import "./index.css"

export default function LoginPage({ handleSubmit }) {

    return (
        <>
        <div className="login-container">
            <form onSubmit={handleSubmit} className="login-form" >
                <label htmlFor="username">Username:</label>
                    <input type="text" placeholder="username" name="username" id="username" />
                <label htmlFor="passoword">Password:</label>
                    <input type="password" name="password" id="password" />
                <button>Login</button>
            </form>
        </div>
        </>
    )
}