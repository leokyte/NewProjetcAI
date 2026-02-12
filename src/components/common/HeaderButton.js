import React from 'react'
import { View, TouchableOpacity } from 'react-native'
import { connect } from 'react-redux'
import { Icon } from 'react-native-elements'
import { KyteIcon } from './KyteIcon'
import { colors } from '../../styles'

const HeaderButton = ({
	icon,
	color,
	iconSize = 26,
	size,
	notificationStyle,
	buttonNotification,
	buttonKyteIcon,
	style,
	onPress,
	hitSlop,
	testProps,
	renderCustomButton,
}) => {
	const isCommonIcon = () => <Icon name={icon} color={color} size={iconSize} />

	const isKyteIcon = () => <KyteIcon name={icon} color={color} size={size} />

	const renderNotification = () => <View style={[styles.notification(), notificationStyle]} />

	const renderViewIcon = () => (
		<View style={[styles.buttonContainer, style]}>
			{buttonNotification ? renderNotification() : null}
			{buttonKyteIcon ? isKyteIcon() : isCommonIcon()}
		</View>
	)

	const renderTouchableView = () => (
		<TouchableOpacity onPress={onPress} activeOpacity={0.8} hitSlop={hitSlop} {...testProps}>
			{renderCustomButton?.() ?? renderViewIcon()}
		</TouchableOpacity>
	)

	return onPress ? renderTouchableView() : renderViewIcon()
}

const styles = {
	buttonContainer: {
		padding: 0,
		height: '100%',
		width: 55,
		justifyContent: 'center',
		alignItems: 'center',
		position: 'relative',
	},
	notification: (size = 8) => ({
		width: size,
		height: size,
		borderRadius: size,
		backgroundColor: colors.barcodeRed,
		position: 'absolute',
		zIndex: 100,
		top: 18,
		right: 15,
	}),
}

const mapStateToProps = ({ common }) => ({ common })

export default connect(mapStateToProps)(HeaderButton)
