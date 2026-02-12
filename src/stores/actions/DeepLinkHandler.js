import _ from 'lodash'
import { LinkingMap } from '../../enums'
import { decodeURLParams } from '../../util'
import NavigationService from '../../services/kyte-navigation'
import { mercadoPagoIncomingPayment, toggleBillingMessage, startLoading } from '.'

const KyteDeepLinkHandler = (url) => (dispatch) => {
	const handleMercadoPago = ({
		amount,
		installments,
		card_type,
		payment_id,
		is_split,
		result_status,
		error_detail,
		type,
		customerAccountPaymentType,
		customerAccountReason,
	}) => {
		const paymentData = {
			amount,
			installments,
			card_type,
			payment_id,
			is_split,
			result_status,
			error_detail,
			type,
			customerAccountPaymentType,
			customerAccountReason,
		}
		dispatch(startLoading())
		dispatch(mercadoPagoIncomingPayment(paymentData))
	}

	const action = url.replace(/\/$/, '').split('/').pop().split('?').shift()
	const findAction = _.find(LinkingMap.items, (item) => item.key === action || _.startsWith(action, item.key))

	if (!findAction) return

	if (findAction.key === LinkingMap.items[LinkingMap.MERCADOPAGO_PAYMENT].key) {
		handleMercadoPago(decodeURLParams(url))
		return
	}
	if (
		findAction.key === LinkingMap.items[LinkingMap.CONFIRM_ACCOUNT].key ||
		findAction.key === LinkingMap.items[LinkingMap.ACCOUNT_CONFIRMED].key
	) {
		const { stack, route } = findAction.routes
		NavigationService.reset(stack, route, { origin: 'default' })
		return
	}
	dispatch(toggleBillingMessage(false))
}

export { KyteDeepLinkHandler }
