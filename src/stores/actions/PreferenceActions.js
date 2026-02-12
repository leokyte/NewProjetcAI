import { getCustomLocale } from '@kyteapp/react-native-locale'
import { getUID, getCurrencyInfo } from '../../util'
import { kyteAccountGetPreference, kyteAccountSetPreference } from '../../services'
import { logEvent } from '../../integrations'
import { OrderStatus } from '../../enums'
import { PREFERENCES_FETCH } from './types'
import { startLoading, stopLoading } from './CommonActions'
import { CoreAction } from '../../enums/Subscription'

const COUNTRY_CODE = 'countryCode'
const NOTIFY_DAILY = 'notifyDaily'
const NOTIFY_WEEK = 'notifyWeek'
const CURRENCY = 'currency'
const SHOW_CANCELED_SALES = 'showCanceledSales'
const DECIMAL_CURRENCY = 'decimalCurrency'
const CHECKOUT_SORT = 'checkoutSort'
const STORE_PAY_LATER = 'allowPayLater'
const SALE_STATUS = 'salesStatus'
const ONLINE_PAYMENTS_COUNTRY_CODE = 'onlinePaymentsCountryCode'
const CARD_SERVICE = 'cardService'
const DID_ACCOUNT_MAKE_ORDER = 'didAccountMakeOrder'
const CORE_ACTIONS_KEY = 'coreActions'

async function preferenceSetKey(dispatch, key, value, callback, errorCallback) {
	try {
		const preference = await kyteAccountSetPreference(getUID(), key, value)
		dispatch({ type: PREFERENCES_FETCH, payload: preference })
		if (callback) callback()
	} catch (error) {
		if (errorCallback) errorCallback(error)
	}
}

export const preferenceInitialize = () => async (dispatch) => {
	const { data } = await kyteAccountGetPreference(getUID())
	dispatch({ type: PREFERENCES_FETCH, payload: data }).catch((ex) => {
		const errorMessage = ex.message ? ex.message : 'No error message provided.'
		logEvent('PreferenceInitializeError', { errorMessage })
	})
}

export const preferenceSetNotifyDaily = (value) => (dispatch) => preferenceSetKey(dispatch, NOTIFY_DAILY, value)
export const preferenceSetNotifyWeek = (value) => (dispatch) => preferenceSetKey(dispatch, NOTIFY_WEEK, value)
export const preferenceSetCanceledSale = (value, callback) => (dispatch) =>
	preferenceSetKey(dispatch, SHOW_CANCELED_SALES, value, callback)
export const preferenceSetDecimalCurrency = (value) => (dispatch) => preferenceSetKey(dispatch, DECIMAL_CURRENCY, value)
export const preferenceSetCheckoutSort = (value) => (dispatch) => preferenceSetKey(dispatch, CHECKOUT_SORT, value)
export const preferenceSetStorePayLater = (value) => (dispatch) => preferenceSetKey(dispatch, STORE_PAY_LATER, value)
export const preferenceSetSaleStatus = (value, callback) => (dispatch) =>
	preferenceSetKey(dispatch, SALE_STATUS, value, callback)
export const preferenceSetOnlinePaymentsCountryCode = (value, callback) => (dispatch) =>
	preferenceSetKey(dispatch, ONLINE_PAYMENTS_COUNTRY_CODE, value, callback)
export const preferenceSetCardServiceConfig = (value, callback, errorCallback) => (dispatch) =>
	preferenceSetKey(dispatch, CARD_SERVICE, value, callback, errorCallback)

export const preferenceSetHasFirstOrder = (value) => (dispatch) =>
	preferenceSetKey(dispatch, DID_ACCOUNT_MAKE_ORDER, value)

// Core Actions (subscription bypass replacement)
export const preferenceAddCoreAction = (action) => (dispatch, getState) => {
	if (!Object.values(CoreAction).includes(action)) return
	const { preference } = getState()
	const current = preference?.account?.[CORE_ACTIONS_KEY] || []
	if (current.includes(action)) return
	const updated = [...current, action]
	preferenceSetKey(dispatch, CORE_ACTIONS_KEY, updated)
}

export const preferenceSetCoreActions = (actions) => (dispatch) => {
	const filtered = Array.from(new Set(actions.filter((a) => Object.values(CoreAction).includes(a))))
	preferenceSetKey(dispatch, CORE_ACTIONS_KEY, filtered)
}

export const preferenceSetCountryCode = (countryCode, currencyCode) => (dispatch) => {
	preferenceSetKey(dispatch, COUNTRY_CODE, countryCode)
	;(async () => {
		let res = { countryCode, currencyCode }
		if (!currencyCode) res = await getCustomLocale(countryCode)
		const currencyInfo = getCurrencyInfo(res.currencyCode)
		preferenceSetKey(dispatch, CURRENCY, { ...res, ...currencyInfo })
	})()
}

export const preferenceSaveSaleStatus = (item, action, callerCallback) => (dispatch, getState) => {
	let salesStatus = getState().preference.account.salesStatus
	const callback = () => {
		dispatch(stopLoading())
		if (callerCallback) callerCallback()
	}

	dispatch(startLoading())

	if (action === 'add') {
		const slugAlreadyUsed = salesStatus.filter((o) => o.status.match(new RegExp(`^${item.status}`, 'i')))
		const hasDefaultStatus =
			item.status === OrderStatus.items[OrderStatus.OPENED].status ||
			item.status === OrderStatus.items[OrderStatus.CONFIRMED].status
		if (slugAlreadyUsed.length) {
			const number = slugAlreadyUsed.pop().status.match(/\d+/g) || 0
			item = { ...item, status: `${item.status}-${Number(number) + 1}` }
		} else if (hasDefaultStatus) {
			item = { ...item, status: `${item.status}-1` }
		}

		dispatch(preferenceSetSaleStatus([...salesStatus, item], () => callback()))
	}

	if (action === 'edit') {
		salesStatus = salesStatus.map((s) => {
			if (s.status !== item.status) return s
			return { ...s, ...item }
		})
		dispatch(preferenceSetSaleStatus(salesStatus, () => callback()))
	}
}
