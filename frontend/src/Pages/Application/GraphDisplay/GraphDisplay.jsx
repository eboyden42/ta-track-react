import { useEffect, useState } from "react"
import Select from "react-select"
import "./GraphDisplay.scss"

export default function GraphDisplay() {
    const [assignments, setAssignments] = useState([])
    const [tas, setTAs] = useState([])
    const [graph, setGraph] = useState()

    useEffect(() => {
        // fetch assignments and TAs from the server

    }, [])
    
    const testAssignmentOptions = [
        { value: "all", label: "All Assignments"},
        { value: "graded", label: "Graded Assignments"},
        { value: "703", label: "Assignment 1" },
        { value: "704", label: "Assignment 2" },
        { value: "705", label: "Assignment 3" },
        { value: "715", label: "Assignment 4" },
    ]

    const testTAOptions = [
        { value: "34", label: "Eli Boyden" },
        { value: "35", label: "John Johnson" },
        { value: "36", label: "Joe Schmoe" },
    ]
    
    const graphTypes = [
        {value: "pie", label: "Pie"},
        {value: "bar", label: "Bar"},
        {value: "line", label: "Line"}
    ]

    function handleAssignmentsChange(selected) {
        setAssignments(selected)
    }

    function handleTAChange(selected) {
        setTAs(selected)
    }

    function handleGraphTypeChange(selected) {
        setGraph(selected)
    }

    function handleCreateGraph() {
        console.log(assignments, tas, graph)
        // fetch data from the server to create the graph
    }

    return (
        <div className="graph-display">
            {/* Assignments Dropdown */}
            <Select 
                options={testAssignmentOptions}
                isMulti
                onChange={handleAssignmentsChange}
                placeholder="Select Assignments"
            />

            {/* TAs Dropdown */}
           <Select 
                options={testTAOptions}
                isMulti
                onChange={handleTAChange}
                placeholder="Select TAs"
            />

            {/* Chart Types Dropdown */}
            <Select 
                options={graphTypes}
                onChange={handleGraphTypeChange}
                placeholder="Select Graph"
                isSearchable="false"
            />
            
            <button 
                className="create-graph-btn"
                onClick={handleCreateGraph}
            >
                Create Graph
            </button>
        </div>
    );
}
