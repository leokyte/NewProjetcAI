import React, { memo } from 'react'
import { G, Text as TextSVG } from 'react-native-svg'

/**
 * Renders correctly positionated labels for line charts
 * PS: currently, only supports 1 row.
 * @param {
 * data: {[key: string]: number}[]
 * width: number;
 * height: number;
 * } props
 * @returns
 */
function LineChartLabels({ data, width, height, colors }) {
	let lastX = 0
	const [firstRow] = data ?? []

	const renderLabel = ({ x, y, label, color }) => (
		<G>
			<TextSVG
				fill={color}
				stroke={color}
				fontSize={12}
				fontFamily="Graphik-Extralight"
				letterSpacing={1}
				x={x}
				y={y}
				textAnchor="middle"
			>
				{label}
			</TextSVG>
		</G>
	)

	return (
		<>
			{Object.keys(firstRow).map((key, index) => {
				const label = `${Number(firstRow[key] ?? 0).toFixed(2)}%`
				const percentage = firstRow[key]
				const sliceWidth = width * (percentage / 100)
				const x = lastX + sliceWidth / 2
				const horizontalPadding = 24
				const isCloseToEnd = x < 70
				const adjustedX = isCloseToEnd ? x + horizontalPadding : x - horizontalPadding
				lastX += sliceWidth

				return renderLabel({ x: adjustedX, y: height - 5, label, color: colors[index] })
			})}
		</>
	)
}

export default memo(LineChartLabels)
