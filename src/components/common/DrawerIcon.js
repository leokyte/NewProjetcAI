import React from 'react'
import { View } from 'react-native'
import { Container, useIsSmallScreen } from '@kyteapp/kyte-ui-components'
import { colors, drawerStyles } from '../../styles'
import { KyteIcon } from './KyteIcon'

const DrawerIcon = ({ containerStyle = {}, isOpen, notification, ...props }) => {
	const isMobile = useIsSmallScreen()

	return (
		<Container
			width={isMobile || isOpen ? 35 : '100%'}
			justifyContent="center"
			alignItems="center"
			style={containerStyle}
		>
			<View>
				<KyteIcon size={drawerStyles.iconSize} color={colors.grayBlue} {...props} />
				{notification && <View style={styles.notification()} />}
			</View>
		</Container>
	)
}

const styles = {
	notification: (size = 7) => ({
		width: size,
		height: size,
		borderRadius: size,
		backgroundColor: colors.barcodeRed,
		position: 'absolute',
		zIndex: 100,
		bottom: 9,
		left: 10,
	}),
}

export default DrawerIcon
