import { useEffect, useState } from "react"
import Select from "react-select"
import PieChart from "../../../components/PieChart/PieChart"
import "./GraphDisplay.scss"
import { Pie } from "react-chartjs-2"

export default function GraphDisplay() {
    // state to manage raw selection data from user input
    const [assignments, setAssignments] = useState([]) // value -> assignment primary key, label -> assignment name
    const [tas, setTAs] = useState([]) // value -> TA primary key, label -> TA name
    const [chart, setChart] = useState() // chart type (value is lowercase string, label is display ready)

    // state to manage fetched chart values for pie chart
    const [chartData, setChartData] = useState({})

    const testChartData = {
        labels: ["Eli Boyden", "John Johnson", "Joe Schmoe"],
        values: [10, 20, 30]
    }

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
                    options={chartTypes}
                    onChange={handleChartTypeChange}
                    placeholder="Select Chart Type"
                    isSearchable={false}
                />
                
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
