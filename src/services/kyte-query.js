import { apiGateway } from './kyte-api-gateway'

// Sync
export const kyteFirstSync = (aid) => apiGateway.get(`/sync/${aid}`)

// Sales
export const kyteQueryGetSales = (filters, aid) =>
	apiGateway.get('/sale', {
		params: {
			aid,
			...filters,
			getStats: Number(true),
		},
	})

export const kyteQueryGetSale = (saleId) => apiGateway.get(`/sale/${saleId}`)

export const kyteQueryGetTotalSales = ({ aid, uid, allowViewOtherSales, params }) =>
	apiGateway.get(`/sale/${aid}/count`, {
		params: {
			uid: allowViewOtherSales ? undefined : uid,
			...params,
		},
		headers: {
			uid,
		},
	})

// Products
export const kyteGetStockHistoryWithPagination = (productId, page, limit) =>
	apiGateway.get(`/stock/withPagination/${productId}/${page}/${limit}`)

export const kyteQueryQRCodeUpsertSale = (sale, uid) => {
	const URL = '/sale/qrCodeUpsert'

	return apiGateway.put(URL, sale, {
		headers: {
			uid,
		},
	})
}

export const kyteQueryUpsertSale = (sale, uid) => {
	const URL = '/sale/upsert'

	return apiGateway.put(URL, sale, {
		headers: {
			uid,
		},
	})
}

/**
 * Fetches products with the given parameters.
 *
 * @param {Object} options - The options for fetching products.
 * @param {string} options.aid - The account ID.
 * @param {Object} options.params - The query parameters.
 * @returns {Promise<AxiosResponse<{ _count: number, _products: IProductVariant[] }>>} - The Axios response containing the count and products.
 */
export const kyteQueryGetProducts = ({ aid, params }) => {
	const URL = `/products/${aid}`
	const response = apiGateway.get(URL, { params })

	return response
}

/**
 * Fetches a list of products along with their stock information, including child products (variants).
 * Note: Products with variants typically do not include stock information for their children
 * (found in the `product.variants` array).
 *
 * @function
 * @param {Object} options - The options for the query.
 * @param {string} options.aid - The account ID associated with the request.
 * @param {Object} options.params - Query parameters to be sent with the request.
 * @returns {Promise<{ data: (import('@kyteapp/kyte-utils').IProduct | import('@kyteapp/kyte-utils').IProductWithVariation)[] }>} A promise that resolves to the response containing the products and their stock information.
 */
export const kyteQueryGetProductsWithinStock = ({ aid, params }) => {
	const URL = `/products/${aid}/listProductsWithChildrenStock`
	const response = apiGateway.get(URL, { params })

	return response
}

/**
 * Fetches the stock totals for a specific product based on the provided account ID (aid).
 *
 * @param {Object} params - The parameters for the query.
 * @param {string} params.aid - The account ID used to fetch the stock totals.
 * @param {string} params.uid - The user's used to fetch the stock totals.
 * @param {string} params.params - the URL params to be used on GET request
 * @returns {Promise<{ data: { _total: { aboveMin: number, belowMin: number, outOfStock: number, costValue: number, profitValue: number, totalStock: number, totalValue: number } } }>} A promise that resolves to an object containing the stock totals.
 */
export const kyteQueryGetStockTotals = async ({ aid, uid, params }) => {
	const URL = `/products/${aid}/total`
	const headers = { uid }
	const response = apiGateway.get(URL, { headers, params })

	return response
}
