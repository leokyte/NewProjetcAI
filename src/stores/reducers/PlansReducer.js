import { SET_STORE_PLANS, HAS_STORE_PLANS, SET_SELECTED_PLAN } from '../actions/types'
import { PLANS_LIST } from '../../enums/Plans'
import { PlansPageAdditionalInfo } from '../../enums/RemoteConfigDefaults'

const INITIAL_STATE = {
	list: PLANS_LIST,
	additionalInfo: PlansPageAdditionalInfo,
	selectedPlan: {
		plan: '',
		recurrence: '',
	},
}

export default (state = INITIAL_STATE, action) => {
	switch (action.type) {
		case SET_STORE_PLANS: {
			return { ...state, list: action?.payload?.plansList, additionalInfo: action?.payload?.additionalInfo }
		}
		case HAS_STORE_PLANS: {
			return { ...state, hasStorePlans: action?.payload }
		}
		case SET_SELECTED_PLAN: {
			return { ...state, selectedPlan: action?.payload }
		}
		default:
			return state
	}
}
