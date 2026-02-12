import React, { useEffect, useMemo } from 'react'
import _ from 'lodash'
import { View, TouchableOpacity, Text, Alert, Platform } from 'react-native'
import { KyteIcon, KyteText } from '.'
import { colors, buttonStyles } from '../../styles'
import I18n from '../../i18n/i18n'

const ActionButton = ({ full, ...props }) => {
	const showAlert = () => {
		const { alertTitle, alertDescription, noDisabledAlert } = props
		if (noDisabledAlert) return
		Alert.alert(alertTitle, alertDescription, [{ text: I18n.t('alertOk') }])
	}

	// Next arrow
	const renderNextArrow = (fontColor, fontSize) => <KyteIcon name="arrow-cart" color={fontColor} size={fontSize - 3} />

	const renderSubtitle = (fontSize) => {
		const { subtitle } = props
		const subtitleFontSize = fontSize - 6
		return (
			<KyteText pallete="actionLight" size={subtitleFontSize} lineHeight={subtitleFontSize + 5}>
				{`\n${subtitle}`}
			</KyteText>
		)
	}

	const generateFontColor = () => {
		if(props?.textColor && !props?.disabled) return props?.textColor
		if (props.borderedDisabled) return colors.disabled2
		if (props.disabled || props.disabledStyle) {
			return colors.disabled
		}
		if (props.cancel) {
			return colors.primaryColor
		}
		if (props.showDisabled) {
			return colors.lightBorder
		}
		if (props.borderedGreen) return colors.actionColor
		return '#FFF'
	}

	const buttonColor = () => {
		if (props.color && !props?.disabled) return { backgroundColor: props.color }
		if (props.borderedDisabled) return { backgroundColor: 'transparent', borderColor: colors.disabled, borderWidth: 1 }
		if (props.borderedGreen) return { backgroundColor: 'transparent', borderColor: colors.actionColor, borderWidth: 1 }
		if (props.disabled || props.disabledStyle) {
			return disabled
		}
		if (props.cancel) {
			return cancel
		}
		if (props.showDisabled) {
			return showDisabled
		}
		return active
	}

	const { buttonSmall, debounce, testProps } = props
	const { base, small, active, disabled, cancel, showDisabled } = buttonStyles
	const { fontStyle } = styles

	const fontColor = generateFontColor()
	const renderSideIcon = (item) => <View style={{ width: 26 }}>{item}</View>
	const hasIcon = props.leftIcon || props.rightIcon
	const fontSize = buttonSmall ? 16 : props.fontSize || 18
	const handleOnPress = useMemo(() => _.debounce(() => props.onPress && props.onPress(), 300), [props.onPress])

	useEffect(() => {
		return () => handleOnPress.cancel()
	}, [handleOnPress])

	return (
		<TouchableOpacity
			onPress={props.disabled ? () => showAlert() : debounce ? () => handleOnPress() : props.onPress}
			activeOpacity={0.8}
			{...testProps}
			hitSlop={props.hitSlop ? props.hitSlop : null}
			style={props.containerStyle}
		>
			<View style={[buttonSmall ? small : base(!!props.subtitle), buttonColor(), props.style]}>
				{hasIcon ? renderSideIcon(props.leftIcon) : null}
				<Text
					allowFontScaling={false}
					style={[
						fontStyle(fontColor, fontSize, 'Graphik-Medium', buttonSmall, full),
						props.leftIcon ? { position: 'relative' } : null,
						{ opacity: props.blur ? 0.4 : 1 },
						{ lineHeight: 24 },
						props.textStyle,
					]}
				>
					{props.children}
					{props.subtitle ? renderSubtitle(fontSize) : null}
				</Text>
				{hasIcon ? renderSideIcon(props.rightIcon) : null}
				{props.nextArrow ? renderNextArrow(fontColor, fontSize) : null}
			</View>
		</TouchableOpacity>
	)
}

const styles = {
	fontStyle: (color, fontSize = 18, fontFamily, buttonSmall, full = true) => ({
		flex: full ? 1 : 0,
		textAlign: 'center',
		fontFamily,
		fontSize,
		color,
		bottom: buttonSmall || Platform.OS === 'ios' ? null : 1.5,
	}),
}

export { ActionButton }
