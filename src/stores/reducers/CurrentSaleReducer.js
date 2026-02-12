import _ from 'lodash'

import {
	addNewItem,
	updateItem,
	removeItem,
	updateTotals,
	updateDiscount,
	updateItemsProfit,
	buildItem,
} from '../_business'
import {
	CURRENT_SALE_SET_OPENED_SALE,
	CURRENT_SALE_ADD_ITEM,
	CURRENT_SALE_DISCOUNT,
	CURRENT_SALE_REMOVE_ITEM,
	CURRENT_SALE_RENEW,
	CURRENT_SALE_ADD_CUSTOMER,
	CURRENT_SALE_REMOVE_CUSTOMER,
	CURRENT_SALE_ADD_PAYMENT,
	CURRENT_SALE_REMOVE_PAYMENT,
	CURRENT_SALE_PAYMENT_RENEW,
	CURRENT_SALE_SPLIT_PAYMENT,
	CURRENT_SALE_UPDATE_ITEM,
	CURRENT_SALE_ADD_OBSERVATION,
	CURRENT_SALE_ADD_DESCRIPTION,
	CURRENT_SALE_SET_STATUS,
	CURRENT_SALE_RETRIEVE_DATA,
	CURRENT_SALE_SET_TAX,
	CURRENT_SALE_SET_OPTIONAL_TAX,
	CURRENT_SALE_SET_SHIPPING_FEE,
	CURRENT_SALE_SET_TOTAL_PAY,
	CURRENT_SALE_SET_TOTAL_PAID,
	CURRENT_SALE_RESET_PAID_VALUES,
	CURRENT_SALE_CLEAR_ACCOUNT_PAYMENTS,
	CURRENT_SALE_SET,
	TAXES_FETCH,
	TAXES_CLEAR,
	LOGOUT,
} from '../actions/types'
import { SaleOrigin, PaymentType } from '../../enums'

const InitialState = {
	totalNet: 0,
	totalGross: 0,
	totalPay: 0,
	payBack: 0,
	totalSplit: 0,
	paymentRemaining: 0,
	discountValue: 0,
	discountPercent: 0,
	discountType: null,
	taxes: [],
	items: [],
	totalItems: 0,
	totalProfit: 0,
	totalTaxes: 0,
	useSaleTaxes: true,
	payments: [],
	observation: '',
	showObservationInReceipt: true,
	description: '',
	did: '',
	statusInfo: {},
}

const generateDiscount = (state) => {
	const { discountType, discountValue, discountPercent } = state
	const value = discountType === 'percent' ? discountPercent : discountValue
	return { value, type: discountType }
}

export default (state = InitialState, action) => {
	switch (action.type) {
		case CURRENT_SALE_ADD_ITEM: {
			const items = addNewItem(state.items, action.payload)
			const totals = updateTotals({
				items,
				taxes: state.taxes,
				useSaleTaxes: state.useSaleTaxes,
				shippingFee: state.shippingFee,
			})

			return { ...state, ...totals, items }
		}
		case CURRENT_SALE_REMOVE_ITEM: {
			const items = removeItem(state.items, action.payload)
			const updatedItems = updateItemsProfit(items, 0)
			const totals = updateTotals({
				items: updatedItems,
				taxes: state.taxes,
				useSaleTaxes: state.useSaleTaxes,
				shippingFee: state.shippingFee,
			})

			return { ...state, ...totals, items: updatedItems }
		}
		case CURRENT_SALE_UPDATE_ITEM: {
			const { item, discount } = action.payload
			const items = updateItem(state.items, { ...item, discount })
			const totals = updateTotals({
				items,
				taxes: state.taxes,
				useSaleTaxes: state.useSaleTaxes,
				shippingFee: state.shippingFee,
			})

			return { ...state, ...totals, items }
		}
		case CURRENT_SALE_DISCOUNT: {
			const newDiscount = updateDiscount(state.totalGross, action.payload)
			const updatedItems = updateItemsProfit(state.items, newDiscount.discountPercent)
			const totals = updateTotals({
				items: updatedItems,
				taxes: state.taxes,
				useSaleTaxes: state.useSaleTaxes,
				discount: action.payload,
				shippingFee: state.shippingFee,
			})

			return { ...state, ...newDiscount, ...totals, items: updatedItems }
		}
		case CURRENT_SALE_SET_OPTIONAL_TAX: {
			const discount = generateDiscount(state)

			const totals = updateTotals({
				items: state.items,
				taxes: state.taxes,
				useSaleTaxes: action.payload,
				discount,
				shippingFee: state.shippingFee,
			})
			return { ...state, ...totals, useSaleTaxes: action.payload }
		}
		case CURRENT_SALE_SET_SHIPPING_FEE: {
			const discount = generateDiscount(state)

			// Set toDeliver
			const toDeliver = !!action.payload

			const totals = updateTotals({
				items: state.items,
				taxes: state.taxes,
				useSaleTaxes: state.useSaleTaxes,
				discount,
				shippingFee: action.payload,
			})
			return { ...state, ...totals, shippingFee: action.payload, toDeliver }
		}
		case CURRENT_SALE_SET_OPENED_SALE: {
			const sale = action.payload

			const { discountPercent, totalPay } = sale
			const discount = generateDiscount(sale)

			const getSaleItems = () => {
				let saleItems
				try {
					saleItems = sale.items.map((item) => item.clone())
				} catch (ex) {
					saleItems = sale.items.map((item) => ({ ...item }))
				}
				return saleItems
			}

			const saleItems = getSaleItems()
			const items = saleItems.map((item) => buildItem(undefined, item, saleItems))
			const updatedItems = updateItemsProfit(items, discountPercent)

			const isCatalog = sale.origin === SaleOrigin.CATALOG
			const taxes = isCatalog ? [...sale.taxes] : state.taxes
			const useSaleTaxes = sale.totalTaxes

			const totals = updateTotals({
				items: updatedItems,
				taxes,
				useSaleTaxes,
				discount,
				totalPay,
				shippingFee: sale.shippingFee,
				totalCouponDiscount: sale?.totalCouponDiscount || 0,
				shippingCouponDiscount: sale?.shippingCouponDiscount || 0 
			})
			return {
				...sale,
				...totals,
				items: updatedItems,
				taxes,
				useSaleTaxes,
				statusInfo: sale.statusInfo || {},
			}
		}
		case CURRENT_SALE_ADD_PAYMENT: {
			const { total, totalPaid, type, split } = action.payload
			const isMoney = type === 0
			const payBack = totalPaid - state.totalNet
			const splitPayBack = state.totalSplit + total - state.totalNet

			const singlePayment = [action.payload]
			const splitPayment = () => [
				...state.payments,
				{ ...action.payload, total: splitPayBack > 0 ? state.paymentRemaining : total },
			]

			return {
				...state,
				totalPay: isMoney ? totalPaid : total,
				payBack,
				payments: split ? splitPayment() : singlePayment,
			}
		}
		case CURRENT_SALE_SPLIT_PAYMENT: {
			const totalSplit = parseFloat(_.sumBy(state.payments, (o) => o.totalPaid).toFixed(2))
			const totalRemaining = parseFloat((state.totalNet - totalSplit).toFixed(2))
			const paymentRemaining = totalSplit ? totalRemaining : state.totalNet
			const payBack = totalSplit > state.totalNet ? Math.abs(paymentRemaining) : 0
			const totalPay = totalSplit > state.totalNet ? totalSplit : state.totalNet

			return { ...state, totalSplit, payBack, totalPay, paymentRemaining }
		}
		case CURRENT_SALE_SET_TOTAL_PAY: {
			const setPayBack = action.payload > state.totalNet

			return {
				...state,
				totalPay: action.payload,
				payBack: setPayBack ? action.payload - state.totalNet : 0,
			}
		}
		case CURRENT_SALE_SET_TOTAL_PAID: {
			return {
				...state,
				payments: [{ ...state.payments[0], totalPaid: action.payload }],
			}
		}
		case CURRENT_SALE_RESET_PAID_VALUES: {
			return { ...state, paymentRemaining: 0, totalPay: 0, totalSplit: 0, payBack: 0 }
		}
		case CURRENT_SALE_SET: {
			return action.payload
		}
		case CURRENT_SALE_ADD_CUSTOMER: {
			return { ...state, customer: { ...action.payload } }
		}
		case CURRENT_SALE_REMOVE_CUSTOMER: {
			return { ...state, customer: null }
		}
		case CURRENT_SALE_CLEAR_ACCOUNT_PAYMENTS: {
			const acountPayment = PaymentType.items[PaymentType.ACCOUNT]
			const payLaterPayment = PaymentType.items[PaymentType.PAY_LATER]
			const filteredPayment = state.payments.filter(
				(p) => p.type !== acountPayment.type && p.type !== payLaterPayment.type
			)

			return { ...state, payments: filteredPayment }
		}
		case CURRENT_SALE_REMOVE_PAYMENT: {
			const filter = [...state.payments.filter((payment) => payment.paymentId !== action.payload)]
			const buildPayments = filter.map((p) => ({ ...p, total: p.totalPaid }))

			return { ...state, payments: action.payload ? buildPayments : [] }
		}
		case CURRENT_SALE_ADD_OBSERVATION: {
			return {
				...state,
				observation: action.payload.observation,
				showObservationInReceipt: action.payload.showObservationInReceipt,
			}
		}
		case CURRENT_SALE_ADD_DESCRIPTION: {
			return { ...state, description: action.payload }
		}
		case CURRENT_SALE_SET_STATUS: {
			const { status, prevStatus } = action.payload
			return { ...state, status, prevStatus }
		}
		case CURRENT_SALE_SET_TAX: {
			return { ...state, taxes: [action.payload] }
		}
		case TAXES_FETCH: {
			return { ...state, taxes: action.payload }
		}
		case TAXES_CLEAR: {
			return { ...state, taxes: [] }
		}
		case CURRENT_SALE_RENEW: {
			return { ...InitialState, taxes: action.payload }
		}

		case CURRENT_SALE_PAYMENT_RENEW:
			return { ...state, payments: [] }
		case CURRENT_SALE_RETRIEVE_DATA: {
			return { ...action.payload }
		}
		case LOGOUT: {
			return { ...InitialState }
		}
		default:
			return state
	}
}
