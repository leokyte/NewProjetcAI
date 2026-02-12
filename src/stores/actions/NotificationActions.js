import { isFree, isTrial } from '@kyteapp/kyte-ui-components'
import { logEvent } from '../../integrations'
import { deleteAll, fetchOneByID, SALE } from '../../repository'
import {
	USER_SET,
	COMMON_USER_REACHED_LIMIT,
	BILLING_FETCH,
	TAXES_CLEAR,
	TAXES_FETCH,
	SYNC_SET_IS_FIRST_NOTIFICATION,
	TOGGLE_BILLING_MESSAGE,
} from './types'
import {
	isFeatureAllowed,
	logOut,
	syncClearAllReducers,
	saleDetail,
	hideGenericModal,
	openGenericModal,
	updateIntegrations,
	setSucessfulMessageVisibility,
	storeAccountSave,
} from './'
import {
	subscribeUserReceiveNotification,
	setUserNotificationRead,
	subscribeAccountReceiveNotification,
	setAccountNotificationRead,
} from './../../sync'
import NavigationService from '../../services/kyte-navigation'
import { SnapshotTypes } from '../../enums'

export const addCatalogPaymentGatewayNotification = (payload) => (dispatch, getState) => {
	const { store } = getState().auth
	const { gatewayServiceType } = getState().externalPayments
	const { gatewayKey } = payload	

	const setCheckoutGateways = [
		...store.checkoutGateways,
		{ key: gatewayKey, active: true, services: [{ type: gatewayServiceType, active: true }] },
	]

	dispatch(storeAccountSave({ ...store, checkoutGateways: setCheckoutGateways }, () => {
		logEvent('Payment Integration Complete', {
			gateway: gatewayKey === 'mercadopago-online' ? 'mercadopago' : 'stripe',
			where: gatewayServiceType === 'catalog' ? 'online payment' : 'payment link',
		})
	}))
}

export const gatewayCheckoutRefundError = (payload) => (dispatch) => {
	const repositorySale = () => fetchOneByID(SALE, payload)
	const sale = repositorySale()

	const onPress = () => {
		dispatch(saleDetail(sale))
		dispatch(hideGenericModal())
		NavigationService.navigate('Sales', 'SaleDetail', { refreshSales: () => null })
	}
	const onPressClose = () => dispatch(hideGenericModal())

	const button = { onPress, onPressClose }

	dispatch(
		openGenericModal({
			isVisible: true,
			path: 'gateway-refund-error',
			content: sale,
			button,
			disabledComponents: ['bottom-container', 'top-button'],
		})
	)
}

export const notificationInitialize = () => async (dispatch, getState) => {
	// Avoid snapshot notification at first check
	const { isFirstNotification } = getState().sync
	const setIsFirstNotification = (value) => dispatch({ type: SYNC_SET_IS_FIRST_NOTIFICATION, payload: value })

	subscribeUserReceiveNotification((notifications) =>
		notificationUserReceiveDispatcher(dispatch, getState, notifications)
	)
	subscribeAccountReceiveNotification(
		(notifications) => notificationAccountReceiveDispatcher(dispatch, getState, notifications),
		isFirstNotification,
		setIsFirstNotification
	)
}

const notificationUserReceiveDispatcher = (dispatch, getState, notifications) => {
	setUser(dispatch, getState, notifications[0])
}

// Snapshot
const notificationAccountReceiveDispatcher = (dispatch, getState, notifications) => {
	const { auth, taxes, billing } = getState()

	if (!auth.isLogged) return

	notifications.forEach((n) => {
		setAccountNotificationRead(n.id)
		if (n.type === SnapshotTypes.USER_DELETED) {
			if (auth.user && n.payload && n.payload.uid === auth.user.uid) dispatch(logOut())
		}
		if (n.type === SnapshotTypes.CLEAR_DATA) {
			dispatch(syncClearAllReducers())
			dispatch(logOut())
			deleteAll(n.payload)
		}
		if (n.type === SnapshotTypes.ACCOUNT_BILLING_CHANGED) {
			const { plan, status } = n.payload

			dispatch({ type: BILLING_FETCH, payload: n.payload })

			if (isFree({ plan, status })) {
				dispatch(setSucessfulMessageVisibility(false))
				dispatch({
					type: TOGGLE_BILLING_MESSAGE,
					payload: { visibility: true, message: n.payload.status },
				})
			} else if (!isTrial({ status })) {
				dispatch({
					type: TOGGLE_BILLING_MESSAGE,
					payload: { visibility: false },
				})
			}

			if (!isFeatureAllowed('taxes', getState)) {
				dispatch({ type: TAXES_CLEAR })
			} else {
				dispatch({ type: TAXES_FETCH, payload: taxes })
			}
		}
		if (n.type === SnapshotTypes.CREDENTIAL_GATEWAY_CHECKOUT) {
			dispatch(addCatalogPaymentGatewayNotification(n.payload))
		}
		if (n.type === SnapshotTypes.REFUND_ERROR_NOTIFICATION) {
			dispatch(gatewayCheckoutRefundError(n.payload.sale))
		}
		if (n.type === SnapshotTypes.FACEBOOK_FBE_INTEGRATION) {
			const isFbeIntegrated =
				!!n.payload.integrations && n.payload.integrations.length > 0
					? n.payload.integrations.find((i) => i.name === 'fbe' && i.active)
					: false
			if (isFbeIntegrated) {
				logEvent('FBEFoodComplete')
			}

			dispatch(updateIntegrations(n.payload.integrations))
		}
		if (n.type === SnapshotTypes.FACEBOOK_PIXEL_INTEGRATION || n.type === SnapshotTypes.TIKTOK_INTEGRATION) {
			dispatch(updateIntegrations(n.payload.integrations))
		}
	})
}

export const setUser = (dispatch, getState, { id, payload }) => {
	const userState = getState().auth.user
	const user = { ...userState, ...payload }
	setUserNotificationRead(id)
	dispatch({ type: USER_SET, payload: user })
	// dispatch({ type: SET_INITIAL_ROUTE_NAME, payload: 'PageConfirmation' });
	NavigationService.navigate('Confirmation', 'PageConfirmation')
	dispatch({ type: COMMON_USER_REACHED_LIMIT, payload: false })
	logEvent('Account Confirmed')
}
