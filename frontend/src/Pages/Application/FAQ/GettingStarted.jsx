import { useState, useRef } from 'react'
import "./GettingStarted.scss"
import { IoIosArrowDown } from "react-icons/io";
import { IoIosArrowBack } from "react-icons/io";
import Banner from "../../../components/Banner/index";

export default function GettingStarted() {

    // state to manage table of contents visibility
    const [showToc, setShowToc] = useState(true)

    // refs for sections to scroll to
    const step1Ref = useRef(null)
    const step2Ref = useRef(null)
    const step3Ref = useRef(null)
    const step4Ref = useRef(null)
    const troubleshootingRef = useRef(null)

    function handleTocExpand() {
        setShowToc(prev => !prev)
    }

    function handleScrollToSection(ref) {
        window.scrollTo({
            top: ref.offsetTop,
            left: 0,
            behavior: "smooth",
        })
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
                        <li>
                            <a 
                                href="#step-one" 
                                onClick={() => handleScrollToSection(step1Ref.current)}
                            >
                                Step 1: Adding Gradescope Info
                            </a>
                        </li>
                        <li>
                            <a 
                                href="#step-two" 
                                onClick={() => handleScrollToSection(step2Ref.current)}
                            >
                                Step 2: Adding a Course
                            </a></li>
                        <li>
                            <a 
                                href="#step-three" 
                                onClick={() => handleScrollToSection(step3Ref.current)}
                            >
                                Step 3: Running a Job
                            </a>
                        </li>
                        <li>
                            <a 
                                href="#step-four" 
                                onClick={() => handleScrollToSection(step4Ref.current)}
                            >
                                Step 4: Visualization
                            </a>
                        </li>
                        <li>
                            <a 
                                href="#troubleshooting" 
                                onClick={() => handleScrollToSection(troubleshootingRef.current)}
                            >
                                Troubleshooting
                            </a>
                        </li>
                    </ul>
                    : null }
                </div>
                <div className="main-body">
                    <section className="adding-gs-info" ref={step1Ref}>
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
                            After pressing submit, you should see a message indicating that your Gradescope information has been successfully added. Check to ensure that the displayed email matches your Gradescope account.
                        </p>
                        <Banner type="warning">
                            <Banner.Title>Warning</Banner.Title>
                            <Banner.Content>
                                An incorrect email or password will prevent TAGuide from fetching your Gradescope data. If you encounter any issues, please double-check your credentials and try again.
                            </Banner.Content>
                        </Banner>
                    </section>
                    <section className="adding-course" ref={step2Ref}>
                        <h2>Step 2: Adding a Course</h2>
                        <p>
                            Once your Gradescope information is set up, you can add a course by navigating to the <strong>Dashboard</strong> page in the NavBar.
                        </p>
                        <p>
                            On the Dashboard, you will see a button labeled <strong className="add-course">+ Add Course</strong>. Clicking this button will open a form where you can enter the course title and Gradescope ID.
                        </p>
                        <h3>Where can I find the course title?</h3>
                        <p>
                            The course title can be anything you want! It's entirely client side, and simply and useful label for your convenience. A changed course title will not affect the performance of scraping tasks.
                        </p>
                        <h3>Where can I find the Gradescope ID?</h3>
                        <p>
                            The Gradescope ID, however, is a unique identifier for your course on Gradescope. You can find it in the URL when you're viewing your course on Gradescope. It usually looks something like this: <code>www.gradescope.com/courses/123456</code>. </p> 
                        <p> In this example, <code>123456</code> is the Gradescope ID for the course.</p>
                        <p> It can also be found by navigating to your course in gradescope, and looking just below the course title on the main dashboard. You should see text like <code>Course ID: 123456</code>.</p>
                        <p>Once you've confirmed the course ID, press submit to create the course. You should see the course appear in the course list on the left Dashboard.</p>
                    </section>
                    <section className="running-job" ref={step3Ref}>
                        <h2>Step 3: Running a Job</h2>
                        <p>
                            With your course added, you can now run a job to fetch data from Gradescope. To do this, simply press the <strong className="start-scrape-btn">Start Scraping Job</strong> button on the Dashboard.
                        </p>
                        <p>
                            Once the job is running, you'll see real-time updates on the scraping process, including any errors or issues that may arise.
                        </p>
                        <h3>What should I do if I encounter errors?</h3>
                        <p>
                            If you encounter any errors during the scraping process, don't worry! The Dashboard will provide detailed error messages to help you troubleshoot the issue. Common problems include incorrect course IDs, gradescope information errors, or network issues.
                        </p>
                        <h3>How can I edit or delete a course?</h3>
                        <p>
                            To edit or delete a course, click on the gear icon in the top right corner of the course card. This will open a menu where you can choose to edit the course title, change the course ID or delete the course entirely.
                        </p>
                        <Banner type="warning">
                            <Banner.Title>Warning</Banner.Title>
                            <Banner.Content>
                                Attempting to change the course ID after a scraping job has been started will be met with an error. If you need to change the course ID, please delete the course and add it again with the new ID.
                            </Banner.Content>
                        </Banner>   
                    </section>
                </div>
            </div>
        </div>
    )
}