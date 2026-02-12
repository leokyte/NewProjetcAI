import { apiGateway, apiGatewayWeb } from './kyte-api-gateway'

export const kyteStatisticGetData = (aid, startDate, endDate, timezone) =>
	apiGateway.get(`/stats/${aid}/${startDate}/${endDate}/${timezone || ''}`)

export const kyteGenerateSalesTotals = (queryString) => apiGateway.get(`/stats/sale/total?${queryString}`)
