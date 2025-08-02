import { useState } from 'react'
import "./GettingStarted.scss"
import { IoIosArrowDown } from "react-icons/io";
import { IoIosArrowBack } from "react-icons/io";
import Banner from "../../../components/Banner/index";

export default function GettingStarted() {

    const [showToc, setShowToc] = useState(true)

    function handleTocExpand() {
        setShowToc(prev => !prev)
    }

    return (
        <div className="getting-started-page">
            <div className="main-content">
                <div className="table-of-contents">
                    <button
                        onClick={handleTocExpand}
                        className="expand-btn"
                    >
                        <h3>
                            Table of Contents
                        </h3>

                        {showToc ? 
                        <IoIosArrowDown />
                        : <IoIosArrowBack /> }
                    </button>
                    {showToc ? 
                    <ul>
                        <li><a href="">Step 1: Adding Gradescope Info</a></li>
                        <li><a href="">Step 2: Adding a Course</a></li>
                        <li><a href="">Step 3: Visualization</a></li>
                        <li><a href="">Troubleshooting</a></li>
                    </ul>
                    : null }
                </div>
                <div className="main-body">
                    <section className="adding-gs-info" >
                        <h2>Step 1: Adding Gradescope Info</h2>
                        <p>
                            The first step in setting up TAGuide is to add your Gradescope information.
                            This is done by navigating to the <strong>Configuration</strong> page in the NavBar.
                        </p>
                        <p>
                            Here, you find a form that allows you to enter your Gradescope email and password. 
                            This information is used to authenticate your account and fetch data from Gradescope. All of your sensitive information is stored securely and is not shared with any third parties for any reason. 
                        </p>
                        <Banner type="neutral">
                            <Banner.Title>Note</Banner.Title>
                            <Banner.Content>
                                If you're still unsure about sharing your Gradescope information, feel free to reach out to me personally, or scan through the open source code on GitHub.
                            </Banner.Content>
                        </Banner>
                        <p>
                            
                        </p>
                    </section>
                </div>
            </div>
        </div>
    )
}