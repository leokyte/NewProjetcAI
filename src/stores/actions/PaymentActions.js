import { Platform } from 'react-native'
import { requestSubscription } from 'react-native-iap'

import { logError } from '../../integrations'
import { startLoading, stopLoading } from '.'
import { PAYMENT_TYPES_FETCH } from './types'
import { kyteAccountGetUUID } from '../../services'

// CurrentSale
export const paymentTypesFetch = () => (dispatch) => {
	dispatch({ type: PAYMENT_TYPES_FETCH, payload: [] })
}

export const mountPaymentLink = (paymentLinkCode) => (dispatch, getState) => {
	const { services } = getState().internal
	const baseUrl = services.urls.pay
	return `${baseUrl}/${paymentLinkCode}`
}

export const setRequestSubscription = (sku) => async (dispatch, getState) => {
	const { plans, billing, auth } = getState()
	const isAndroid = Platform.OS === 'android'

	// eslint-disable-next-line prefer-const
	let payload = { sku }

	if (isAndroid) {
		let offerToken = null

		plans?.list.find((item) => {
			if (item?.monthly?.sku === sku) {
				offerToken = item.monthly?.subscriptionOfferDetails[0]?.offerToken
			}
			if (item?.yearly?.sku === sku) {
				offerToken = item.yearly?.subscriptionOfferDetails[0]?.offerToken
			}

			return null
		})

		payload.subscriptionOffers = [{ sku, ...(offerToken && { offerToken }) }]
		payload.obfuscatedAccountIdAndroid = JSON.stringify({ aid: auth.aid, uid: auth.uid })
		payload.obfuscatedProfileIdAndroid = JSON.stringify({ aid: auth.aid, uid: auth.uid })

		if (billing.purchaseToken) payload.purchaseTokenAndroid = billing.purchaseToken
	} else {
		try {
			const { data } = await kyteAccountGetUUID(auth.aid)
			if (data) payload.appAccountToken = data
		} catch (err) {
			console.log('[error] kyteAccountGetUUID', err)
			logError(err, 'error: kyteAccountGetUUID')
		}
	}

	try {
		dispatch(startLoading())
		await requestSubscription(payload)
	} catch (err) {
		console.log('[error] requestSubscription', err)
		logError(err, 'Request_Subscription_Error')
	} finally {
		dispatch(stopLoading())
	}
}
