import React from "react"
import { BannerContext } from "./Banner"
import classnames from "classnames"

export default function BannerTitle({ children }) {
    
    const type = React.useContext(BannerContext)
    const classNames = classnames("title", type ? `title-${type}` : "title-neutral")
    
    return <div className={classNames}>{children}</div>
}