import "./ErrorPage.scss"
import { IoArrowBackOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

export default function ErrorPage() {

    const navigate = useNavigate()

    function handleReturn() {
        navigate("/user/dashboard")
    }

    return (
        <>
        <main>
            <h1><span>Error Code 404:</span> Page not found.</h1>
            <p>The page your looking for does not exist, or has been depreciated.</p>
            <button className="return-btn" onClick={handleReturn}> <IoArrowBackOutline />  Return</button>
        </main>
        </>
    )
}