import {
	fetchFilter,
	fetchSynchronous,
	fetchOneByID,
	create,
	update,
	next,
	remove,
	SALE,
	deleteDocuments,
	fetchSaleFilter,
} from './repository'
import { filterByPeriod, filterByDays } from './filters'
import { SaleOrigin } from '../enums'
import KyteErrorHandler from '../integrations/ErrorHandler'
import { kyteQueryQRCodeUpsertSale, kyteQueryUpsertSale } from '../services/kyte-query'
import { markDocumentAs } from '../util/util-sync'
import { SyncStatus } from '../enums/SyncStatus'

const sort = { key: 'dateCreation', isDesc: true }

export const fetchSale = (options) => {
	const filters = []
	const {
		status,
		search,
		period,
		days,
		paymentMethods = [],
		gatewayMethods = [],
		uid,
		cancelled,
		opened,
		showCanceledSales = true,
		showCatalogOrdersOnly = false,
		customer,
		syncStatus,
	} = options
	const isNumber = Number(search)
	const listSort = { key: opened ? 'dateCreation' : 'dateClosed', isDesc: true }

	filters.push(
		status.map((s) => `statusInfo.status = "${s}" OR (statusInfo == ${null} AND status = "${s}")`).join(' OR ')
	)

	if (search && !isNumber) {
		filters.push(`customer.name CONTAINS[c] "${search}" OR items.product.name CONTAINS[c] "${search}"`)
	}

	if (search && isNumber) {
		filters.push(`number == ${Number(search)} OR totalNet == ${Number(search)}`)
	}

	if (period) {
		const filterPeriod = opened ? filterByPeriod('dateCreationInt', period) : filterByPeriod('dateClosedInt', period)
		filters.push(filterPeriod)
	}

	if (days) {
		const filterDays = opened
			? filterByDays('dateCreationInt', days.start, days.end)
			: filterByDays('dateClosedInt', days.start, days.end)
		filters.push(filterDays)
	}

	if (uid && uid.length > 0) {
		filters.push(uid.map((u) => `uid = "${u.uid}"`).join(' OR '))
	}

	if (paymentMethods.length) {
		filters.push(paymentMethods.map((p) => `ANY payments.type = ${p}`).join(' OR '))
	}

	if (gatewayMethods.length) {
		filters.push(gatewayMethods.map((g) => `ANY payments.transaction.gateway = "${g}"`).join(' OR '))
	}

	if (cancelled) {
		filters.push('isCancelled = true')
	} else if (!showCanceledSales) {
		filters.push('isCancelled = false')
	}

	if (showCatalogOrdersOnly) {
		filters.push(`origin = ${SaleOrigin.CATALOG}`)
	}

	if (customer) {
		filters.push(`customer.id = '${customer}'`)
	}

	if (syncStatus) {
		filters.push(`syncStatus = '${syncStatus}'`)
	}

	return fetchSaleFilter(filters, { sort: listSort })
}

export function fetchSaleById(saleId) {
	return fetchOneByID(SALE, saleId)
}

export const fetchSaleByCustomer = (customerId, status, uid, showCanceledSales, size) => {
	const filters = [`customer.id = "${customerId}"`]

	if (status) filters.push(status.map((s) => `status = "${s}"`).join(' OR '))
	if (uid && uid.length > 0) filters.push(uid.map((u) => `uid = "${u}"`).join(' OR '))
	if (!showCanceledSales) filters.push('isCancelled = false')

	return fetchFilter(SALE, filters, { sort }, size, status)
}

export const numberOfSalesByCustomer = (customerId) => {
	const filters = [`customer.id = "${customerId}"`]
	const sales = fetchSynchronous(SALE, filters)
	return sales.length
}

export const fetchSaleByUser = (uid, status, showCanceledSales, size) => {
	const filters = [`uid = "${uid}"`]

	if (status) filters.push(`status = "${status}"`)
	if (!showCanceledSales) filters.push('isCancelled = false')

	return fetchFilter(SALE, filters, { sort }, size, status)
}

export const countOpenedSales = (uid) => {
	const filters = ['status = "opened"']
	if (uid) filters.push(`uid = "${uid}"`)

	return fetchFilter(SALE, filters, { sort })
}

export const countOrdersByStatus = (uid, status, showCanceledSales) => {
	const filters = [`status != "${status}"`]
	if (uid) filters.push(`uid = "${uid}"`)
	if (!showCanceledSales) filters.push('isCancelled = false')

	return fetchFilter(SALE, filters, { sort })
}

export const createSale = (sale, successCallback) => {
	const number = next(SALE)

	return create(SALE, { number, ...sale }, successCallback)
}

export const setTimeline = (timeline, s) => {
	const hasTimeline = timeline && timeline.length
	const action = { ...s, timeStamp: new Date() }

	const keepTheSame = hasTimeline && timeline[timeline.length - 1].status === s.status
	const addItem = hasTimeline ? [...timeline, action] : [action]

	return keepTheSame ? timeline : addItem
}

export const saveSaleAndGeneratePix = async ({ sale, uid, setLastSaleCallback }) => {
	const unSyncedSale = markDocumentAs(sale, SyncStatus.NEVER_ON_SERVER)

	try {
		const response = await kyteQueryQRCodeUpsertSale(unSyncedSale, uid)
		const syncedSale = markDocumentAs(response?.data, SyncStatus.SYNCED)
		
		setLastSaleCallback?.(syncedSale)

		return syncedSale
	} catch {
		throw new Error('Error generating Pix')
	}
}

export const saveSale = async (sale, uid, setLastSaleCallback) => {
	const isCreating = !sale.id
	// Save/Update locally first and mark it as NEVER_ON_SERVER
	const unSyncedSale = markDocumentAs(sale, SyncStatus.NEVER_ON_SERVER)
	const localSavedSale = isCreating
		? await createSale(unSyncedSale, false)
		: await update(SALE, unSyncedSale.id, unSyncedSale, false)
	setLastSaleCallback?.(sale)

	// Try to Save/Update on server and mark it as SYNCED
	try {
		const syncedSale = markDocumentAs({ ...sale, id: localSavedSale.id }, SyncStatus.SYNCED)
		const response = await kyteQueryUpsertSale(localSavedSale, uid)
		const responseSaleId = response?.data?.split?.(' ')?.pop?.()
		const saleId = responseSaleId || localSavedSale.id || sale.id

		const syncedSaleWithId = { ...syncedSale, id: saleId }

		await update(SALE, saleId, syncedSaleWithId, false)
		setLastSaleCallback?.(syncedSaleWithId)
		return syncedSaleWithId
	} catch {
		// Return what was saved locally in case of API errors
		setLastSaleCallback?.(localSavedSale)

		return localSavedSale
	}
}

export function removeSale(id) {
	return remove(SALE, id)
}

export const manageOfflineSales = () => {
	const filters = ['status = "closed"']
	fetchFilter(SALE, filters, { sort })
		.then((sales) => {
			if (sales.length <= 300) return
			const removableSales = sales.splice(-1, sales.length - 300) // removing X registers from the end
			deleteDocuments(removableSales.map((rs) => ({ ...rs, model: SALE })))
		})
		.catch((error) => KyteErrorHandler.addItemInErrorsQueue(error))
}

export const cancelSale = async (sale) => {
	const saleToCancel = {
		...sale,
		isCancelled: true,
		timeline: setTimeline(sale.timeline, { status: 'canceled' }),
	}
	await update(SALE, sale.id, saleToCancel)
	return saleToCancel
}
