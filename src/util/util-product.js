import { checkPinProducts } from '../repository'

// Check Stock Status
/**
 * Checks the stock value status based on the current stock and minimum stock level.
 *
 * @param {number} currentStock - The current stock level.
 * @param {Object} stock - The stock object containing the minimum stock level.
 * @param {import('@kyteapp/kyte-utils').IProduct | import('@kyteapp/kyte-utils').IProductVariant} product - The product object
 * @param {number} [stock.minimum] - The minimum stock level.
 * @returns {'errorr' | 'warning' | null} - Returns 'error' if the current stock is 0 or less,
 * 'warning' if the current stock is less than or equal to the minimum stock level,
 * and null otherwise.
 */
export const checkStockValueStatus = (currentStock, stock, product = null) => {
	const hasVariants = product?.variants?.some((variant) => variant.stockActive)
	const checkStatus = (pCurrentStock, pStock) => {
		if (pCurrentStock <= 0) return 'error'
		if (pCurrentStock <= pStock?.minimum) return 'warning'
		return null
	}

	if (hasVariants) {
		const statuses = product?.variants?.map?.((variant) => checkStatus(variant?.stock?.current, variant.stock)) ?? []
		if (statuses.includes('error')) return 'error'
		if (statuses.includes('warning')) return 'warning'

		return null
	}

	return checkStatus(currentStock, stock)
}

// Check edited product is in cart
export const checkProductIsInCart = (currentSale, productId) => {
	if (!currentSale.items.length) return false
	return currentSale.items.find((item) => item.product && item.product.prodId === productId)
}

export const hasPinCategory = () => checkPinProducts()

export const getVirtualCurrentStock = (product) => {
	if (!product?.stockActive || !product?.stock) return null
	const stockReserved = !product.virtual ? 0 : product.virtual.stockReserved
	const stockValue = product.stock.current + stockReserved
	return stockValue % 1 !== 0 ? stockValue.toFixed(3) : stockValue
}

/**
 * Builds and returns an object for managing product details.
 *
 * @param {Object} product - The product object containing various properties.
 * @param {Object} defaultProductManaging - The default product managing object.
 * @param {Object} product.stock - The stock information of the product.
 * @param {boolean} product.stockActive - Indicates if stock management is active.
 * @param {string} product.category - The category of the product.
 * @param {boolean} product.isFractioned - Indicates if the product is fractioned.
 * @param {string} product.image - The main image of the product.
 * @param {Array} product.gallery - An array of additional images for the product.
 * @returns {{
 *   initialStock: number | string,
 *   currentStock: number | string,
 *   minimumStock: number | string,
 *   isFractioned: boolean,
 *   isStockEnabled: boolean,
 *   productPhoto: string,
 *   productColor: string,
 *   productOtherPhotos: Array,
 *   category: Object | null
 *   contentHasChanged: boolean
 * }} An object containing the managed product details.
 */
export function buildProductManaging(product, defaultProductManaging) {
	const initial = defaultProductManaging
	const { stock, stockActive, category, isFractioned, image, gallery } = product
	const initialCurrentStock = product.isFractioned ? '0.000' : 0

	return {
		...initial,
		initialStock: stock ? getVirtualCurrentStock(product) : initialCurrentStock,
		currentStock: stock ? getVirtualCurrentStock(product) : initialCurrentStock,
		minimumStock: stock ? stock.minimum : initialCurrentStock,
		isFractioned: isFractioned ?? initial.isFractioned,
		isStockEnabled: stockActive ?? initial.isStockEnabled,
		productPhoto: image ?? initial.image,
		productOtherPhotos: [...(_.map(gallery, (a) => a) ?? [])],
		category: category ?? initial.category,
	}
}

/**
 * Updates a product in the provided list and returns a new updated list.
 *
 * This function does not modify the original list. Instead, it creates a new list
 * with the updated product. If the product exists in the list (matched by `id` or `_id`),
 * it replaces the existing product with the provided one. If the product is not found,
 * the original list is returned unchanged.
 *
 * @param {import('@kyteapp/kyte-utils').IProduct} product - The product object to update in the list.
 * @param {Array<import('@kyteapp/kyte-utils').IProduct>} list - The array of product objects to search and update.
 * @returns {Array<import('@kyteapp/kyte-utils').IProduct>} A new array with the updated product, or the original list if no match is found.
 */
export function getUpdatedProductList(product = {}, list = []) {
	// eslint-disable-next-line no-underscore-dangle
	const index = list.findIndex((item) => (item.id || item._id) === (product.id || product._id))

	if (index !== -1) {
		const updatedList = [...list]
		updatedList.splice(index, 1, product)

		return updatedList
	}

	return list
}
