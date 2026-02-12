import { AxiosResponse } from 'axios'
import { apiGateway, apiVariantsGateway, apiCdn, apiWebGateway } from './kyte-api-gateway'
import {
	BatchOperationsEnum,
	ICategory,
	IParentProduct,
	IProduct,
	IUser,
} from '@kyteapp/kyte-utils'
import { IVariant } from '../stores/variants/variants.types'
import { Purchase } from 'react-native-iap'

export const kyteApiWebUpdateProduct = (product: IProduct): Promise<AxiosResponse> =>
	apiGateway.put('/product', product, {
		headers: {
			uid: product.uid,
		},
	})

export const kyteApiWebUpdateCategory = (category: ICategory): Promise<AxiosResponse> =>
	apiGateway.put('/category', category, {
		headers: {
			uid: category.uid,
		},
	})

export const kyteApiGetProduct = async ({
	aid,
	productId,
}: {
	productId: string
	aid: string
}): Promise<AxiosResponse<{ data: IProduct }>> => {
	return apiGateway.get(`/products/${aid}/get/${productId}`)
}

export type TkyteApiWebBatchlySetStockActive = {
	productsIds: string[]
	active: boolean
	user: IUser
}

type TBatchAPIPayload = {
	inclusionList: string[] | 'all'
	exclusionList?: string[]
	operation: BatchOperationsEnum
	payload?: Object
	filters?: Object | null
}

export const kyteApiWebBatchlySetStockActive = (params: TkyteApiWebBatchlySetStockActive) => {
	const { productsIds, active, user } = params
	const { aid, uid, displayName: userName } = user
	const url = `/product/batch/${aid}`
	const operation: BatchOperationsEnum = active ? BatchOperationsEnum.ENABLE_STOCK : BatchOperationsEnum.DISABLE_STOCK
	const payload = operation === BatchOperationsEnum.DISABLE_STOCK ? { uid, userName } : undefined
	const body: TBatchAPIPayload = { inclusionList: productsIds, operation, payload, exclusionList: [], filters: null }
	const headers = { uid }

	return apiGateway.put(url, body, { headers })
}

type TGenerateDescriptionParams = {
	aid: string
	language: string
	product: { name: string; category?: string; description?: string }
	store?: { name?: string; description?: string }
}
/**
 * Query AI to suggest a product description
 * @param {Object} params - The parameters for the AI description generation
 * @param {string} params.aid - The account ID
 * @param {Object} params.product - The partial product data
 * @param {string} params.product.name - The name of the product
 * @param {string} params.product.category - The category of the product (optional)
 * @param {string} params.product.description - The current description of the product (optional)
 * @param {Object} params.store - The store information
 * @param {string} params.store.name - The name of the store (optional)
 * @param {string} params.store.description - The description of the store (optional)
 * @param {string} params.language - The language for the description
 * @returns {Promise<string>} The AI generated description
 */
export const kyteApiWebQueryAISuggestDescription = async (params: TGenerateDescriptionParams) => {
	const response = await apiGateway.post<string>('/product/generate/description', params)

	return response.data
}

type TRemoveProductVariationsParams = {
	user: IUser
	product: IParentProduct
}

export const kyteApiWebRemoveProductVariations = async (params: TRemoveProductVariationsParams) => {
	const { user, product } = params ?? {}
	const { aid, uid } = user
	const url = `/product/batch/${aid}`
	const variantIds = product.variants.map((variant) => String(variant._id || variant.id || ''))
	const body: TBatchAPIPayload = {
		inclusionList: variantIds,
		operation: BatchOperationsEnum.DELETE,
	}
	const headers = { uid }
	const response = await apiGateway.put(url, body, { headers })

	return response.data
}

type TUpdateProductVariantOptionsParams = {
	productId: string
	variations: IVariant[]
}

export const kyteApiWebUpdateProductVariantOptions = async (params: TUpdateProductVariantOptionsParams) => {
	const { productId, variations } = params
	const url = `/backend/product/${productId}/variants`
	const body = { variations }
	const response = await apiVariantsGateway.put(url, body)

	return response.data
}

type TGenerateProductFromImageParams = {
	aid: string
	uid: string
	imageUrl: string
	language: string
	store?: {
		name?: string
		description?: string
	}
	productDescription?: string
	saleCostPrice?: string
	tag?: string
}

type TGenerateProductFromImageResponse = {
	product: Partial<IProduct>
	confidenceLevelName: number
}

/**
 * Query AI to generate product data from image
 * @param {Object} params - The parameters for the AI product generation
 * @param {string} params.aid - The account ID
 * @param {string} params.imageUrl - The image URL or base64 string
 * @param {string} params.language - The language for the generation
 * @param {Object} params.store - The store information (optional)
 * @param {string} params.store.name - The name of the store (optional)
 * @param {string} params.store.description - The description of the store (optional)
 * @param {string} params.productDescription - Current product description (optional)
 * @param {string} params.saleCostPrice - Current product cost price (optional)
 * @param {string} params.tag - Tag to identify the source (optional)
 * @returns {Promise<TGenerateProductFromImageResponse>} The AI generated product data
 */
export const kyteApiWebQueryAIProductFromImage = async (
	params: TGenerateProductFromImageParams
): Promise<TGenerateProductFromImageResponse> => {
	const headers = { uid: params.uid }
	const response = await apiWebGateway.post<TGenerateProductFromImageResponse>('/product/generate/data', params, { headers })

	return response.data
}

export const kyteApiRegisterInAppPurchase = async ({
	aid,
	currentPurchase,
	availablePurchases,
}: {
	aid: string
	currentPurchase?: Purchase
	availablePurchases?: Purchase[]
}): Promise<AxiosResponse<{ confirm: boolean; message?: string }>> => {
	return apiCdn.post('/subscription/inapp-purchase-registration', { aid, currentPurchase, availablePurchases })
}
