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
    const [pieChartData, setPieChartData] = useState({})
    const [showPieChart, setShowPieChart] = useState(false)

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
        if (!chart) {
            alert("Please select a chart type.")
            return
        }

        if (assignments.length === 0 || tas.length === 0) {
            alert("Please select at least one assignment and one TA.")
            return
        }

        switch (chart.value) {
            case "pie":
                createPieChart()
                break;
            case "bar":
                createBarChart()
                break;
            case "line":
                createLineChart()
                break;
            default:
                console.error("Invalid chart type selected")
        }
    }

    function createPieChart() {
        console.log("Creating pie chart!")
        
        let includedAssignments = assignments
        let includedTAs = tas

        if (assignments.filter(a => a.value === "all").length === 1) {
            includedAssignments = fetchedAssignments.filter(a => a.value !== "all")
        }

        if (tas.filter(t => t.value === "all").length === 1) {
            includedTAs = fetchedTAs.filter(t => t.value !== "all")
        }

        console.log("Included Assignments:", includedAssignments)
        console.log("Included TAs:", includedTAs)

        fetch(`${import.meta.env.VITE_API_URL}/api/get_pie_chart_data`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                course_id: course_pk,
                assignments: includedAssignments.map(a => a.value),
                tas: includedTAs.map(t => t.value)
            })
        }).then((res) => res.json()).then((data) => {
            if (data.data) {
                setPieChartData(data.data)
                setShowPieChart(true)
            }

            if (data.error) {
                console.error("Error fetching pie chart data:", data.error)
            }
        }).catch(err => console.error(err.error))

    }

    function createBarChart() {
        console.log("Creating bar chart!")
    }

    function createLineChart() {
        console.log("Creating line chart!")
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
            {showPieChart ? 
            <PieChart 
                data={pieChartData}
                className="chart-container"
            />
            : null}
        </div>
    );
}
