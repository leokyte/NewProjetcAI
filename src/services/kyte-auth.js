import axios from 'axios'
import Config from 'react-native-config'
import { AuthTokenScopeEnum } from '../enums/AuthTokenScope'

const { APIM_SUBSCRIPTION_KEY, KYTE_AUTH_API, KYTE_ADMIN_API } = Config
const headers = {
	'Ocp-Apim-Subscription-Key': APIM_SUBSCRIPTION_KEY,
	'Ocp-Apim-Trace': true,
	'Accept-Version': '1.1.0',
}

const authAPI = axios.create({
	baseURL: KYTE_AUTH_API,
	headers,
	timeout: 30000,
})

const adminAPI = axios.create({
	baseURL: KYTE_ADMIN_API,
	headers,
	timeout: 30000,
})

/**
 *
 * @param {string} token
 * @param {boolean} cancelToken
 * @returns {Promise<{ uid: string }>}
 */
export const getUserByToken = async (token, cancelToken) => {
	const URL = `/get-user-by-token`
	const scope = [AuthTokenScopeEnum.PREFERENCES, AuthTokenScopeEnum.BILLING, AuthTokenScopeEnum.STORE]

	const { data } = await authAPI.post(URL, { token, cancelToken, scope })
	return data
}

/**
 * Fetches data from clipboard API using the provided ID.
 * @async
 * @function getTokenFromClipboard
 * @param {string} id - ID extracted from userAgent.
 * @returns {Promise<{
 *   confirm: boolean,
 *   payload: {
 *     _id: string,
 *     accessToken: string,
 *     createdAt: string,
 *     expireDate: string
 *   }
 * }>} Response object
 */
export const getTokenFromClipboard = async (id) => {
	const URL = `/clipboard?id=${id}`
	const { data } = await adminAPI.post(URL)

	return data
}
