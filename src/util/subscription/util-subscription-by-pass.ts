// Documentação: /docs/subscription/by-pass.md
import DeviceInfo from 'react-native-device-info'
import { isFree, isTrial } from '@kyteapp/kyte-ui-components'
import { BlackListedTestEmail, CoreAction } from '../../enums/Subscription'
import { IBilling } from '@kyteapp/kyte-utils'
import { remoteConfigGetValue } from '../../integrations'

const blackListedTestEmails = [
	BlackListedTestEmail.Google,
	BlackListedTestEmail.Apple,
	BlackListedTestEmail.CloudTestLab,
]

const coreActions = [CoreAction.FirstSale, CoreAction.FirstProduct, CoreAction.FirstCustomer, CoreAction.PublishCatalog]

/**
 * Checks if the given email is in the blocked test email list.
 * @param email Email to check
 * @returns true if the email is blocked
 */
const isBlackListedTestEmail = (email: string): boolean =>
	blackListedTestEmails.some((blackListedEmail) => email.includes(blackListedEmail))

/**
 * Returns the number of minutes since the app was installed.
 * @returns number of minutes since installation
 */
const getInstallTime = async (): Promise<number> => {
	const installDate = await DeviceInfo.getFirstInstallTime()
	const now = Date.now()
	const msSinceInstall = now - installDate
	const minutesSinceInstall = msSinceInstall / (1000 * 60) // calculation in minutes
	return minutesSinceInstall
}

/**
 * Checks if the user has performed any core app actions.
 * @param coreActionsPref Lista de core actions vinda das preferences
 * @returns true if any core action was performed
 */
const hasDoneAnyCoreActions = (coreActionsPref: string[] = []): boolean => {
	try {
		return coreActions.some((action) => coreActionsPref.includes(action))
	} catch (e) {
		return false
	}
}

/**
 * Checks if the billing information indicates a free or trial subscription with a referral code.
 * @param billingInfo Billing information object
 * @param referralCode Optional referral code
 * @returns true if the billing info is free or trial with a referral code
 */
const hasReferralCode = (billingInfo: IBilling, referralCode?: string): boolean =>
	Boolean(referralCode) && (isFree(billingInfo) || isTrial(billingInfo))

/** * Returns the remote config value for bypassing subscriptions.
 * @returns true if the bypass is enabled
 */
const getByPassRemoteKey = async () => {
	let byPassSubscription: boolean = false
	try {
		await remoteConfigGetValue(
			'ByPassSubscription',
			(remoteKey: boolean) => {
				byPassSubscription = remoteKey
			},
			'boolean'
		)
		// If the remote config fetch fails, default to false
		return byPassSubscription
	} catch (error) {
		console.error('Error fetching ByPassSubscription remote config:', error)
	}
}

/**
 * Evaluates the subscription bypass rules and returns the decision object.
 * Bypass is always allowed if the user has a referral code and the billing is free or trial.
 * Otherwise, bypass is allowed only if ALL conditions are met:
 * - Email is not in the blacklist
 * - App install time is greater than 5 minutes
 * - User has performed at least one core action
 * - Remote config for bypass is enabled
 *
 * @param email User email
 * @param billing Billing information
 * @param referralCode Optional referral code
 * @param coreActionsPref Lista de core actions vinda das preferences
 * @returns { safetyRules: boolean; ignoreRules: boolean; isByPassEnabled?: boolean }
 * - safetyRules=true: do NOT bypass (navigate to Plans)
 * - ignoreRules=true: label experiment as "ignore" (regardless of remote flag)
 */
export const evaluateSubscriptionByPass = async (
	email: string,
	billing: IBilling,
	referralCode?: string,
	coreActionsPref: string[] = []
): Promise<{ safetyRules: boolean; ignoreRules: boolean; isByPassEnabled?: boolean }> => {
	const isBlocked = isBlackListedTestEmail(email)
	const installTime = await getInstallTime()
	const hasDoneCoreActions = hasDoneAnyCoreActions(coreActionsPref)
	const hasReferral = hasReferralCode(billing, referralCode)
	const isByPassEnabled = await getByPassRemoteKey()
	if (hasReferral) {
		// Always allow bypass if referral code is present
		return { safetyRules: false, ignoreRules: true, isByPassEnabled }
	}

	// Define rule groups:
	// ignoreRules: conditions that mark the user as "ignore" for experiment labeling
	// safetyRules: conditions that prevent bypass navigation (includes remote flag)

	// Bypass is not allowed if ANY of the following is true and remote config is disabled:
	// 1. The email is blocked (testers/reviewers)
	// 2. The install time is less than 60 minutes
	// 3. The user has NOT performed any core actions
	// 4. The remote config for bypass is disabled
	const ignoreRules = isBlocked || installTime < 60 || !hasDoneCoreActions
	const safetyRules = ignoreRules || !isByPassEnabled
	return {
		safetyRules,
		ignoreRules,
		isByPassEnabled,
	}
}
