import React from "react"
import {BrowserRouter, Routes, Route} from "react-router-dom"
import Layout from "./Pages/Layout/Layout"
import LoginPage from "./Pages/LoginPage/LoginPage"
import About from "./Pages/About/About"
import Home from "./Pages/Home/Home"

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
            </Routes>
        </BrowserRouter>
        </>
    )
}