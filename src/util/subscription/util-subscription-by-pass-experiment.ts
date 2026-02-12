import { ByPassSubscriptionExperiment } from '../../enums/Subscription'

type ByPassEvaluationResult = {
	ignoreRules: boolean
	isByPassEnabled?: boolean
}

/**
 * Maps the bypass evaluation result to experiment labels shared across analytics surfaces.
 */
export const getByPassExperimentLabels = ({ ignoreRules, isByPassEnabled }: ByPassEvaluationResult) => {
	const ByPassEnabledProp = isByPassEnabled
		? ByPassSubscriptionExperiment.ByPassEnabled
		: ByPassSubscriptionExperiment.ByPassDisabled

	const byPassExperimentProp = ignoreRules
		? ByPassSubscriptionExperiment.ByPassIgnore
		: ByPassEnabledProp

	return {
		ByPassEnabledProp,
		byPassExperimentProp,
	}
}
