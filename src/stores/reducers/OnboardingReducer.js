import {
	TOGGLE_HELPER_VISIBILITY,
	LOGOUT,
	BUILD_HELPER_STEPS,
	SET_HELPER_ACTUAL_STEP,
	UPDATE_HELPER_STATE,
	CREATE_HELPER_STATE,
	SET_HELPER_REMOTE_AVAILABILITY,
	SET_SAMPLE_EXP_INITIAL_SCREEN,
} from '../actions/types'
import { HelperSteps } from '../../enums'
import { helperCompletionState, buildHelperSteps } from '../../util'
import { isCatalogApp } from '../../util/util-flavors'

const INITIAL_STATE = {
	helper: {
		isVisible: false,
		active: true,
		enabled: true,
		steps: [...HelperSteps],
		completionPercentage: 0,
		actualStep: '',
		remoteAvailability: isCatalogApp() ? 'disabled' : 'enabled',
		key: 'helper',
	},
	sample: {
		expInitialScreen: undefined,
	},
}

export default (state = INITIAL_STATE, action) => {
	switch (action.type) {
		case TOGGLE_HELPER_VISIBILITY: {
			return { ...state, helper: { ...state.helper, isVisible: action.payload } }
		}
		case BUILD_HELPER_STEPS: {
			const { apiSteps, reducerSteps, enabled, active, key } = action.payload

			return {
				...state,
				helper: {
					...state.helper,
					active,
					enabled,
					key,
					steps: buildHelperSteps(apiSteps, reducerSteps),
					completionPercentage: helperCompletionState(apiSteps),
				},
			}
		}
		case SET_HELPER_ACTUAL_STEP: {
			return { ...state, helper: { ...state.helper, actualStep: action.payload } }
		}
		case UPDATE_HELPER_STATE: {
			return { ...state, helper: { ...state.helper, active: action.payload } }
		}
		case CREATE_HELPER_STATE: {
			return { ...state, helper: { ...state.helper, active: action.payload.active, key: action.payload.key } }
		}
		case SET_HELPER_REMOTE_AVAILABILITY: {
			return { ...state, helper: { ...state.helper, remoteAvailability: action.payload } }
		}
		case SET_SAMPLE_EXP_INITIAL_SCREEN: {
			return { ...state, sample: { ...state.sample, expInitialScreen: action.payload } }
		}
		case LOGOUT:
			return INITIAL_STATE
		default:
			return state
	}
}
