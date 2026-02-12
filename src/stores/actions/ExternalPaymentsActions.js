import {
	EXTERNAL_PAYMENTS_ADD_GATEWAY,
	EXTERNAL_PAYMENTS_CLEAR_GATEWAYS,
	EXTERNAL_PAYMENTS_SET_UP,
	EXTERNAL_PAYMENTS_SERVICE_TYPE,
	EXTERNAL_PAYMENTS_COUNTRY_FEES,
} from './types'

export const updatePaymentGateways = () => (dispatch, getState) => {
	const { checkoutGateways: storeGateways } = getState().auth.store

	dispatch({ type: EXTERNAL_PAYMENTS_CLEAR_GATEWAYS })
	if (!storeGateways) return
	storeGateways.forEach((gateway) => {
		dispatch({ type: EXTERNAL_PAYMENTS_ADD_GATEWAY, payload: gateway })
		dispatch({ type: EXTERNAL_PAYMENTS_SET_UP })
	})
}

export const setCheckoutGatewayServiceType = (gatewayServiceType) => (dispatch) => {
	dispatch({ type: EXTERNAL_PAYMENTS_SERVICE_TYPE, payload: gatewayServiceType })
}

export const setCountryFees = (countryFees) => (dispatch) => {
	dispatch({ type: EXTERNAL_PAYMENTS_COUNTRY_FEES, payload: countryFees })
}
