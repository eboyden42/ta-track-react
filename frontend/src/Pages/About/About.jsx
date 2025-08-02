import React from 'react'
import "./About.scss"
import CodeImg from "../../assets/code.png"

export default function About() {
    return (
        <div className="about">
            <div className="main-content">
                <section className="about-creator">
                    <div className="left">
                        <h2>About the Creator</h2>
                        <p>Hi, I'm Eli Boyden, a Computer Science, Mathematics, and Data Science student at <a href="https://www.virginia.edu" target='_blank'>UVA</a>. I love coding, teaching, and applying my skills to projects that can save time for myself and others. I'm a teaching assitant for Calculus II (APMA 1110) and I noticed it was very hard to keep track of what questions were being graded by which TA. I wanted to make a tool that would help me centralize this data, and TAGuide was born.</p>

                        <p>TAGuide started from a simple python scraper, and developed into a full-stack application that I use to keep up with my TA team's grading and progress.</p>
                    </div>
                    <div className="right">
                        <img 
                        src="https://avatars.githubusercontent.com/u/185650633?v=4" alt="Eli Boyden" 
                        />
                    </div>
                </section>
                <section className="about-project">
                    <div className="left">
                        <img 
                        alt="Screenshot of some code from TAGuide v1.0"
                        src={CodeImg}
                        />
                    </div>
                    <div className="right">
                        <h2>About the Project</h2>
                        <p>The first version of TAGuide was a script that ran using a basic CLI. This tool was useful, but it could only create a total agregation pie chart, and had no methods of persitence. This meant that data visualization was limited and time was wasted rescraping data each time you wanted an updated chart.</p>

                        <p>To fix this I decided to leverage my React skills to build a simple user interface, and add persitence with PostgreSQL. </p>
                    </div>
                </section>
                <section className="about-tech">
                    <div className="left">
                        <h2>About the Tech</h2>
                        <p>TAGuide is built using a React frontend, and a Flask backend. The frontend uses React Router for routing, and Chart.js for data visualization. The backend uses Flask to handle requests, and PostgreSQL to store data.</p>

                        <p>Some other tools I used are python's thread pool executor (for management of concurrent tasks), APScheduler (for reoccurring new data checks), socketio (for live updates on scraping progress), and bcrypt and fernet (for secure encryption and storage of login info).</p>
                    </div>
                    <div className="right">
                    </div>
                </section>
            </div>
        </div>
    )
}