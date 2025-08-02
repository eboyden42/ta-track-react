import React from 'react'
import "./Home.scss"
import TAGuideLogo from "../../assets/TAGuide.png"
import { FaArrowRight } from "react-icons/fa"
import { useNavigate } from 'react-router-dom'

export default function Home() {

    const navigate = useNavigate()

    const handleGetStarted = () => {
        navigate("/login")
    }

    return (
        <div className="home">
            <div className="title-container">
                <h1 className="home-title">
                    Welcome to 
                </h1>
                <img 
                    src={TAGuideLogo} 
                    alt="TA Guide" 
                    className="home-logo"
                    aria-label="TA Guide" 
                />
            </div>
            <p>Ready to simplify your teaching assistant data collection processs with one click?</p>
            <div className="btn-container">
                <button className="get-started-btn" onClick={handleGetStarted}>
                    <span>Get Started</span>
                    <FaArrowRight />
                </button>
                <button className="learn-more-btn" onClick={() => navigate("/about")}>
                    Learn More
                </button>
            </div>
        </div>
    )
}