// Documentação: /docs/subscription/by-pass.md
import { Linking } from 'react-native'
import { KyteBillingPayment } from '../../services'
import NavigationService from '../../services/kyte-navigation'
import { evaluateSubscriptionByPass } from '../subscription/util-subscription-by-pass'
import { getByPassExperimentLabels } from '../subscription/util-subscription-by-pass-experiment'
import { AxiosResponse } from 'axios'
import { IBilling } from '@kyteapp/kyte-utils'
import { logEvent } from '../../integrations'

/**
 * Navigates to the Plans page or opens Checkout Web based on the user's email.
 * This function checks if the user should bypass the subscription process based on their email and actions.
 * If they should not bypass, it navigates to the 'Plans' screen. Otherwise, it fetches a payment URL
 * and opens it in the device's browser.
 *
 * @param {string} email - The user's email address.
 * @param {string} aid - The application ID for the payment service.
 * @param {IBilling} billing - Billing information.
 * @param {string} [referralCode] - The referral code (optional).
 * @param {string[]} [coreActionsPref] - List of core actions from preferences.
 */
const navigateToSubscription = async (
	email: string,
	aid: string,
	billing: IBilling,
	referralCode?: string,
	coreActionsPref: string[] = [] // novo parâmetro com default
) => {
	try {
		const result = await evaluateSubscriptionByPass(email, billing, referralCode, coreActionsPref)
		const { byPassExperimentProp } = getByPassExperimentLabels(result)
		logEvent('Subscribe Intention Click', { exp_bypass_assinatura: byPassExperimentProp })
		// If they should not bypass, navigate to the Plans screen
		if (result.safetyRules) return NavigationService.navigate('Plans', 'Plans')
		// Otherwise, fetch the payment URL
		const redirectUrl: AxiosResponse<{ subscriptionUrl: string }> = await KyteBillingPayment(aid, 'paymentMethod=null')
		// Open the payment URL in the device's browser
		Linking.openURL(redirectUrl.data.subscriptionUrl)
	} catch (error) {
		console.error('Error determining subscription navigation:', error)
		NavigationService.navigate('Plans', 'Plans')
	}
}

export default navigateToSubscription
