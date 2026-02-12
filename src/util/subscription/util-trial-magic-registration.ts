import { isTrial } from '@kyteapp/kyte-ui-components'
import { IBilling } from '@kyteapp/kyte-utils'
import { remoteConfigGetValue } from '../../integrations'
import { TrialMagicRegistrationExperiment } from '../../enums/Subscription'

type TrialMagicEvaluationResult = {
	isTrialMagicEnabled?: boolean
}

/**
 * Returns the remote config value for Trial Magic Registration.
 * @returns true if the trial magic registration is enabled
 */
export const getTrialMagicRemoteKey = async (): Promise<boolean> => {
	let trialMagicRegistration: boolean = false
	try {
		await remoteConfigGetValue(
			'TrialMagicRegistration',
			(remoteKey: boolean) => {
				trialMagicRegistration = remoteKey
			},
			'boolean'
		)
		// If the remote config fetch fails, default to false
		return trialMagicRegistration ?? false
	} catch (error) {
		console.error('Error fetching TrialMagicRegistration remote config:', error)
		return false
	}
}

/**
 * Evaluates if the user should have access to Trial Magic Registration.
 * Only applies to users with Trial status.
 *
 * @param billing Billing information
 * @returns { isTrialMagicEnabled?: boolean }
 */
export const evaluateTrialMagicRegistration = async (
	billing: IBilling
): Promise<TrialMagicEvaluationResult> => {
	// Only evaluate for Trial users
	if (!isTrial(billing)) {
		return { isTrialMagicEnabled: false }
	}

	const isTrialMagicEnabled = await getTrialMagicRemoteKey()
	return {
		isTrialMagicEnabled,
	}
}

/**
 * Maps the trial magic registration evaluation result to experiment labels shared across analytics surfaces.
 * Similar to getByPassExperimentLabels pattern.
 */
export const getTrialMagicExperimentLabels = ({
	isTrialMagicEnabled,
}: TrialMagicEvaluationResult) => {
	const trialMagicExperimentProp = isTrialMagicEnabled
		? TrialMagicRegistrationExperiment.TrialMagicEnabled
		: TrialMagicRegistrationExperiment.TrialMagicDisabled

	return {
		trialMagicExperimentProp,
	}
}
