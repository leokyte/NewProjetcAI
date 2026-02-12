/* eslint-disable default-param-last */
import { findIndex } from 'lodash'
import {
	SALES_FETCH,
	ORDERS_FETCH,
	SALES_FETCH_BY_CUSTOMER,
	SALES_FETCH_BY_USER,
	ORDERS_FETCH_BY_CUSTOMER,
	SALES_CLEAR,
	SALES_CLEAR_DETAIL,
	SALES_UPDATE_QUANTITY_OPENED,
	SALES_UPDATE_SELECTED_USERS_HISTORY,
	SALES_UPDATE_SEARCH_TERM,
	SALES_UPDATE_QUANTITY,
	SALE_UPDATE_COUNTERS,
	SALES_SET_FILTER,
	ORDERS_SET_FILTER,
	SALES_REPLACE_FILTER,
	SALES_SET_FILTER_TYPE,
	SALES_CLEAR_FILTER,
	SALE_DETAIL,
	SALES_RESET_LIST_SIZE,
	SALE_UPDATE_ITEM,
	SALES_SET_EXPANDED_ITEMS,
	LOGOUT,
	SALES_RESET_GROUP,
	SALES_UPDATE_LIST_ITEM,
	SALE_UPDATE_UNSYCED_SALES,
	SALES_LAST_NUMBER,
	SALES_SET_THIS_MONTH,
	SALES_UPDATE_QUANTITY_CLOSED,
} from '../actions/types'
import { OrderStatus } from '../../enums'
import { createSalesListItem, updateItemAtIndex } from '../../util'
import { SalesFetchTypeEnum, SalesGroupTypeEnum, SalesTypeEnum } from '../../enums/SaleSort'
import { SALES_FETCH_LIMIT } from '../../kyte-constants'

export const SALES_GROUP_RESULT_INITIAL_STATE = { list: [], dailyTotals: [], unsycedList: [], total: 0, amount: 0 }
export const FILTERS_INITIAL_STATE = {
	type: 'sale',
	status: [],
	search: null,
	period: null,
	cancelledSales: false,
	days: { start: '', end: '' },
	users: [],
	customer: null,
	showCatalogOrdersOnly: false,
	paymentMethods: [],
	gatewayMethods: [],
}

const defaultOrderStatus = OrderStatus.items.slice(0, 5)

const INITIAL_STATE = {
	detail: {},
	salesGroupsResult: SALES_GROUP_RESULT_INITIAL_STATE,
	ordersGroupsResult: SALES_GROUP_RESULT_INITIAL_STATE,
	customerSales: { salesGroupsResult: SALES_GROUP_RESULT_INITIAL_STATE },
	userSales: { salesGroupsResult: SALES_GROUP_RESULT_INITIAL_STATE },
	saleHistorySelectedUsers: [],
	openedSalesQuantity: 0,
	confirmedOrdersQuantity: 0,
	salesQuantity: 0,
	lastSaleNumber: null,
	filterSales: FILTERS_INITIAL_STATE,
	filterOrders: { ...FILTERS_INITIAL_STATE, defaultStatus: defaultOrderStatus, type: SalesTypeEnum.ORDER },
	filterType: 'sale',
	listSize: 0,
	fetchLimit: SALES_FETCH_LIMIT,
	expandedItemsOrders: true,
	expandedItemsSales: true,
	salesFetchType: SalesFetchTypeEnum.SERVER,
}

export default (state = INITIAL_STATE, action) => {
	switch (action.type) {
		case SALES_FETCH:
		case ORDERS_FETCH: {
			const { sales, listSize, dailyTotals: incomingDailyTotals, salesTotals, reboot, salesFetchType } = action.payload
			const { amount, total } = salesTotals

			const reducerSales = action.type === ORDERS_FETCH ? state.ordersGroupsResult.list : state.salesGroupsResult.list
			const reducerDailyTotals =
				action.type === ORDERS_FETCH ? state.ordersGroupsResult.dailyTotals : state.salesGroupsResult.dailyTotals

			const dailyTotals = reboot ? incomingDailyTotals : [...reducerDailyTotals, ...incomingDailyTotals]

			const list = reboot
				? createSalesListItem(sales, dailyTotals)
				: createSalesListItem([...reducerSales, ...sales], dailyTotals)

			const reducerProperty = action.type === ORDERS_FETCH ? SalesGroupTypeEnum.ORDER : SalesGroupTypeEnum.SALE

			return {
				...state,
				[reducerProperty]: {
					unsycedList: state[reducerProperty].unsycedList,
					amount,
					total,
					list,
					dailyTotals,
				},
				fetchSize: list.length,
				listSize,
				salesFetchType,
			}
		}
		case SALES_UPDATE_LIST_ITEM: {
			const { salesType, updatedList } = action.payload
			const isOrder = salesType === SalesTypeEnum.ORDER
			const reducerProperty = isOrder ? SalesGroupTypeEnum.ORDER : SalesGroupTypeEnum.SALE

			return {
				...state,
				[reducerProperty]: {
					...state[reducerProperty],
					list: updatedList,
				},
			}
		}
		case SALES_FETCH_BY_CUSTOMER: {
			const { sales, listSize, dailyTotals, salesTotals, reboot } = action.payload
			const { amount, total } = salesTotals
			const incomingSales = createSalesListItem(sales, dailyTotals)
			const stateSales = state.customerSales.salesGroupsResult.list

			const list = reboot ? incomingSales : [...stateSales, ...incomingSales]

			return {
				...state,
				customerSales: {
					salesGroupsResult: { ...state.customerSales.salesGroupsResult, amount, total, list },
				},
				fetchSize: sales.length,
				listSize,
			}
		}
		case SALES_FETCH_BY_USER: {
			const { sales, listSize, dailyTotals, salesTotals, reboot } = action.payload
			const { amount, total } = salesTotals
			const incomingSales = createSalesListItem(sales, dailyTotals)
			const stateSales = state.userSales.salesGroupsResult.list

			const list = reboot ? incomingSales : [...stateSales, ...incomingSales]

			return {
				...state,
				userSales: { salesGroupsResult: { amount, total, list } },
				fetchSize: sales.length,
				listSize,
			}
		}
		case ORDERS_FETCH_BY_CUSTOMER: {
			const { sales, dailyTotals } = action.payload
			const orders = createSalesListItem(sales, dailyTotals)

			return {
				...state,
				customerSales: { salesGroupsResult: { ...state.customerSales.salesGroupsResult, orders } },
			}
		}
		case SALES_SET_FILTER:
		case ORDERS_SET_FILTER: {
			const { value, property, salesType } = action.payload
			const filterName = salesType === SalesTypeEnum.ORDER ? 'filterOrders' : 'filterSales'
			return { ...state, [filterName]: { ...state[filterName], [property]: value } }
		}
		case SALES_REPLACE_FILTER: {
			const filterName = action.payload.salesType === SalesTypeEnum.ORDER ? 'filterOrders' : 'filterSales'
			return { ...state, [filterName]: action.payload.newFilters }
		}
		case SALES_SET_FILTER_TYPE: {
			return { ...state, filterType: action.payload }
		}
		case SALES_CLEAR_FILTER: {
			const filterName = action.payload.salesType === SalesTypeEnum.ORDER ? 'filterOrders' : 'filterSales'
			return {
				...state,
				[filterName]: { ...INITIAL_STATE[filterName] },
			}
		}
		case SALES_CLEAR: {
			const { detail } = state
			const clearState = {
				...INITIAL_STATE,
				openedSalesQuantity: state.openedSalesQuantity,
				confirmedOrdersQuantity: state.confirmedOrdersQuantity,
				filterSales: state.filterSales,
				filterOrders: state.filterOrders,
			}

			return detail.id ? state : clearState
		}
		case SALES_CLEAR_DETAIL: {
			return { ...state, detail: {} }
		}
		case SALES_UPDATE_QUANTITY_OPENED: {
			return { ...state, openedSalesQuantity: action.payload }
		}
		case SALES_UPDATE_QUANTITY_CLOSED: {
			return { ...state, closedSalesQuantity: action.payload }
		}
		case SALES_UPDATE_SELECTED_USERS_HISTORY: {
			return { ...state, saleHistorySelectedUsers: action.payload }
		}
		case SALES_UPDATE_SEARCH_TERM:
			return { ...state, saleSearchTerm: action.payload }
		case SALES_UPDATE_QUANTITY:
			return { ...state, salesQuantity: action.payload }
		case SALE_DETAIL:
			return { ...state, detail: action.payload }
		case SALES_RESET_LIST_SIZE: {
			return { ...state, listSize: 0 }
		}
		case SALE_UPDATE_ITEM: {
			const { sale } = action.payload

			return {
				...state,
				detail: sale,
			}
		}
		case SALE_UPDATE_COUNTERS: {
			const { amount, total, salesType } = action.payload
			const reducerProperty = salesType === SalesTypeEnum.ORDER ? SalesGroupTypeEnum.ORDER : SalesGroupTypeEnum.SALE
			return {
				...state,
				[reducerProperty]: {
					...state[reducerProperty],
					amount,
					total,
				},
			}
		}
		case SALE_UPDATE_UNSYCED_SALES: {
			const { salesType, value } = action.payload
			const reducerProperty = salesType === SalesTypeEnum.ORDER ? SalesGroupTypeEnum.ORDER : SalesGroupTypeEnum.SALE

			return {
				...state,
				[reducerProperty]: {
					...state[reducerProperty],
					unsycedList: value,
				},
			}
		}
		case SALES_SET_EXPANDED_ITEMS: {
			const { value, salesType } = action.payload
			const reducerProperty = salesType === SalesTypeEnum.ORDER ? 'expandedItemsOrders' : 'expandedItemsSales'
			return {
				...state,
				[reducerProperty]: value,
			}
		}

		case SALES_RESET_GROUP: {
			const { salesType } = action.payload
			const reducerProperty = salesType === SalesTypeEnum.ORDER ? SalesGroupTypeEnum.ORDER : SalesGroupTypeEnum.SALE
			return {
				...state,
				[reducerProperty]: SALES_GROUP_RESULT_INITIAL_STATE,
			}
		}

		case SALES_LAST_NUMBER: {
			return {
				...state,
				lastSaleNumber: action.payload,
			}
		}

		case LOGOUT: {
			return { ...INITIAL_STATE }
		}
		default:
			return state
	}
}
