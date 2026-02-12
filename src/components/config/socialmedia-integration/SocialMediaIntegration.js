import React, { useState, useEffect } from 'react'
import { Image, ScrollView, View, Dimensions } from 'react-native'
import { KyteText } from '@kyteapp/kyte-ui-components'
import { connect } from 'react-redux'

import { checkFeatureIsAllowed, checkUserIsAllowed, openModalWebview } from '../../../stores/actions'
import { LoadingCleanScreen, DetailPage, ListOptions } from '../../common'
import SocialMediaIntegrationTip from './templates/SocialMediaIntegrationTip'
import { remoteConfigGetValue } from '../../../integrations'
import I18n from '../../../i18n/i18n'
import {
	InstagramLogo,
	InstagramTipImage,
	GoogleLogo,
	GoogleShoppingTipImage,
	TikTokLogo,
	// PinterestLogo,
	// PinterestTipImage,
	FbeTipImage,
	FacebookPixelTipImage,
	TikTokTipImage,
} from '../../../../assets/images'
import { FacebookLogo } from '../../../../assets/images/social-media/facebook-logo'
import { colors } from '../../../styles'
import { getPROFeature, generateDefaultPROFeatures } from '../../../util'

const Strings = {
	PAGE_TITLE: I18n.t('socialMediaIntegrationPageTitle'),

	HEADER_FACEBOOK_INSTAGRAM_TITLE: 'Facebook / Instagram',
	HEADER_GOOGLE_TITLE: 'Google',

	SHOPPING_TITLE: 'Shopping',
	INSTAGRAM_SUB: I18n.t('instagramIntegrationSubtitle'),
	INSTAGRAM_TIP_INFO: I18n.t('instagramIntegrationTipInfo'),
	INSTAGRAM_TUTORIAL_LINK: I18n.t('instagramTutorialLink'),

	ORDER_FOOD_TITLE: I18n.t('fbeIntegrationTipInfo.subtitle'),
	ORDER_FOOD_SUBTITLE: I18n.t('fbeIntegrationSubtitle'),
	ORDER_FOOD_TITLE_TIP: 'Facebook/Instagram',
	ORDER_FOOD_SUBTITLE_TIP: I18n.t('fbeIntegrationTipInfo.subtitle'),
	ORDER_FOOD_INFO_1: I18n.t('fbeIntegrationTipInfo.info1'),
	ORDER_FOOD_INFO_2: I18n.t('fbeIntegrationTipInfo.info2'),
	ORDER_FOOD_INFO_3: I18n.t('fbeIntegrationTipInfo.info3'),
	ORDER_FOOD_INFO_4: I18n.t('fbeIntegrationTipInfo.info4'),
	ORDER_FOOD_INFO_5: I18n.t('fbeIntegrationTipInfo.info5'),
	ORDER_FOOD_INFO_6: I18n.t('fbeIntegrationTipInfo.info6'),
	ORDER_FOOD_INFO_7: I18n.t('fbeIntegrationTipInfo.info7'),
	ORDER_FOOD_INFO_8: I18n.t('fbeIntegrationTipInfo.info8'),
	ORDER_FOOD_TIP_INFO: I18n.t('instagramIntegrationTipInfo'),
	FBE_TUTORIAL_LINK: I18n.t('fbeTutorialLink'),

	PINTEREST_TITLE: 'Pinterest Shopping',
	PINTEREST_SUB: I18n.t('pinterestIntegrationSubtitle'),
	PINTEREST_TIP_INFO: I18n.t('pinterestIntegrationTipInfo'),

	FACEBOOK_PIXEL_TITLE: 'Facebook Pixel',
	FACEBOOK_PIXEL_TITLE_TIP: 'Facebook',
	FACEBOOK_PIXEL_SUBTITLE_TIP: 'Pixel',
	FACEBOOK_PIXEL_SUB: I18n.t('facebookPixelIntegrationSubtitle'),
	FACEBOOK_PIXEL_TIP_INFO: I18n.t('facebookPixelTipInfo'),
	FACEBOOK_PIXEL_TUTORIAL_LINK: I18n.t('facebookPixelTutorialLink'),

	GOOGLE_SHOPPING_SUB: I18n.t('googleShoppingIntegrationSubtitle'),
	GOOGLE_SHOPPING_TIP_INFO: I18n.t('googleShoppingIntegrationTipInfo'),
	GOOGLE_SHOPPING_TUTORIAL_LINK: I18n.t('googleShoppingTutorialLink'),

	LANG: I18n.t('fbIntegration.imageCode'),
}

//
// TIP export
//

const instagram_i = Strings.INSTAGRAM_TIP_INFO
const socialMediaIntegrationTipsInfo = [
	{
		title: Strings.SHOPPING_TITLE,
		info: [{ text: instagram_i.info1 }, { text: instagram_i.info2, bold: true }, { text: instagram_i.info3 }],
		image: { src: InstagramTipImage(Strings.LANG), style: { height: 250, width: 250 } },
		tutorialUrl: Strings.INSTAGRAM_TUTORIAL_LINK,
	},
	{
		title: Strings.SHOPPING_TITLE,
		info: [{ text: Strings.GOOGLE_SHOPPING_TIP_INFO }],
		image: { src: GoogleShoppingTipImage, style: { height: 210, width: 162 } },
		tutorialUrl: Strings.GOOGLE_SHOPPING_TUTORIAL_LINK,
	},
	{
		title: Strings.ORDER_FOOD_TITLE_TIP,
		subtitle: Strings.ORDER_FOOD_SUBTITLE_TIP,
		info: [
			{ text: `${Strings.ORDER_FOOD_INFO_1} ` },
			{ text: `${Strings.ORDER_FOOD_INFO_2} `, bold: true },
			{ text: `${Strings.ORDER_FOOD_INFO_3} ` },
			{ text: `${Strings.ORDER_FOOD_INFO_4} `, bold: true },
			{ text: `${Strings.ORDER_FOOD_INFO_5} ` },
			{ text: `${Strings.ORDER_FOOD_INFO_6} `, bold: true },
			{ text: `${Strings.ORDER_FOOD_INFO_7} ` },
			{ text: `${Strings.ORDER_FOOD_INFO_8} `, bold: true },
		],
		infoStyle: { textAlign: 'center' },
		infoContainerStyle: { paddingHorizontal: 12, marginTop: -5, marginBottom: 30 },
		image: { src: FbeTipImage(Strings.LANG), style: { height: 164, width: 282 } },
		tutorialUrl: Strings.FBE_TUTORIAL_LINK,
		typeIntegration: 'fbe',
	},
	{
		title: Strings.FACEBOOK_PIXEL_TITLE_TIP,
		subtitle: Strings.FACEBOOK_PIXEL_SUBTITLE_TIP,
		info: [{ text: Strings.FACEBOOK_PIXEL_TIP_INFO }],
		infoStyle: {
			textAlign: 'center',
			marginTop: -30,
			marginBottom: 10,
			width: Dimensions.get('window').width - 10,
		},
		image: { src: FacebookPixelTipImage(Strings.LANG), style: { height: 206, width: 300 } },
		tutorialUrl: Strings.FACEBOOK_PIXEL_TUTORIAL_LINK,
		typeIntegration: 'facebookPixel',
	},
	{
		title: 'TikTok',
		subtitle: I18n.t('tiktok.subtitleTip'),
		info: [{ text: I18n.t('tiktok.tikTokTipInfo') }],
		infoStyle: {
			textAlign: 'center',
			marginTop: -30,
			marginBottom: 10,
			width: Dimensions.get('window').width - 10,
		},
		image: { src: TikTokTipImage(I18n.t('tiktok.imageCode')), style: { height: 200, width: 195 } },
		tutorialUrl: I18n.t('tiktok.tutorialLink'),
		typeIntegration: 'tiktok',
	},
]

const renderSocialMediaIntegrationTip = (p) => (
	<SocialMediaIntegrationTip
		key={p.tipIndex}
		isModalVisible={p.isModalVisible}
		hideModal={p.hideModal}
		goToIntegration={p.goToIntegration}
		showTagPro={p.showTagPro}
		typeIntegration={p.typeIntegration}
		isIntegrated={p.isIntegrated}
		{...socialMediaIntegrationTipsInfo[p.tipIndex]}
	/>
)

//
// MAIN Component
//

const SocialMediaIntegration = ({ ...props }) => {
	// Props
	const { navigation, route } = props
	const { params = {} } = route
	const { integrations = [] } = props.auth.store

	// State

	const [isLoading, setIsLoading] = useState(true)
	const [showInstagramTip, setShowInstagramTip] = useState(false)
	const [showGoogleSTip, setShowGoogleSTip] = useState(false)
	const [showTikTokTip, setShowTikTokTip] = useState(false)
	// const [showPinterestTip, setShowPinterestTip] = useState(false);
	const [showOrderFoodTip, setShowOrderFoodTip] = useState(false)
	const [showFacebookPixelTip, setShowFacebookPixelTip] = useState(false)
	const [socialMediaIntegrationFBE, setSocialMediaIntegrationFBE] = useState(true)
	const [socialMediaIntegrationFBShopping, setSocialMediaIntegrationFBShopping] = useState(true)
	const [socialMediaIntegrationFBPixel, setSocialMediaIntegrationFBPixel] = useState(true)
	const [socialMediaIntegrationGoogleShopping, setSocialMediaIntegrationGoogleShopping] = useState(true)
	const [socialMediaIntegrationTikTokShopping, setSocialMediaIntegrationTikTokShopping] = useState(true)

	const [PROFacebookShopping, setPROFacebookShopping] = useState(
		generateDefaultPROFeatures('PROFacebookShopping').PROFacebookShopping
	)
	const [PROFacebookOrderFood, setPROFacebookOrderFood] = useState(
		generateDefaultPROFeatures('PROFacebookOrderFood').PROFacebookOrderFood
	)
	const [PROFacebookPixel, setPROFacebookPixel] = useState(
		generateDefaultPROFeatures('PROFacebookPixel').PROFacebookPixel
	)
	const [PROGoogleShopping, setPROGoogleShopping] = useState(
		generateDefaultPROFeatures('PROGoogleShopping').PROGoogleShopping
	)
	const [PROTikTok, setPROTikTok] = useState(generateDefaultPROFeatures('PROTikTok').PROTikTok)

	const isPixelIntegrated = integrations.find((i) => i.name === 'pixel' && i.active)
	const isFbeIntegrated = integrations.find((i) => i.name === 'fbe' && i.active)

	const navigateTo = (pageName, type) => navigation.navigate(pageName, { key: `${pageName}Page`, ...type })

	// Navigation pages
	const [pagesRoutes] = useState({
		instagram: 'InstagramPage',
		googleShopping: 'GoogleShoppingPage',
		pinterest: 'PinterestPage',
		facebookPixel: 'FacebookPixelPage',
		facebookPixelIntegrated: 'FacebookPixelIntegratedPage',
		fbe: 'FBEPage',
		TiktokPage: 'TiktokPage',
	})

	const isUserPro = () => {
		try {
			return checkUserIsAllowed(undefined, props.billing)
		} catch (error) {
			console.log(error)
		}
	}

	const getPROFeatures = async () => {
		setIsLoading(true)
		const FacebookShopping = await getPROFeature('PROFacebookShopping')
		const FacebookOrderFood = await getPROFeature('PROFacebookOrderFood')
		const FacebookPixel = await getPROFeature('PROFacebookPixel')
		const GoogleShopping = await getPROFeature('PROGoogleShopping')
		const TikTok = await getPROFeature('PROTikTok')

		setPROFacebookShopping(FacebookShopping)
		setPROFacebookOrderFood(FacebookOrderFood)
		setPROFacebookPixel(FacebookPixel)
		setPROGoogleShopping(GoogleShopping)
		setPROTikTok(TikTok)

		setIsLoading(false)
	}

	const goToFacebookPixelPage = () => {
		if (isPixelIntegrated || isFbeIntegrated) {
			return navigateTo(pagesRoutes.facebookPixelIntegrated)
		}

		return navigateTo(pagesRoutes.facebookPixel)
	}

	// Generate items
	const items = [
		{
			hideItem: !socialMediaIntegrationFBShopping,
			title: Strings.SHOPPING_TITLE,
			subtitle: Strings.INSTAGRAM_SUB,
			tip: { onPress: () => setShowInstagramTip(true) },
			onPress: () => navigateTo(pagesRoutes.instagram),
			billingList: true,
			PROFeature: PROFacebookShopping,
			containerStyle: {
				height: 'auto',
				paddingVertical: 16,
			},
		},
		{
			hideItem: !socialMediaIntegrationFBE,
			title: Strings.ORDER_FOOD_TITLE,
			subtitle: Strings.ORDER_FOOD_SUBTITLE,
			tip: { onPress: () => setShowOrderFoodTip(true) },
			onPress: () => navigateTo(pagesRoutes.fbe),
			badge: I18n.t('words.s.new'),
			badgeCustomStyle: { marginRight: 10, borderRadius: 24 },
			billingList: true,
			PROFeature: PROFacebookOrderFood,
			containerStyle: {
				height: 'auto',
				paddingVertical: 16,
			},
			itemStyle: {
				lineHeight: 20,
				width: 210,
			},
		},
		{
			hideItem: !socialMediaIntegrationFBPixel,
			title: Strings.FACEBOOK_PIXEL_TITLE,
			subtitle: Strings.FACEBOOK_PIXEL_SUB,
			tip: {
				onPress: () => setShowFacebookPixelTip(true),
			},
			onPress: () => goToFacebookPixelPage(),
			badge: I18n.t('words.s.new'),
			badgeCustomStyle: { marginRight: 10, borderRadius: 24 },
			billingList: true,
			PROFeature: PROFacebookPixel,
			containerStyle: {
				height: 'auto',
				paddingVertical: 16,
			},
		},
	]

	const googleItem = [
		{
			hideItem: !socialMediaIntegrationGoogleShopping,
			title: Strings.SHOPPING_TITLE,
			subtitle: Strings.GOOGLE_SHOPPING_SUB,
			tip: { onPress: () => setShowGoogleSTip(true) },
			onPress: () => navigateTo(pagesRoutes.googleShopping),
			billingList: true,
			PROFeature: PROGoogleShopping,
			containerStyle: {
				height: 'auto',
				paddingVertical: 16,
			},
		},
	]

	const tikTokItem = [
		{
			title: I18n.t('tiktok.subtitleTip'),
			subtitle: I18n.t('tiktok.subtitleMenu'),
			tip: { onPress: () => setShowTikTokTip(true) },
			onPress: () => navigateTo(pagesRoutes.TiktokPage),
			billingList: true,
			badge: I18n.t('words.s.new'),
			badgeCustomStyle: { marginRight: 10, borderRadius: 24 },
			containerStyle: {
				height: 'auto',
				paddingVertical: 16,
			},
			PROFeature: PROTikTok,
		},
	]

	// Generate items tip
	const tips = [
		{
			isModalVisible: showInstagramTip,
			hideModal: () => setShowInstagramTip(false),
			goToIntegration: () => navigateTo(pagesRoutes.instagram),
			showTagPro: !isUserPro() && PROFacebookShopping.isPaid,
		},
		{
			isModalVisible: showGoogleSTip,
			hideModal: () => setShowGoogleSTip(false),
			goToIntegration: () => navigateTo(pagesRoutes.googleShopping),
			showTagPro: !isUserPro() && PROGoogleShopping.isPaid,
		},
		{
			isModalVisible: showOrderFoodTip,
			hideModal: () => setShowOrderFoodTip(false),
			goToIntegration: () => navigateTo(pagesRoutes.fbe),
			isIntegrated: integrations.find((i) => i.name === 'fbe' && i.active),
			showTagPro: !isUserPro() && PROFacebookOrderFood.isPaid,
		},
		// {
		//   isModalVisible: showPinterestTip,
		//   hideModal: () => setShowPinterestTip(false),
		//   title: Strings.PINTEREST_TITLE,
		//   info: [{ text: Strings.PINTEREST_TIP_INFO }],
		//   image: { src: PinterestTipImage, style: { height: 203, width: 130 } },
		//   goToIntegration: () => navigateTo(pagesRoutes.pinterest),
		// },
		{
			isModalVisible: showFacebookPixelTip,
			hideModal: () => setShowFacebookPixelTip(false),
			info: [{ text: Strings.FACEBOOK_PIXEL_TIP_INFO }],
			goToIntegration: goToFacebookPixelPage,
			isIntegrated: integrations.find((i) => i.name === 'pixel' && i.active),
			showTagPro: !isUserPro() && PROFacebookPixel.isPaid,
		},
		{
			isModalVisible: showTikTokTip,
			hideModal: () => setShowTikTokTip(false),
			goToIntegration: () => navigateTo(pagesRoutes.TiktokPage),
			isIntegrated: integrations.find((i) => i.name === 'tiktok' && i.active),
			showTagPro: !isUserPro() && PROTikTok.isPaid,
		},
	]

	// RENDER methods
	const renderTip = (p, i) => renderSocialMediaIntegrationTip({ tipIndex: i, ...p })

	const renderTips = () => tips.map(renderTip)

	// Navigation
	const goBack = () => {
		navigation.goBack()
	}

	useEffect(() => {
		const { configType } = params

		let payloadTiktok = {}

		switch (configType) {
			case 'pixel':
				isPixelIntegrated
					? navigation.navigate('FacebookPixelIntegratedPage')
					: navigation.navigate('FacebookPixelPage')
				break
			case 'instagram':
				navigation.navigate(pagesRoutes.instagram)
				break
			case 'google-shopping':
				navigation.navigate(pagesRoutes.googleShopping)
				break
			case 'fbe':
				navigation.navigate(pagesRoutes.fbe)
				break
			case 'tiktok':
				payloadTiktok = params.auth_code && { auth_code: params.auth_code }
				navigation.navigate(pagesRoutes.TiktokPage, payloadTiktok)
				break
			default:
		}
	}, [params, navigation, isPixelIntegrated, pagesRoutes])

	useEffect(() => {
		remoteConfigGetValue('SocialMediaIntegrationFBE', (k) => setSocialMediaIntegrationFBE(k), 'boolean')
		remoteConfigGetValue('SocialMediaIntegrationFBShopping', (k) => setSocialMediaIntegrationFBShopping(k), 'boolean')
		remoteConfigGetValue('SocialMediaIntegrationFBPixel', (k) => setSocialMediaIntegrationFBPixel(k), 'boolean')
		remoteConfigGetValue(
			'SocialMediaIntegrationGoogleShopping',
			(k) => setSocialMediaIntegrationGoogleShopping(k),
			'boolean'
		)
		remoteConfigGetValue(
			'SocialMediaIntegrationTikTokShopping',
			(k) => setSocialMediaIntegrationTikTokShopping(k),
			'boolean'
		)
	}, [])

	useEffect(() => {
		getPROFeatures()
	}, [props.billing.toleranceEndDate, props.billing.endDate, props.billing.status])

	return (
		<DetailPage goBack={goBack} pageTitle={Strings.PAGE_TITLE}>
			<ScrollView>
				<View style={styles.viewTitle}>
					<Image source={{ uri: FacebookLogo }} style={styles.imageTitle} />
					<Image source={{ uri: InstagramLogo }} style={styles.imageTitle} />
					<KyteText size={14} color={colors.secondaryBg} weight={500}>
						{Strings.HEADER_FACEBOOK_INSTAGRAM_TITLE}
					</KyteText>
				</View>

				<ListOptions
					billing={props.billing}
					openModalWebview={(infoURL) => props.openModalWebview(infoURL)}
					isUserPro={isUserPro()}
					items={items}
				/>

				<View style={styles.viewTitle}>
					<Image source={{ uri: GoogleLogo }} style={styles.imageTitle} />
					<KyteText size={14} color={colors.secondaryBg} weight={500}>
						{Strings.HEADER_GOOGLE_TITLE}
					</KyteText>
				</View>

				<ListOptions
					billing={props.billing}
					openModalWebview={(infoURL) => props.openModalWebview(infoURL)}
					isUserPro={isUserPro()}
					items={googleItem}
				/>

				{socialMediaIntegrationTikTokShopping && (
					<>
						<View style={styles.viewTitle}>
							<Image source={{ uri: TikTokLogo }} style={styles.imageTitle} />
							<KyteText size={14} color={colors.secondaryBg} weight={500}>
								TikTok
							</KyteText>
						</View>

						<ListOptions
							billing={props.billing}
							openModalWebview={(infoURL) => props.openModalWebview(infoURL)}
							isUserPro={isUserPro()}
							items={tikTokItem}
						/>
					</>
				)}
			</ScrollView>
			{renderTips()}

			{isLoading && <LoadingCleanScreen />}
		</DetailPage>
	)
}

const styles = {
	viewTitle: {
		paddingVertical: 8,
		paddingLeft: 16,
		backgroundColor: '#f7f7f8',
		flexDirection: 'row',
		alignItems: 'center',
	},
	imageTitle: {
		width: 24,
		height: 24,
		marginRight: 11,
	},
}

const mapStateToProps = ({ auth, billing }) => ({
	auth,
	billing,
})

export default connect(mapStateToProps, { checkFeatureIsAllowed, openModalWebview })(SocialMediaIntegration)
export { renderSocialMediaIntegrationTip }
