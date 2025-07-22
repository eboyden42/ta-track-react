import React from 'react'
import { Pie } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

export default function PieChart({ data, ...rest }) {


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

    // prepare data for the pie chart
    const generatedColors = generateColors(data.values.length)
    const chartData = {
        labels: data.labels,
        datasets: [
            {
                label: 'Questions Graded',
                data: data.values,
                backgroundColor: generatedColors,
                borderColor: generatedColors,
                borderWidth: 1,
            },
        ],
    }

    return (
        <div {...rest} >
            <Pie data={chartData} />
        </div>
    )
}