import React from "react"
import {BrowserRouter, Routes, Route} from "react-router-dom"
import Layout from "./Pages/Layout/Layout"
import LoginPage from "./Pages/LoginPage/LoginPage"
import About from "./Pages/About/About"
import Home from "./Pages/Home/Home"
import ApplicationLayout from "./Pages/Application/ApplicationLayout"
import Dashboard from "./Pages/Application/Dashboard/Dashboard"
import Courses from "./Pages/Application/Courses/Courses"

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
                    <Route path="/user/dashboard" element={<Dashboard />} />
                    <Route path="/user/courses" element={<Courses />} />
                </Route>
            </Routes>
        </BrowserRouter>
        </>
    )
}