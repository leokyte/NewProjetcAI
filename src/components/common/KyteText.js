import React from 'react'
import { KyteText as UIKyteText } from '@kyteapp/kyte-ui-components'
import { colors, defaultTextColor } from '../../styles/colors'

const KyteText = ({ pallete, lineThrough, ...props }) => {
	const palleteColor = pallete ? colors[pallete] : props.color
	const color = palleteColor || props.color || defaultTextColor

	return (
		<UIKyteText
			{...props}
			textDecorationLine={lineThrough ? 'line-through' : 'none'}
			allowFontScaling={false}
			color={color}
			{...props.testProps}
		/>
	)
}

export { KyteText }
