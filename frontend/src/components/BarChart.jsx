import React from 'react'
import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Legend, Tooltip } from 'chart.js'

ChartJS.register(BarElement, CategoryScale, LinearScale, Legend, Tooltip)

export default function BarChart({ data, ...rest }) {

    // state to manage generated colors for the pie chart
    const [generatedColors, setGeneratedColors] = React.useState([])

    // function to generate random colors for the bar chart
    function generateColors(numColors) {
        const colors = []
        for (let i = 0; i < numColors; i++) {
            const hue = Math.floor(Math.random() * 360)
            const saturation = Math.floor(Math.random() * 100) + 50
            const lightness = Math.floor(Math.random() * 50) + 25
            colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`)
        }
        return colors
    }

    React.useEffect(() => {
        // generate colors when the component mounts or data changes
        if (data && data.length) {
            const colors = generateColors(data.length)
            setGeneratedColors(colors)
        }
    }, [JSON.stringify(data)])


    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Questions Graded',
                },
            },
            x: {
                title: {
                    display: true,
                    text: 'Assignments',
                },
            },
        },
    }

    const assignmentLabels = data?.map(item => item.assignment)
    const tas = Object.keys(data[0].data)
    const datasets = tas.map((ta, index) => ({
        label: ta,
        data: data.map(item => item.data[ta]),
        backgroundColor: generatedColors[index],
    }))
    const chartData = {
        labels: assignmentLabels,
        datasets: datasets,
    }

    return (
        <div {...rest}>
            <Bar data={chartData} options={options} />
        </div>
    )
}