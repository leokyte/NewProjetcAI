import { apiAdminServices } from './kyte-api-gateway'

// eslint-disable-next-line import/prefer-default-export
export const kyteAdminFetchSample = async (aid) => {
	const { data } = (await apiAdminServices.get(`/sample?aid=${aid}&event=AccountCreate`)) ?? {}

	return data
}
