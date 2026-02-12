import React from 'react'
import { KyteButton } from '@kyteapp/kyte-ui-components'

/**
 * Normalized version of UIKyteButton with applcation's default text style
 *
 * @param {function | undefined} onPress - Function to be called when button is pressed
 * @param {string} children - Button text
 * @param {React.ReactNode} customChildren - Custom button content
 * @param {string} type - Button type: primary, secondary, tertiary, disabled
 * @param {object} props - Additional props
 */
const KyteBaseButton = ({ onPress, children, customChildren, type = 'primary', ...props }) => (
	<KyteButton textStyle={{ fontSize: 16, fontFamily: 'Graphik-Medium' }} onPress={onPress} type={type} {...props}>
		{customChildren || children}
	</KyteButton>
)

export default KyteBaseButton
