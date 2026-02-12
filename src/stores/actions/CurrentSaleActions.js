import {
	CURRENT_SALE_SET_OPENED_SALE,
	CURRENT_SALE_ADD_ITEM,
	CURRENT_SALE_REMOVE_ITEM,
	CURRENT_SALE_RENEW,
	CURRENT_SALE_ADD_CUSTOMER,
	CURRENT_SALE_REMOVE_CUSTOMER,
	CURRENT_SALE_ADD_PAYMENT,
	CURRENT_SALE_REMOVE_PAYMENT,
	CURRENT_SALE_SPLIT_PAYMENT,
	CURRENT_SALE_PAYMENT_RENEW,
	CURRENT_SALE_UPDATE_ITEM,
	CURRENT_SALE_ADD_OBSERVATION,
	CURRENT_SALE_ADD_DESCRIPTION,
	CURRENT_SALE_SET_STATUS,
	CURRENT_SALE_DISCOUNT,
	CURRENT_SALE_RETRIEVE_DATA,
	CURRENT_SALE_SET_TAX,
	CURRENT_SALE_SET_OPTIONAL_TAX,
	CURRENT_SALE_SET_SHIPPING_FEE,
	CURRENT_SALE_SET_IN_SPLIT_PAYMENT,
	CURRENT_SALE_SET_TOTAL_PAY,
	CURRENT_SALE_SET_TOTAL_PAID,
	CURRENT_SALE_RESET_PAID_VALUES,
	CURRENT_SALE_CLEAR_ACCOUNT_PAYMENTS,
	SET_CONCLUSION_STATE,
	CURRENT_SALE_SET,
} from './types'

import { isFeatureAllowed } from "."
import { PaymentType, OrderStatus } from '../../enums'
import { fetchOneByID, CUSTOMER, checkSyncProductStock, update, PRODUCT } from '../../repository'
import { kyteDataProductsStockReview } from '../../services'
import { logError } from '../../integrations'

export const currentSaleSetOpenedSale = (openedSale) => (dispatch) => {
		let _openedSale
		try {
			_openedSale = openedSale.clone()
		} catch (ex) {
			_openedSale = { ...openedSale }
		}

		if (_openedSale.customer) {
			let guestCustomer
			try {
				guestCustomer = { ..._openedSale.customer.clone(), accountBalance: 0 }
			} catch (ex) {
				guestCustomer = { ..._openedSale.customer, accountBalance: 0 }
			}

			const customer = _openedSale.customer.isGuest ? guestCustomer : fetchOneByID(CUSTOMER, _openedSale.customer.id)
			_openedSale = { ..._openedSale, customer: customer || _openedSale.customer }
		}

		dispatch({ type: CURRENT_SALE_SET_OPENED_SALE, payload: _openedSale })
	}

export const currentSaleSet = (sale) => (dispatch) => {
		dispatch({ type: CURRENT_SALE_SET, payload: sale })
	}

export const currentSaleAddValue = (value, description) => (dispatch) => {
		dispatch({
			type: CURRENT_SALE_ADD_ITEM,
			payload: { value, unitValue: value, description, amount: 1 },
		})
	}

export const currentSaleAddProduct = (
	prodId,
	isFractioned,
	value,
	name,
	amount = 1,
	fraction = 1,
	costValue = 0,
	originalUnitValue,
	stockActive = false,
	virtualCurrentStock = null,
	variations = null,
	image = null,
	imagePath = null,
	description = null,
	code = null,
  parentId
) => (dispatch) => {
  const product = {
    prodId,
    name,
    isFractioned,
    unitValue: value,
    costValue: costValue ? Number(costValue.toFixed(2)) : 0,
    originalUnitValue,
    stockActive,
    virtualCurrentStock,
    image,
    imagePath,
    description,
    code,
    variations
  }

    if (parentId) product.parentId = parentId

		dispatch({
			type: CURRENT_SALE_ADD_ITEM,
			payload: {
				product,
				value,
				amount,
				fraction
			},
		})
	}

export const currentSaleRemoveValue = (itemId) => ({
	type: CURRENT_SALE_REMOVE_ITEM,
	payload: itemId,
})

export const currentSaleUpdateItem = (item, discount) => ({
	type: CURRENT_SALE_UPDATE_ITEM,
	payload: { item, discount },
})

export const currentSaleDiscount = (value, type) => (dispatch) => {
		dispatch({ type: CURRENT_SALE_DISCOUNT, payload: { value, type } })
	}

export const currentSaleAddCustomer = ({
	id,
	uid,
	name,
	email,
	phone,
	celPhone,
	address,
	addressComplement,
	image,
	accountBalance,
	allowPayLater,
	observation,
	documentNumber,
}) => (dispatch) =>
		dispatch({
			type: CURRENT_SALE_ADD_CUSTOMER,
			payload: {
				id,
				uid,
				name,
				email,
				phone,
				celPhone,
				address,
				addressComplement,
				image,
				accountBalance,
				allowPayLater,
				observation,
				documentNumber,
			},
		})

export const currentSaleRemoveCustomer = () => ({
	type: CURRENT_SALE_REMOVE_CUSTOMER,
})

export const currentSaleAddPayment =
	(type, description, total, split = false, paymentId = randomize(), transaction, totalPaid) =>
	async (dispatch) => {
		const { receiptDescription } = PaymentType.items[type]
		// "totalPaid" is the exibition value, "total" is the value that'll be saved on [payments]

		const payment = {
			type,
			description,
			total,
			totalPaid: totalPaid || total,
			split,
			paymentId,
			transaction,
			receiptDescription,
		}

		dispatch({ type: CURRENT_SALE_ADD_PAYMENT, payload: payment })
		if (transaction && split) dispatch({ type: CURRENT_SALE_SET_IN_SPLIT_PAYMENT, payload: true })
	}

export const currentSaleSplitPayment = () => ({
	type: CURRENT_SALE_SPLIT_PAYMENT,
})

export const currentSaleRemovePayment = (index) => ({
	type: CURRENT_SALE_REMOVE_PAYMENT,
	payload: index,
})

export const currentSaleSetOptionalTax = (value) => ({
	type: CURRENT_SALE_SET_OPTIONAL_TAX,
	payload: value,
})

export const currentSaleAddObservation = (observation, showObservationInReceipt) => ({
	type: CURRENT_SALE_ADD_OBSERVATION,
	payload: { observation, showObservationInReceipt },
})

export const currentSaleAddDescription = (description) => ({
	type: CURRENT_SALE_ADD_DESCRIPTION,
	payload: description,
})

export const currentSaleSetStatus = (setStatus, prevStatus) => (dispatch, getState) => {
		const { currentSale } = getState()
		const isOrder = currentSale.id
		const defaultStatus = isOrder ? OrderStatus.items[OrderStatus.PAID].status : 'closed'
		const status = setStatus || defaultStatus
		const payload = { status, prevStatus }

		dispatch({ type: CURRENT_SALE_SET_STATUS, payload })

		return { ...currentSale, ...payload }
	}

export const currentSaleSetPaymentLink = (paymentLink) => (dispatch, getState) => {
	const { currentSale } = getState()
	dispatch({ type: CURRENT_SALE_SET, payload: { ...currentSale, paymentLink } })
}

export const currentSaleRenew = (tax) => (dispatch, getState) => {
	const { taxes } = getState()
	const defaultTax = isFeatureAllowed('taxes', getState) ? taxes : []

	dispatch({ type: CURRENT_SALE_RENEW, payload: tax || defaultTax })
	dispatch({ type: SET_CONCLUSION_STATE, payload: false })
}

export const currentSaleSetTax = (tax) => (dispatch) => {
	dispatch({ type: CURRENT_SALE_SET_TAX, payload: [tax] })
	dispatch(currentSaleRenew([tax]))
}

export const currentSalePaymentRenew = () => ({
	type: CURRENT_SALE_PAYMENT_RENEW,
})

export const currentSaleSetTotalPay = (value) => ({
	type: CURRENT_SALE_SET_TOTAL_PAY,
	payload: value,
})
export const currentSaleSetTotalPaid = (value) => ({
	type: CURRENT_SALE_SET_TOTAL_PAID,
	payload: value,
})
export const currentSaleResetPaidValues = () => ({ type: CURRENT_SALE_RESET_PAID_VALUES })

export const currentSaleSetInSplitPayment = (status) => (dispatch) =>
	dispatch({ type: CURRENT_SALE_SET_IN_SPLIT_PAYMENT, payload: status })

export const currentSaleRetrieve = () => (dispatch, getState) => {
	const { common, currentSale } = getState()
	const { isInSplitPayment } = common
	if (isInSplitPayment) {
		dispatch({ type: CURRENT_SALE_RETRIEVE_DATA, payload: currentSale })
	}
}

export const currentSaleClearAccountPayments = () => ({
	type: CURRENT_SALE_CLEAR_ACCOUNT_PAYMENTS,
})

const randomize = () => Math.floor(Math.random() * 10000)

// Duplicated methods 'cause of currentSale one was already in use
// Becomes easiest this way
export const checkCurrentSaleStock =
	(onlyOpened = true, openedOrNotId = false) =>
	(dispatch, getState) => {
		const { currentSale } = getState()
		return checkStockSale(currentSale, onlyOpened, openedOrNotId)
	}

export const checkLastSaleStock =
	(onlyOpened = true, openedOrNotId = false) =>
	(dispatch, getState) => {
		const { lastSale } = getState()
		return checkStockSale(lastSale, onlyOpened, openedOrNotId)
	}

export const checkStockSale = (sale, onlyOpened, openedOrNotId) => {
	// If not opened stock OK
	const OPENED = OrderStatus.items[OrderStatus.OPENED].status
	const isOpened = sale.status === OPENED
	const haveId = !!sale.id

	if (onlyOpened && !isOpened) return true
	if (openedOrNotId && !isOpened && haveId) return true

	// Check stock
	const stockOk = !sale.items.find((item) => !checkSyncProductStock(item))
	return stockOk
}

export const hasActiveShippingFees = () => (dispatch, getState) => {
	// return true;
	const { store } = getState().auth
	const { shippingFees = { active: false, fees: [] } } = store

	// allow if fees are actives
	return shippingFees.active && !!shippingFees.fees.find((f) => f.active)
}

export const applyShippingFee = (newFee) => ({
	type: CURRENT_SALE_SET_SHIPPING_FEE,
	payload: newFee || null,
})

export const currentSaleUpdateCartProductsOnline = () => async (dispatch, getState) => {
	const { currentSale } = getState()
	const { items } = currentSale

	const itemsWithStockControl = items.filter((item) => item.product && item.product.stockActive)
	if (!items || !itemsWithStockControl) return

	try {
		const { data: updatedItems, status } = await kyteDataProductsStockReview(
			itemsWithStockControl.map((i) => ({ _id: i.product.prodId }))
		)
		if (status !== 200) return

		// eslint-disable-next-line no-restricted-syntax
		for (const item of updatedItems) {
			const getItemLocally = fetchOneByID(PRODUCT, item._id)
			// eslint-disable-next-line no-await-in-loop
			await update(PRODUCT, item._id, {
				...getItemLocally.clone(),
				stock: { ...item.stock },
			})
		}

		const allItems = items.map((item) => {
			const searchCurrentItem = updatedItems.find((i) => i._id === item.id)
			if (!searchCurrentItem) return item
			return {
				...searchCurrentItem,
				product: {
					...searchCurrentItem.product,
					virtualCurrentStock: item.stock.current,
				},
				currentStock: item.stock.current,
			}
		})
		dispatch(currentSaleSet({ ...currentSale, items: allItems }))
	} catch (exception) {
		logError(exception, 'APP_CurrentSaleUpdatedCartProductsOnline_Error')
	}
}

export const getCurrentSaleTotalItems = () => (dispatch, getState) => {
	const { currentSale } = getState()
	const { totalItems } = currentSale
	return totalItems
}
