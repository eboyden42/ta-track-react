import React from "react"
import { FaCircleCheck } from "react-icons/fa6";
import { IoIosWarning } from "react-icons/io";
import { FaCircleXmark } from "react-icons/fa6";
import { FaInfoCircle } from "react-icons/fa";

export default function Icon({ type }) {
    switch (type) {
        case "success":
            return <FaCircleCheck className="icon icon-success" />
        case "warning":
            return <IoIosWarning className="icon icon-warning" />
        case "error":
            return <FaCircleXmark className="icon icon-error" />
        default:
            return <FaInfoCircle className="icon icon-neutral" />
    }
}