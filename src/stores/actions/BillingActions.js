import { Linking, Platform } from 'react-native'
import _ from 'lodash'
import { isFree as testIsFree, isPaid } from '@kyteapp/kyte-ui-components'

import { KyteBillingPayment } from '../../services'
import { checkIsExpired } from '../../util'
import { toggleBillingMessage } from '.'
import { BILLING_PAYMENT, BILLING_SET_ERROR_MODAL, BILLING_SET_SUCCESSFUL_MODAL, TOGGLE_BLOCK_MANAGE } from './types'
import { isDifferentAppSubscription } from '../../util/util-plans'
import I18n from '../../i18n/i18n'
import navigateToSubscription from '../../util/navigation/subscription-navigate.ts'

// key representa a chave do feature, exemplo: 'taxes'
export const isFeatureAllowed = (key, getState, _billing = null) => {
	const { planInfo, endDate, toleranceEndDate, status } = _billing || getState().billing

	const hasFeatureKey = _.includes(planInfo.features, key)
	const hasAllKey = _.includes(planInfo.features, 'all')
	const isMillennium = status === 'millennium'
	const isFree = testIsFree({ status })
	const useTolerance = status === 'paid' || status === 'expired' || status === 'tolerance'

	const isExpired = checkIsExpired(useTolerance ? toleranceEndDate : endDate)
	const conditions = [hasFeatureKey || hasAllKey, !isExpired, !isFree]

	return conditions.every((c) => c) || isMillennium
}

export const checkFeatureIsAllowed =
	(key, callback, remoteKey = 'featureProDefault', message = 'Pro', callbackFail) =>
	(dispatch, getState) => {
		if (key === 'mockKey') return dispatch(toggleBillingMessage(true, message, remoteKey)) // testing, remove this later

		if (isFeatureAllowed(key, getState)) return callback()

		if (callbackFail) callbackFail()
		dispatch(toggleBillingMessage(true, message, remoteKey))
	}

export const checkUserIsAllowed = (getState, _billing = null) => {
	const { endDate, toleranceEndDate, status } = _billing || getState().billing

	const isMillennium = status === 'millennium'
	const isFree = testIsFree({ status })
	const useTolerance = status === 'paid' || status === 'expired'

	const isExpired = checkIsExpired(useTolerance ? toleranceEndDate : endDate)

	return [!isExpired, !isFree].every((c) => c) || isMillennium
}

export const exposeBillingURL =
	({ paymentMethod, navigateToURL, shouldRedirectToSubscription }) =>
	(dispatch, getState) => {
		const { aid } = getState().auth
		return KyteBillingPayment(aid, paymentMethod)
			.then((response) => {
				const url = shouldRedirectToSubscription ? response.data.subscriptionUrl : response.data.checkoutUrl
				navigateToURL(url)
				dispatch({ type: BILLING_PAYMENT, payload: url })
			})
			.catch((error) => {
				throw error
			})
	}

export const redirectCheckoutWeb = () => async (dispatch, getState) => {
	// This value is set on the Plans screen and saved on the plans reducer
	const { selectedPlan } = getState().plans
	const selectedPlanParams = `plan=${selectedPlan?.plan}&recurrence=${selectedPlan?.recurrence}`

	await dispatch(
		exposeBillingURL({
			paymentMethod: 'paymentMethod=null',
			navigateToURL: (url) => {
				Linking.openURL(`${url}&${selectedPlanParams}`)
			},
			shouldRedirectToSubscription: false, 
		})
	)
}

export const redirectToSubscription = () => async (dispatch, getState) => {
	const referralCode = getState().auth.account?.metadata?.via
	const { selectedPlan } = getState().plans
	const selectedPlanParams = `plan=${selectedPlan?.plan}&recurrence=${selectedPlan?.recurrence}&via=${referralCode}`
	const locale = I18n.t('locale') === 'es-ES' ? 'es' : I18n.t('locale')

	await dispatch(
		exposeBillingURL({
			paymentMethod: 'paymentMethod=null',
			navigateToURL: (url) => {
				const [link, token] = url.split('?')
				const formattedUrl = `${link}/${locale}?${token}&${selectedPlanParams}`

				Linking.openURL(formattedUrl)
			},
			shouldRedirectToSubscription: true,
		})
	)
}

export const checkPlanKeys = (key) => (dispatch, getState) =>
	new Promise((resolve) => resolve(isFeatureAllowed(key, getState)))

export const setSucessfulMessageVisibility = (visibility, fromManageButton) => (dispatch) =>
	dispatch({ type: BILLING_SET_SUCCESSFUL_MODAL, payload: { visibility, fromManageButton } })

export const setErrorMessageVisibility = (visibility) => (dispatch) =>
	dispatch({ type: BILLING_SET_ERROR_MODAL, payload: { visibility } })

export const toggleBlockManagePlan = () => async (dispatch, getState) => {
	const { billing } = getState()
	const { showBlockManagePlan, paymentType, status, planInfo } = billing
	const { aid, signinEmail, account } = getState().auth
	const referralCode = account?.metadata?.referral?.code
	const coreActionsPref = getState().preference?.account?.coreActions || []

	const shouldShowPlanList = () => {
		const isPaidInOtherApp = isDifferentAppSubscription(planInfo?.planId)
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

	if (!isPaid(getState().billing)) {
		await navigateToSubscription(signinEmail, aid, billing, referralCode, coreActionsPref)
	} else if (status === 'millennium' || paymentType === 'checkout') {
		dispatch(redirectToSubscription())
	} else if (shouldShowPlanList()) {
		await navigateToSubscription(signinEmail, aid, billing, referralCode, coreActionsPref)
	} else {
		dispatch({ type: TOGGLE_BLOCK_MANAGE, payload: !showBlockManagePlan })
	}
}
