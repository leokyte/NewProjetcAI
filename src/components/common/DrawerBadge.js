import React from 'react'
import { StyleSheet, Platform } from 'react-native'
import { connect } from 'react-redux'
import { Container, useIsSmallScreen } from '@kyteapp/kyte-ui-components'
import { KyteText } from './KyteText'
import { colorSet, Type, colors } from '../../styles'

const DrawerBadgeComponent = ({ isOpen, children, ...props }) => {
	const isMobile = useIsSmallScreen()

	function formatNotificationCount(count) {
		if (count >= 9999) {
			return '9k+'
		}

		if (count >= 1000) {
		  const kCount = Math.floor(count / 1000)
		  return `${kCount}k+`
		}

		return count.toString()
	  }

	return (
		<Container width={isMobile || isOpen ? 35 : '100%'} justifyContent="center" alignItems="center">
			<Container
				backgroundColor={colors.actionColor}
				borderRadius={50}
				width={24}
				height={18}
				alignItems="center"
				style={styles.innerContainer}
			>
				<KyteText style={[Type.Medium, Type.fontSize(11), colorSet('#444e5e')]}>{formatNotificationCount(children)}</KyteText>
			</Container>
		</Container>
	)
}

const styles = StyleSheet.create({
	innerContainer: Platform.select({
		ios: { justifyContent: 'center' },
	}),
})

const DrawerBadge = connect(null, {})(DrawerBadgeComponent)
export default DrawerBadge
