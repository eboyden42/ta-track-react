import React, { useState, useContext, useEffect } from 'react'
import { UserContext } from '../../../App'
import './Info.scss'

export default function Info() {
    const {user} = useContext(UserContext)
    const [showForm, setShowForm] = useState(false)
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')

    useEffect(() => {
        // fetch gradescope user info if available, if not display form
    })

    const handleUsernameChange = (e) => {
        setUsername(e.target.value)
    }

    const handlePasswordChange = (e) => {
        setPassword(e.target.value)
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        // Implement submit handler
    }

    return (
        <div style={{ maxWidth: 400, margin: '0 auto', padding: 20 }}>
            <h2>We'll need your gradescope login information to get started, don't worry all information is securely encrypted.</h2>
            <h3>Please enter your gradescope login below. When you're ready, press submit.</h3>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 16 }}>
                    <label>
                        Username:
                        <input
                            type="text"
                            value={username}
                            onChange={handleUsernameChange}
                            style={{ width: '100%', padding: 8, marginTop: 4 }}
                            autoComplete="username"
                        />
                    </label>
                </div>
                <div style={{ marginBottom: 16 }}>
                    <label>
                        Password:
                        <input
                            type="password"
                            value={password}
                            onChange={handlePasswordChange}
                            style={{ width: '100%', padding: 8, marginTop: 4 }}
                            autoComplete="current-password"
                        />
                    </label>
                </div>
                <button type="submit" style={{ padding: '8px 16px' }}>
                    Submit
                </button>
            </form>
        </div>
    )
}