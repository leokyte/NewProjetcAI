import { ToastAndroid, Platform } from 'react-native'
import moment from 'moment'
import Intercom from '@intercom/intercom-react-native'
import { logEvent, remoteConfigGetValue } from '../../integrations'

import {
	SET_COMMON,
	CHAT_NOTIFICATION,
	RECEIPT_MAIL_SENT,
	RECEIPT_MAIL_TO,
	RESET_MAIL_TO,
	UPDATE_DRAWER_VISIBILITY,
	COMMON_START_LOADING,
	COMMON_STOP_LOADING,
	COMMON_START_GLOBAL_LOADING,
	COMMON_STOP_GLOBAL_LOADING,
	COMMON_USER_REACHED_LIMIT,
	SET_INITIAL_ROUTE_NAME,
	SET_ACTUAL_ROUTE_NAME,
	COMMON_SET_NOPRODUCTS_HELPER_VISIBILITY,
	COMMON_SET_FIRSTPRODUCT_HELPER_VISIBILITY,
	COMMON_SET_FIRSTSALE_HELPER_VISIBILITY,
	COMMON_SET_ISONLINE,
	TOGGLE_BILLING_MESSAGE,
	SET_CONCLUSION_STATE,
	COMMON_START_TOAST,
	COMMON_STOP_TOAST,
	CHECKOUT_EDITION_MODE,
	COMMON_SET_VALUES,
	SET_CHECKOUT_PRODUCT_STYLE,
	COMMON_REFRESH_CUSTOMER_STATEMENTS,
	COMMON_OPEN_GENERIC_MODAL,
	COMMON_HIDE_GENERIC_MODAL,
	COMMON_SET_LOAD_GENERIC_MODAL,
	COMMON_OPEN_TERMS_MODAL,
	COMMON_HIDE_TERMS_MODAL,
	COMMON_HAS_UPDATED_DEVICE_INFO,
	COMMON_SET_BARCODE_VISIBILITY,
	SET_VIEWPORT,
	COMMON_IS_CANCELLING_SALE,
	COMMON_SET_NUMBER_OF_MESSAGES,
	SET_ENABLED_DRAWER_SWIPE,
	SHOW_NEED_CONFIGURE_CATALOG_MODAL_FOR_COUPONS,
	COMMON_SET_AUDIO_PERMISSION_REQUESTED,
} from './types'

import { sendReceipt, sendReport, sendCustomerAccountReceipt } from '../../services'
import { totalLocalData } from '../../repository'
import I18n from '../../i18n/i18n'
import { currentSaleRenew } from '.'
import KyteMixpanel, { getMixpanelProps } from '../../integrations/Mixpanel'
import { getIntercomProps, getUnreadIntercomConversationCount, loginUserOnIntercom } from '../../integrations/Intercom'
import { getClarityTags, setClarityCustomTags } from '../../integrations/Clarity'
import { getInitialRoute } from '../../util'
import Sample from '../../enums/Sample'

export const initializeCommon = () => async (dispatch, getState) => {
	const { isAtConclusion } = getState().common
	const { user, isLogged } = getState().auth

	await KyteMixpanel.init()
	dispatch(updateMixpanelUserData())

	await loginUserOnIntercom(isLogged, user)
	dispatch(updateIntercomUserData())

	if (Platform.OS === 'android') dispatch(updateClarityCustomTag())

	const intercomUnreadConversations = await getUnreadIntercomConversationCount()
	dispatch(updateBadgeNumber(intercomUnreadConversations))

	// Clear cart on app load
	if (isAtConclusion) dispatch(currentSaleRenew())
	dispatch({ type: SET_CONCLUSION_STATE, payload: false })
}

export const updateIntercomUserData = () => async (dispatch, getState) => {
	const { auth } = getState()
	const isTestUser = auth?.user?.email?.includes('@kyte.com')
	if (isTestUser) return

	try {
		const userAttributes = getIntercomProps(getState)
		await Intercom.updateUser(userAttributes)
	} catch (error) {
		if (__DEV__) {
			console.tron.logImportant('updateIntercomUserData Error ', error)
		}
	}
}

export const updateBadgeNumber = (number) => (dispatch) =>
	dispatch({ type: COMMON_SET_NUMBER_OF_MESSAGES, payload: number })

export const setCommon = (payload) => (dispatch) => dispatch({ type: SET_COMMON, payload })

export const chatNotification = (value) => ({
	type: CHAT_NOTIFICATION,
	payload: value,
})

export const receiptMailTo = (value) => ({
	type: RECEIPT_MAIL_TO,
	payload: value,
})

export const receiptMailSent = (value) => ({
	type: RECEIPT_MAIL_SENT,
	payload: value,
})

export const resetMailTo = () => ({
	type: RESET_MAIL_TO,
})

export const updateDrawerVisibility = (value) => (dispatch) => {
	dispatch({
		type: UPDATE_DRAWER_VISIBILITY,
		payload: value,
	})
}

export const sendReceiptByMail = (emailContent) => async () => {
	const response = await sendReceipt(emailContent)
	showEmailSendToast(response.status, emailContent.receiver)
}

export const sendCustomerAccountReceiptByEmail = (data, callback) => async () => {
	const response = await sendCustomerAccountReceipt(data)
	showEmailSendToast(response.status, data.receiver)
	if (response.status === 200) callback()
}

export const updateUserHasCheckedOpenedSales = (status) => async (dispatch, getState) => {
	// const { userHasCheckedOpenedSales } = getState().common;
	// const { openedSalesQuantity } = getState().sales;
	//
	// // checking if this user really has any opened sales
	// if (openedSalesQuantity <= 0) {
	//   AsyncStorage.setItem('userHasCheckedOpenedSales', status.toString());
	//   dispatch({ type: COMMON_UPDATE_USER_CHECKED_OPENED_SALES, payload: true });
	//   return;
	// }
	//
	// if (status !== userHasCheckedOpenedSales) { // only persists and change redux state if is different from the old value
	//   await dispatch(updateQuantityOpenedSales());
	//   if (!status) {
	//     AsyncStorage.setItem('userHasCheckedOpenedSales', 'true');
	//     dispatch({ type: COMMON_UPDATE_USER_CHECKED_OPENED_SALES, payload: true });
	//     return;
	//   }
	//
	//   AsyncStorage.setItem('userHasCheckedOpenedSales', status.toString());
	//   dispatch({ type: COMMON_UPDATE_USER_CHECKED_OPENED_SALES, payload: status });
	// }
}

export const startLoading = (msg) => ({ type: COMMON_START_LOADING, payload: msg })

export const stopLoading = () => ({ type: COMMON_STOP_LOADING })

export const startGlobalLoading = (msg) => ({ type: COMMON_START_GLOBAL_LOADING, payload: msg })

export const stopGlobalLoading = () => ({ type: COMMON_STOP_GLOBAL_LOADING })

export const checkUserReachedLimit = () => (dispatch, getState) => {
	if (!getState().auth.user.authVerified) {
		const totalRegisters = totalLocalData()
		if (totalRegisters.totalSale + totalRegisters.totalProduct + totalRegisters.totalCustomer > 1) {
			// return dispatch({ type: COMMON_USER_REACHED_LIMIT, payload: true }) ( Temporary validation bug fix )
			dispatch({ type: COMMON_USER_REACHED_LIMIT, payload: false })
			// uncomment this line when the bug is fixed ( Temporary validation bug fix )
			// dispatch({ type: SET_INITIAL_ROUTE_NAME, payload: 'Confirmation' })
		} else {
			dispatch({ type: COMMON_USER_REACHED_LIMIT, payload: false })
		}
	} else {
		dispatch({ type: COMMON_USER_REACHED_LIMIT, payload: false })
	}
}

export const setNoProductsHelperVisibility = (visibility) => ({
	type: COMMON_SET_NOPRODUCTS_HELPER_VISIBILITY,
	payload: visibility,
})
export const setFirstProductHelperVisibility = (visibility) => ({
	type: COMMON_SET_FIRSTPRODUCT_HELPER_VISIBILITY,
	payload: visibility,
})
export const setFirstSaleHelperVisibility = (visibility) => ({
	type: COMMON_SET_FIRSTSALE_HELPER_VISIBILITY,
	payload: visibility,
})

export const commonSetIsOnline = (isOnline) => ({ type: COMMON_SET_ISONLINE, payload: isOnline })
export const setUserReachedLimit = (status) => ({
	type: COMMON_USER_REACHED_LIMIT,
	payload: status,
})

export const setInitialRouteName = (routeName) => (dispatch, getState) => {
	const { auth, store, onboarding } = getState()
	const defaultInitialRoute = onboarding?.sample?.expInitialScreen === Sample.DASHBOARD ? 'Dashboard' : 'CurrentSale'
	const hasCatalog = Boolean(store?.catalog)
	const user = auth?.user
	// Defensive: Treat empty string as invalid, use default instead
	const sanitizedRouteName = routeName && routeName.trim() !== '' ? routeName : null
	const updatedRouteName = sanitizedRouteName || getInitialRoute({ defaultInitialRoute, hasCatalog, user })

	dispatch({ type: SET_INITIAL_ROUTE_NAME, payload: updatedRouteName })
}

export const setActualRouteName = (route) => ({ type: SET_ACTUAL_ROUTE_NAME, payload: route })
export const checkoutEditionMode = (status) => ({ type: CHECKOUT_EDITION_MODE, payload: status })

export const toggleBillingMessage = (visibility, message, remoteKey) => (dispatch) => {
	const messageType = message

	logEvent('BillingMessage', { messageType })
	const toggleMessage = (webview = '') => {
		if (webview === 'disabled') return
		dispatch({
			type: TOGGLE_BILLING_MESSAGE,
			payload: { visibility, message: messageType, webview },
		})
	}

	return remoteKey ? remoteConfigGetValue(remoteKey, toggleMessage) : toggleMessage()
}

export const openModalWebview =
	(webview, message = 'featureOnlyPro') =>
	(dispatch) => {
		dispatch({
			type: TOGGLE_BILLING_MESSAGE,
			payload: { visibility: true, message, webview },
		})
	}

export const requestReportExport = (start, end, models) => (dispatch, getState) => {
	const { auth, preference } = getState()
	const { user } = auth
	const { email } = user
	const data = {
		aid: auth.aid,
		period: {
			init: start,
			end,
		},
		receiver: email,
		models,
		userLanguage: I18n.t('locale'),
		currencyCode: preference.account.currency.currencyCode,
		tz: moment().format('Z'),
		accountCountryCode: preference.account.countryCode,
	}

	return new Promise((resolve, reject) => {
		dispatch(startLoading())
		sendReport(data)
			.then(() => {
				logEvent('ReportExport', { selectedOptions: models.join(', ') })
				dispatch(stopLoading())
				resolve()
			})
			.catch((error) => {
				dispatch(stopLoading())
				reject()
			})
	})
}

export const startToast = (text) => ({ type: COMMON_START_TOAST, payload: text })
export const stopToast = () => ({ type: COMMON_STOP_TOAST })
export const commonSetValues = (payload) => ({ type: COMMON_SET_VALUES, payload })
export const setCheckoutProductStyle = (style) => ({
	type: SET_CHECKOUT_PRODUCT_STYLE,
	payload: style,
})
export const refreshCustomerStatements = (bool) => ({
	type: COMMON_REFRESH_CUSTOMER_STATEMENTS,
	payload: bool,
})

const showEmailSendToast = (status, receiver) => {
	if (status === 200) {
		if (Platform.OS !== 'ios') {
			ToastAndroid.showWithGravity(
				`${I18n.t('receiptSuccessfullySentTo')} ${receiver}`,
				ToastAndroid.LONG,
				ToastAndroid.BOTTOM
			)
		}
	} else if (Platform.OS !== 'ios') {
		ToastAndroid.showWithGravity(
			`${I18n.t('failedToSendReceiptTo')} ${receiver}`,
			ToastAndroid.LONG,
			ToastAndroid.BOTTOM
		)
	}
}

export const updateMixpanelUserData = () => async (_dispatch, getState) => {
	const [userProps, superProps] = await getMixpanelProps(getState)
	KyteMixpanel.setTrackingProperties(userProps, superProps)
}

export const updateClarityCustomTag = () => (dispatch, getState) => {
	const userTags = getClarityTags(getState)
	setClarityCustomTags(userTags)
}

export const openGenericModal = (payload) => (dispatch) => dispatch({ type: COMMON_OPEN_GENERIC_MODAL, payload })
export const hideGenericModal = () => (dispatch) => dispatch({ type: COMMON_HIDE_GENERIC_MODAL })
export const setLoadGenericModal = () => (dispatch) => dispatch({ type: COMMON_SET_LOAD_GENERIC_MODAL })
export const openTermsModal = () => (dispatch) => dispatch({ type: COMMON_OPEN_TERMS_MODAL })
export const hideTermsModal = () => (dispatch) => dispatch({ type: COMMON_HIDE_TERMS_MODAL })
export const setHasUpdatedDeviceInfo = (payload) => (dispatch) =>
	dispatch({ type: COMMON_HAS_UPDATED_DEVICE_INFO, payload })
export const setBarcodeVisibility = (payload) => (dispatch) =>
	dispatch({ type: COMMON_SET_BARCODE_VISIBILITY, payload })
export const setViewport = (viewport) => (dispatch) => dispatch({ type: SET_VIEWPORT, payload: viewport })
export const setIsCancellingSale = (isCancelling) => (dispatch) =>
	dispatch({ type: COMMON_IS_CANCELLING_SALE, payload: isCancelling })
export const setEnabledDrawerSwipe = (isEnabled) => (dispatch) =>
	dispatch({ type: SET_ENABLED_DRAWER_SWIPE, payload: isEnabled })
export const setShowNeedConfigureCatalogModalForCoupons = (isToShow) => (dispatch) =>
	dispatch({ type: SHOW_NEED_CONFIGURE_CATALOG_MODAL_FOR_COUPONS, payload: isToShow })
export const setAudioPermissionRequested = (requested) => (dispatch) =>
	dispatch({ type: COMMON_SET_AUDIO_PERMISSION_REQUESTED, payload: requested })
