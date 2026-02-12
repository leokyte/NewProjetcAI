import React from 'react'

import { colors, Container } from '@kyteapp/kyte-ui-components'

export type AlertType = 'success' | 'warning' | 'error' | 'info'

export interface AlertBoxProps {
	type?: AlertType
}

// TO-DO: New color, Add it to kyte-ui-components
const gray11 = '#EDEFF2'
const backgroundColorMap: Record<AlertType, string> = {
	success: colors.green07,
	warning: colors.lightYellow,
	error: colors.lightRed,
	info: gray11,
}

/**
 * A common alert/info box component.
 *
 * Usage:
 * ```tsx
 * <AlertBox type="warning" content={<></>} />
 * ```
 */
// TO-DO: Write this component in kyte-ui-components
const AlertBox: React.FC<AlertBoxProps> = ({ type = 'info', children }) => (
	<Container backgroundColor={backgroundColorMap[type]} padding={16} borderRadius={8}>
		{children}
	</Container>
)

export default AlertBox
