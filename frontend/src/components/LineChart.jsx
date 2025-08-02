import React from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Legend,
  Tooltip,
} from 'chart.js'
import { getColors } from '../utils/colors.js'

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Legend, Tooltip)

export default function LineChart({ data, ...rest }) {

    // state to manage generated colors for the line chart
    const [generatedColors, setGeneratedColors] = React.useState([]);

    React.useEffect(() => {
        // generate colors when the component mounts or data changes
        if (data && data.length) {
            const colors = getColors(data.length)
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
            <Line data={chartData} options={options} />
        </div>
    )
}