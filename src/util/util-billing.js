import { Platform } from 'react-native'
import moment from 'moment-timezone'
import { isFree } from "@kyteapp/kyte-ui-components/src/packages/utils/util-billing";
import { apiGateway } from '../services/kyte-api-gateway'

const timezone = 'Europe/London'

export const billingCheckAnalyticsPeriod = (selected) => ['today', 'yesterday'].indexOf(selected) >= 0

export const billingCheckAnalyticsPeriodDate = (startPeriod, dateFormat) => {
	const today = moment(new Date()).format(dateFormat)
	const yesterday = moment(new Date()).subtract(1, 'day').format(dateFormat)

	return [today, yesterday].indexOf(startPeriod) >= 0
}

export const trialRemaningDays = (endDate) => {
	const beginning = moment(new Date()).tz(timezone).format('YYYY-MM-DD')
	const ending = moment(endDate, 'YYYY-MM-DD')

	return ending.diff(beginning, 'days')
}

export const countUniqueMessages = (messages, type) => {
	const msg = messages.find((item) => item.type === type)
	const otherMessages = messages.filter((item) => item !== msg)
	if (!msg) return otherMessages

	msg.count++
	return [...otherMessages, msg]
}

export const uniqueMsgShown = (messages, type) => {
	const msg = messages.find((item) => item.type === type)
	return msg && msg.count === 0
}

export const checkIsExpired = (endDate) => {
	const today = moment(new Date()).tz(timezone)
	const ending = moment(endDate).utc().format()
	const finalDay = moment(ending).add(1, 'day')

	return moment(finalDay).isBefore(today, 'day')
}

export const checkIsBetweenTolerance = (endDate, toleranceEndDate) => {
	const today = moment(new Date()).tz(timezone)
	const finalToleranceDay = moment(toleranceEndDate).add(1, 'day')
	const isBetween = moment(today).isBetween(endDate, finalToleranceDay, 'day')

	return isBetween
}

export const checkTrialLastDay = (endDate) => {
	const beginning = moment(new Date()).format('YYYY-MM-DD')
	const ending = moment(endDate).utc().format('YYYY-MM-DD')

	return moment(ending).isSame(beginning, 'day')
}

export const daysPassed = (creationDate) => {
	const beginning = moment(creationDate).startOf('day')
	const today = moment(new Date()).startOf('day')

	return today.diff(beginning, 'days')
}

export const shouldRedirectToSubscription = (billing, referralCode) => !!referralCode && (isFree(billing) || billing.status === 'trial')

// IOS IN-APP PURCHASE

/**
 * Method used to load the products registered at iTunes previously.
 * @returns array
 */

/* const axiosAPI = axios.create({
// baseURL: kyteAccountServiceUrl,
  baseURL: 'https://kyte-user-account.azurewebsites.net/api',
  timeout: 120000,
});
*/

export const confirmInAppPurchase = (transactionObject) =>
	apiGateway.post('/billing-signature-transaction', { ...transactionObject, os: Platform.OS })
