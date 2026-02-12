import axios, { AxiosResponse } from 'axios'
import Config from 'react-native-config'
import { IVariant } from '../stores/variants/variants.types'
import { IProduct, IProductWithVariation } from '@kyteapp/kyte-utils'

const { APIM_SUBSCRIPTION_KEY, API_ANALYTICS_KYTE_APP_URL: BACKEND_API_KYTE_URL } = Config
const headers = {
	'Ocp-Apim-Subscription-Key': APIM_SUBSCRIPTION_KEY,
	'Ocp-Apim-Trace': true,
	'Accept-Version': '1.1.0',
}

// TO-DO: Replace with the actual backend API URL
const backendAPI = axios.create({
	baseURL: BACKEND_API_KYTE_URL,
	headers,
	timeout: 35000,
})

export const kyteApiCreateVariation = (variant: IVariant): Promise<AxiosResponse<IVariant>> =>
	backendAPI.post('/variation/create', variant)

export const kyteApiUpdateVariation = async (variation: IVariant): Promise<{ data: IVariant }> => {
	const response = await backendAPI.put('/variation', variation)
	const updatedVariant = response.data?.id ? response.data : variation

	return { data: updatedVariant }
}

export type OptionsPayloadUpdate = {
	aid: string
	currentTitle: string
	newTitle: string
	variationId: string
}

export const kyteApiUpdateVariationOption = async (
	payload: OptionsPayloadUpdate
): Promise<{ data: IVariant | undefined }> => {
	const makeUrl = (variationId: string) => `/variation/${variationId}/option`
	const response = await backendAPI.put(makeUrl(payload.variationId), payload)

	const responseData = response.data ?? undefined

	return { data: responseData }
}

type TkyteApiRenameVariationOptionParams = { variation: IVariant; currentTitle: string; updatedTitle: string }
export const kyteApiRenameVariationOption = async ({
	variation,
	currentTitle,
	updatedTitle,
}: TkyteApiRenameVariationOptionParams): Promise<{ data: string }> => {
	const variationId = variation._id || variation.id
	const url = `/variation/${variationId}/option`
	const body = { aid: variation.aid, variationId, currentTitle, newTitle: updatedTitle }
	const response = await backendAPI.put(url, body)

	return response?.data
}

export const kyteApiGenerateSKUs = async (
	variations: IVariant[],
	product: Partial<IProduct>,
	aid: string
): Promise<IProductWithVariation[]> => {
	const response = await backendAPI.post(`/product/${aid}/variants/save`, { variations, product })
	return response?.data
}

export const kyteApiPersistSKUS = async (
	variants: IProductWithVariation[],
	product: IProductWithVariation,
	aid: string
): Promise<AxiosResponse<{ product: IProductWithVariation; variants: IProductWithVariation[] }>> =>
	backendAPI.post(`product/variants/persist/${aid}`, { variants, product })

export const kyteApiGetVariations = async (aid: string): Promise<AxiosResponse<IVariant[]>> =>
	backendAPI.get(`/variation/list/${aid}`)
