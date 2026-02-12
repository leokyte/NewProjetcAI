import moment from 'moment'

import { PERIOD_NAVIGATE, PERIOD_TYPE_SET, PERIOD_RANGE_SET, DATA_TYPE_SET, STATISTICS_FETCH } from './types'

import { startLoading, stopLoading } from './'
import { getAID } from './../../util'
import { kyteStatisticGetData } from './../../services'

export const periodNavigate = (action) => {
	return (dispatch) => {
		return new Promise((resolve) => {
			resolve(dispatch({ type: PERIOD_NAVIGATE, payload: action }))
		})
	}
}

export const periodTypeSet = (type, selectedPeriod, subtract) => {
	return (dispatch) => {
		dispatch({ type: PERIOD_TYPE_SET, payload: { type, selectedPeriod, subtract } })
	}
}

export const periodRangeSet = (startDate, endDate) => {
	return (dispatch) => {
		dispatch({ type: PERIOD_RANGE_SET, payload: { startDate, endDate } })
	}
}

export const dataTypeSet = (dataInfo) => {
	return (dispatch) => {
		dispatch({ type: DATA_TYPE_SET, payload: dataInfo })
	}
}

export const statisticsFetch = (startDate, endDate) => async (dispatch) => {
	dispatch(startLoading())
	const timezone = moment().format('Z')

	kyteStatisticGetData(getAID(), startDate, endDate, timezone)
		.then(({ data }) => {
			dispatch({ type: STATISTICS_FETCH, payload: data })
			dispatch(stopLoading())
		})
		.catch((ex) => dispatch(stopLoading()))
}
