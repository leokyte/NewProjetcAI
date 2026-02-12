import { Dispatch } from 'react-redux'
import { fetchStockTotals, startLoading, stopLoading } from '../../actions'
import {
	GET_PRODUCT_VARIANTS,
	IGetProductVariants,
	ISetVariantsNotifications,
	IVariantsState,
	SET_CHECKOUT_PRODUCT,
	SET_PARENT_PRODUCT_STOCK_ACTIVE,
	SET_PARENT_PRODUCT_STOCK_INACTIVE,
	SET_PRODUCT_VARIANT_DETAIL,
	SET_VARIANTS_NOTIFICATIONS,
	UPDATE_PRODUCT_VARIANT_OPTIONS,
} from '../variants.types'
import { setVariationDetail } from './product-variant.actions'
import { checkIsParentProduct, IParentProduct, IProduct, IProductVariant, IUser } from '@kyteapp/kyte-utils'
import { IVariant } from '../variants.types'
import {
	kyteApiRenameVariationOption,
	kyteApiUpdateVariation,
	kyteApiUpdateVariationOption,
	OptionsPayloadUpdate,
} from '../../../services/kyte-backend'
import {
	kyteApiGetProduct,
	kyteApiWebBatchlySetStockActive,
	kyteApiWebUpdateProduct,
	kyteQueryGetProducts,
} from '../../../services'
import { KyteNotificationProps } from '@kyteapp/kyte-ui-components/src/packages/utilities/kyte-notification/KyteNotification'
import { NotificationType } from '@kyteapp/kyte-ui-components/src/packages/enums'
import { toasTimer } from '../../../components/common/KyteNotifications'
import I18n from '../../../i18n/i18n'
import { RootState } from '../../../types/state/RootState'
import { sortVariants } from '../../../util'
import { fetchOneByID, PRODUCT } from '../../../repository'
import { logEvent } from '../../../integrations'
import { getVariations } from './wizard-variation.async.actions'
import { kyteApiWebUpdateProductVariantOptions } from '../../../services/kyte-api-web'

export type EditProductVariantProps = {
	callback?: () => void
	product: IProductVariant
	parentProduct: IParentProduct
}

const VARIANTS_SKU_LIMIT = 100

// TODO: getState: () => RootState

export function editProductVariant({ product, parentProduct, callback }: EditProductVariantProps) {
	async function thunk(dispatch: Dispatch, getState: () => RootState) {
		dispatch(startLoading())

		try {
			await kyteApiWebUpdateProduct(product)
			const getProductVariantsThunk = getProductVariants(parentProduct)

			callback?.()
			dispatch(stopLoading())
			await getProductVariantsThunk(dispatch)
		} catch (error: any) {
			console.error('Error editing product variation:', error)
			const { notifications = [] } = getState().variants ?? {}
			const notification: KyteNotificationProps = {
				title: I18n.t('variants.apiEditError'),
				type: NotificationType.ERROR,
				timer: toasTimer,
			}
			const updatedNotifications = [...notifications, notification]
			dispatch({ type: SET_VARIANTS_NOTIFICATIONS, payload: updatedNotifications })
			dispatch(stopLoading())
			throw error
		}
	}

	return thunk
}

export function getProductVariants(product: IParentProduct, showLoading = true) {
	async function thunk(dispatch: Dispatch) {
		try {
			const { aid, _id: parentId } = product

			if (showLoading) {
				dispatch(startLoading())
			}
			const response = await kyteQueryGetProducts({ aid, params: { parentId, limit: VARIANTS_SKU_LIMIT } })
			const result = response?.data?._products
			const isResultInvalid = !result || !result?.length || !Array.isArray(result)

			if (isResultInvalid) throw new Error()
			const sortedVariants = sortVariants(product, result)

			const successAction: IGetProductVariants = { type: GET_PRODUCT_VARIANTS, payload: sortedVariants }

			dispatch(successAction)
		} catch (error) {
			const errorAction: IGetProductVariants = { type: GET_PRODUCT_VARIANTS, payload: null }
			logEvent('Product Variants List View Error', { error: errorAction })

			dispatch(errorAction)
		} finally {
			if (showLoading) {
				dispatch(stopLoading())
			}
		}
	}

	return thunk
}

export function setParentProductStockActive(params: { product: IParentProduct; user: IUser; active: boolean }) {
	async function thunk(dispatch: Dispatch, getState: () => RootState) {
		const { product, user, active } = params ?? {}

		try {
			dispatch(startLoading())
			const variantsIds: string[] = product.variants
				.map((variant) => variant.id || variant._id)
				.filter((id): id is string => Boolean(id))

			const response = await kyteApiWebBatchlySetStockActive({ productsIds: variantsIds, active, user })
			const successAction = {
				payload: response.data,
				type: active ? SET_PARENT_PRODUCT_STOCK_ACTIVE : SET_PARENT_PRODUCT_STOCK_INACTIVE,
			}

			const getProductVariantsThunk = getProductVariants(product)

			dispatch(successAction)
			dispatch(stopLoading())
			getProductVariantsThunk(dispatch)
			fetchStockTotals()(dispatch, getState)
		} catch (error) {
			const title = active ? 'Error activating product stock' : 'Error deactiving product stock' // TOOD: i18n
			const errorNotification: IVariantsState['notifications'][0] = { title, type: NotificationType.ERROR }
			const notifications = [...(getState().variants?.notifications ?? [])]
			const notificationAction: ISetVariantsNotifications = {
				type: SET_VARIANTS_NOTIFICATIONS,
				payload: [...notifications, errorNotification],
			}

			dispatch(notificationAction)
			dispatch(stopLoading())
		}
	}

	return thunk
}

type TGetProductVariantDetailParams = {
	productId: string
	callback?: (error: any, productVariant?: IParentProduct) => void
}

export function getProductVariantDetail({ productId, callback }: TGetProductVariantDetailParams) {
	async function thunk(dispatch: Dispatch, getState: () => RootState) {
		dispatch(startLoading())

		try {
			const aid: string = getState()?.auth?.user?.aid
			const response = await kyteApiGetProduct({ aid, productId })
			const productVariant = response?.data?.data as IParentProduct

			dispatch({ type: SET_PRODUCT_VARIANT_DETAIL, payload: productVariant })
			callback?.(undefined, productVariant)
			dispatch(stopLoading())

			return productVariant
		} catch (error: any) {
			const { notifications = [] } = getState().variants ?? {}
			const notification: KyteNotificationProps = {
				title: I18n.t('variants.apiDetailError'),
				type: NotificationType.ERROR,
				timer: toasTimer,
			}
			const updatedNotifications = [...notifications, notification]

			dispatch({ type: SET_VARIANTS_NOTIFICATIONS, payload: updatedNotifications })
			callback?.(error)
			dispatch(stopLoading())
		}
	}

	return thunk
}

export function setCheckoutProductWithVariant(product: IParentProduct) {
	async function thunk(dispatch: Dispatch) {
		const realmProduct = fetchOneByID(PRODUCT, product.id)
		const pureProduct: IParentProduct = JSON.parse(JSON.stringify(realmProduct.clone()))
		// Realm schema does not include variant IDs, so we need to ensure each variant has a valid 'id' by using '_id' if necessary.
		const normalizeVariantIds = () => {
			return pureProduct.variants.map((variant) => (!variant?.id ? { ...variant, id: variant._id } : variant))
		}
		const variants = normalizeVariantIds()

		dispatch({ type: SET_CHECKOUT_PRODUCT, payload: { ...pureProduct, variants } })

		try {
			const { aid, _id: parentId } = product

			const response = await kyteQueryGetProducts({ aid, params: { parentId, limit: VARIANTS_SKU_LIMIT } })
			const result = response?.data?._products
			const isResultInvalid = !result || !result?.length || !Array.isArray(result)

			if (isResultInvalid) throw new Error()

			dispatch({ type: SET_CHECKOUT_PRODUCT, payload: { ...pureProduct, variants: result } })

			dispatch(stopLoading())
		} catch (error: any) {
			console.error('Error loading additional product data:', error)
		}
	}

	return thunk
}

export type UpdateVariationProps = {
	variation: IVariant
	callback?: (error?: any, updated?: IVariant) => void
}

export function updateVariationOptions(payload: OptionsPayloadUpdate) {
	async function thunk(_dispatch: Dispatch, getState: () => RootState) {
		const response = await kyteApiUpdateVariationOption(payload)
		let updatedVariation = response.data

		if (!updatedVariation) {
			const currentVariation = getState().variants.variationDetail

			if (currentVariation) {
				const updatedOptions = currentVariation.options.map((opt) => {
					if (opt.title === payload.currentTitle) {
						return { ...opt, title: payload.newTitle }
					}
					return opt
				})

				updatedVariation = { ...currentVariation, options: updatedOptions }
			}
		}

		return updatedVariation
	}
	return thunk
}

export function updateVariation({ variation, callback }: UpdateVariationProps) {
	async function thunk(dispatch: Dispatch, getState: () => RootState) {
		dispatch(startLoading())
		try {
			const response = await kyteApiUpdateVariation(variation)
			const aid: string = getState().auth.aid
			const product: IProduct = getState().products.detail
			const currentProductVariationIndex = checkIsParentProduct(product)
				? product.variations.findIndex((item) => item._id === variation._id)
				: -1
			const shouldUpdateProductDetail = currentProductVariationIndex !== -1

			dispatch(setVariationDetail(response.data))
			dispatch(getVariations(aid, undefined, true) as any)

			if (shouldUpdateProductDetail) {
				const response = await kyteApiGetProduct({ aid, productId: product._id || product.id || '' })
				const updatedProduct = response.data.data as IParentProduct

				dispatch(getProductVariants(updatedProduct) as any)
			}
			dispatch(stopLoading())
			callback?.(undefined, response.data)
		} catch (error: any) {
			dispatch(stopLoading())
			callback?.(error)
		}
	}
	return thunk
}

export type RenameVariationOptionProps = UpdateVariationProps & {
	currentTitle: string
	updatedTitle: string
}

export function renameVariationOption({ variation, currentTitle, updatedTitle, callback }: RenameVariationOptionProps) {
	async function thunk(dispatch: Dispatch, getState: () => RootState) {
		let updatedVariation = { ...variation }

		dispatch(startLoading())
		try {
			await kyteApiRenameVariationOption({ variation, updatedTitle, currentTitle })
			const aid: string = getState().auth.aid
			const product: IProduct = getState().products.detail
			const currentProductVariationIndex = checkIsParentProduct(product)
				? product.variations.findIndex((item) => item._id === variation._id)
				: -1
			const shouldUpdateProductDetail = currentProductVariationIndex !== -1
			const updatedOptions: IVariant['options'] = variation.options.map((option) => {
				const title = option.title === currentTitle ? updatedTitle : option.title
				const updatedOption = { ...option, title }

				return updatedOption
			})
			updatedVariation = { ...variation, options: updatedOptions }

			dispatch(setVariationDetail(updatedVariation))
			dispatch(getVariations(aid, undefined, true) as any)

			if (shouldUpdateProductDetail) {
				const response = await kyteApiGetProduct({ aid, productId: product._id || product.id || '' })
				const updatedProduct = response.data.data as IParentProduct

				dispatch(getProductVariants(updatedProduct) as any)
			}
			dispatch(stopLoading())
			callback?.(undefined, updatedVariation)
		} catch (error: any) {
			dispatch(stopLoading())
			callback?.(error)
		}
	}
	return thunk
}

export type UpdateProductVariantOptionsProps = {
	productId: string
	variations: IVariant[]
	callback?: (error?: any, response?: any) => void
}

export function updateProductVariantOptions({ productId, variations, callback }: UpdateProductVariantOptionsProps) {
	async function thunk(dispatch: Dispatch, getState: () => RootState) {
		dispatch(startLoading())
		try {
			const response = await kyteApiWebUpdateProductVariantOptions({
				productId,
				variations,
			})

			dispatch({
				type: UPDATE_PRODUCT_VARIANT_OPTIONS,
				payload: {
					productId,
					variations,
				},
			})

			dispatch(stopLoading())
			callback?.(undefined, response)
		} catch (error: any) {
			console.error('Error updating product variant options:', error)
			const { notifications = [] } = getState().variants ?? {}
			const notification: KyteNotificationProps = {
				title: 'Error updating variant options',
				type: NotificationType.ERROR,
				timer: toasTimer,
			}
			const updatedNotifications = [...notifications, notification]
			dispatch({ type: SET_VARIANTS_NOTIFICATIONS, payload: updatedNotifications })
			dispatch(stopLoading())
			callback?.(error)
		}
	}
	return thunk
}
