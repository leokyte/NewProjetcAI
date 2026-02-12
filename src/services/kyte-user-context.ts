import { AxiosResponse } from 'axios'
import { apiCdn } from './kyte-api-gateway'
import { IUserContext } from '@kyteapp/kyte-utils'

/**
 * Fetches user context information (business characteristics and active features)
 * @param {string} aid - The account ID
 * @returns {Promise<AxiosResponse<IUserContext>>} A promise that resolves to user context data
 */
export const kyteQueryGetUserContext = async (aid: string): Promise<AxiosResponse<IUserContext>> => {
	return apiCdn.get<IUserContext>('/user-context', {
		params: { aid },
	})
}

