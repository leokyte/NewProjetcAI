import { BILLING_FETCH } from '../actions/types'
import { getPastSubscriptions } from '../../util'

const internalMiddleware = (store) => (next) => (action) => {
	if (!action) return

	if (action.type === BILLING_FETCH && !!action.payload.aid && !action.payload.subscriptionRecovered) {
		getPastSubscriptions(action.payload.aid)
	}

	next(action)
}

export { internalMiddleware }
