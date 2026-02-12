import React, { useState } from 'react'
import { View, Text, Platform, Dimensions, TouchableOpacity, Image, ScrollView, StyleSheet } from 'react-native'
import { Icon } from 'react-native-elements'
import { connect } from 'react-redux'

import { headerStyles, colors, scaffolding, Type } from '../../styles'
import { Offline } from '../../../assets/images'
import { KyteModal, Input, SubHeaderButton, MenuButton } from '.'
import I18n from '../../i18n/i18n'
import HeaderButton from './HeaderButton'
import { generateTestID } from '../../util'
import {
	LargeScreenOnly,
	MobileOnly,
	Container,
	KyteBox,
	KyteIcon,
	KyteText,
	KyteButtonV2,
	KyteBaseButton,
} from '@kyteapp/kyte-ui-components'

const KyteToolbarComponent = ({
	rightButtons,
	useCommonIcon,
	isSearchVisible,
	rightComponent,
	rightText,
	testProps,
	onSearchText,
	searchPlaceholder,
	onCloseSearch,
	goBack,
	navigation,
	useIconCircle,
	hideClose,
	showCloseButton,
	innerPage,
	headerTextStyle,
	headerTitle,
	borderBottom,
	position,
	backgroundColor,
	style,
	hideCloseIcon,
	hideTitle,
	isOnline,
	menuButtonProps,
}) => {
	const [showModalInfo, setShowModalInfo] = useState(false)
	const SCREEN_HEIGHT = Dimensions.get('window').height
	const SMALL_SCREENS = SCREEN_HEIGHT <= 568
	const SMALLEST_SCREENS = SCREEN_HEIGHT <= 480


	const renderRightButtons = () =>
		rightButtons.map((item, i) => {
			const content = (
				<HeaderButton
					buttonKyteIcon={!useCommonIcon}
					buttonNotification={item.notification}
					key={i}
					icon={item.icon}
					onPress={item.onPress}
					color={item.color || colors.primaryColor}
					size={item.iconSize}
					testProps={item.testProps}
					renderCustomButton={item.renderCustomButton}
					style={item.style}
				/>
			)

			if (!item.isHidden) {
				return item.renderParent?.(content) || content
			}

			return undefined
		})

	const renderRightComponent = () => <View>{rightComponent}</View>

	const renderHeaderRight = () => (
		<View style={headerStyles.headerButtonsContainer}>
			{rightButtons ? renderRightButtons() : null}
			{rightText ? renderRightText() : null}
			{rightComponent ? renderRightComponent() : null}
		</View>
	)

	const renderRightText = () => {
		const { text, onPress, textStyle } = rightText

		return (
			<TouchableOpacity style={styles.rightTextConteiner} onPress={onPress}>
				<Text style={[Type.Medium, styles.rightText, textStyle]} {...generateTestID('Clear')}>
					{text}
				</Text>
			</TouchableOpacity>
		)
	}

	const renderSearchBar = () => {
		const { searchBarContainer, searchBar, subBarDefaults } = scaffolding

		return (
			<View
				style={[
					searchBarContainer,
					subBarDefaults,
					Platform.select({
						ios: {
							height: SMALL_SCREENS || SMALLEST_SCREENS ? 68 : 55,
							borderBottomWidth: 1.5,
							borderBottomColor: colors.borderDarker,
						},
						android: {
							height: 60,
							padding: 5,
							borderBottomWidth: 1.5,
							borderBottomColor: colors.borderDarker,
						},
					}),
				]}
				{...testProps}
			>
				<Input
					onChangeText={onSearchText}
					style={[searchBar, { fontSize: 14 }]}
					placeholder={searchPlaceholder}
					flex
					noBorder
					autoFocus
					hideLabel
				/>

				<SubHeaderButton onPress={onCloseSearch}>
					<Icon name="close" color={colors.primaryColor} />
				</SubHeaderButton>
			</View>
		)
	}

	const renderCloseButton = () => (
		<HeaderButton
			buttonKyteIcon={!showCloseButton}
			icon={showCloseButton ? 'close' : 'back-navigation'}
			onPress={goBack}
			color={colors.secondaryBg}
			testProps={generateTestID('back')}
		/>
	)

	const renderMenuButton = () => (
		<MobileOnly>
		<MenuButton {...menuButtonProps} navigate={() => navigation.openDrawer()} />
	</MobileOnly>
	)

	const renderClose = () => (
		<View testProps={generateTestID('close')} style={useIconCircle ? styles.circleIcon : null}>
			{hideClose ? null : renderCloseButton()}
		</View>
	)

	const renderCloseContent = () => (innerPage ? renderClose() : renderMenuButton())

	const renderHeaderTitle = () => (
		<Text
			ellipsizeMode="tail"
			numberOfLines={1}
			style={[headerStyles.headerTitleStyle, headerTextStyle]}
			{...generateTestID('screen-title')}
		>
			{headerTitle}
		</Text>
	)

	const renderMainContent = () => (
		<View style={[headerStyles.headerBase(borderBottom, position, backgroundColor), style]} {...testProps}>
			{!hideCloseIcon && renderCloseContent()}
			<LargeScreenOnly>{!innerPage || hideCloseIcon ? <Container marginLeft={15} /> : null}</LargeScreenOnly>
			<Container flex={1} paddingLeft={hideClose ? 20 : 0}>
				{!hideTitle && renderHeaderTitle()}
			</Container>
			{renderHeaderRight()}
		</View>
	)

	const toggleModalInfo = () => {
		setShowModalInfo(!showModalInfo)
	}

	const offLineBar = (
		<>
			<KyteBox bg="#F7B84F">
				<KyteBaseButton type="blank" onPress={() => toggleModalInfo()} noRadius>
					<KyteBox bg="#F7B84F" w="100%" h={28} justify="center" alignItems="center" d="row">
						<KyteIcon name="no-internet" size={16} color={colors.primaryDarker} />
						<KyteText size={12} weight={500} color={colors.primaryDarker} marginLeft={8}>
							{I18n.t('offLineBar')}
						</KyteText>
					</KyteBox>
				</KyteBaseButton>
			</KyteBox>

			<KyteModal isModalVisible={showModalInfo} hideModal={() => toggleModalInfo()} height="auto" title=" ">
				<ScrollView>
					<Image
						source={{ uri: Offline }}
						style={{ height: 150, width: '100%', marginBottom: 24 }}
						resizeMode="contain"
					/>

					<KyteText textAlign="center" marginBottom={24} size={19} weight={600} color={colors.primaryDarker}>
						{I18n.t('offlineModal.title')}
					</KyteText>
					<KyteText textAlign="center" marginBottom={24} lineHeight={24}>
						<KyteText weight={400} size={16} color={colors.primaryDarker}>
							{I18n.t('offlineModal.text1.slim1')}
						</KyteText>{' '}
						<KyteText weight={500} size={16} color={colors.primaryDarker}>
							{I18n.t('offlineModal.text1.bold1')}
						</KyteText>{' '}
						<KyteText weight={400} size={16} color={colors.primaryDarker}>
							{I18n.t('offlineModal.text1.slim2')}
						</KyteText>
					</KyteText>
					<KyteText textAlign="center" marginBottom={24} lineHeight={24}>
						<KyteText weight={400} size={16} color={colors.primaryDarker}>
							{I18n.t('offlineModal.text2.slim1')}
						</KyteText>{' '}
						<KyteText weight={500} size={16} color={colors.primaryDarker}>
							{I18n.t('offlineModal.text2.bold1')}
						</KyteText>{' '}
						<KyteText weight={400} size={16} color={colors.primaryDarker}>
							{I18n.t('offlineModal.text2.slim2')}
						</KyteText>
					</KyteText>
					<KyteButtonV2 title={I18n.t('alertOk')} onPress={() => toggleModalInfo()} />
				</ScrollView>
			</KyteModal>
		</>
	)

	return (
		<>
			{isSearchVisible ? renderSearchBar() : renderMainContent()}
			{!isOnline && offLineBar}
		</>
	)
}

const styles = StyleSheet.create({
	rightTextConteiner: {
		marginRight: 20,
	},
	rightText: {
		color: colors.actionColor,
	},
	circleIcon: {
		width: 36,
		height: 36,
		borderRadius: 25,
		backgroundColor: 'white',
		alignItems: 'center',
		justifyContent: 'center',
	},
	plusButtonWrapper: {
		paddingRight: 8,
	},
	plusButtonContainer: {
		backgroundColor: colors.actionColor,
		height: 36,
		width: 36,
		borderRadius: 4,
	},
})

const mapStateToProps = ({ common }) => ({ isOnline: common.isOnline })

const KyteToolbar = connect(mapStateToProps, {})(KyteToolbarComponent)
export { KyteToolbar }
