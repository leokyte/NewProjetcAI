import _ from 'lodash'
import { getCountry } from 'react-native-localize'
import { isTrial, isPro } from '@kyteapp/kyte-ui-components'

import {
	INITIALIZER,
	BILLING_FETCH,
	TAXES_FETCH,
	TAXES_CLEAR,
	PREFERENCES_FETCH,
	UPDATE_BILLING_UNIQUE_MESSAGES,
	RESET_BILLING_UNIQUE_MESSAGES,
	INTERNAL_SET_GLOBAL,
	EXTERNAL_PAYMENTS_SET_UP,
	BUILD_HELPER_STEPS,
	BEHAVIOR_FETCH,
} from './types'
import { isFeatureAllowed, preferenceSetCountryCode, preferenceSetDecimalCurrency, toggleBillingMessage } from '.'

import { uniqueMsgShown, checkIsExpired, checkIsBetweenTolerance, daysPassed } from '../../util'
import { remoteConfigGetValue } from '../../integrations'
import { KyteAccountInitializer } from '../../services'
import { registerOneSignalTag } from '../../integrations/OneSignal'

export const handleBillingMessage =
	(_billing = null) =>
	async (dispatch, getState) => {
		let billing = _billing
		if (!_billing) billing = getState().billing
		const { uniqueMessages } = getState().billing
		const { terms = {} } = getState().auth.account

		let doEnableTrialJourney
		await remoteConfigGetValue(
			'enabledTrialJourney',
			(k) => {
				doEnableTrialJourney = k
			},
			'boolean'
		)

		const showMessage = (message, remoteKey = '') => {
			dispatch(toggleBillingMessage(true, message, remoteKey))
		}

		const isInTolerance = checkIsBetweenTolerance(billing.endDate, billing.toleranceEndDate)
		const useTolerance = billing.status === 'paid' || billing.status === 'expired' || billing.status === 'tolerance'
		const toleranceExpired = useTolerance && checkIsExpired(billing.toleranceEndDate)

		const showUniqueMessage = uniqueMsgShown(uniqueMessages, toleranceExpired ? 'toleranceExpired' : billing.status)

		// Mensagens únicas (aparecem uma vez) dos status paid, millennium, toleranceExpired
		if (showUniqueMessage && !isTrial(billing)) {
			return showMessage(
				toleranceExpired ? 'toleranceExpired' : billing.status,
				toleranceExpired ? 'toleranceExpired' : ''
			)
		}

		// Mensgens durante o período de trial
		if (daysPassed(billing.creationDate) <= 7 && !isPro(billing) && terms.hasAccepted && doEnableTrialJourney) {
			showMessage('trial', `trialDay${daysPassed(billing.creationDate)}`)
		}

		// Mensagem do free ao inicializar o app
		if (!isFeatureAllowed('', getState)) showMessage('free', 'free')

		// Mensagens de período de tolerancia
		if (useTolerance && isInTolerance) {
			dispatch({ type: RESET_BILLING_UNIQUE_MESSAGES, payload: 'toleranceExpired' })
			showMessage('inTolerance', 'tolerancePeriod')
		}
	}

export const AccountInitializer = (origin) => async (dispatch, getState) => {
	const { aid } = getState().auth.user
	const countryCode = getCountry()

	// gateway list set uo
	dispatch({ type: EXTERNAL_PAYMENTS_SET_UP })

	// registering some local info before requesting other data
	registerOneSignalTag('aid', aid)

	KyteAccountInitializer(aid).then((response) => {
		const { billing, taxes, preferences, global, behavior } = response.data
		const { helper } = getState().onboarding
		// const realBillingStatus = status === 'paid' && !isFeatureAllowed('', getState) ? 'free' : status;

		registerOneSignalTag('billing_plan', billing.plan)

		// Check if there's currency
		const hasCurrency = preferences && preferences.currency
		if (!hasCurrency) dispatch(preferenceSetCountryCode(countryCode))

		// Check if there's decimalCurrency
		const hasDecimalCurrency = preferences && preferences.hasOwnProperty('decimalCurrency')
		if (!hasDecimalCurrency) dispatch(preferenceSetDecimalCurrency(true))

		// Prevent currency without countryCode (define a 'USD' fallback)
		if (preferences) {
			const fallbackCode = preferences.currency.currencyCode || 'USD'
			const preferencePayload = {
				...preferences,
				currency: { ...preferences.currency, currencyCode: fallbackCode },
			}
			dispatch({ type: PREFERENCES_FETCH, payload: preferencePayload })
		}

		// Inicializa os reducers billing e preferences
		dispatch({ type: UPDATE_BILLING_UNIQUE_MESSAGES })
		dispatch({ type: INITIALIZER })
		dispatch({ type: BILLING_FETCH, payload: billing })
		dispatch({ type: BEHAVIOR_FETCH, payload: behavior })

		// Initializing Helper
		const helperKey = Object.keys(behavior)[0] || 'helper'
		if (behavior[helperKey]?.enabled) {
			dispatch({
				type: BUILD_HELPER_STEPS,
				payload: {
					apiSteps: behavior[helperKey].steps,
					reducerSteps: helper.steps,
					enabled: behavior[helperKey].enabled,
					active: behavior[helperKey].active,
					key: helperKey,
				},
			})
		}

		// Remove recursos PRO
		if (isFeatureAllowed('', getState)) {
			dispatch({ type: TAXES_FETCH, payload: taxes })
		} else {
			dispatch({ type: TAXES_CLEAR })
		}

		// Dispatching Global informations
		dispatch({ type: INTERNAL_SET_GLOBAL, payload: global })
		dispatch(handleBillingMessage(billing))
	})
}
