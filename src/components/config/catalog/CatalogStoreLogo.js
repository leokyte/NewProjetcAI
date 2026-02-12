import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { View, Image, Dimensions, Platform, ScrollView } from 'react-native'
import { KyteBottomBar, KyteBox } from '@kyteapp/kyte-ui-components'
import { Icon } from 'react-native-elements'
import I18n from '../../../i18n/i18n'
import { storeImgSet } from '../../../stores/actions'
import { colors } from '../../../styles'
import { KyteText, DetailPage, WizardProgressBar, KyteButton } from '../../common'
import { CATALOG_WIZARD_TOTAL_STEPS } from '../../../kyte-constants'
import { CatalogLogo, LogoPlaceholder } from '../../../../assets/images'
import { openDevicePhotoLibrary, cropImage, extractFileName, moveToKyteFolder, getImagePath } from '../../../util'
import { logEvent } from '../../../integrations'

const SCREEN_HEIGHT = Dimensions.get('window').height
const SMALL_SCREENS = SCREEN_HEIGHT <= 568

const styles = {
	textStyle: {
		textAlign: 'center',
	},
	svgImage: {
		resizeMode: 'contain',
		width: Dimensions.get('window').width * 0.6,
		height: 306,
	},
	topContainer: {
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: colors.lightBg,
		paddingVertical: 20,
		paddingHorizontal: 12,
	},
	receiptLogoOverlay: {
		resizeMode: 'contain',
		height: 38,
		width: 84,
		left: -14,
		top: -4
	},
	receiptPlaceholderOverlay: {
		height: 40,
		width: 84,
		left: -14,
		top: -4
	},
	phoneLogoOverlay: {
		resizeMode: 'contain',
		height: 32,
		width: 80,
		top: 20,
		left: 46,
	},
	phonePlaceholderOverlay: {
		height: 32,
		width: 80,
		top: 20,
		left: 46,
	},
	logoContainer: {
		width: 200,
		height: SMALL_SCREENS ? 100 : 160,
		...Platform.select({
			ios: { flex: 0.9 },
			android: { flex: 0.85 },
		}),
	},
	logoStyle: {
		flex: 1,
		resizeMode: 'contain',
	},
	iconContainer: {
		position: 'absolute',
		right: 5,
		top: 5,
		...Platform.select({
			ios: { flex: 0.1 },
			android: { flex: 0.15 },
		}),
	},
}

const CatalogStoreLogo = ({ navigation, storeImgSet: storeImgSetAction, authStore }) => {
	const [storeLogo, setStoreLogo] = useState(authStore && authStore.imageURL ? authStore.imageURL : '')

	useEffect(() => {
		logEvent('Catalog Logo View')
	}, [])

	const photoResponse = (response) => {
		if (!response) return

		const store = { ...authStore }

		const getPath = (response) => {
			const path = response.path || response
			return Platform.OS === 'ios' ? path : path.split('file://')[1]
		}

		const source = {
			fileName: extractFileName(getPath(response)),
			path: getPath(response),
			uri: getPath(response),
		}

		const setPhoto = (fileName) => {
			const companyLogo = Platform.OS === 'ios' ? source.uri : fileName
			storeImgSetAction(store, fileName)
			setStoreLogo(companyLogo)
		}

		moveToKyteFolder(source.fileName, source.path, setPhoto)

		logEvent('Catalog Logo Add View')
		logEvent('Logo Add', { where: 'catalog_wizard' })
	}

	const getStoreLogo = () => {
		if (storeLogo) {
			navigation.navigate('CatalogColorTemplate', {})
		} else {
			logEvent('Catalog Logo Add Click')
			openDevicePhotoLibrary((response) =>
				cropImage(response?.path).then((imageResponse) => photoResponse(imageResponse?.path))
			)
		}
	}

	const removeLogo = () => {
		const store = { ...authStore }
		storeImgSetAction(store, '')
		setStoreLogo('')
	}

	const renderTip = () => (
		<KyteText size={19} weight={400} lineHeight={26} style={{ textAlign: 'center', marginBottom: 48 }}>
			{I18n.t('catalog.storeLogo.tips.text1.part1')}{' '}
			<KyteText size={19} weight={500} lineHeight={26}>
				{I18n.t('catalog.storeLogo.tips.text1.part2')}
			</KyteText>
		</KyteText>
	)

	const renderLogoOverlay = () => (
		<>
			<Image style={styles.receiptLogoOverlay} source={{ uri: getImagePath(storeLogo) }} />
			<Image style={styles.phoneLogoOverlay} source={{ uri: getImagePath(storeLogo) }} />
		</>
	)

	const renderPlaceholderOverlay = () => (
		<>
			<Image style={styles.receiptPlaceholderOverlay} source={{ uri: LogoPlaceholder }} />
			<Image style={styles.phonePlaceholderOverlay} source={{ uri: LogoPlaceholder }} />
		</>
	)

	const renderAdditionalTip = () => (
		<View>
			<KyteText size={14} weight={400} lineHeight={21} style={styles.textStyle}>
				{I18n.t('catalog.storeLogo.tips.text2.part1')}{' '}
				<KyteText size={14} weight={500} lineHeight={21}>
					{I18n.t('catalog.storeLogo.tips.text2.part2')}
				</KyteText>{' '}
				{I18n.t('catalog.storeLogo.tips.text2.part3')}
			</KyteText>
		</View>
	)

	const renderLogo = () => {
		const { logoStyle, logoContainer, iconContainer } = styles

		return (
			<>
				<View style={logoContainer}>
					<Image style={logoStyle} source={{ uri: getImagePath(storeLogo) }} />
				</View>
				<View style={iconContainer}>
					<KyteButton onPress={() => removeLogo()} width={40} height={40}>
						<Icon name="close" color={colors.primaryColor} />
					</KyteButton>
				</View>
			</>
		)
	}

	return (
		<DetailPage
			style={{ flex: 1 }}
			pageTitle={I18n.t('words.p.customization')}
			goBack={() => navigation.goBack()}
			navigation={navigation}
		>
			<WizardProgressBar currentStep={2} totalSteps={CATALOG_WIZARD_TOTAL_STEPS} />
			<ScrollView contentContainerStyle={{ padding: 20 }}>
				<KyteBox pb={12} align="center">
					{renderTip()}
					<KyteBox>
						<Image style={styles.svgImage} source={{ uri: CatalogLogo }} />
						<KyteBox position="absolute" align="center" height={30} top={25} left={0} right={0}>
							{storeLogo ? renderLogoOverlay() : renderPlaceholderOverlay()}
						</KyteBox>
					</KyteBox>
				</KyteBox>
				<View style={[styles.topContainer, { height: storeLogo ? 136 : 'auto' }]}>
					{storeLogo ? renderLogo() : renderAdditionalTip()}
				</View>
			</ScrollView>
			{!storeLogo ? (
				<KyteBottomBar
					columnButton
					title={I18n.t('catalog.storeLogo.buttons.putOff')}
					onPress={() => {
						navigation.navigate('CatalogColorTemplate', {})
						logEvent('Catalog Logo Skip')
					}}
					type="blank"
					secondButtonTitle={I18n.t('catalog.storeLogo.buttons.addLogo')}
					secondButtonOnPress={() => getStoreLogo()}
				/>
			) : (
				<KyteBottomBar title={I18n.t('words.s.proceed')} type="primary" onPress={() => getStoreLogo()} />
			)}
		</DetailPage>
	)
}

const mapStateToProps = ({ auth, common }) => ({
	authStore: auth.store,
	isLoading: common.loader.visible,
})

export default connect(mapStateToProps, { storeImgSet })(CatalogStoreLogo)
