import { Alert, Platform } from 'react-native'
import { confirmInAppPurchase, getAndroidSubscriptionPrices, sendConfirmationSuccessEvents } from '../../util'
import { SET_STORE_PLANS, HAS_STORE_PLANS, SET_SELECTED_PLAN } from './types'
import { setErrorMessageVisibility, setSucessfulMessageVisibility, stopLoading, toggleBillingMessage } from '.'
import { logEvent, remoteConfigGetValue } from '../../integrations'
import { BillingErrorMessagesBlackList } from '../../enums/BillingErrors'

export const setStorePlans =
	(subscriptions = []) =>
	async (dispatch, getState) => {
		const plans = getState().plans.list
		const initialAdditionalInfo = getState().plans.additionalInfo
		const isAndroid = Platform.OS === 'android'
		let remoteConfig
		let additionalInfo = initialAdditionalInfo

		await remoteConfigGetValue(
			'PlansPageSettings',
			(k) => {
				remoteConfig = k
			},
			'json'
		)

		await remoteConfigGetValue(
			'PlansPageAdditionalInfo',
			(k) => {
				additionalInfo = k
			},
			'json'
		)

		const buildPlans = plans.map((plan) => {
			const remoteConfigPlan = remoteConfig?.[plan.id] || {}

			const monthlySubscription = subscriptions.find((subscription) => subscription?.productId === plan?.monthly?.sku)
			const yearlySubscription = subscriptions.find((subscription) => subscription?.productId === plan?.yearly?.sku)

			const androidMonthlyPrices =
				isAndroid && monthlySubscription ? getAndroidSubscriptionPrices(monthlySubscription) : {}
			const androidYearlyPrices =
				isAndroid && yearlySubscription ? getAndroidSubscriptionPrices(yearlySubscription) : {}

			const contentMonthly = monthlySubscription
				? { monthly: { ...monthlySubscription, ...androidMonthlyPrices, ...plan.monthly } }
				: {}
			const contentYearly = yearlySubscription
				? { yearly: { ...yearlySubscription, ...androidYearlyPrices, ...plan.yearly } }
				: {}

			return {
				...plan,
				...contentMonthly,
				...contentYearly,
				...remoteConfigPlan,
			}
		})

		dispatch({ type: SET_STORE_PLANS, payload: { plansList: buildPlans, additionalInfo } })
		dispatch({ type: HAS_STORE_PLANS, payload: Boolean(subscriptions.length) })
	}

export const handleIAPSubscriptionSuccess = (purchase, finishTransaction) => async (dispatch, getState) => {
	const { aid } = getState().auth

	if (aid) {
		const {
			productId,
			transactionId,
			transactionReceipt,
			transactionDate,
			purchaseToken,
			dataAndroid,
			signatureAndroid,
			autoRenewingAndroid,
			isAcknowledgedAndroid,
		} = purchase

		try {
			await finishTransaction({ purchase, isConsumable: false })
			confirmInAppPurchase({
				aid,
				productId,
				signatureTransactionId: transactionId,
				transactionReceipt,
				transactionDate,
				purchaseToken,
				dataAndroid,
				signatureAndroid,
				autoRenewingAndroid,
				isAcknowledgedAndroid,
			})
			sendConfirmationSuccessEvents(aid, purchase.productId)

			dispatch(setSucessfulMessageVisibility(true))
		} catch (ex) {
			dispatch(stopLoading())
			dispatch(toggleBillingMessage(false))
		} finally {
			dispatch(stopLoading())
			dispatch(toggleBillingMessage(false))
		}
	}
}

export const toggleBillingErrorMessageVisibility = (isVisible, error, message) => async (dispatch) => {
	dispatch(stopLoading())
	dispatch(toggleBillingMessage(false))
	dispatch(setSucessfulMessageVisibility(false))

	const errorPayload = {
		error_code: error,
		error_message: message,
	}
	logEvent('In App Billing Error Received', errorPayload)
	// Checks if the billing error modal should be shown
	const shouldNotShowBillingError = BillingErrorMessagesBlackList.find((item) => item === error)
	if (!shouldNotShowBillingError) {
		logEvent('In App Billing Error Modal Shown', errorPayload)
		dispatch(setErrorMessageVisibility(isVisible, error))
	}
}
/**
 * @function setSelectedPlan - Set selected plan
 * @param {{ plan: string, recurrence: string }} plan - Selected plan object
 * @returns
 */
export const setSelectedPlan = (plan) => async (dispatch) => {
	dispatch({ type: SET_SELECTED_PLAN, payload: plan })
}
