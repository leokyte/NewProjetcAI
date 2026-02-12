import {
	Platform,
	View,
	StatusBar,
	Linking,
	Text,
	Dimensions,
	AppState,
	NativeEventEmitter,
	NativeModules,
} from 'react-native'
import React, { Suspense, useEffect, useRef } from 'react'
import { connect } from 'react-redux'
import NetInfo from '@react-native-community/netinfo'
import Intercom, { Visibility, IntercomEvents } from '@intercom/intercom-react-native'
import KyteMixpanel from '../integrations/Mixpanel'

import { colors, scaffolding } from '../styles'
import {
	syncInitialize,
	notificationInitialize,
	updateDrawerVisibility,
	currentSaleRetrieve,
	updateQuantitySales,
	initializeCommon,
	dispatchUserAccountCache,
	checkIfHasMultiuserProperty,
	productsFetch,
	productsFetchByNameAndCode,
	productsListFetch,
	productCategoryFetch,
	syncDownRestore,
	authInitialize,
	stockFetch,
	customersFetch,
	customerAccountCancelSale,
	hideGenericModal,
	setViewport,
	setSucessfulMessageVisibility,
	setErrorMessageVisibility,
	sendAttribution,
	commonSetIsOnline,
	toggleBlockManagePlan,
	syncSales,
	fetchUnsycedSales,
	updateIntercomUserData,
	updateBadgeNumber,
	KyteDeepLinkHandler,
	setDashboardVersion,
	setShowNeedConfigureCatalogModalForCoupons,
} from '../stores/actions'
import { BillingMessage, KyteQuickView, LoadingCleanScreen, BlockManagePlan } from './common'
import AuthContainer from './AuthContainer'
import ToastMessage from './common/ToastMessage'
import Helper from './onboarding/Helper'
import { calculateViewport, redirappURL } from '../util'
import SubscribeSuccessfulMessage from './account/auxiliary-components/SubscribeSuccessfulMessage'
import { SubscribeErrorMessage } from './account/auxiliary-components/SubscribeErrorMessage'
import IAPHandler from './common/plans/IAPHandler'
import { logEvent } from '../integrations'
import { useGetSyncResult } from '../hooks'
import { SALES_GROUP_RESULT_INITIAL_STATE } from '../stores/reducers/SalesReducer'
import { SalesTypeEnum } from '../enums/SaleSort'
import { updateCurrentAppIntercomProps } from '../integrations/Intercom'
import { isDifferentAppSubscription } from '../util/util-plans'
import { setClarityUserId } from '../integrations/Clarity'
import Attribution from './analytics/Attribution'
import TokenAuthenticationHandler from './auth/TokenAuthenticationHandler'
import PermissionsHandler from './permissions/PermissionsHandler'
import FacebookSDK from './analytics/FacebookSDK'
import NeedConfigureCatalogModal from './common/modals/NeedConfigureCatalogModal'
import { NeedCatalogModal } from '../../assets/images'

export const AppContainerComponent = ({
	auth,
	dispatch,
	isLogged,
	syncDownResult,
	productCategory,
	sortType,
	checkoutSort,
	products,
	billing,
	actualRouteName,
	toast,
	stockSearchText,
	productsSearchText,
	refreshStatements,
	customer,
	genericModal,
	isBillingSuccessfulMessageVisible,
	isBillingErrorMessageVisible,
	isFromManageButton,
	fetchSaleLoader,
	isOnline,
	unsycedSales,
	unsycedOrders,
	user,
	store,
	showNeedConfigureCatalogModalForCoupons,
	...props
}) => {
	const fetchLimit = 40
	const { outerContainer } = scaffolding
	const previousUnsycedSales = useRef(unsycedSales)
	const previousUnsycedOrders = useRef(unsycedOrders)
	const previousIsOnlineRef = useRef(isOnline)

	// Lazy imports
	const SaleQuickView = React.lazy(() => import('./sales/SaleQuickView'))
	const GatewayRefundError = React.lazy(() => import('./common/GatewayRefundError'))

	const { hasProduct, hasCategories, hasCustomers } = useGetSyncResult(syncDownResult)
	const modalComponents = [
		{ path: 'sale-detail', Component: SaleQuickView },
		{ path: 'gateway-refund-error', Component: GatewayRefundError },
	]

	const initializeActions = () => {
		props.authInitialize()
		props.dispatchUserAccountCache()
		props.syncInitialize()
		props.notificationInitialize()
		props.updateQuantitySales()
		props.updateQuantitySales('closed')
		props.initializeCommon()
		props.currentSaleRetrieve()
		props.checkIfHasMultiuserProperty()
		props.setViewport(calculateViewport(Dimensions.get('window').width))
		props.fetchUnsycedSales()
		props.setDashboardVersion()
	}

	const renderBillingSuccessfulMessage = () => {
		isBillingSuccessfulMessageVisible &&
			logEvent('Current Plan View', {
				plan: billing.plan,
				billing_status: billing.status,
				recurrence: billing.recurrence,
			})

		return (
			<SubscribeSuccessfulMessage
				fromManageButton={!!billing.fromManageButton}
				fromManageButtonAction={billing.fromManageButton ? () => manageSubscription() : false}
				billingInfo={billing}
				actionButtonOnPress={() => {
					props.setSucessfulMessageVisibility(false, false)
				}}
				redirectToRate={() => Linking.openURL(redirappURL)}
				onSwipeComplete={() => props.setSucessfulMessageVisibility(false, false)}
				seePlans={() => {
					logEvent('Other Plans Click', {
						plan: billing.plan,
						billing_status: billing.status,
						recurrence: billing.recurrence,
					})
					props.setSucessfulMessageVisibility(false, false)
					props.toggleBlockManagePlan()
				}}
			/>
		)
	}

	const renderBillingErrorMessage = () => (
		<SubscribeErrorMessage
			actionButtonOnPress={() => props.setErrorMessageVisibility(false)}
			onSwipeComplete={() => props.setErrorMessageVisibility(false)}
		/>
	)

	const renderGenericModal = () => {
		const Content = modalComponents.find((c) => c.path === genericModal.path)

		return (
			<KyteQuickView
				hideQuickView={() => props.hideGenericModal()}
				iconList={[genericModal.button]}
				isQuickViewVisible={genericModal.isVisible}
				loading={genericModal.loading}
				disabledComponents={genericModal.disabledComponents}
			>
				<Suspense fallback={<Text>Loading...</Text>}>
					<Content.Component
						content={genericModal.content}
						onPress={genericModal.button.onPress}
						onPressClose={genericModal.button.onPressClose}
					/>
				</Suspense>
			</KyteQuickView>
		)
	}

	const renderCleanLoadingScreen = () => {
		const { visible } = fetchSaleLoader

		if (visible) return <LoadingCleanScreen />
	}

	const manageSubscription = async () => {
		const { plan, status, recurrence, paymentType } = billing

		logEvent('Current Plan Manage', {
			plan,
			payment_intermediary: Platform.OS,
			billing_status: status,
			recurrence,
		})

		const isPaymentDevice = () => {
			const isPaidInOtherApp = isDifferentAppSubscription(billing?.planInfo?.planId)
			if (isPaidInOtherApp) return false

			const isAndroid = Platform.OS === 'android'
			const isIOS = Platform.OS === 'ios'

			switch (paymentType) {
				case 'google':
					return isAndroid
				case 'apple':
					return isIOS
				default:
					return false
			}
		}

		if ((paymentType === 'apple' || paymentType === 'google') && status !== 'millennium' && isPaymentDevice()) {
			return Linking.openURL(
				Platform.select({
					ios: 'https://apps.apple.com/account/subscriptions',
					android: 'https://play.google.com/store/account/subscriptions',
				})
			)
		}
		props.setSucessfulMessageVisibility(false, false)
		setTimeout(() => props.toggleBlockManagePlan(), 500)
	}

	const getProducts = (oneProductSync, syncFetchLength, sort) => {
		const isFocusedOnProducts =
			actualRouteName === 'ProductsIndex' || actualRouteName === 'ProductDetails' || actualRouteName === 'Products'

		const fetchProps = [
			isFocusedOnProducts ? null : sort,
			null,
			productCategory.selected,
			{
				limit: oneProductSync ? syncFetchLength : fetchLimit,
				length: 0,
			},
			'reboot',
		]

		props.productsFetch(...fetchProps)
		props.productsListFetch(...fetchProps)
	}

	const handleOpenURL = (event) => {
		const { url } = event

		if (!isLogged) return

		props.KyteDeepLinkHandler(url)
	}

	useEffect(() => {
		const urlListener = Linking.addEventListener('url', (event) => handleOpenURL(event))
		if (isLogged) {
			initializeActions()

			Linking.getInitialURL().then((url) => {
				if (!url) return
				handleOpenURL({ url })
			})
			if (Platform.OS === 'android') setClarityUserId(auth?.user?.aid)
		}

		return () => {
			urlListener.remove()
		}
	}, [isLogged])

	useEffect(() => {
		const handleAppStateChange = (nextAppState) => {
			if (nextAppState === 'active') {
				Intercom.handlePushMessage()
				// It needs to be logged because if there's no registered user in Intercom/MixPanel, it will throw an error.
			}
		}

		if (isLogged && auth?.user?.aid) {
			updateCurrentAppIntercomProps()
			KyteMixpanel.updateCurrentAppMixPanelProps(auth?.user?.aid)
		}

		const appStateListener = AppState.addEventListener('change', handleAppStateChange)

		const cleanupIntercomEventListeners = Intercom.bootstrapEventListeners()
		const intercomEmitter = NativeModules.IntercomEventEmitter
			? new NativeEventEmitter(NativeModules.IntercomEventEmitter)
			: null
		const unreadEventName = IntercomEvents.IntercomUnreadCountDidChange
		const listener =
			intercomEmitter?.addListener(unreadEventName, ({ count }) => {
				props.updateBadgeNumber(count)
			}) ?? null

		return () => {
			appStateListener.remove()
			listener?.remove()
			cleanupIntercomEventListeners?.()
		}
	}, [isLogged, auth?.user?.aid])

	useEffect(() => {
		const hideIntercomPopupMessages = [
			'ProductSale',
			'Cart',
			'CartItemUpdate',
			'Discount',
			'CartItemDiscount',
			'CartObservation',
			'ShippingFeesApply',
			'Payment',
			'PaymentEdition',
			'PaymentLink',
			'SplitPayment',
			'Receipt',
			'ReceiptShareOptions',
			'CustomerSaleAccountBalance',
			'AllowPayLater',
		].includes(actualRouteName)

		if (hideIntercomPopupMessages) {
			Intercom.setInAppMessageVisibility(Visibility.GONE)
		} else {
			Intercom.setInAppMessageVisibility(Visibility.VISIBLE)
		}
	}, [actualRouteName])

	useEffect(() => {
		const onReceipt = actualRouteName === 'ReceiptShareOptions'
		const sort = { key: checkoutSort || 'dateCreation', isDesc: false }

		if (hasProduct && !onReceipt) {
			const oneProductSync = hasProduct === 1
			const syncFetchLength = products.length + 1

			if (!sortType) {
				props.stockFetch(stockSearchText, { limit: fetchLimit, length: 0 }, 'reboot')
			}

			if (productsSearchText) {
				props.productsFetchByNameAndCode(productsSearchText, null, { limit: fetchLimit, length: 0 }, 'reboot')
			} else {
				getProducts(oneProductSync, syncFetchLength, sort)
			}

			props.syncDownRestore()
		}
	}, [actualRouteName, hasProduct])

	useEffect(() => {
		if (hasCategories) {
			props.productCategoryFetch()
			props.syncDownRestore()
		}

		if (hasCustomers) {
			props.customersFetch()
			props.syncDownRestore()

			if (refreshStatements) {
				const updatedCustomer = syncDownResult.syncDownResultDocuments.models.customer

				props.customerAccountCancelSale(customer.id, updatedCustomer)
			}
		}
	}, [hasCategories, hasCustomers])

	useEffect(() => {
		const netInfoListener = (state) => props.commonSetIsOnline(state.isConnected)
		const unsubscribe = NetInfo.addEventListener(netInfoListener)
		const cleanup = () => unsubscribe()

		return cleanup
	}, [isOnline])

	useEffect(() => {
		const initialUnsycedSales = SALES_GROUP_RESULT_INITIAL_STATE.unsycedList
		const isInitiatingOrders = previousUnsycedOrders.current === initialUnsycedSales
		const isInitiatingSales = previousUnsycedSales.current === initialUnsycedSales
		const didBecameOnline = !previousIsOnlineRef.current && isOnline
		const shouldSyncOrders = unsycedOrders.length && (didBecameOnline || isInitiatingOrders)
		const shouldSyncSales = unsycedSales.length && (didBecameOnline || isInitiatingSales)

		previousUnsycedOrders.current = unsycedOrders
		previousUnsycedSales.current = unsycedSales
		previousIsOnlineRef.current = isOnline

		if (shouldSyncOrders) props.syncSales(unsycedOrders, SalesTypeEnum.ORDER)
		if (shouldSyncSales) props.syncSales(unsycedSales, SalesTypeEnum.SALE)
	}, [isOnline, unsycedSales, unsycedOrders])

	return (
		<View style={outerContainer}>
			<FacebookSDK />
			<PermissionsHandler />
			<TokenAuthenticationHandler />
			<Attribution />
			<IAPHandler />
			<StatusBar
				backgroundColor={colors.statusBarColor}
				barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'}
			/>
			<BillingMessage />
			<BlockManagePlan />
			{isLogged && isBillingSuccessfulMessageVisible ? renderBillingSuccessfulMessage() : null}
			{isLogged && isBillingErrorMessageVisible ? renderBillingErrorMessage() : null}
			<AuthContainer />
			{toast.visible && <ToastMessage />}
			{genericModal.isVisible ? renderGenericModal() : null}
			{isLogged && <Helper />}
			{renderCleanLoadingScreen()}
			<NeedConfigureCatalogModal
				isVisible={showNeedConfigureCatalogModalForCoupons}
				hideModal={() => props.setShowNeedConfigureCatalogModalForCoupons(false)}
				image={NeedCatalogModal}
				imgStyles={{ width: 210, height: 210 }}
				subtitle="coupons.needConfigureCatalogSubtitleModal"
			/>
		</View>
	)
}

const mapStateToProps = ({
	auth,
	sync,
	productCategory,
	products,
	preference,
	billing,
	common,
	stock,
	customers,
	sales,
}) => ({
	isLogged: auth.isLogged,
	syncDownResult: sync.syncDownResult,
	productCategory,
	sortType: products.sortType,
	products: products.list,
	productsSearchText: products.searchText,
	checkoutSort: preference.account.checkoutSort,
	billing,
	isBillingSuccessfulMessageVisible: billing.isSuccessfulMessageVisible,
	isBillingErrorMessageVisible: billing.isErrorMessageVisible,
	isFromManageButton: billing.fromManageButton,
	actualRouteName: common.actualRouteName,
	toast: common.toast,
	refreshStatements: common.refreshCustomerStatements,
	genericModal: common.genericModal,
	fetchSaleLoader: common.globalLoader,
	isOnline: common.isOnline,
	stockSearchText: stock.searchText,
	customer: customers.detail,
	unsycedSales: sales.salesGroupsResult.unsycedList,
	unsycedOrders: sales.ordersGroupsResult.unsycedList,
	user: auth.user,
	store: auth.store,
	auth,
	showNeedConfigureCatalogModalForCoupons: common.showNeedConfigureCatalogModalForCoupons
})

const AppContainer = connect(mapStateToProps, {
	syncInitialize,
	notificationInitialize,
	updateDrawerVisibility,
	currentSaleRetrieve,
	updateQuantitySales,
	initializeCommon,
	dispatchUserAccountCache,
	checkIfHasMultiuserProperty,
	productsFetch,
	productsFetchByNameAndCode,
	productsListFetch,
	productCategoryFetch,
	syncDownRestore,
	authInitialize,
	stockFetch,
	customersFetch,
	customerAccountCancelSale,
	hideGenericModal,
	setViewport,
	setSucessfulMessageVisibility,
	setErrorMessageVisibility,
	sendAttribution,
	commonSetIsOnline,
	toggleBlockManagePlan,
	syncSales,
	fetchUnsycedSales,
	updateIntercomUserData,
	updateBadgeNumber,
	KyteDeepLinkHandler,
	setDashboardVersion,
	setShowNeedConfigureCatalogModalForCoupons
})(AppContainerComponent)
export { AppContainer }
