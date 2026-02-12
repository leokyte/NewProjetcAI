import { Platform } from 'react-native'
import { getAvailablePurchases } from 'react-native-iap'
import { isFree, isTrial, isPro, isGrow, isPrime } from '@kyteapp/kyte-ui-components'

import { logEvent } from '../integrations/Firebase-Integration'
import { FirebaseAnalytics, PRO, GROW, PRIME } from '../enums'
import { confirmInAppPurchase, checkUserPermission } from '.'
import { IAP_SUBSCRIPTIONS_LIST } from '../enums/Plans'

export const getPastSubscriptions = async (aid) => {
	const pastSubscriptions = await getAvailablePurchases()

	if (pastSubscriptions.length > 0) {
		const lastSubscription = pastSubscriptions.pop()
		const {
			productId,
			transactionId,
			transactionReceipt,
			transactionDate,
			purchaseToken,
			signatureAndroid,
			autoRenewingAndroid,
			isAcknowledgedAndroid,
		} = lastSubscription

		try {
			confirmInAppPurchase({
				aid,
				productId,
				signatureTransactionId: transactionId,
				transactionReceipt,
				transactionDate,
				purchaseToken,
				signatureAndroid,
				autoRenewingAndroid,
				isAcknowledgedAndroid,
				subscriptionRecovered: true,
			})
		} catch (ex) {
			sendConfirmationErrorEvents(aid, productId, ex.message)
		}
	}
}

export const sendConfirmationSuccessEvents = (aid, productIdentifier) => {
	logEvent(
		FirebaseAnalytics.items[
			Platform.OS === 'ios'
				? FirebaseAnalytics.IOS_PAYMENT_CONFIRMATION_SUCCESSFUL
				: FirebaseAnalytics.ANDROID_PAYMENT_CONFIRMATION_SUCCESS
		].type,
		{ aid, productIdentifier }
	)
}

export const sendConfirmationErrorEvents = (aid, productIdentifier, inapp_payment_failure_reason = null) => {
	logEvent(
		FirebaseAnalytics.items[
			Platform.OS === 'ios'
				? FirebaseAnalytics.IOS_PAYMENT_CONFIRMATION_FAIL
				: FirebaseAnalytics.ANDROID_PAYMENT_CONFIRMATION_FAIL
		].type,
		{ aid, productIdentifier, inapp_payment_failure_reason }
	)
}

export const getAndroidSubscriptionPrices = ({ subscriptionOfferDetails }) => {
	if (!subscriptionOfferDetails) return

	const data = subscriptionOfferDetails[0]?.pricingPhases?.pricingPhaseList[0]
	const price = Number(data?.priceAmountMicros) / 1000000

	return { localizedPrice: data?.formattedPrice, price }
}
export const upOrDownPlan = (selectedPlan, billing) => {
	const isGrowOrPrimeSelected = selectedPlan?.id === GROW || selectedPlan?.id === PRIME
	const isProOrGrowSelected = selectedPlan?.id === PRO || selectedPlan?.id === GROW
	const isPrimeSelected = selectedPlan?.id === PRIME
	const isProSelected = selectedPlan?.id === PRO

	const isFreeAndProUpgrade = isFree(billing) || isTrial(billing) || (isPro(billing) && isGrowOrPrimeSelected)
	const isGrowUpgrade = isGrow(billing) && isPrimeSelected

	if (isFreeAndProUpgrade || isGrowUpgrade) return 'upgrade'

	const isGrowDowngrade = isGrow(billing) && isProSelected
	const isPrimeDowngrade = isPrime(billing) && isProOrGrowSelected

	if (isGrowDowngrade || isPrimeDowngrade) return 'downgrade'

	return 'error'
}
export const isDifferentAppSubscription = (planId) => {
	const { skus } = IAP_SUBSCRIPTIONS_LIST
	return planId ? !skus.includes(planId) : false
}

export const canAccessSmartAssistant = ({ billing, userPermissions, smartAssistantPlan }) => {
	const { isOwner } = checkUserPermission(userPermissions)
	if (!isOwner) return false

	const isPrimePlan = isPrime(billing)
	const isGrowPlan = isGrow(billing)

	if (smartAssistantPlan === GROW) {
		return isGrowPlan || isPrimePlan
	}

	return smartAssistantPlan === PRIME && isPrimePlan
}

