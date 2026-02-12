import { ICategory, IStockTotal, SortEnum, StockEnum } from '@kyteapp/kyte-utils'
import { INITIAL_STATE as STOCK_INITIAL_STATE } from '../stores/reducers/StockReducer'

type StockState = typeof STOCK_INITIAL_STATE
interface AdaptedStockTotals {
	value: number
	products: number
	saleCost: number
	profits: number
	minimum: number
	noStock: number
}
/**
 * Adapts the response object containing stock totals into a more readable format.
 *
 * @param {StockTotals} totals - The original stock totals object.
 * @returns {AdaptedStockTotals} An object containing the adapted stock totals.
 */
export function adaptFetchStockTotalsResponse(totals: IStockTotal): AdaptedStockTotals {
	const updatedTotals = {
		value: totals.totalValue,
		products: totals.totalStock,
		saleCost: totals.costValue,
		profits: totals.profitValue,
		minimum: totals.belowMin,
		noStock: totals.outOfStock,
	}

	return updatedTotals
}

export function adaptFetchStockTotalsParams({
	filters,
	...rest
}: {
	filters: { stock: StockState['filters']['stock']; categories: ICategory[] }
}) {
	const { stock: stockFilters } = filters ?? {}
	type StockStatusKey = keyof typeof stockFilters
	const paramsMap: { [key in StockStatusKey]: StockEnum } = {
		aboveMinimum: StockEnum.ABOVE_MIN,
		noMinimum: StockEnum.BELOW_MIN,
		noStock: StockEnum.OUT_OF_STOCK,
		withoutStockControl: StockEnum.NOT_CONTROLLED,
	}
	const stockStatuses: string = (Object.keys(stockFilters) as StockStatusKey[])
		.filter((key) => stockFilters[key])
		.map((key) => paramsMap[key])
		.join(',')
	const categoryIds = filters.categories
		.filter((category) => Boolean(category?.id))
		.map((category) => category?.id || '')
		.join(',')

	const params = {
		stockStatus: stockStatuses,
		categoryId: categoryIds,
		...rest,
	}

	return params
}

export default { adaptFetchStockTotalsResponse }
