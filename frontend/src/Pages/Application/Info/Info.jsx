import React, { useState, useContext, useEffect } from 'react'
import { UserContext } from '../../../App'
import './Info.scss'

export default function Info() {
    const { user } = useContext(UserContext)
    const [showForm, setShowForm] = useState(true)
    const [gradescopeUsername, setUsername] = useState('')
    const [gradescopePassword, setPassword] = useState('')

    useEffect(() => {
        // fetch gradescope user info if available, if not display form
        fetch('/api/get_gs_info', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username: user.username}),
        }).then((response) => {
            if (response.ok) {
                const data = response.json()
                setUsername(data.gradescope_username)
                setPassword(data.gradescope_password)
                console.log('Fetched Gradescope user info:', data)
                setShowForm(false)
            } else {
                throw new Error('Failed to fetch Gradescope user info')
            }
        }).catch((error) => {
            console.error('Error fetching Gradescope user info:', error)
        })

    }, [])

    function handleUsernameChange(e) {
        setUsername(e.target.value)
    }

    function handlePasswordChange(e) {
        setPassword(e.target.value)
    }

    function handleSubmit(e) {
        e.preventDefault()
        fetch('/api/update_gs_user', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username: user.username, gradescope_username: gradescopeUsername, gradescope_password: gradescopePassword }),
        }).then((response) => {
            if (response.ok) {
                console.log('Gradescope user info updated successfully')
                setShowForm(false)
            } else {
                console.error('Failed to update Gradescope user info')
            }
        })
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
                            value={gradescopeUsername}
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
                            value={gradescopePassword}
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