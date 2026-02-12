import React from 'react'
import { View, Text, ActivityIndicator, Dimensions } from 'react-native'
import { colors, Type, scaffolding } from '../../styles'
import { KyteIcon } from './'
import { isCatalogApp } from '../../util/util-flavors'

const styles = {
	container: (backgroundColor) => ({
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor,
	}),
	textStyle: (color) => ({
		color,
		marginVertical: 15,
		marginHorizontal: 20,
		fontSize: 18,
		textAlign: 'center',
		lineHeight: 26,
	}),
}

const LoadingScreen = (props) => {
	const { outerContainer } = scaffolding
	const { container, textStyle } = styles
	const { reverseColor, hideLogo, description } = props
	const isKyteCatalogApp = isCatalogApp()

	const getColor = () => {
		if (reverseColor) {
			return {
				logo: '#2dd1ac',
				container: '#FFF',
				text: colors.primaryColor,
				indicator: colors.actionColor,
			}
		}
		return {
			logo: isKyteCatalogApp ? colors.actionColor : colors.white,
			container: isKyteCatalogApp ? colors.white : colors.actionColor,
			text: isKyteCatalogApp ? colors.actionColor : colors.white,
			indicator: isKyteCatalogApp ? colors.actionColor : colors.white,
		}
	}

	const colorPallete = getColor()
	const containerStyle = container(colorPallete.container)
	const textStyleValue = textStyle(colorPallete.text)

	const renderLogo = () => (
		<KyteIcon name="logo" color={colorPallete.logo} size={Dimensions.get('window').width * 0.2} />
	)

	return (
		<View style={[outerContainer, containerStyle, props.styles]}>
			{!hideLogo && renderLogo()}
			{description && (
				<Text style={[Type.Medium, textStyleValue, { marginBottom: hideLogo ? 0 : 60 }]}>{description}</Text>
			)}
			<ActivityIndicator size="large" color={colorPallete.indicator} />
		</View>
	)
}

export default LoadingScreen
