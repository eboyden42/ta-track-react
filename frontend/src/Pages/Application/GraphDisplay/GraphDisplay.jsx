import { useEffect, useState } from "react"
import Select from "react-select"
import PieChart from "../../../components/PieChart"
import BarChart from "../../../components/BarChart"
import LineChart from "../../../components/LineChart"
import "./GraphDisplay.scss"


export default function GraphDisplay({ course_pk }) {
    // state to manage raw selection data from user input
    const [assignments, setAssignments] = useState([]) // value -> assignment primary key, label -> assignment name
    const [tas, setTAs] = useState([]) // value -> TA primary key, label -> TA name
    const [chart, setChart] = useState() // chart type (value is lowercase string, label is display ready)

    // state to manage fetched chart values for pie chart
    const [pieChartData, setPieChartData] = useState({})
    const [showPieChart, setShowPieChart] = useState(false)

    // state to manage fetched bar chart data
    const [barChartData, setBarChartData] = useState([])
    const [showBarChart, setShowBarChart] = useState(false)

    // state to manage fetched line chart data
    const [lineChartData, setLineChartData] = useState([])
    const [showLineChart, setShowLineChart] = useState(false)

    // state to manage fetched assignments and TAs
    const [fetchedAssignments, setFetchedAssignments] = useState([])
    const [fetchedTAs, setFetchedTAs] = useState([])

    useEffect(() => {
        // fetch assignments and TAs from the server
        fetch(`${import.meta.env.VITE_API_URL}/api/get_assignments_and_tas`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ course_id: course_pk })
        }).then((res) => res.json()).then((data) => {
            if (data.assignments) {
                setFetchedAssignments([{ value: "all", label: "All Assignments" }, ...data.assignments])
            }
            if (data.tas) {
                setFetchedTAs([{ value: "all", label: "All TAs" }, ...data.tas])
            }
        })
        .catch((error) => {
            console.error("Error fetching assignments:", error)
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
        setShowBarChart(false)
        setShowLineChart(false)

        let includedAssignments = assignments
        let includedTAs = tas

        if (assignments.filter(a => a.value === "all").length === 1) {
            includedAssignments = fetchedAssignments.filter(a => a.value !== "all")
        }

        if (tas.filter(t => t.value === "all").length === 1) {
            includedTAs = fetchedTAs.filter(t => t.value !== "all")
        }

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
        setShowPieChart(false)
        setShowLineChart(false)

        let includedAssignments = assignments
        let includedTAs = tas

        if (assignments.filter(a => a.value === "all").length === 1) {
            includedAssignments = fetchedAssignments.filter(a => a.value !== "all")
        }

        if (tas.filter(t => t.value === "all").length === 1) {
            includedTAs = fetchedTAs.filter(t => t.value !== "all")
        }

        fetch(`${import.meta.env.VITE_API_URL}/api/get_bar_chart_data`, {
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
                console.log("Bar chart data:", data.data)
                setBarChartData(data.data)
                setShowBarChart(true)
            }

            if (data.error) {
                console.error("Error fetching bar chart data:", data.error)
            }
        })
    }

    function createLineChart() {
        setShowPieChart(false)
        setShowBarChart(false)

        let includedAssignments = assignments
        let includedTAs = tas

        if (assignments.filter(a => a.value === "all").length === 1) {
            includedAssignments = fetchedAssignments.filter(a => a.value !== "all")
        }

        if (tas.filter(t => t.value === "all").length === 1) {
            includedTAs = fetchedTAs.filter(t => t.value !== "all")
        }

        fetch(`${import.meta.env.VITE_API_URL}/api/get_bar_chart_data`, {
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
                console.log("Line chart data:", data.data)
                setLineChartData(data.data)
                setShowLineChart(true)
            }

            if (data.error) {
                console.error("Error fetching line chart data:", data.error)
            }
        })

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

            {showBarChart ?
            <BarChart
                data={barChartData}
                className="chart-container"
            />
            : null}

            {showLineChart ?
            <LineChart
                data={lineChartData}
                className="chart-container"
            />
            : null}
        </div>
    );
}
