import axios from 'axios'
import Config from 'react-native-config'

const { APIM_SUBSCRIPTION_KEY } = Config
export const apiGatewayDefaultURL = Config.API_GATEWAY_DEFAULT_URL
export const apiGatewayBaseURL = Config.API_GATEWAY_BASE_URL
export const apiAnalyticsKyteAppURL = Config.API_ANALYTICS_KYTE_APP_URL
export const apiPromotionURL = Config.API_PROMOTION_URL
const apiIntegrationsGatewayDefaultURL = Config.API_INTEGRATIONS_GATEWAY_DEFAULT_URL
const apiAdminServicesGatewayURL = Config.API_ADMIN_SERVICES_GATEWAY_URL
const apiWebGatewayURL = Config.API_WEB_GATEWAY_URL
const apiCdnDefaultURL = Config.API_CDN_BASE_URL

const commonHeaders = {
	'Ocp-Apim-Subscription-Key': APIM_SUBSCRIPTION_KEY,
	'Ocp-Apim-Trace': true,
	'Accept-Version': '1.1.0',
}

export const apiVariantsGateway = axios.create({
	baseURL: apiGatewayDefaultURL.replace('/kyte-app', ''),
	headers: commonHeaders,
	timeout: 30000,
})

export const apiGateway = axios.create({
	baseURL: apiGatewayDefaultURL,
	headers: commonHeaders,
	timeout: 30000,
})

export const apiIntegrationsGateway = axios.create({
	baseURL: apiIntegrationsGatewayDefaultURL,
	headers: commonHeaders,
	timeout: 30000,
})

export const apiAnalyticsKyteApp = axios.create({
	baseURL: apiAnalyticsKyteAppURL,
	headers: {
		...commonHeaders,
		'Content-Type': 'application/json',
	},
})

export const apiAttribution = axios.create({
	baseURL: apiGatewayBaseURL,
	headers: {
		...commonHeaders,
		'Content-Type': 'application/json',
	},
})

export const apiAdminServices = axios.create({
	baseURL: apiAdminServicesGatewayURL,
	headers: {
		'Ocp-Apim-Subscription-Key': APIM_SUBSCRIPTION_KEY,
		'Ocp-Apim-Trace': true,
	},
	timeout: 15000,
})

export const apiWebGateway = axios.create({
	baseURL: apiWebGatewayURL,
	headers: {
		'Ocp-Apim-Subscription-Key': APIM_SUBSCRIPTION_KEY,
		'Ocp-Apim-Trace': true,
	},
	timeout: 30000,
})

export const apiCdn = axios.create({
	baseURL: apiCdnDefaultURL,
	headers: {
		...commonHeaders,
	},
	timeout: 30000,
})

export const apiPromotionGateway = axios.create({
	baseURL: apiPromotionURL,
	headers: {
		'Ocp-Apim-Subscription-Key': APIM_SUBSCRIPTION_KEY,
	},
	timeout: 30000,
})
