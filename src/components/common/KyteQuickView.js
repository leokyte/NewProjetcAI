import React from 'react'
import { View, ScrollView, TouchableOpacity, Platform, ActivityIndicator } from 'react-native'
import Modal from 'react-native-modal'
import { KyteIcon, KyteText } from './'
import { colors } from '../../styles'
import { generateTestID } from '../../util'

const KyteQuickView = (props) => {
	const isBottomContainerDisabled =
		!!props.disabledComponents && !!props.disabledComponents.find((dc) => dc === 'bottom-container')
	const isTopButtonDisabled = !!props.disabledComponents && !!props.disabledComponents.find((dc) => dc === 'top-button')

	const renderIconsList = () => {
		const { iconList } = props

		return <View style={style.iconsContainer}>{iconList.map((icon, key) => renderIcon(icon, key))}</View>
	}

	const renderBottomContainer = () => <View style={style.bottomContainer}>{renderIconsList()}</View>

	const renderTopButton = () => (
		<View style={style.topContainer} {...generateTestID('close-pdck')}>
			<KyteIcon name={'cross-thin'} color={'#FFF'} size={26} onPress={props.hideQuickView} />
		</View>
	)

	//
	// ICONS
	//
	const renderKyteIcon = (icon) => (
		<KyteIcon size={20} name={icon.name} color={icon.backgroundColor ? 'white' : colors.primaryColor} />
	)

	const renderTextIcon = (icon) => {
		const text = () => (
			<KyteText style={style.iconText(icon)} weight={'Medium'} size={18}>
				{icon.name}
			</KyteText>
		)
		const loader = () => <ActivityIndicator size={'small'} color={'white'} />

		return props.loading ? loader() : text()
	}

	const renderIcon = (icon, key) => (
		<View style={style.iconsItemsContainer} key={key}>
			<TouchableOpacity onPress={icon.onPress}>
				<View style={style.iconBorder}>
					<View
						style={style.iconWrapper(icon)}
						{...(isNaN(icon.name) ? generateTestID(`${icon.name}-pdck`) : generateTestID(`stock-pdck`))}
					>
						{icon.type === 'icon' ? renderKyteIcon(icon) : renderTextIcon(icon)}
					</View>
				</View>
			</TouchableOpacity>
		</View>
	)

	// MODAL

	return (
		<Modal
			isVisible={props.isQuickViewVisible}
			onBackdropPress={props.hideQuickView}
			backdropColor={colors.primaryDarker}
			backdropOpacity={0.9}
			animationIn={'zoomIn'}
			animationInTiming={100}
			animationOut={'zoomOut'}
			animationOutTiming={100}
		>
			<View style={style.outerContainer(props.maxHeight)}>
				<View style={style.container}>
					{!isTopButtonDisabled ? renderTopButton() : null}
					{/*Main Container*/}
					<View style={style.mainContainer}>
						<ScrollView contentContainerStyle={style.contentContainerStyle}>{props.children}</ScrollView>
					</View>
					{!isBottomContainerDisabled ? renderBottomContainer() : null}
				</View>
			</View>
		</Modal>
	)
}

const contentWidth = 420
const style = {
	outerContainer: (maxHeight = '68%') => ({
		alignItems: 'center',
		justifyContent: 'center',
		flexDirection: 'row',
		maxHeight,
	}),
	container: {
		flex: 1,
		alignItems: 'center',
	},
	contentContainerStyle: {
		width: '100%',
		height: 'auto',
	},
	topContainer: {
		maxWidth: contentWidth,
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: 25,
	},
	mainContainer: {
		maxWidth: contentWidth,
		borderRadius: 6,
		position: 'relative',
		overflow: 'hidden',
		width: '100%',
	},
	bottomContainer: {
		maxWidth: contentWidth,
		width: '100%',
	},
	iconsContainer: {
		marginTop: 25,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
	},
	iconsItemsContainer: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
	iconBorder: {
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: 50,
		padding: 2.5,
		backgroundColor: 'white',
	},
	iconWrapper: (icon) => ({
		minWidth: 45.7,
		height: 45.7,
		padding: 10,
		borderRadius: 50,
		backgroundColor: icon.backgroundColor ? icon.backgroundColor : 'white',
		// borderWidth: 2.5,
		// borderColor: 'white',
		alignItems: 'center',
		justifyContent: 'center',
	}),
	iconText: (icon) => ({
		position: 'relative',
		top: Platform.OS === 'ios' ? 1 : -2,
		color: icon.backgroundColor ? 'white' : colors.primaryColor,
	}),
}

export { KyteQuickView }
