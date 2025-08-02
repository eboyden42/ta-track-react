import React, { useEffect } from 'react'
import { Pie } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { getColors } from '../utils/colors.js'

ChartJS.register(ArcElement, Tooltip, Legend)

export default function PieChart({ data, ...rest }) {

    // state to manage generated colors for the pie chart
    const [generatedColors, setGeneratedColors] = React.useState([])

    useEffect(() => {
        // generate colors when the component mounts or data changes
        if (data && data.values) {
            const colors = getColors(data.values.length)
            setGeneratedColors(colors)
        }
    }, [JSON.stringify(data.values), JSON.stringify(data.labels)])

    // prepare data for the pie chart
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