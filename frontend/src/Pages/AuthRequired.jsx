import { Outlet } from "react-router-dom"
import { UserContext } from "../App"
import { useContext, useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import Loading from "./Loading/Loading"

export default function AuthRequired() {

    const { user, setUser } = useContext(UserContext)
    const [autheticated, setAuthenticated] = useState(false)
    const navigate = useNavigate()
    const location = useLocation()

    useEffect(() => {
        const isReload = sessionStorage.getItem('isReload')

        if (!isReload) {
            // Set the flag in sessionStorage to indicate the component has been loaded
            sessionStorage.setItem('isReload', 'true');
        } else {
            // Attempt to restore session from cookies
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
                // Session found, update user context
                console.log("Session persisted...")
                setUser(data.user)
                setAuthenticated(true)
            })
            .catch((err) => {
                console.log(err)
                setAuthenticated(false)
                navigate("/login", { state: { from: location } })
            })
        }
    }, [])

    if (!autheticated) {
        return <Loading />
    }

    return (
        <>
            <Outlet />
        </>
    );
}