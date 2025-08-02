const PRESET_COLORS = [
  '#FF6384', // red-ish
  '#36A2EB', // blue-ish
  '#FFCE56', // yellow
  '#4BC0C0', // teal
  '#9966FF', // purple
  '#FF9F40', // orange
  '#C9CBCF', // gray
  '#8BC34A', // green
  '#F06292', // pink
  '#BA68C8', // violet
]

function generateColors(numColors) {
    const colors = [];
    for (let i = 0; i < numColors; i++) {
        const hue = Math.floor(Math.random() * 360);
        const saturation = Math.floor(Math.random() * 100) + 50;
        const lightness = Math.floor(Math.random() * 50) + 25;
        colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
    }
    return colors;
}

export function getColors(dataLength) {
    if (dataLength <= PRESET_COLORS.length) {
        return PRESET_COLORS.slice(0, dataLength)
    } else {
        const generated = generateColors(dataLength - PRESET_COLORS.length)
        return [...PRESET_COLORS, ...generated]
    }
}