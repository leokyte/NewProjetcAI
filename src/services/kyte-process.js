import { apiGateway, apiAnalyticsKyteApp, apiAttribution } from './kyte-api-gateway'

export const kyteCustomerAccountEdit = (balance) => apiGateway.post('/customer-account-add', balance)
export const kyteCustomerAccountStatementsCancel = (statement) => apiGateway.post('/customer-account-cancel', statement)
export const kyteDataClearData = (aid, deviceId) => apiGateway.get(`/clear-data/${aid}/${deviceId}`)
export const kyteSetAttribution = (payload) => apiAttribution.post('/attribution-save', payload)
