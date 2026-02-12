import { constants } from '@kyteapp/react-native-locale'
import { PREFERENCES_FETCH, LOGOUT } from '../actions/types'
import { CoreAction, OrderStatus } from '../../enums'

const INITIAL_STATE = {
	account: {
		countryCode: constants()?.countryCode,
		currency: constants(),
		showCanceledSales: true,
		decimalCurrency: true,
		checkoutSort: 'dateCreation', // enum [ dateCreation, name ]
		allowPayLater: true,
		salesStatus: OrderStatus.items.slice(5),
		coreActions: [],
	},
}

export default (state = INITIAL_STATE, action) => {
	switch (action.type) {
		case PREFERENCES_FETCH: {
			return { account: { ...INITIAL_STATE.account, ...action.payload } }
		}
		case LOGOUT:
			return INITIAL_STATE
		default:
			return state
	}
}
