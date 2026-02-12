import { Alert, Dimensions, Linking, Platform, ScrollView } from 'react-native'
import React, { useState, useEffect, useCallback } from 'react'
import Carousel from 'react-native-snap-carousel'
import {
	Padding,
	KyteBox,
	KyteIcon,
	colors,
	useIsSmallScreen,
	isFree,
	isTrial,
	Container,
} from '@kyteapp/kyte-ui-components'
import { initConnection, useIAP } from 'react-native-iap'
import { connect } from 'react-redux'
import { WebView } from 'react-native-webview'
import Swiper from 'react-native-swiper'

import { DetailPage, KyteText, KyteModal } from '../common'
import {
	setRequestSubscription,
	redirectCheckoutWeb,
	setSelectedPlan,
	redirectToSubscription
} from '../../stores/actions'
import LoadingScreen from '../common/LoadingScreen'
import I18n from '../../i18n/i18n'
import { CarouselItem, FooterButtons } from './parts'
import { logError, logEvent } from '../../integrations'
import { IAP_SUBSCRIPTIONS_LIST, PLAN_MONTHLY } from '../../enums'
import { checkUserPermission, upOrDownPlan } from '../../util'
import { getTermsUrl } from '../../util/util-policies'

export const PlansComponent = ({
	navigation,
	billing,
	loader,
	plans,
	additionalInfo,
	hasStorePlans,
	userPermissions,
	...props
}) => {
	const productsItems = plans.map((item) => !item.hidePlan && item)
	const [activeIndex, setActiveIndex] = useState(productsItems.findIndex((p) => p.defaultPlan) || 0)
	const [selectType, setSelectType] = useState(PLAN_MONTHLY)
	const [isFeaturesModalVisible, setIsFeatureModalVisibility] = useState(false)
	const { isOwner } = checkUserPermission(userPermissions)
	const { fetchProducts } = useIAP()
	const selectedPlan = productsItems[activeIndex]

	const isMobile = useIsSmallScreen()
	const slideDimensions = {
		width: isMobile ? Dimensions.get('window').width : 580,
		height: 'auto',
	}
	const isAndroid = Platform.OS === 'android'
	const animatedStyles = () => ({
		padding: 10,
	})

	const handleGoBack = () => {
		if (navigation.canGoBack()) {
			navigation.goBack()
		} else {
			navigation.navigate('Account')
		}
	}

	const webviewLink = () => {
		switch (I18n.t('locale')) {
			case 'pt-br':
				return 'pt'
			case 'es':
			case 'es-ES':
				return 'es'
			case 'en':
			default:
				return 'en'
		}
	}

	const showPermissionAlert = () => {
		Alert.alert(I18n.t('words.s.attention'), I18n.t('words.m.youDontHaveLoginPermission'), [
			{ text: I18n.t('alertOk'), onPress: () => handleGoBack() },
		])
	}

	const toggleFeatureModalVisibility = () => {
		setIsFeatureModalVisibility(!isFeaturesModalVisible)
	}

	const subscribe = () => {
		if (!isOwner) return showPermissionAlert()
		const target = hasStorePlans ? 'store' : 'web'

		props.setSelectedPlan({
			plan: selectedPlan?.id,
			recurrence: selectType,
		})

		if (isFree(billing))
			logEvent('Plan Subscribe Click', {
				plan: selectedPlan?.id,
				recurrence: selectType,
				target,
			})
		else
			logEvent('Plan Change Click', {
				change_type: upOrDownPlan(selectedPlan, billing),
				recurrence: selectType,
				plan: selectedPlan?.id,
				previous_plan: billing.plan,
				billing_status: billing.status,
				target,
			})

		if (hasStorePlans) {
			props.setRequestSubscription(selectedPlan?.[selectType].sku)
		} else {
			props.redirectToSubscription()
		}
		return null
	}

	const renderCarouselItem = (item) => (
		<CarouselItem
			toggleModalVisibility={toggleFeatureModalVisibility}
			hasStorePlans={hasStorePlans}
			item={item}
			type={selectType}
			billing={billing}
			height={slideDimensions.height}
		/>
	)

	const renderWebview = () => {
		return (
			<WebView
				renderLoading={() => <LoadingScreen reverseColor hideLogo />}
				startInLoadingState
				style={{ flex: 1, marginTop: Platform.OS === 'ios' ? -45 : 0 }}
				source={{ uri: `https://www.kyte.link/checkout/plans/${webviewLink()}-tabela-grow` }}
				injectedJavaScript="window.ReactNativeWebView.postMessage(document.body.scrollHeight)"
				javaScriptEnabled
				domStorageEnabled
			/>
		)
	}

	const contentContainer = (children) => {
		return Platform.OS === 'android' ? <ScrollView flex={1}>{children}</ScrollView> : children
	}
	const IAPInitConnection = useCallback(async () => {
		try {
			await initConnection()

			// Defensive check: ensure fetchProducts is available before calling
			if (typeof fetchProducts === 'function') {
				await fetchProducts({ skus: IAP_SUBSCRIPTIONS_LIST, type: 'subs' })
			} else {
				logError(
					new Error('fetchProducts is not available from useIAP hook'),
					'[error] IAPInitConnection - fetchProducts undefined'
				)
			}
		} catch (error) {
			logError(error, '[error] IAPInitConnection')
		}
	}, [fetchProducts])

	useEffect(() => {
		if (isFree(billing) || isTrial(billing)) {
			logEvent('Plan List View')
		} else {
			logEvent('Plan Change View', {
				plan: billing.plan,
				billing_status: billing.status,
			})
		}
	}, [])

	useEffect(() => {
		// Only attempt IAP initialization if fetchProducts is available
		if (fetchProducts) {
			IAPInitConnection()
		}
	}, [IAPInitConnection, fetchProducts])

	useEffect(() => {
		// Setting selectedPlan reducer initial state
		props.setSelectedPlan({
			plan: selectedPlan?.id,
			recurrence: selectType,
		})
	}, [])

	return (
		<DetailPage pageTitle={I18n.t('plansPage.titlePage')} goBack={() => handleGoBack()}>
			{contentContainer(
				<Container flex={1}>
					<KyteBox bg="#363F4D" h={290} w="100%" align="center" pt={12} />
					<KyteBox marginTop={-280}>
						{productsItems &&
							(isAndroid ? (
								<Swiper
									overScrollMode="never"
									loop={false}
									index={productsItems.findIndex((p) => p.defaultPlan) || 0}
									onIndexChanged={(index) => setActiveIndex(index)}
									width={slideDimensions.width}
									height={'100%'}
									showsPagination={false}
									showsButtons
									buttonWrapperStyle={{
										paddingHorizontal: 0,
										paddingVertical: 0,
									}}
									nextButton={
										<KyteBox pv={8}>
											<KyteBox position="absolute" top={0} left={0} right={0} bottom={0} zIndex={1} opacity={0} />
											<KyteIcon size={36} color={colors.green03Kyte} name="nav-arrow-right" />
										</KyteBox>
									}
									prevButton={
										<KyteBox pv={8}>
											<KyteBox position="absolute" top={0} left={0} right={0} bottom={0} zIndex={1} opacity={0} />
											<KyteIcon size={36} color={colors.green03Kyte} name="back-navigation" />
										</KyteBox>
									}
								>
									{productsItems.map((item) => (
										<KyteBox ph={9} key={item.id}>
											{renderCarouselItem(item)}
										</KyteBox>
									))}
								</Swiper>
							) : (
								<Carousel
									layout="default"
									data={productsItems}
									sliderWidth={slideDimensions.width}
									itemWidth={slideDimensions.width - 40}
									firstItem={productsItems.findIndex((p) => p.defaultPlan) || 0}
									renderItem={({ item }) => renderCarouselItem(item)}
									onSnapToItem={(index) => setActiveIndex(index)}
									slideInterpolatedStyle={animatedStyles}
								/>
							))}
					</KyteBox>
					{Platform.OS === 'ios' ? renderWebview() : null}
					{Platform.OS === 'android' ? (
						<KyteModal
							title={I18n.t('plansPage.knowOurPlans')}
							hideModal={toggleFeatureModalVisibility}
							isModalVisible={isFeaturesModalVisible}
							topRadius={12}
							bottomPage
							height="90%"
						>
							<Padding horizontal={15}>
								<KyteText size={16} textAlign="center" lineHeight={24}>
									{I18n.t('plansPage.featuresDescription')}
								</KyteText>
							</Padding>
							{renderWebview()}
						</KyteModal>
					) : null}
					{isTrial(billing) ? (
						<Padding top={5} horizontal={30}>
							<KyteText textAlign="center" size={14} lineHeight={20} color={colors.gray05}>
								{additionalInfo?.trialDisclaimer?.[I18n.t('locale')]}
							</KyteText>
						</Padding>
					) : null}
				</Container>
			)}

			<FooterButtons
				subscribe={subscribe}
				selectedPlan={selectedPlan}
				type={selectType}
				setType={(item) => setSelectType(item)}
			/>

			{Platform.OS === 'android' ? (
				<Padding bottom={10} horizontal={30}>
					<KyteText textAlign="center" size={14} lineHeight={20} color={colors.gray05}>
						{additionalInfo?.subscriptionAutoRenewal?.[I18n.t('locale')]}
						{` ${I18n.t('expressions.readOur')}`}
						<KyteText onPress={() => Linking.openURL(getTermsUrl())} weight={500} color={colors.green03Kyte} size={14}>
							{` ${I18n.t('termsOfUse')}`}
						</KyteText>
					</KyteText>
				</Padding>
			) : null}
		</DetailPage>
	)
}

const mapStateToProps = ({ billing, common, plans, auth }) => ({
	billing,
	loader: common.loader,
	plans: plans.list,
	hasStorePlans: plans.hasStorePlans,
	userPermissions: auth.user.permissions,
	additionalInfo: plans.additionalInfo,
	account: auth.account,
})

const Plans = connect(mapStateToProps, {
	setRequestSubscription,
	redirectCheckoutWeb,
	setSelectedPlan,
	redirectToSubscription
})(PlansComponent)
export { Plans }
