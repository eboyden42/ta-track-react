import { useState } from "react";
import "./GraphDisplay.scss"

export default function GraphDisplay() {
    const [activeDropdown, setActiveDropdown] = useState(null);

    const handleFocus = (dropdown) => {
        setActiveDropdown(dropdown);
    };

    const handleBlur = () => {
        setActiveDropdown(null);
    };

    return (
        <div className="graph-display">
            {/* Assignments Dropdown */}
            <select
                className={`dropdown ${activeDropdown === "assignments" ? "active" : ""}`}
                onFocus={() => handleFocus("assignments")}
                onBlur={handleBlur}
            >
                <option value="assignments">Assignments</option>
                <option>All Assignments</option>
            </select>

            {/* TAs Dropdown */}
            <select
                className={`dropdown ${activeDropdown === "tas" ? "active" : ""}`}
                onFocus={() => handleFocus("tas")}
                onBlur={handleBlur}
            >
                <option value="tas">TAs</option>
            </select>

            {/* Chart Types Dropdown */}
            <select
                className={`dropdown ${activeDropdown === "chart-types" ? "active" : ""}`}
                onFocus={() => handleFocus("chart-types")}
                onBlur={handleBlur}
            >
                <option value="chart-types">Chart Types</option>
            </select>

            <button className="create-graph-btn">
                Create Graph
            </button>
        </div>
    );
}
