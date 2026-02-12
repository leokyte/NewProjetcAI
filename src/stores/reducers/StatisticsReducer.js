import moment from 'moment/min/moment-with-locales'
import _ from 'lodash'
import {
	PERIOD_NAVIGATE,
	PERIOD_TYPE_SET,
	PERIOD_RANGE_SET,
	DATA_TYPE_SET,
	STATISTICS_FETCH,
	SYNC_RESET,
	LOGOUT,
	STATISTICS_CLEAR,
} from '../actions/types'
import { adaptReceiptsByDateReceived } from '../../util/util-statistics'

const dateFormat = 'YYYYMMDD'
const INITIAL_STATE = {
	filter: {
		type: 'month',
		selectedPeriod: 'this_month',
		periodRange: {
			startDate: moment().startOf('month').format(dateFormat),
			endDate: moment().endOf('month').format(dateFormat),
		},
		immutableRange: false,
		dateFormat,
	},
	dashboardData: {
		income: 0,
		salesTotal: 0,
		storeReceiptsTotal: 0,
		averageTicket: 0,
		profit: 0,
		taxes: 0,
		paymentMetod: 0,
		topPaymentMetod: '',
		topProduct: '',
		topUser: '',
		topUserName: '',
		topCustomer: '',
		topIncome: '',
		topSales: '',
		topAvg: '',
		topProfit: '',
		topTaxes: '',
		salesData: [],
	},
	statisticsData: [],
	dataInfo: {
		type: '',
		unity: '',
	},
}

export default (state = INITIAL_STATE, action) => {
	switch (action.type) {
		case STATISTICS_FETCH: {
			const hasAnyValue = !!_.find(action.payload, (p) => p.length)
			if (!hasAnyValue) return { ...state, statisticsData: null }

			const income = calculateTotals(action.payload, 'sales', 'total')
			const salesTotal = calculateTotals(action.payload, 'sales', 'count')
			const topCustomer = findHighestValue(action.payload, 'customers', 'total')
			const topProduct = findHighestValue(action.payload, 'products', 'total')
			const topIncome = findHighestValue(action.payload, 'sales', 'total')
			const topSales = findHighestValue(action.payload, 'sales', 'count')
			const topProfit = findHighestValue(action.payload, 'sales', 'totalProfit')
			const topTaxes = findHighestValue(action.payload, 'sales', 'totalTaxes')
			const topAvg = findHighestValue(action.payload, 'sales', 'avg')
			const topPaymentMetod = findHighestValue(action.payload, 'receipts', 'total')
			// const topPaymentMetod = findHighestValue(action.payload, 'payments', 'total');
			const paymentMetod = calculatePercent(action.payload, 'receipts', 'total')
			// const paymentMetod = calculatePercent(action.payload, 'payments', 'total');
			const averageTicket = income / salesTotal || 0
			const profit = calculateTotals(action.payload, 'sales', 'totalProfit')
			const taxes = calculateTotals(action.payload, 'sales', 'totalTaxes')
			const topUser = findHighestValue(action.payload, 'users', 'total')
			const salesData = action.payload.sales
			const statisticsData = { ...action.payload }

			if (statisticsData.receiptsByDateReceived) {
				statisticsData.receiptsByDateReceived = adaptReceiptsByDateReceived(statisticsData.receiptsByDateReceived)
			}

			return {
				...state,
				statisticsData,
				dashboardData: {
					...state.dashboardData,
					income,
					salesTotal,
					salesData,
					averageTicket,
					profit,
					taxes,
					topCustomer,
					topProduct,
					topIncome,
					paymentMetod,
					topPaymentMetod,
					topSales,
					topProfit,
					topTaxes,
					topAvg,
					topUser,
				},
			}
		}
		case PERIOD_TYPE_SET: {
			const periodRange = !action.payload.subtract
				? periodSet(action.payload.type)
				: periodNavigate(state, action.payload.type, 'subtract', 'currentDate')

			return {
				...state,
				filter: {
					...state.filter,
					previous: action.payload.indicator,
					selectedPeriod: action.payload.selectedPeriod,
					type: action.payload.type,
					periodRange,
					immutableRange: false,
				},
			}
		}
		case PERIOD_NAVIGATE: {
			const periodRange = periodNavigate(state, state.filter.type, action.payload)
			return { ...state, filter: { ...state.filter, periodRange, immutableRange: false } }
		}
		case PERIOD_RANGE_SET: {
			return { ...state, filter: { ...state.filter, periodRange: action.payload, immutableRange: true } }
		}
		case DATA_TYPE_SET: {
			return { ...state, dataInfo: action.payload }
		}
		case LOGOUT:
		case SYNC_RESET:
		case STATISTICS_CLEAR:
			return INITIAL_STATE
		default: {
			return state
		}
	}
}

const periodSet = (type) => {
	return {
		startDate: moment().startOf(type).format(dateFormat),
		endDate: moment().endOf(type).format(dateFormat),
	}
}

const periodNavigate = (state, type, indicator, currentDate) => {
	const { periodRange } = state.filter
	return {
		startDate: moment(currentDate ? new Date() : periodRange.startDate)
			[indicator](1, type)
			.startOf(type)
			.format(dateFormat),
		endDate: moment(currentDate ? new Date() : periodRange.endDate)
			[indicator](1, type)
			.endOf(type)
			.format(dateFormat),
	}
}

const calculateTotals = (data, kind, field) =>
	_.sumBy(data[kind], (item) => {
		return item[field]
	})
const findHighestValue = (data, kind, field) =>
	_.maxBy(data[kind], (item) => {
		return item._id || item._id === 0 ? item[field] : {}
	})
const calculatePercent = (data, kind, field) => {
	if (!findHighestValue(data, kind, field)) return 0
	return (findHighestValue(data, kind, field)[field] * 100) / calculateTotals(data, kind, field)
}
