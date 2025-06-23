import React, { useState, useContext, useEffect } from 'react'
import { UserContext } from '../../../App'
import './Info.scss'

export default function Info() {
    // Access user state from context
    const { user } = useContext(UserContext)

    // State to control form visibility
    const [showForm, setShowForm] = useState(true)

    // State for fetched Gradescope username
    const [fetchedUsername, setFetchedUsername] = useState('')

    // State for form fields of Gradescope username and password
    const [gradescopeUsername, setUsername] = useState('')
    const [gradescopePassword, setPassword] = useState('')

    useEffect(() => {
        if (!user) {
            return
        }
        // fetch gradescope user info if available, if not display form
        fetch('/api/get_gs_info', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username: user.username}),
        }).then((response) => response.json())
        .then((data) => {
            if (data.gradescope_username) {
                setFetchedUsername(data.gradescope_username)
                setUsername(data.gradescope_username)
                setPassword(data.gradescope_password)
                setShowForm(false) // Hide form if user info is fetched
            } else {
                console.log('No Gradescope user info found, displaying form')
            }
        })
        .catch((error) => {
            console.error(error)
        })

    }, [user, fetchedUsername])

    function handleUsernameChange(e) {
        setUsername(e.target.value)
    }

    function handlePasswordChange(e) {
        setPassword(e.target.value)
    }

    function handleUpdateClick() {
        setShowForm(true) // Show form when user clicks update button
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
                setFetchedUsername(gradescopeUsername)
                setShowForm(false)
            } else {
                console.error('Failed to update Gradescope user info')
            }
        })
    }

    return showForm ? (
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
    ) : <>
    <div>
        <h2>Gradescope Information</h2>
        <p>Your Gradescope username is: {fetchedUsername}</p>
        <p>Your Gradescope password is securely stored and not displayed here.</p>
        <button onClick={handleUpdateClick}>
            Update Gradescope Information
        </button>
    </div>
    </>
}