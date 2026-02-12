import _ from 'lodash'
import {
	STOCK_FETCH,
	STOCK_SET_FILTER,
	STOCK_SET_ORDER,
	STOCK_SET_CATEGORY,
	STOCK_SET_SEARCH_TEXT,
	STOCK_CLEAR_FILTER,
	STOCK_FETCH_TOTALS_LOADING,
	STOCK_FETCH_TOTALS_SUCCESS,
	STOCK_FETCH_TOTALS_ERROR,
	STOCK_SERVER_FETCH,
	STOCK_SERVER_FETCH_ERROR,
} from './types'
import { fetchFilterOr, fetchByNameAndCode, PRODUCT } from '../../repository'
import {
	adaptFetchStockTotalsParams,
	adaptFetchStockTotalsResponse,
	adaptParentProduct,
	getVirtualCurrentStock,
} from '../../util'
import { kyteQueryGetProductsWithinStock, kyteQueryGetStockTotals } from '../../services'

const mountStockOrder = (stockOrder) => {
	let sort = [['stock.current'], ['asc']] // default order, per lowestStock
	if (stockOrder.higherStock) {
		sort = [['stock.current'], ['desc']]
	}
	if (stockOrder.aZ) {
		sort = [['name'], ['asc']]
	}
	if (stockOrder.zA) {
		sort = [['name'], ['desc']]
	}
	return sort
}

export const stockFetch =
	(text, size, reboot, options = null) =>
	(dispatch, getState) => {
		const { filters, order } = getState().stock
		const stockFilters = filters
		const stockOrder = order

		const sort = mountStockOrder(stockOrder)

		let filterAction = null

		if (text) {
			// filterAction = fetchByNameAndCode(PRODUCT, text, null, size);
			filterAction = fetchByNameAndCode(PRODUCT, text, options, null, true) // limitless = true
		} else {
			// filterAction = fetchFilterOr(PRODUCT, null, null, size);
			filterAction = fetchFilterOr(PRODUCT, null, options, null, true) // limitless = true
		}
		// const { listItems, listSize } = filterAction;

		filterAction
			.then(async (stockSuccess) => {
				let finalStock = []
				const { noStock, noMinimum, aboveMinimum, withoutStockControl } = stockFilters.stock

				if (noStock) {
					await _(stockSuccess)
						.filter((eachProduct) => eachProduct.stock && getVirtualCurrentStock(eachProduct) <= 0)
						.uniqBy('id')
						.forEach((eachProduct) => finalStock.push(eachProduct))
				}
				if (noMinimum) {
					await _(stockSuccess)
						.filter(
							(eachProduct) =>
								eachProduct.stock &&
								eachProduct.stock.minimum &&
								getVirtualCurrentStock(eachProduct) <= eachProduct.stock.minimum
						)
						.forEach((eachProduct) => finalStock.push(eachProduct))
				}
				if (aboveMinimum) {
					await _(stockSuccess)
						.filter(
							(eachProduct) =>
								eachProduct.stock &&
								eachProduct.stock.minimum > -1 &&
								getVirtualCurrentStock(eachProduct) > eachProduct.stock.minimum
						)
						.forEach((eachProduct) => finalStock.push(eachProduct))
				}
				if (withoutStockControl) {
					await _(stockSuccess)
						.filter((eachProduct) => !eachProduct?.stockActive)
						.forEach((eachProduct) => finalStock.push(eachProduct))
				}

				if (!noStock && !noMinimum && !aboveMinimum && !withoutStockControl) {
					// no filters
					finalStock = stockSuccess
				}

				if (stockFilters.categories.length > 0) {
					let filteredByCategory = []
					stockFilters.categories.forEach(async (eachCategory) => {
						await _(finalStock)
							.filter((eachProduct) => eachProduct.category && eachProduct.category.id === eachCategory.id)
							.forEach((eachProduct) => filteredByCategory.push(eachProduct))
					})

					filteredByCategory = _.uniqBy(filteredByCategory, (eachProduct) => eachProduct.id)
					const items = _.orderBy(filteredByCategory, sort[0], sort[1])
					// Removing variants from list rendering
					const products = items.map((item) => adaptParentProduct({ ...item?.clone() }))

					const payload = {
						items: products.slice(size.length, size.length + size.limit),
						listSize: null,
						reboot,
					}

					dispatch({ type: STOCK_FETCH, payload })
				} else {
					const data = _.orderBy(finalStock, sort[0], sort[1])
					const items = _.uniqBy(data, (eachProduct) => eachProduct.id)
					// Removing variants from list rendering
					const products = items.map((item) => adaptParentProduct({ ...item?.clone() }))

					const payload = {
						items: products.slice(size.length, size.length + size.limit),
						listSize: null,
						reboot,
					}

					dispatch({ type: STOCK_FETCH, payload })
				}

				fetchStockTotals()(dispatch, getState)
			})
			.catch(() => {
				// console.log('stockError', stockError);
			})
	}

export const fetchStockTotals = () => async (dispatch, getState) => {
	dispatch({ type: STOCK_FETCH_TOTALS_LOADING })

	try {
		const { stock, auth } = getState()
		const { searchText, filters } = stock
		const { aid = '', uid = '' } = auth?.user ?? {}
		const params = adaptFetchStockTotalsParams({ search: searchText, filters })

		const hasAuthInfo = Boolean(aid && uid)

		if (!hasAuthInfo) throw new Error()

		const response = await kyteQueryGetStockTotals({ aid, uid, params })
		// eslint-disable-next-line no-underscore-dangle
		const totals = adaptFetchStockTotalsResponse(response.data?._total ?? {})

		if (!totals) throw new Error()

		dispatch({ type: STOCK_FETCH_TOTALS_SUCCESS, payload: totals })
	} catch {
		dispatch({ type: STOCK_FETCH_TOTALS_ERROR })
	}
}

export function stockServerFetch({ params, localFetch, reboot }) {
	const thunk = async (dispatch, getState) => {
		try {
			const aid = getState()?.auth?.user.aid ?? ''
			if (!aid) throw new Error('Auth error. Missing aid')

			// List total is comming from local fetch
			// state.stock.fetchSize
			localFetch?.(null)
			const response = await kyteQueryGetProductsWithinStock({ aid, params })
			const products = response.data

			// Make sure fetchSize is set from server response
			// so the value is used onEndReached
			// and not from local products (localFetch)
			const payload = { products, reboot, params, fetchSize: products?.length || 0 }

			dispatch({ type: STOCK_SERVER_FETCH, payload })
		} catch (error) {
			dispatch({ type: STOCK_SERVER_FETCH_ERROR })
			localFetch(error)
		}
	}

	return thunk
}

export const stockClearFilter = () => ({ type: STOCK_CLEAR_FILTER })

export const stockSetFilter = (type, status) => ({ type: STOCK_SET_FILTER, payload: { type, status } })
export const stockSetOrder = (type, status) => ({ type: STOCK_SET_ORDER, payload: { type, status } })
export const stockSetCategory = (category) => ({ type: STOCK_SET_CATEGORY, payload: { category } })
export const stockSetSearchText = (text) => ({ type: STOCK_SET_SEARCH_TEXT, payload: text })
export const stockSetServerList = (serverList) => (dispatch) =>
	dispatch({ type: STOCK_SERVER_FETCH, payload: serverList })
