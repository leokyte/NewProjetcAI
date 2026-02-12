import {
	DASHBOARD_FETCH_STATS,
	DASHBOARD_SET_STATE,
	DASHBOARD_SET_TOTAL_DASHBOARD_VIEWS,
	DASHBOARD_SET_VERSION,
	DASHBOARD_TOGGLE_VALUES_VISIBILITY,
	LOGOUT,
} from '../actions/types'

const INITIAL_STATE = {
	salesStats: {
		today: null,
		yesterday: null,
		month: null,
	},
	fetchedAt: null,
	isFetching: false,
	didLastFetchFail: false,
	totalDashboardViews: 0,
	isValuesHidden: false,
}

function reducer(state = INITIAL_STATE, action = {}) {
	switch (action?.type) {
		case DASHBOARD_FETCH_STATS:
			return { ...state, isFetching: true }
		case DASHBOARD_SET_STATE:
			return { ...state, ...action.payload }
		case DASHBOARD_SET_TOTAL_DASHBOARD_VIEWS:
			return { ...state, totalDashboardViews: state.totalDashboardViews + 1 }
		case DASHBOARD_TOGGLE_VALUES_VISIBILITY:
			return { ...state, isValuesHidden: action.payload }
		case DASHBOARD_SET_VERSION:
			return { ...state, version: action.payload }
		case LOGOUT: {
			return { ...INITIAL_STATE }
		}
		default:
			return state
	}
}

export default reducer
