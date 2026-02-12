import { IN } from 'emoji-flags'
import _ from 'lodash'
import {
	STOCK_FETCH,
	STOCK_SET_FILTER,
	STOCK_SET_ORDER,
	STOCK_SET_CATEGORY,
	STOCK_SET_SEARCH_TEXT,
	STOCK_CLEAR,
	STOCK_CLEAR_FILTER,
	LOGOUT,
	STOCK_FETCH_TOTALS_LOADING,
	STOCK_FETCH_TOTALS_SUCCESS,
	STOCK_FETCH_TOTALS_ERROR,
	STOCK_SERVER_FETCH,
	STOCK_SERVER_FETCH_ERROR,
} from '../actions/types'

export const INITIAL_STATE = {
	searchText: '',
	serverList: null,
	list: [],
	detail: null,
	detailOrigin: null,
	isFetchingTotals: false,
	filters: {
		stock: {
			noStock: false,
			noMinimum: false,
			aboveMinimum: false,
			withoutStockControl: false,
		},
		categories: [],
	},
	order: {
		lowestStock: true,
		higherStock: false,
		aZ: false,
		zA: false,
	},
	fetchSize: 0,
	totals: {
		value: 0,
		products: 0,
		saleCost: 0,
		profits: 0,
		minimum: 0,
		noStock: 0,
	},
}

export default (state = INITIAL_STATE, action) => {
	switch (action.type) {
		case STOCK_FETCH: {
			const { items, reboot, listSize } = action.payload
			const appendList = [...state.list, ...items]
			return { ...state, list: reboot ? items : appendList, listSize, fetchSize: items.length }
		}
		case STOCK_SERVER_FETCH: {
			const { products, reboot, fetchSize } = action.payload
			const serverList = reboot ? products : (state.serverList ?? []).concat(products)

			return { ...state, serverList, fetchSize }
		}

		case STOCK_SERVER_FETCH_ERROR:
			return { ...state, serverList: null }
		case STOCK_FETCH_TOTALS_LOADING:
			return { ...state, isFetchingTotals: true, totals: INITIAL_STATE.totals }
		case STOCK_FETCH_TOTALS_SUCCESS:
			return { ...state, isFetchingTotals: false, totals: action.payload }
		case STOCK_FETCH_TOTALS_ERROR:
			return { ...state, isFetchingTotals: false, totals: null }
		case STOCK_SET_FILTER:
			return { ...state, filters: setFilter(action.payload, state.filters) }
		case STOCK_SET_ORDER:
			return { ...state, order: setOrder(action.payload, state.order) }
		case STOCK_SET_CATEGORY:
			return {
				...state,
				filters: {
					...state.filters,
					categories: setCategory(action.payload.category, state.filters.categories),
				},
			}
		case STOCK_SET_SEARCH_TEXT: {
			return { ...state, searchText: action.payload }
		}
		case STOCK_CLEAR_FILTER: {
			return {
				...state,
				filters: { ...INITIAL_STATE.filters, categories: [] },
				order: { ...INITIAL_STATE.order },
			}
		}
		case STOCK_CLEAR:
		case LOGOUT: {
			return INITIAL_STATE
		}
		default:
			return state
	}
}

const setFilter = (filter, state) => {
	const stock = state.stock
	switch (filter.type) {
		case 'noStock':
			return { ...state, stock: { ...stock, noStock: filter.status } }
		case 'noMinimum':
			return { ...state, stock: { ...stock, noMinimum: filter.status } }
		case 'aboveMinimum':
			return { ...state, stock: { ...stock, aboveMinimum: filter.status } }
		case 'withoutStockControl':
			return { ...state, stock: { ...stock, withoutStockControl: filter.status } }
	}
}

const setOrder = (order, state) => {
	switch (order.type) {
		case 'lowestStock':
			if (state.lowestStock) {
				return state
			}
			return { ...state, lowestStock: order.status, higherStock: !order.status, aZ: !order.status, zA: !order.status }
		case 'higherStock':
			if (state.higherStock) {
				return state
			}
			return { ...state, higherStock: order.status, lowestStock: !order.status, aZ: !order.status, zA: !order.status }
		case 'aZ':
			if (state.aZ) {
				return state
			}
			return { ...state, aZ: order.status, lowestStock: !order.status, higherStock: !order.status, zA: !order.status }
		case 'zA':
			if (state.zA) {
				return state
			}
			return { ...state, zA: order.status, lowestStock: !order.status, higherStock: !order.status, aZ: !order.status }
	}
}

const setCategory = (category, selectedCategories) => {
	const categoryExists = _.find(selectedCategories, (eachCategory) => eachCategory.id === category.id)
	if (categoryExists) {
		_.remove(selectedCategories, (eachCategory) => eachCategory.id === category.id)
		return selectedCategories
	}
	selectedCategories.push(category)
	return selectedCategories
}
