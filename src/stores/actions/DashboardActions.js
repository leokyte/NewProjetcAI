import {
	DASHBOARD_FETCH_STATS,
	DASHBOARD_SET_STATE,
	DASHBOARD_SET_TOTAL_DASHBOARD_VIEWS,
	DASHBOARD_SET_VERSION,
	DASHBOARD_TOGGLE_VALUES_VISIBILITY,
} from './types'
import { kyteQueryGetSales } from '../../services/kyte-query'
import { Period } from '../../enums/Period'
import { checkUserPermission } from '../../util/util-common'
import { SALES_FETCH_LIMIT } from '../../kyte-constants'
import { SalesSortEnum } from '../../enums/SaleSort'
import { generateThisMonthStats, getFilterQuery, groupSalesDailyTotals } from '../../util/util-sale'
import { FILTERS_INITIAL_STATE } from '../reducers/SalesReducer'
import { remoteConfigGetValue } from '../../integrations'

export function setDashboardState(updatedState) {
	return (dispatch) => {
		dispatch({ type: DASHBOARD_SET_STATE, payload: updatedState })
	}
}

export function fetchDashboardStats() {
	return async (dispatch, getState) => {
		dispatch({ type: DASHBOARD_FETCH_STATS })
		const state = getState()

		try {
			const CLOSED_STATUS = 'closed'
			const { permissions, uid, aid } = state.auth.user
			const { allowViewOtherSales } = checkUserPermission(permissions)
			const userQuery = allowViewOtherSales ? '' : uid

			const serverFilters = getFilterQuery({
				...FILTERS_INITIAL_STATE,
				status: [CLOSED_STATUS],
				fetchLimit: SALES_FETCH_LIMIT,
				sort: SalesSortEnum.DESC_DATE_CLOSED,
				userId: userQuery,
				period: Period.THIS_MONTH,
			})
			const response = await kyteQueryGetSales(serverFilters, aid)

			const { _sales: sales = [], totalSales = 0, totalAmount = 0 } = response?.data ?? {}

			const dailyTotals = groupSalesDailyTotals(sales, [CLOSED_STATUS])
			const salesTotals = { amount: totalAmount, total: totalSales?.toFixed(2) }
			const result = { dailyTotals, salesTotals }

			const salesStats = generateThisMonthStats(result)
			const fetchedAt = new Date().toISOString()
			const didLastFetchFail = false
			const isFetching = false

			const successState = { ...state.dashboard, salesStats, isFetching, didLastFetchFail, fetchedAt }
			dispatch(setDashboardState(successState))
		} catch (error) {
			const didLastFetchFail = true
			const isFetching = false

			const errorState = { ...state.dashboard, isFetching, didLastFetchFail }
			dispatch(setDashboardState(errorState))
		}
	}
}

export function incrementDashboardViews() {
	return {
		type: DASHBOARD_SET_TOTAL_DASHBOARD_VIEWS,
	}
}

export function toggleDashboardValuesVisibility(isValuesHidden) {
	return (dispatch) => {
		dispatch({ type: DASHBOARD_TOGGLE_VALUES_VISIBILITY, payload: isValuesHidden })
	}
}

export function setDashboardVersion() {
	return async (dispatch) => {
		try {
			const version = await new Promise((resolve) => remoteConfigGetValue('StoryblokDashboardVersion', resolve))

			dispatch({ type: DASHBOARD_SET_VERSION, payload: version })
		} catch (error) {
			console.error('Failed to fetch dashboard version:', error)
		}
	}
}
