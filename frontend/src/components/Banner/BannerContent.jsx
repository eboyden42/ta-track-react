import React from "react"
import { BannerContext } from "./Banner"
import classnames from "classnames"

export default function BannerContent({ children }) {
    const type = React.useContext(BannerContext)
    const classNames = classnames("content", type ? `content-${type}` : "content-neutral")
    
    return <div className={classNames}>{children}</div>
}