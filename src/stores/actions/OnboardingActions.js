import {
	TOGGLE_HELPER_VISIBILITY,
	SET_HELPER_ACTUAL_STEP,
	BUILD_HELPER_STEPS,
	UPDATE_HELPER_STATE,
	CREATE_HELPER_STATE,
	HELPER_FETCH,
	SET_HELPER_REMOTE_AVAILABILITY,
	SET_SAMPLE_EXP_INITIAL_SCREEN,
} from './types'
import { logEvent, remoteConfigGetValue } from '../../integrations'
import {
	kyteAccountBehaviorCompleteStep,
	kyteAccountBehaviorUpdateState,
	kyteAccountBehaviorCreateState,
	kyteAccountBehaviorFetch,
	kyteAdminFetchSample,
} from '../../services'
import { fetchUserOnboardingGroup, getInitialRoute } from '../../util'
import { setInitialRouteName } from '.'
import Sample from '../../enums/Sample'

export const toggleHelperVisibility = (visibility) => (dispatch, getState) => {
	const { helper, sample } = getState().onboarding
	const { expInitialScreen } = sample

	const isEnabled = helper.remoteAvailability === 'enabled' && expInitialScreen !== Sample.DASHBOARD

	const payload = visibility ? visibility && isEnabled : visibility

	dispatch({ type: TOGGLE_HELPER_VISIBILITY, payload })
}

export const setHelperActualStep = (step) => {
	const stepID = step.replace(/-/g, '_')

	logEvent(`started_step_${stepID}`)
	return { type: SET_HELPER_ACTUAL_STEP, payload: step }
}

export const saveHelperStep = (step) => async (dispatch, getState) => {
	const { helper } = getState().onboarding
	const { aid, behavior } = getState().auth
	const stepID = step.replace(/-/g, '_')

	// check if is done or helper is disabled
	const actualStep = helper.steps?.find?.((s) => s?.id === step)
	const actualBehavior = behavior.hasOwnProperty(helper.key) ? behavior[helper.key] : false
	if (!actualStep || actualStep?.completed || !actualBehavior?.enabled) {
		return
	}

	try {
		const { data } = await kyteAccountBehaviorCompleteStep(aid, helper.key, step)

		if (!data[helper.key]) return

		dispatch({
			type: BUILD_HELPER_STEPS,
			payload: {
				apiSteps: data[helper.key].steps,
				reducerSteps: helper.steps,
				active: data[helper.key].active,
				enabled: helper.enabled,
				key: helper.key,
			},
		})

		dispatch({ type: SET_HELPER_ACTUAL_STEP, payload: '' })
		dispatch(toggleHelperVisibility(helper.active))

		logEvent(`finished_step_${stepID}`)
	} catch (err) {
		logEvent('helper_step_error', { error: err })
	}
}

export const createHelperState = (state) => (dispatch, getState) => {
	const { auth, onboarding } = getState()

	const fetchBehaviour = (remoteKey) =>
		kyteAccountBehaviorCreateState(auth.aid, remoteKey, state)
			.then((response) => {
				const { data } = response
				if (!remoteKey.includes('helper') || remoteKey == null) {
					return
				}

				dispatch({ type: CREATE_HELPER_STATE, payload: { active: true, key: remoteKey } })
				dispatch({
					type: BUILD_HELPER_STEPS,
					payload: {
						apiSteps: data[remoteKey].steps,
						reducerSteps: onboarding.helper.steps,
						enabled: data[remoteKey].enabled,
						active: true,
						key: remoteKey,
					},
				})
				if (!data[remoteKey].active) logEvent('Helper Disabled')
			})
			.catch((e) => logEvent('helper_update_error', { error: e }))

	remoteConfigGetValue('helperVariation', fetchBehaviour)
}

export const updateHelperState = (state) => (dispatch, getState) => {
	const { auth, onboarding } = getState()
	const { helper } = onboarding

	kyteAccountBehaviorUpdateState(auth.aid, helper.key, state)
		.then((response) => {
			const { data } = response
			if (!data[helper.key]) return

			dispatch({ type: UPDATE_HELPER_STATE, payload: data[helper.key].active })
			if (!data[helper.key].active) logEvent('Helper Disabled')
		})
		.catch((e) => {
			logEvent('helper_update_error', { error: e })
		})
}

export const helperFetch = (cb) => (dispatch, getState) => {
	const { aid } = getState().auth

	kyteAccountBehaviorFetch(aid)
		.then((response) => {
			const { helper } = getState().onboarding
			const { data } = response

			const keyName = Object.keys(data)[0]

			if (!keyName.includes('helper') || keyName == null || keyName == undefined) {
				return
			}

			dispatch({ type: HELPER_FETCH })
			dispatch({
				type: BUILD_HELPER_STEPS,
				payload: {
					apiSteps: data[keyName].steps,
					enabled: data[keyName].enabled,
					reducerSteps: helper.steps,
					active: data[keyName].active,
					key: keyName,
				},
			})
			if (cb) cb()
		})
		.catch((e) => {
			logEvent('helper_fetch_error', { error: e })
			if (cb) cb()
		})
}

export const setHelperRemoteAvailability = () => async (dispatch) => {
	const setAvailability = (availability) => {
		dispatch({
			type: SET_HELPER_REMOTE_AVAILABILITY,
			payload: availability,
		})
	}

	await remoteConfigGetValue('helperAvailability', (key) => setAvailability(key))
}

export const decideInitialRoute = (user, store) => async (dispatch) => {
	const { initialScreen = Sample.DEFAULT_SCREEN, userGroup } = await fetchUserOnboardingGroup(user?.aid)
	const hasCatalog = Boolean(store?.catalog)
	const initialRoute = getInitialRoute({ defaultInitialRoute: initialScreen, user, hasCatalog })

	dispatch(setInitialRouteName(initialRoute))

	if (userGroup != null) {
		dispatch({
			type: SET_SAMPLE_EXP_INITIAL_SCREEN,
			payload: userGroup,
		})
	}
}

export const setUserSampleGroup = () => async (dispatch, getState) => {
	const { auth } = getState()

	try {
		const result = await kyteAdminFetchSample(auth?.aid)
		const sample = result?.[Sample.NAME] || ''

		dispatch({
			type: SET_SAMPLE_EXP_INITIAL_SCREEN,
			payload: sample,
		})
	} catch (error) {
		if (__DEV__) {
			console.tron.logImportant('Error kyteAdminFetchSample: ', error)
		}
	}
}
