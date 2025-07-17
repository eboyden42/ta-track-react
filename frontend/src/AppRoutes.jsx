import React from "react"
import {BrowserRouter, Routes, Route} from "react-router-dom"
import Layout from "./Pages/Layout/Layout"
import LoginPage from "./Pages/LoginPage/LoginPage"
import About from "./Pages/About/About"
import Home from "./Pages/Home/Home"
import ApplicationLayout from "./Pages/Application/ApplicationLayout"
import Dashboard from "./Pages/Application/Dashboard/Dashboard"
import Info from "./Pages/Application/Info/Info"
import CourseCard from "./Pages/Application/CourseCard/CourseCard"
import DefaultCard from "./Pages/Application/DefaultCard/DefaultCard"

export default function AppRoutes() {
    return (
        <>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout />} >
                    <Route index element={<Home/>} />
                    <Route path="/about" element={<About/>} />
                    <Route path="/login" element={<LoginPage/>} />
                </Route>
                <Route path="/user" element={<ApplicationLayout />} >
                    <Route index element={<Dashboard />} />
                    <Route path="/user/dashboard" element={<Dashboard />}>
                        <Route index element={<DefaultCard />} />
                        <Route path="/user/dashboard/:id" element={<CourseCard />}/>
                    </Route>
                    <Route path="/user/info" element={<Info />} />
                </Route>
            </Routes>
        </BrowserRouter>
        </>
    )
}