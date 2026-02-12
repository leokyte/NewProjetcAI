// @ts-nocheck - Disable TypeScript checking for this file
import {
	PRODUCTS_FETCH,
	PRODUCTS_LIST_FETCH,
	PRODUCT_SAVE,
	PRODUCT_DETAIL,
	PRODUCT_REMOVE,
	PRODUCT_MANAGEMENT_SET_VALUE,
	PRODUCT_STOCK_HISTORY_SET_FILTER,
	PRODUCT_STOCK_HISTORY_CLEAR_FILTER,
	PRODUCT_FILTER_STOCK_HISTORY,
	PRODUCT_SAVE_BY_QUICKSALE,
	PRODUCT_MANAGEMENT_RESET,
	PRODUCTS_UPDATE_QUANTITY,
	PRODUCT_MANAGE_STOCK,
	PRODUCT_MANAGE_STOCK_ACTIVITY,
	UPDATE_SHARE_CATALOG_MODAL_VISIBILITY,
	PRODUCT_GET_STOCK_HISTORY,
	PRODUCT_SORT_TYPE_SET,
	PRODUCT_SET_VIRTUAL_DATA,
	PRODUCTS_SET_SEARCH_TEXT,
	PRODUCTS_LIST_SERVER_FETCH,
	PRODUCTS_LIST_SERVER_FETCH_ERROR,
	PRODUCT_AI_PRODUCT_DESCRIPTION,
	PRODUCT_AI_IMAGE_SUGGESTIONS,
	CLEAR_PRODUCT_AI_SUGGESTIONS,
	PRODUCT_AI_SUGGESTIONS_APPLIED,
	SET_SELECTED_VARIATION_FOR_PHOTO_EDIT,
} from './types'
import { checkIsParentProduct, checkIsChildProduct, IParentProduct, IStandardProduct } from '@kyteapp/kyte-utils'
import { Dispatch } from 'react-redux'
import {
	fetchFilter,
	fetchByNameAndCode,
	save,
	updateManyVirtualData,
	remove,
	PRODUCT,
	fetchOneByID,
	updateVirtualData,
	update,
} from '../../repository'
import { DetailOrigin, ProductDetailsTabKeys } from '../../enums'
import { adaptParentProduct, checkProductIsInCart, getVirtualCurrentStock, prepareProductFileNames } from '../../util'

import { getVirtualStockReservedByItems } from '../_business'
import {
	kyteDataSetStockEntry,
	kyteDataSetStockActivity,
	kyteDataFilterStockHistory,
	kyteGetStockHistoryWithPagination,
	kyteApiWebUpdateProduct,
	kyteGetProduct,
	kyteQueryGetProductsWithinStock,
	kyteApiWebQueryAISuggestDescription,
	kyteApiWebRemoveProductVariations,
	kyteApiWebQueryAIProductFromImage,
} from '../../services'
import { productCategoryFetch, startLoading, stopLoading, currentSaleRenew } from '.'
import { preferenceAddCoreAction } from '.'
import { CoreAction } from '../../enums/Subscription'
import { logError } from '../../integrations'
import { adapterObjectToModel } from '../../repository/model.adapter'
import { RootState } from '../../types/state/RootState'
import {
	INotification,
	KyteNotificationProps,
} from '@kyteapp/kyte-ui-components/src/packages/utilities/kyte-notification/KyteNotification'
import { NotificationType } from '@kyteapp/kyte-ui-components/src/packages/enums'
import { getProductWithoutVariants } from '../../util/products/util-variants'
import { resetVariantsState } from '../variants/actions/product-variant.actions'

export const productSortTypeSet = (sort) => (dispatch) => dispatch({ type: PRODUCT_SORT_TYPE_SET, payload: sort })

const fetchList = (dispatch, type, sort, cb, category, size, reboot) => {
	const generateFilter = (id) => (id === 'pin' ? ['pin = true'] : [`category.id = '${id}'`])
	const filters = category && category.id ? generateFilter(category.id) : null

	dispatch(startLoading())

	fetchFilter(PRODUCT, filters, { sort }, size)
		.then((result) => {
			const { items, listSize } = result
			// Removing variants from list rendering
			const products = items.map((item) => adaptParentProduct({ ...item?.clone() }))
			const payload = { items: products, listSize, reboot }

			dispatch({ type, payload })
			dispatch(stopLoading())
			if (cb) cb()
		})
		.catch(() => dispatch(stopLoading()))
}

export function productsLocalFetch(sort = null, cb, category, size, reboot) {
	const thunk = (dispatch) => fetchList(dispatch, PRODUCTS_FETCH, sort, cb, category, size, reboot)

	return thunk
}

export function productsListLocalFetch(sort = null, cb, category, size, reboot) {
	const thunk = (dispatch) => fetchList(dispatch, PRODUCTS_LIST_FETCH, sort, cb, category, size, reboot)

	return thunk
}

export function productsListServerFetch({ params, localFetch, reboot }) {
	const thunk = async (dispatch, getState) => {
		try {
			dispatch(startLoading())
			const aid = getState()?.auth?.user.aid ?? ''
			if (!aid) throw new Error('Auth error. Missing aid')

			// List total is comming from local fetch
			// state.products.innerListSize
			localFetch?.(null)
			const response = await kyteQueryGetProductsWithinStock({ aid, params })
			const products = response.data

			// Make sure innerFetchSize is set from server response
			// so the value is used onEndReached
			// and not from local products (localFetch)
			const payload = { products, reboot, params, innerFetchSize: products?.length || 0 }

			dispatch({ type: PRODUCTS_LIST_SERVER_FETCH, payload })
		} catch (error) {
			dispatch({ type: PRODUCTS_LIST_SERVER_FETCH_ERROR })
			localFetch?.(error)
		} finally {
			dispatch?.(stopLoading?.())
		}
	}

	return thunk
}

export const productsFetch = productsLocalFetch
export const productsListFetch = productsListLocalFetch

export const productsFetchByNameAndCode = (text, sort, size, reboot, type) => (dispatch) => {
	fetchByNameAndCode(PRODUCT, text, { sort }, size).then((result) => {
		const { items, listSize } = result
		const products = items.map((item) => adaptParentProduct({ ...item?.clone() }))

		const payload = { items: products, reboot, listSize }

		dispatch({ type, payload })
	})
}

export const updateProductDetailState =
	(product, origin, tabKey = null) =>
	(dispatch) => {
		const dispatchProduct = product?.id ? fetchOneByID(PRODUCT, product.id)?.clone() : product
		dispatch({
			type: PRODUCT_DETAIL,
			payload: {
				product: dispatchProduct,
				detailOrigin: origin,
				detailTabKey: tabKey,
			},
		})
	}

export const setProductDetail = (product) => (dispatch, getState) => {
	const { detailOrigin, detailTabKey } = getState().products

	dispatch({
		type: PRODUCT_DETAIL,
		payload: { product, detailOrigin, detailTabKey },
	})
}

export const setSelectedVariationForPhotoEdit = (variation) => (dispatch) => {
	dispatch({
		type: SET_SELECTED_VARIATION_FOR_PHOTO_EDIT,
		payload: variation,
	})
}

export const productDetailBySale = (product) => (dispatch) => {
	let productPayload
	if (product) {
		let _product
		try {
			_product = product.clone()
		} catch (ex) {
			_product = product
		}
		productPayload = { ..._product, virtualCurrentStock: getVirtualCurrentStock(product) }
	} else {
		productPayload = { name: '', image: '', foreground: '', background: '' }
	}

	// setting Product Detail reducer with the information on the device
	dispatch(updateProductDetailState(productPayload, DetailOrigin.BY_SALE))
	// Commented out because this API call is redundant, as the product is already fetched in the product list
	// fetching product update from API, if online
	// if (productPayload.id) {
	// 	dispatch(
	// 		getProductOnline(product.id, (_onlineProduct) => {
	// 			if (!_onlineProduct) return

	// 			const onlineProduct = {
	// 				..._onlineProduct,
	// 				virtualCurrentStock: getVirtualCurrentStock(_onlineProduct),
	// 			}
	// 			dispatch(updateProductDetailState(onlineProduct, DetailOrigin.BY_SALE))
	// 		})
	// 	)
	// }
}

export const productDetailCreate = () => ({
	type: PRODUCT_DETAIL,
	payload: {
		product: { name: '', image: '', foreground: '', background: '' },
		detailOrigin: DetailOrigin.CREATE,
	},
})

export const productDetailUpdate =
	(product, detailTabKey = ProductDetailsTabKeys.Product) =>
	(dispatch) => {
		let _product
		try {
			_product = product.clone()
		} catch (ex) {
			_product = product
		}

		const productPayload = { ..._product, virtualCurrentStock: getVirtualCurrentStock(_product) }

		// setting Product Detail reducer with the information on the device
		dispatch(updateProductDetailState(productPayload, DetailOrigin.UPDATE, detailTabKey))
		// Commented out because this API call is redundant, as the product is already fetched in the product list
		// // fetching product update from API, if online
		// dispatch(
		//   getProductOnline(product.id, (_onlineProduct) => {
		//     if (!_onlineProduct) return;

		//     const onlineProduct = {
		//       ..._onlineProduct,
		//       virtualCurrentStock: getVirtualCurrentStock(_onlineProduct),
		//     };
		//     dispatch(updateProductDetailState(onlineProduct, DetailOrigin.UPDATE, detailTabKey));
		//   }),
		// );
	}

export const productSave =
	(product, callback, isClone = false) =>
	async (dispatch, getState) => {
		const { currentSale, common, variants } = getState()
		const { productVariants } = variants
		// TO-DO: Centralize product manipulation in a separate file
		const sameProduct = {
			...product,
			saleCostPrice: product.saleCostPrice ? product.saleCostPrice : product.salePrice,
			variants: productVariants || product?.variants,
		}
		const renewCart = checkProductIsInCart(currentSale, sameProduct.id)

		if (!isClone && renewCart) dispatch(currentSaleRenew())

		const persistedProduct = await save(PRODUCT, sameProduct)

		if (common.isOnline) {
			dispatch(startLoading())
			try {
				// * This prevent image breaking when saving products that came from the server.
				// * (state.products.serverList)
				let updatedProduct = persistedProduct.clone()
				const productWithFormattedImages = prepareProductFileNames(updatedProduct)
				updatedProduct = productWithFormattedImages
				const shouldRemoveVariants = !checkIsParentProduct(updatedProduct) && !checkIsChildProduct(updatedProduct)
				if (shouldRemoveVariants) updatedProduct = getProductWithoutVariants(updatedProduct)
				await kyteApiWebUpdateProduct(updatedProduct)
			} catch (exception) {
				logError(exception, 'APP_SaveProductOnline_Fail')
			} finally {
				dispatch(stopLoading())
			}
		}

		if (isClone) {
			// needs to update productManaging as well
			dispatch(productManagementReset())
		}

		dispatch({ type: PRODUCT_SAVE, payload: persistedProduct })
		dispatch(productCategoryFetch())
		// Adiciona core action nas preferences
		dispatch(preferenceAddCoreAction(CoreAction.FirstProduct))
		callback(persistedProduct.clone())
	}

export const productSaveByQuickSale = (value) => (dispatch) => {
	dispatch({ type: PRODUCT_SAVE_BY_QUICKSALE, payload: value })
}

export const productsUpdateStockVirtualData = (sale) => {
	const itemsProduct = sale.items
		.filter((i) => !!i.product)
		.map((item) => ({ product: fetchOneByID(PRODUCT, item.product.prodId), item }))

	const productsVirtualStock = getVirtualStockReservedByItems(itemsProduct, sale.isCancelled)

	if (productsVirtualStock) {
		updateManyVirtualData(PRODUCT, productsVirtualStock)
	}
}

export const productRemove = (id, callback) => async (dispatch) => {
	await fetchFilter(PRODUCT, [`id = '${id}'`]).then((productFilter) => productFilter[0])

	// if (product && product.category) {
	//   await dispatch(productCategoryChangeQuantity(product.category.id, 'decrease'));
	//   dispatch(productCategoryFetch());
	// }

	const persistedProduct = await remove(PRODUCT, id)
	dispatch({ type: PRODUCT_REMOVE })
	callback()
	try {
		kyteApiWebUpdateProduct(persistedProduct)
	} catch (error) {
		logError(error, 'APP_RemoveProductOnline_Fail')
	}
}

export const updateshareCatalogModalVisible = (value) => (dispatch) => {
	dispatch({
		type: UPDATE_SHARE_CATALOG_MODAL_VISIBILITY,
		payload: value,
	})
}

export const updateProductsQuantity = (qtt) => (dispatch) => {
	dispatch({ type: PRODUCTS_UPDATE_QUANTITY, payload: qtt })
}

export const productManagementSetValue = (value, property, set) => (dispatch) => {
	dispatch({
		type: PRODUCT_MANAGEMENT_SET_VALUE,
		payload: { value, property, set },
	})
}

export const productStockHistorySetFilter = (value, property) => (dispatch) => {
	dispatch({
		type: PRODUCT_STOCK_HISTORY_SET_FILTER,
		payload: { value, property },
	})
}

export const productStockHistoryClearFilter = () => (dispatch) => dispatch({ type: PRODUCT_STOCK_HISTORY_CLEAR_FILTER })

export const productManagementReset = () => (dispatch) => {
	dispatch({ type: PRODUCT_MANAGEMENT_RESET })
}

export const productManageStock = (stock, cb) => (dispatch) => {
	dispatch(startLoading())
	kyteDataSetStockEntry(stock)
		.then((result) => {
			dispatch({ type: PRODUCT_MANAGE_STOCK })
			dispatch(stopLoading())
			if (cb) cb()
		})
		.catch((error) => {
			dispatch(stopLoading())
			// TODO: deal with error
		})
}

export const productManageStockActivity = (product, cb) => (dispatch) => {
	dispatch(startLoading())
	kyteDataSetStockActivity(product).then((result) => {
		dispatch({ type: PRODUCT_MANAGE_STOCK_ACTIVITY })
		dispatch(stopLoading())
		if (cb) cb()
	})
}

export const productSetVirtualData = (productId, reserved) => {
	const virtual = { stockReserved: reserved }

	return (dispatch) => {
		updateVirtualData(PRODUCT, { id: productId, virtual }).then(() => {
			dispatch({ type: PRODUCT_SET_VIRTUAL_DATA })
		})
	}
}

export const productGetStockHistory =
	(productId, limit, page = 0) =>
	(dispatch) =>
		new Promise((resolve) => {
			resolve(
				kyteGetStockHistoryWithPagination(productId, page, limit).then((result) => {
					dispatch({ type: PRODUCT_GET_STOCK_HISTORY, payload: result.data })
					return result.data
				})
			)
		})

export const productFilterStockHistory = (product, filter) => (dispatch) =>
	new Promise((resolve) => {
		resolve(
			kyteDataFilterStockHistory(product, filter).then((result) => {
				dispatch({ type: PRODUCT_FILTER_STOCK_HISTORY, payload: result.data })
			})
		)
	})

export const productsSetSearchText = (text) => ({ type: PRODUCTS_SET_SEARCH_TEXT, payload: text })

export const getProductOnline =
	(id, callback = null) =>
	async (dispatch, getState) => {
		const { common } = getState()
		if (!common.isOnline) {
			if (callback) callback(false)
			return
		}

		try {
			const { data: product, status } = await kyteGetProduct(id)
			if (status !== 200) return

			const productAdapted = adapterObjectToModel(PRODUCT, product)
			await update(PRODUCT, product.id, productAdapted, false)
			if (callback) callback(product)
		} catch (ex) {
			if (callback) callback(false)
			if (__DEV__) {
				console.tron.logImportant('getProductOnline error', { message: ex.message })
			}
		}
	}

export const productSetServerList = (serverList) => (dispatch) => {
	dispatch({ type: PRODUCTS_LIST_SERVER_FETCH, payload: serverList })
}

export const AISuggestProductDescription = (params, callback) => async (dispatch) => {
	try {
		dispatch(startLoading())
		const description = await kyteApiWebQueryAISuggestDescription(params)
		dispatch({ type: PRODUCT_AI_PRODUCT_DESCRIPTION, payload: description })
		callback?.(description)
	} catch (error) {
		if (__DEV__) {
			console.tron.logImportant('AISuggestProductDescription error', { message: error.message })
		}
		throw error
	} finally {
		dispatch(stopLoading())
	}
}

export const clearAISuggestProductDescription = () => (dispatch) => {
	dispatch({ type: PRODUCT_AI_PRODUCT_DESCRIPTION, payload: null })
}

export const aiProcessProductImage =
	(params: { image: string; language: string }, callback?: (suggestions: any, error?: Error) => void) =>
	async (dispatch: Dispatch, getState: () => RootState) => {
		try {
			dispatch(startLoading())

			const state = getState()
			const { store } = state.auth

			const apiParams = {
				aid: state.auth.user.aid,
				uid: state.auth.user.uid,
				imageUrl: params.image,
				language: params.language,
				store: {
					name: store?.name,
					description: store?.infoExtra,
				},
				tag: 'app',
			}

			const response = await kyteApiWebQueryAIProductFromImage(apiParams)

			const suggestions = {
				name: response.product.name,
				description: response.product.description,
				salePrice: response.product.salePrice,
				category: response.product.category,
				image: response.product.image,
				confidenceLevelName: response.confidenceLevelName,
			}

			dispatch({
				type: PRODUCT_AI_IMAGE_SUGGESTIONS,
				payload: suggestions,
			})

			callback?.()
		} catch (error) {
			if (__DEV__) {
				console.tron.logImportant('AIProcessProductImage error', { message: error.message })
			}

			callback?.(error as Error)
		} finally {
			dispatch(stopLoading())
		}
	}

export const clearAIProductSuggestions = () => (dispatch) => {
	dispatch({ type: CLEAR_PRODUCT_AI_SUGGESTIONS })
}

export const setAISuggestionsApplied = (applied: boolean) => (dispatch) => {
	dispatch({ type: PRODUCT_AI_SUGGESTIONS_APPLIED, payload: applied })
}

export const removeProductVariations =
	(product: IParentProduct, callback: (error) => void) => async (dispatch: Dispatch, getState: () => RootState) => {
		try {
			const { user } = getState().auth
			const productWithoutVariations: IStandardProduct = { ...product, variants: [], variations: [], isParent: true }

			dispatch(startLoading())
			await kyteApiWebRemoveProductVariations({ user, product })
			const response = await kyteApiWebUpdateProduct(productWithoutVariations)
			const updatedProduct = response.data

			dispatch({
				type: PRODUCT_DETAIL,
				payload: {
					product: updatedProduct,
					detailOrigin: DetailOrigin.UPDATE,
					detailTabKey: ProductDetailsTabKeys.Product,
				},
			})
			dispatch(resetVariantsState())

			callback()
		} catch (error) {
			callback?.(error)
		} finally {
			dispatch?.(stopLoading?.())
		}
	}
