import "./Loading.scss"
import { FourSquare } from "react-loading-indicators"

export default function Loading() {
    return (
        <div className="loading-container">
            <h1>Loading...</h1>
            <FourSquare color="#5B85AA" size="small" />
        </div>
    )
}