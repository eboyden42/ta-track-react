import React, { useState, useContext, useEffect, use } from 'react'
import { FourSquare } from "react-loading-indicators"
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

    // State to handle loading
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (!user) {
            return
        }
        
        if (fetchedUsername !== '' || gradescopeUsername !== '' || gradescopePassword !== '') {
            setIsLoading(false)
        }

    }, [fetchedUsername, gradescopePassword, gradescopePassword]

    )

    useEffect(() => {
        if (!user) {
            return
        }
        // fetch gradescope user info if available, if not display form
        fetch(`${import.meta.env.VITE_API_URL}/api/get_gs_info`, {
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
                console.log(data.message)
            }
        })
        .catch((error) => {
            console.log('Error fetching Gradescope user info:', error)
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
        fetch(`${import.meta.env.VITE_API_URL}/api/update_gs_user`, {
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

    return <>
    
    {
        isLoading ? (
        <>
            <h2 className="loading-message">Loading configuration info...</h2>
            <FourSquare color="#5B85AA" size="small" />
        </>
        ) : (
            showForm ? (
                <div className="form-container">
                    <h2>We'll need your gradescope login information to get started, don't worry all information is securely encrypted.</h2>
                    <h3>Please enter your gradescope login below. If there are any issues, we'll let you know.</h3>
                    <form className="info-form" onSubmit={handleSubmit}>
                        <input
                            type="text"
                            value={gradescopeUsername}
                            onChange={handleUsernameChange}
                            placeholder="Gradescope email or username"
                        />
                        <input
                            type="password"
                            value={gradescopePassword}
                            onChange={handlePasswordChange}
                            placeholder="Gradescope password"
                        />
                        <button className="submit" type="submit">
                            Submit
                        </button>
                    </form>
                </div>
            ) : (
                <div className="info-container">
                    <h2>Gradescope Information</h2>
                    <p>Your Gradescope username is: {fetchedUsername}</p>
                    <p>Your Gradescope password is securely stored on our encrypted database and not displayed here.</p>
                    <button className="update-btn" onClick={handleUpdateClick}>
                        Update Gradescope Information
                    </button>
                </div>
            )
        )
    }
    </>
}