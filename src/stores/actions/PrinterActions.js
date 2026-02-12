import moment from 'moment/min/moment-with-locales'
import * as RNLocalize from 'react-native-localize'

import _ from 'lodash'
import { renderProductVariationsName } from '@kyteapp/kyte-utils'
import I18n from '../../i18n/i18n'

import {
	PRINTER_SET_DEVICE,
	PRINTER_SET_DEVICE_PAPER_TYPE,
	PRINTER_SET_DEVICE_TEXT_SIZE,
	PRINTER_SET_REPEAT_NUMBER,
} from './types'
import { KytePrint } from '../../integrations/Print/KytePrint'
import { currencyFormat, removeAccents, formatStoreInformation, renderShippingValue } from '../../util'
import { PaymentType, CustomerAccountMovementType, CustomerAccountMovementReason } from '../../enums'
import { startLoading, stopLoading } from './CommonActions'

export const setDevice = (id, name, type) => (dispatch) => {
	dispatch({ type: PRINTER_SET_DEVICE, payload: { id, name, type } })
}

export const removeDevice = () => (dispatch) => {
	dispatch({ type: PRINTER_SET_DEVICE, payload: { id: null, name: null, type: null } })
}

export const connectToDevice = () => async (dispatch, getState) => {
	const { id } = getState().printer
	return manager
		.connectToDevice(id, { autoConnect: false })
		.then(async (deviceConnected) => {
			if (deviceConnected) {
				const subscription = deviceConnected.onDisconnected((error, disconnectedDevice) => {
					subscription.remove()
				})
				return manager
					.discoverAllServicesAndCharacteristicsForDevice(deviceConnected.id)
					.then((deviceServices) => deviceServices.services())
			}
			return false
		})
		.catch((bluetoothError) => false)
}

export const disconnectDevice = () => (dispatch, getState) => {
	const { id } = getState().printer
	return manager.isDeviceConnected(id).then((isConnected) => {
		if (isConnected) {
			manager.cancelDeviceConnection(id)
		}
	})
}

export const printerInitialize = () => async (dispatch) => {
	// const printerStorage = await AsyncStorage.getItem('printer');
	// if (printerStorage) {
	//   const printer = JSON.parse(printerStorage);
	//   dispatch({ type: PRINTER_SET_DEVICE, payload: printer });
	// }
}

export const updateDevicePaperType = (paperTypeId) => (dispatch) => {
	dispatch({ type: PRINTER_SET_DEVICE_PAPER_TYPE, payload: { paperTypeId } })
}

export const updateDeviceTextSize = (textSizeId) => (dispatch) => {
	dispatch({ type: PRINTER_SET_DEVICE_TEXT_SIZE, payload: { textSizeId } })
}

export const setPrinterRepeatNumber = () => (dispatch, getState) => {
	const currentRepeatNumber = getState().printer.repeatPrint
	const newRepeatNumber = currentRepeatNumber > 1 ? 1 : 2
	dispatch({ type: PRINTER_SET_REPEAT_NUMBER, payload: newRepeatNumber })
}

const getDeviceInfo = (paperType) => {
	switch (paperType) {
		default:
		case 1:
			return { paperType: '80mm' }
		case 0:
			return { paperType: '58mm' }
	}
}

const formatMoney = (
	value,
	currencySymbol,
	decimalSeparator,
	groupingSeparator,
	decimalCurrency,
	useValueSymbol = false
) => currencyFormat(value, { currencySymbol, decimalSeparator, groupingSeparator }, decimalCurrency, useValueSymbol)

export const printSaleReceipt = (sale, store) => async (dispatch, getState) => {
	const { id, type, paperTypeId, name } = getState().printer
	const { groupingSeparator, decimalSeparator } = getState().preference.account.currency
	let { currencySymbol } = getState().preference.account.currency
	const { decimalCurrency } = getState().preference.account

	const isOrder = sale.status !== 'closed'
	const hasPayments = sale.payments.length > 0
	const showShippingCouponTag = !!sale?.shippingCouponDiscount
	if (currencySymbol.indexOf('$') === -1) {
		currencySymbol = ''
	}

	const kytePrint = new KytePrint(getDeviceInfo(paperTypeId).paperType, id, type, name)
	const generateReceiptText = () => {
		const hasOnlyPayLaterPayment = sale.payments.length === 1 && sale?.payments[0]?.type === PaymentType.PAY_LATER
		if (!isOrder && !hasOnlyPayLaterPayment) return I18n.t('words.s.receipt')
		return ''
	}
	const saleStore = {
		storeName: store.name ? removeAccents(store.name) : '',
		storePhone: store.phone || '',
		receiptText: generateReceiptText(),
		receiptNumber: `#${sale.number}`,
	}

	const itemsQuantity = _.sum(
		sale.items.map((item) => {
			if (item.product) {
				return item.product.isFractioned ? 1 : item.amount
			}
			return item.amount
		})
	)
	const itemsQuantityHeader = `${sale.items.length} ${
		sale.items.length > 1 ? I18n.t('words.p.item') : I18n.t('words.s.item')
	} (${I18n.t('words.s.qty')}: ${itemsQuantity})`
	const receiptItems = sale.items.map((eachItem) => {
		const itemValue = formatMoney(eachItem.value, currencySymbol, decimalSeparator, groupingSeparator, decimalCurrency)
		const hasVariations = eachItem?.product?.variations && eachItem?.product?.variations?.length > 0
		let itemName = I18n.t('words.s.noDescr')
		let itemUnitValue
		if (eachItem.product && eachItem.product.name) {
			itemName = eachItem.product.name
		} else if (eachItem.description) {
			itemName = eachItem.description
		}

		if (eachItem.product) {
			itemUnitValue = eachItem.product.isFractioned
				? `${eachItem.fraction} x ${formatMoney(
						eachItem.unitValue,
						currencySymbol,
						decimalSeparator,
						groupingSeparator,
						decimalCurrency
				  )}`
				: `1 UN x ${formatMoney(
						eachItem.unitValue,
						currencySymbol,
						decimalSeparator,
						groupingSeparator,
						decimalCurrency
				  )}`
		} else if (!eachItem.product) {
			itemUnitValue = `1 UN x ${formatMoney(
				eachItem.unitValue,
				currencySymbol,
				decimalSeparator,
				groupingSeparator,
				decimalCurrency
			)}`
		}

		return {
			quantity: eachItem.product && eachItem.product.isFractioned ? eachItem.fraction : eachItem.amount,
			isFractioned: eachItem.product && eachItem.product.isFractioned,
			name: removeAccents(itemName),
			value: itemValue,
			unitValue: itemUnitValue,
			variations: hasVariations ? renderProductVariationsName(eachItem.product) : null,
			discountValue:
				eachItem.discount && eachItem.discount.discountValue
					? formatMoney(
							eachItem.discount.discountValue,
							currencySymbol,
							decimalSeparator,
							groupingSeparator,
							decimalCurrency
					  )
					: null,
			discountPercent:
				eachItem.discount && eachItem?.discount?.discountPercent ? `${eachItem.discount.discountPercent}%` : null,
		}
	})

	// Receipt subtotal
	const saleTaxes = Array.from(sale.taxes)
	const saleTax = sale.totalTaxes ? saleTaxes[0] : null
	let saleSubtotal
	if (sale.discountPercent || saleTax) {
		const grossValue = formatMoney(
			sale.totalGross,
			currencySymbol,
			decimalSeparator,
			groupingSeparator,
			decimalCurrency
		)
		saleSubtotal = `${I18n.t('words.s.subtotal')}: ${grossValue}`
	}

	// Receipt discount
	let saleDiscount
	if (sale.discountPercent) {
		const discountValue = formatMoney(
			sale.discountValue,
			currencySymbol,
			decimalSeparator,
			groupingSeparator,
			decimalCurrency
		)
		saleDiscount = `${I18n.t('words.s.discount')}: (${sale.discountPercent}%) ${discountValue}`
	}

	// Receipt coupon discount
	let totalCouponDiscount
	if (sale.totalCouponDiscount) {
		const discountValue = formatMoney(
			sale.totalCouponDiscount,
			currencySymbol,
			decimalSeparator,
			groupingSeparator,
			decimalCurrency
		)
		totalCouponDiscount = `${I18n.t('coupons.coupon')} (${
			sale?.appliedCoupon?.code || sale?.appliedCoupon?.name
		}): -${discountValue}`
	}

	// Receipt taxes
	let receiptSaleTax
	if (saleTax && saleTax.type === 'sale-tax') {
		const taxValue = formatMoney(sale.totalTaxes, currencySymbol, decimalSeparator, groupingSeparator, decimalCurrency)
		receiptSaleTax = {
			name: saleTax.name,
			percent: saleTax.percent,
			taxValue,
			typePercentFixed: saleTax.typePercentFixed,
		}
	}

	const receiptSaleShippingFee = () => {
		const { shippingFee, shippingCouponDiscount } = sale
		if (!shippingFee) return false

		return `${I18n.t('words.s.delivery')} (${shippingFee.name}): ${renderShippingValue({
			shippingFee: shippingFee?.value,
			shippingCouponDiscount,
			renderCurrency: (value) =>
				formatMoney(value, currencySymbol, decimalSeparator, groupingSeparator, decimalCurrency),
		})}`
	}

	// Receipt total
	const netValue = formatMoney(sale.totalNet, currencySymbol, decimalSeparator, groupingSeparator, decimalCurrency)
	const receiptTotal = `Total: ${netValue}`

	// Receipt taxes (once again)
	let receiptProductTax
	if (saleTax && saleTax.type === 'product-tax') {
		const taxValue = formatMoney(sale.totalTaxes, currencySymbol, decimalSeparator, groupingSeparator, decimalCurrency)
		receiptProductTax = { name: saleTax.name, percent: saleTax.percent, taxValue, typePercentFixed: null }
	}

	// Receipt payment(s) header
	const salePaymentsHeader = removeAccents(`${I18n.t('receiptPaymentTitle')}:`)

	// Receipt payment(s) item(s)
	const hasPayment = sale && sale.payments && sale.payments.length > 0
	const payments = hasPayment
		? sale.payments.map((eachPayment) => {
				const paymentValue = formatMoney(
					eachPayment.totalPaid || eachPayment.total,
					currencySymbol,
					decimalSeparator,
					groupingSeparator,
					decimalCurrency
				)
				const paymentDescription = removeAccents(eachPayment.receiptDescription || eachPayment.description)
				return `${paymentDescription}: ${paymentValue}`
		  })
		: []
	const salePayments = payments.join(' + ')
	const hasPayLaterPayment = hasPayment
		? sale.payments.find((p) => p.type === PaymentType.PAY_LATER || p.type === PaymentType.ACCOUNT)
		: null

	// Receipt payback
	const salePayback = sale.payBack
		? `${I18n.t('words.s.change')} ${formatMoney(
				sale.payBack,
				currencySymbol,
				decimalSeparator,
				groupingSeparator,
				decimalCurrency
		  )}`
		: null

	// Receipt observations
	const saleObservations = sale.showObservationInReceipt && !!sale.observation ? removeAccents(sale.observation) : null

	// Customer :)
	const saleCustomer = sale.customer
		? {
				name: removeAccents(sale.customer.name),
				celPhone: sale.customer.celPhone || sale.customer.phone || '',
				address: sale.customer.address ? removeAccents(sale.customer.address) : null,
				addressComplement: sale.customer.addressComplement ? removeAccents(sale.customer.addressComplement) : null,
				accountBalance: hasPayLaterPayment
					? `${I18n.t('words.s.balance')}: ${formatMoney(
							sale.customer.accountBalance,
							currencySymbol,
							decimalSeparator,
							groupingSeparator,
							decimalCurrency,
							true
					  )}`
					: null,
		  }
		: null

	// Receipt footer
	const locales = RNLocalize.getLocales()
	moment.locale('en')
	if (
		locales[0].languageTag.includes('es') ||
		locales[0].languageTag.toString().includes('pt') ||
		locales[0].languageTag.toString().includes('en')
	) {
		moment.locale(locales[0].languageTag)
	}

	const saleFooter = {
		footerExtra: store.footerExtra ? removeAccents(store.footerExtra) : null,
		dateCreation: removeAccents(moment(sale.dateCreation).format('LLL')),
	}

	const storeExtra = store.headerExtra ? removeAccents(store.headerExtra) : null
	const storeLabel = formatStoreInformation(store.address, store.addressComplement, storeExtra)

	return new Promise((resolve, reject) => {
		const receipt = {
			saleStore,
			storeLabel,
			itemsQuantityHeader,
			receiptItems,
			saleSubtotal,
			saleDiscount,
			totalCouponDiscount,
			receiptSaleTax,
			receiptSaleShippingFee: receiptSaleShippingFee(),
			receiptTotal,
			receiptProductTax,
			salePaymentsHeader: !isOrder ? salePaymentsHeader : null,
			salePayments: hasPayments ? salePayments : null,
			salePayback: hasPayments && salePayback ? salePayback : null,
			saleObservations,
			saleCustomer,
			saleFooter,
			showShippingCouponTag,
			appliedCoupon: sale?.appliedCoupon,
		}
		kytePrint
			.buildSaleReceipt(receipt)
			.print()
			.then(() => resolve())
			.catch((ex) => reject(ex))
	})
}

export const printCustomerStatements = (customer) => (dispatch, getState) => {
	const { auth, printer, preference } = getState()
	const { store } = auth
	const { id, type, paperTypeId, name } = printer
	const { groupingSeparator, decimalSeparator } = preference.account.currency
	let { currencySymbol } = preference.account.currency
	const { decimalCurrency, currency } = getState().preference.account

	dispatch(startLoading())

	if (currencySymbol.indexOf('$') === -1) {
		currencySymbol = ''
	}

	const locales = RNLocalize.getLocales()
	moment.locale('en')
	if (
		locales[0].languageTag.includes('es') ||
		locales[0].languageTag.toString().includes('pt') ||
		locales[0].languageTag.toString().includes('en')
	) {
		moment.locale(locales[0].languageTag)
	}

	const storeInfo = {
		storeName: store.name ? removeAccents(store.name) : '',
		storePhone: store.phone || '',
		storeHeader: store.headerExtra ? removeAccents(store.headerExtra) : null,
		storeFooter: store.footerExtra ? removeAccents(store.footerExtra) : null,
		dateCreation: removeAccents(moment().format('lll')),
	}

	const accountBalance =
		customer.accountBalance < 0
			? `-${formatMoney(customer.accountBalance, currencySymbol, decimalSeparator, groupingSeparator, decimalCurrency)}`
			: formatMoney(customer.accountBalance, currencySymbol, decimalSeparator, groupingSeparator, decimalCurrency)
	const accountStatements = customer.accountStatements.map((statement) => {
		const isOut = statement.type === CustomerAccountMovementType.items[CustomerAccountMovementType.OUT].type
		const newValue = formatMoney(statement.value, currencySymbol, decimalSeparator, groupingSeparator, decimalCurrency)
		const newCurrent = formatMoney(
			statement.newCurrent,
			currencySymbol,
			decimalSeparator,
			groupingSeparator,
			decimalCurrency
		)
		const reason = CustomerAccountMovementReason.items[statement.reason.toUpperCase()]
		return {
			...statement,
			value: isOut ? `-${newValue}` : `+${newValue}`,
			newCurrent: isOut ? `-${newCurrent}` : `+${newCurrent}`,
			dateCreation: moment(statement.dateCreation).format('L'),
			reason: reason ? removeAccents(reason.title) : '',
		}
	})

	return new Promise((resolve, reject) => {
		const statements = {
			storeInfo,
			customer: { ...customer, accountBalance, accountStatements: accountStatements.splice(0, 10) },
			statementsCount: customer.accountStatements.length,
		}

		const kytePrint = new KytePrint(getDeviceInfo(paperTypeId).paperType, id, type, name)
		kytePrint
			.buildCustomerStatements(statements, currency)
			.print()
			.then(() => {
				dispatch(stopLoading())
				resolve()
			})
			.catch((ex) => {
				dispatch(stopLoading())
				reject(ex)
			})
	})
}
