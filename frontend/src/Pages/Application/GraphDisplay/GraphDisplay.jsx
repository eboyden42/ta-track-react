import { useEffect, useState } from "react"
import Select from "react-select"
import PieChart from "../../../components/PieChart/PieChart"
import "./GraphDisplay.scss"
import { Pie } from "react-chartjs-2"

export default function GraphDisplay({ course_pk }) {
    // state to manage raw selection data from user input
    const [assignments, setAssignments] = useState([]) // value -> assignment primary key, label -> assignment name
    const [tas, setTAs] = useState([]) // value -> TA primary key, label -> TA name
    const [chart, setChart] = useState() // chart type (value is lowercase string, label is display ready)

    // state to manage fetched chart values for pie chart
    const [chartData, setChartData] = useState({})

    // state to manage fetched assignments and TAs
    const [fetchedAssignments, setFetchedAssignments] = useState([])
    const [fetchedTAs, setFetchedTAs] = useState([])

    const testChartData = {
        labels: ["Eli Boyden", "John Johnson", "Joe Schmoe"],
        values: [10, 20, 30]
    }

    useEffect(() => {
        // fetch assignments and TAs from the server
        fetch(`${import.meta.env.VITE_API_URL}/api/get_assignments`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ course_id: course_pk })
        }).then((res) => res.json()).then((data) => {
            if (data.assignments) {
                setFetchedAssignments(data.assignments)
                setFetchedAssignments(prev => [{ value: "all", label: "All Assignments"}, ...prev])

            }
        })
        .catch((error) => {
            console.error("Error fetching assignments:", error)
        })

        fetch(`${import.meta.env.VITE_API_URL}/api/get_tas`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ course_id: course_pk })
        }).then((res) => res.json()).then((data) => {
            if (data.tas) {
                setFetchedTAs(data.tas)
                setFetchedTAs(prev => [{ value: "all", label: "All TAs"}, ...prev])
            }
        })
        .catch((error) => {
            console.error("Error fetching TAs:", error.error)
        })

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

    const chartTypes = [
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

    function handleChartTypeChange(selected) {
        setChart(selected)
    }

    function handleCreateChart() {
        console.log(assignments, tas, chart)
        // fetch data from the server to create the chart   
    }

    return (
        <div className="graph-display">
            <div className="graph-controls">
                <div>
                    {/* Assignments Dropdown */}
                    <Select 
                        options={fetchedAssignments}
                        isMulti
                        onChange={handleAssignmentsChange}
                        placeholder="Select Assignments"
                    />
                </div>

                <div>
                    {/* TAs Dropdown */}
                    <Select 
                        options={fetchedTAs}
                        isMulti
                        onChange={handleTAChange}
                        placeholder="Select TAs"
                    />
                </div>

                <div>
                    {/* Chart Types Dropdown */}
                    <Select 
                        options={chartTypes}
                        onChange={handleChartTypeChange}
                        placeholder="Select Chart Type"
                        isSearchable={false}
                    />
                </div>
                
                <button 
                    className="create-chart-btn"
                    onClick={handleCreateChart}
                >
                    Create Chart
                </button>
            </div>
            <PieChart 
                data={{
                    labels: testChartData.labels,
                    values: testChartData.values
                }}
                className="chart-container"
            />
        </div>
    );
}
