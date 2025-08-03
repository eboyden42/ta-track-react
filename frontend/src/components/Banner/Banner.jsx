import React from "react"
import classnames from "classnames"
import Icon from "./Icon"

const BannerContext = React.createContext()

export default function Banner({ children, type, ...rest }) {
    
    const classNames = classnames("banner", type ? `banner-${type}` : "banner-neutral")
    
    
    
    return (
        <BannerContext.Provider value={type} >
        <div {...rest}>
        <div className={classNames}>
            <Icon type={type} />
            <div className="banner-text">
                {children}
            </div>
        </div>
        </div>
        </BannerContext.Provider>
    )
}

export { BannerContext } 