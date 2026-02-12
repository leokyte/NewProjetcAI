/* eslint-disable no-param-reassign */
import _ from 'lodash'
import moment from 'moment/min/moment-with-locales'
import xregexp from 'xregexp'

import { renderProductVariationsName } from '@kyteapp/kyte-utils'
import { CUSTOMER, fetchOneByID, next, SALE } from '../repository'
import { OrderStatus } from '../enums'
import I18n from '../i18n/i18n'
import { SalesTypeEnum } from '../enums/SaleSort'
import { setTimeline } from '../repository/saleRepository'

export const updateVirtualStock = (prevStatus, status) => {
	if (status === 'opened') return false
	if (prevStatus === 'confirmed' && status === 'closed') return false
	if (prevStatus === status) return false
	return true
}

export const getCustomerUid = (sale, getState) => {
	const customer = getState().customers.detail
	let saleCustomer
	try {
		saleCustomer = sale.customer.clone()
	} catch (ex) {
		saleCustomer = sale.customer
	}

	// Retornando apenas o customer em pedidos pelo Guest
	if (sale.customer.isGuest) return { ...saleCustomer }

	const modelCustomer = saleCustomer.uid ? { ...saleCustomer } : fetchOneByID(CUSTOMER, saleCustomer.id)

	if (customer.id) {
		modelCustomer.accountBalance = customer.manageCustomerAccount.newBalance || 0
		modelCustomer.previousAccountBalance = customer.manageCustomerAccount.actualBalance || 0
	}

	return {
		...saleCustomer,
		uid: modelCustomer.uid,
		accountBalance: modelCustomer.accountBalance,
		previousAccountBalance: modelCustomer.previousAccountBalance,
	}
}

export const getStatusInfo = (getState, status) => {
	const { salesStatus } = getState().preference.account
	const { defaultStatus } = getState().sales.filterOrders
	const statusList = [...defaultStatus, ...salesStatus]

	return statusList.find((s) => s.status === status) || { status }
}

export const manageOrderStatus = (currentStatus, newStatus) => {
	const opened = OrderStatus.items[OrderStatus.OPENED].status
	const confirmed = OrderStatus.items[OrderStatus.CONFIRMED].status
	const paid = OrderStatus.items[OrderStatus.PAID].status
	const awaitingPayment = OrderStatus.items[OrderStatus.AWAITING_PAYMENT].status
	const closed = 'closed'

	// Check if the new status is one of the relevant status
	const relevantStatus = [opened, confirmed, paid, awaitingPayment, closed]
	const changeStatus = relevantStatus.some((s) => s === newStatus)

	return changeStatus ? newStatus : currentStatus
}

export const setOrderIcon = (statusName, isCancelled) => {
	const paid = OrderStatus.items[OrderStatus.PAID].status
	const opened = OrderStatus.items[OrderStatus.OPENED].status
	const awaitingPayment = OrderStatus.items[OrderStatus.AWAITING_PAYMENT].status
	const dollarSign = (s) => s === paid || s === awaitingPayment

	if (isCancelled) return 'cancel-sale'
	if (statusName === opened) return 'clock-stroke-small'
	if (dollarSign(statusName)) return 'dollar-sign'
	return 'clock-small'
}

export const groupSalesDailyTotals = (salesList, status) => {
	const checkStatus = status || []
	const isClosed = checkStatus.find((s) => s === 'closed')
	const dateGroup = isClosed ? 'dateClosedInt' : 'dateCreationInt'
	const dateView = isClosed ? 'dateClosed' : 'dateCreation'
	const group = _(salesList)
		.groupBy(dateGroup)
		.map((sales, key, i) => {
			const index = 0
			const salesActives = _.filter(sales, (s) => !s.isCancelled)
			const order = _.orderBy(sales, [dateView], ['desc'])
			const lastIndex = order[index].id

			return {
				date: moment(order[index][dateView]).startOf('d').toDate(),
				amount: salesActives.length,
				total: parseFloat(_.sumBy(salesActives, (s) => s.totalNet).toFixed(2)),
				dateInt: order[index][dateGroup],
				lastIndex,
			}
		})
		.orderBy(['date'], ['desc'])
		.value()

	return group
}

export const updateItemAtIndex = (salesList, saleIndex, sale) => {
	salesList[saleIndex] = { ...salesList[saleIndex], sale }
	return salesList
}

export const updateSalesListItem = (updatedSale, salesListGroups = []) => {
	const updatedList = salesListGroups.map((group) => {
		const { sale } = group
		if (sale?.id !== updatedSale?.id) return group
		return { ...group, sale: updatedSale }
	})

	return updatedList
}

export const createSalesListItem = (salesList, dailyTotals) =>
	salesList.map((item) => {
		const sale = item.sale || item
		const dateView = sale.status === 'closed' ? 'dateClosedInt' : 'dateCreationInt'
		const dailyTotal = dailyTotals.find((t) => t.dateInt === sale[dateView]) || {}
		const isLast = dailyTotal.lastIndex === sale.id

		return { sale, dailyTotal, isLast, id: sale.id }
	})

export const formatSalesDateInts = (salesList) => {
	// Formating sales dateInt to local dates (moment)
	const formatedList = salesList.map((sale) => ({
			...sale.clone(),
			dateCreationInt: parseInt(moment(sale.dateCreation).format('YYYYMMDD'), 10),
			dateClosedInt: sale.dateClosed ? parseInt(moment(sale.dateClosed).format('YYYYMMDD'), 10) : null,
		}))

	return formatedList
}

export const getSalesTotals = (salesTotals) => {
	const amount = _.sumBy(salesTotals, (s) => s.amount)
	const total = _.sumBy(salesTotals, (s) => s.total).toFixed(2)

	return { amount, total }
}

export const checkSaleAwaitingPayment = (sale) => {
	const { timeline = [] } = sale
	const awaitingPayment = OrderStatus.items[OrderStatus.AWAITING_PAYMENT].status
	return timeline.find((t) => t.status === awaitingPayment)
}

export const checkSaleConfirmed = (sale) => {
	const { timeline, status, statusInfo } = sale
	const s = statusInfo ? statusInfo.status : status

	if (s === 'closed' || s === 'confirmed') return true // Sales is always confirmed
	if (!timeline) return false // Just in case
	return !!timeline.find((t) => t.status === OrderStatus.items[OrderStatus.CONFIRMED].status)
}

export const checkSalePaid = (sale) => {
	const { timeline, status, statusInfo = {} } = sale
	const s = statusInfo ? statusInfo.status : status

	if (s === 'closed' || s === 'kyte-paid') return true
	if (!timeline) return false

	return !!timeline.find((t) => t.status === OrderStatus.items[OrderStatus.PAID].status)
}

export const buildItemsNames = (sale) => {
	const itemsWithName = _.filter(sale.items, (i) => !!i.product || i.description).map(getItemName)

	const totalItemsWithoutName = _.filter(sale.items, (i) => !i.product && !i.description).length

	let itemsName
	if (itemsWithName) {
		itemsName = itemsWithName.join(' ')
	}

	if (totalItemsWithoutName) {
		itemsName += ` ${totalItemsWithoutName}x${I18n.t('words.s.noDescrAbbr')}`
	}
	return itemsName
}

const getItemName = (i) => {
	if (!i.product) {
		return `${i.amount}x ${i.description}`
	}
	

	if (i?.product?.variations?.length > 0) {
	const optionsName = renderProductVariationsName(i.product, ", ")

	return `${i.amount}x ${i.product.name} - ${optionsName}`;
}

	const search = xregexp('([^?<first>\\pL ]+)')
	const multiplier = i.product.isFractioned ? i.fraction.toFixed(3) : i.amount
	const itemName = xregexp.replace(i.product.name, search, '', 'all')
	return `${multiplier}x ${itemName.substr(0, 8)}`
}

export const hasFilters = (filter) => {
	const { search, period, cancelledSales, days, users, paymentMethods, gatewayMethods, showCatalogOrdersOnly } = filter

	const hasPeriod = !!period
	const filtersArr = [
		search,
		hasPeriod,
		cancelledSales,
		days.start,
		users.length,
		paymentMethods.length,
		gatewayMethods.length,
		showCatalogOrdersOnly,
	]

	return filtersArr.some((f) => f)
}

export const getFilterQuery = (reducerFilter) => {
	const {
		search,
		period: chosenPeriod,
		cancelledSales,
		days,
		users = [],
		status,
		paymentMethods,
		gatewayMethods,
		fetchLimit,
		sort,
		lastId,
		customerId,
		userId,
		showCatalogOrdersOnly,
	} = reducerFilter
	const uid = userId ? [userId] : [...users.map((u) => u.uid), showCatalogOrdersOnly ? 'catalog' : undefined]
	const formatDateQuery = (date) => moment(date).format('YYYYMMDD')
	const period = days.start || days.end ? undefined : chosenPeriod
	const timezone = moment().format('Z')

	return {
		// allsales: TO-DO filter.allsales,
		limit: fetchLimit,
		sort,
		period,
		lastId,
		customerId,
		startDate: days.start ? formatDateQuery(days.start) : undefined,
		endDate: days.end ? formatDateQuery(days.end) : undefined,
		search: search || undefined,
		canceled: cancelledSales,
		gateway: gatewayMethods?.join(),
		status: status?.join(),
		uid: uid?.join(),
		payment: paymentMethods?.join(),
		timezone,
	}
}

export function checkIsOrderType(salesType) {
	return salesType === SalesTypeEnum.ORDER
}

export function checkIsSaleType(salesType) {
	return salesType === SalesTypeEnum.SALE
}

/**
 *
 * @param {null | number } lastSaleNumber value from redux(sales.lastSaleNumberr)
 * @returns sale.number
 */
export function getSaleNumber(lastSaleNumber) {
	return lastSaleNumber == null ? next(SALE) : lastSaleNumber + 1
}

export function getUpdatedSale({ sale, user, store, lastSaleNumber }) {
	const currentDate = new Date()
	const dateCreationInt = parseInt(moment(currentDate).format('YYYYMMDD'))

	const updatedSale = {
		...sale,
		timeline: setTimeline(sale.timeline, sale.statusInfo),
		syncStatus: undefined,
		number: sale.number ?? lastSaleNumber ?? getSaleNumber(),
		sid: sale.sid ?? store._id,
		uid: sale.uid ?? user?.uid,
		aid: sale.aid ?? user?.aid,
		userName: sale.userName ?? user?.displayName,
		active: sale.active ?? true,
		isCancelled: sale.isCancelled ?? false,
		dateCreation: sale.dateCreation ?? currentDate,
		dateCreationInt: sale.dateCreationInt ?? dateCreationInt,
	}

	if (sale.status === 'closed') {
		updatedSale.dateClosed = sale.dateClosed ?? currentDate
		updatedSale.dateClosedInt = sale.dateClosedInt ?? parseInt(moment(updatedSale.dateClosed).format('YYYYMMDD'), 10)
		updatedSale.dateClosedLocal = sale.dateClosedLocal ?? moment(updatedSale.dateClosed).format()
	}

	return updatedSale
}

export function sortSales(sales = []) {
	const sortedSales = sales.sort((previousSale, currentSale) => {
		const dateKey = previousSale.dateClosed ? 'dateClosed' : 'dateCreation'
		const previousDate = previousSale[dateKey]?.toISOString?.() || previousSale[dateKey]
		const currentDate = currentSale[dateKey]?.toISOString?.() || currentSale[dateKey]

		return previousDate > currentDate ? -1 : 1
	})

	return sortedSales
}

export function getDefaultStatuses() {
	const statusPaid = OrderStatus.items[OrderStatus.PAID].status
	const statusOpened = OrderStatus.items[OrderStatus.OPENED].status
	const statusConfirmed = OrderStatus.items[OrderStatus.CONFIRMED].status
	const statusAwaitingPayment = OrderStatus.items[OrderStatus.AWAITING_PAYMENT].status
	const defaultStatuses = [statusPaid, statusOpened, statusConfirmed, statusAwaitingPayment]

	return defaultStatuses
}

export function getAccountStatuses(account) {
	const customStatuses = account.salesStatus.map((s) => s.status)

	return customStatuses
}

export function cloneSale(sale) {
	let updatedSale

	try {
		updatedSale = sale?.clone?.() ?? { ...sale }
	} catch {
		updatedSale = { ...sale }
	}

	return updatedSale
}

export function generateThisMonthStats(salesGroupsResult) {
	const emptyStat = { value: 0, amount: 0 }
	const currentStats = {
		today: { ...emptyStat },
		yesterday: { ...emptyStat },
		month: { ...emptyStat },
	}
	const today = moment().startOf('day')
	const yesterday = moment().add(-1, 'days').startOf('day')
	const { salesTotals = {}, dailyTotals = [] } = salesGroupsResult ?? {}

	dailyTotals.forEach((dailyTotal) => {
		const { date, total, amount } = dailyTotal
		const isToday = moment(today).isSame(date)
		const isYesterday = moment(yesterday).isSame(date)

		if (isToday) currentStats.today = { value: total, amount }
		if (isYesterday) currentStats.yesterday = { value: total, amount }
	})
	currentStats.month = { value: salesTotals?.total ?? 0, amount: salesTotals?.amount ?? 0 }

	return currentStats
}

export const statusNames = {
	OPENED: OrderStatus.items[OrderStatus.OPENED].status,
	CONFIRMED: OrderStatus.items[OrderStatus.CONFIRMED].status,
	PAID: OrderStatus.items[OrderStatus.PAID].status,
	AWAITING_PAYMENT: OrderStatus.items[OrderStatus.AWAITING_PAYMENT].status,
	CLOSED: 'closed',
}


export function renderShippingValue({
  shippingFee,
	shippingCouponDiscount,
	renderCurrency
}) {

	const fee = Number(shippingFee);
	const couponDiscount = Number(shippingCouponDiscount);

	if (!shippingCouponDiscount) return renderCurrency(fee);
	
	if (Number.isFinite(fee) && Number.isFinite(couponDiscount)) {
		const discounted = fee - couponDiscount;
		return discounted > 0 ? renderCurrency(discounted) : I18n.t("plansAndPrices.freeLabel");
	}
	
	return I18n.t("plansAndPrices.freeLabel");
}
