/* eslint-disable no-underscore-dangle */
import * as RNLocalize from 'react-native-localize'
import { findIndex } from 'lodash'
import {
	SALES_FETCH,
	SALES_UPDATE_QUANTITY_OPENED,
	SALES_UPDATE_SELECTED_USERS_HISTORY,
	SALES_UPDATE_QUANTITY,
	SALES_LAST_NUMBER,
	SET_CONCLUSION_STATE,
	SALES_SET_FILTER,
	ORDERS_SET_FILTER,
	SALES_REPLACE_FILTER,
	SALES_SET_FILTER_TYPE,
	SALES_CLEAR_FILTER,
	LAST_SALE_SET,
	SALES_CLEAR,
	SALES_CLEAR_DETAIL,
	SALE_GENERATE_PAYMENT_LINK,
	SALE_SAVE_WITH_PAYMENT_LINK,
	ORDERS_FETCH,
	SALES_RESET_LIST_SIZE,
	SALE_UPDATE_ITEM,
	SALES_SET_EXPANDED_ITEMS,
	SALES_RESET_GROUP,
	SALES_UPDATE_LIST_ITEM,
	SALE_DETAIL,
	COMMON_API_ERROR,
	SALE_UPDATE_UNSYCED_SALES,
	SALES_UPDATE_QUANTITY_CLOSED,
} from './types'

import {
	SALE,
	fetchSale,
	numberOfSalesByCustomer,
	cancelSale,
	saveSale,
	countOrdersByStatus,
	totalLocalData,
	fetchOneByID,
	saveSaleAndGeneratePix,
} from '../../repository'
import { firebaseSetUserProperty } from '../../integrations'

import { productsUpdateStockVirtualData } from './ProductActions.ts'
import { setIsSyncingSale, setIsNotSyncingSale } from './SyncActions'
import { OrderStatus, FirebaseUserProperties, Period } from '../../enums'
import {
	checkIsOrderType,
	getSaleNumber,
	getUpdatedSale,
	sortSales,
	getDefaultStatuses,
	getAccountStatuses,
	cloneSale,
} from '../../util/util-sale'

import {
	checkUserPermission,
	updateVirtualStock,
	getStatusInfo,
	getCustomerUid,
	manageOrderStatus,
	momentFirebaseUserProperties,
	groupSalesDailyTotals,
	getSalesTotals,
	formatSalesDateInts,
	getFilterQuery,
	updateSalesListItem,
} from '../../util'
import {
	kyteQueryGetSale,
	kyteGeneratePaymentLink,
	kyteQueryGetSales,
	kyteQueryGetTotalSales,
	kyteGeneratePixQRCode,
} from '../../services'
import { startLoading, stopLoading, currentSaleRenew, preferenceSetHasFirstOrder, preferenceAddCoreAction } from '.'
import { CoreAction } from '../../enums/Subscription.ts'
import I18n from '../../i18n/i18n'
import { adapterObjectToModel } from '../../repository/model.adapter'
import { SalesFetchTypeEnum, SalesTypeEnum } from '../../enums/SaleSort'
import { SyncStatus } from '../../enums/SyncStatus'
import { startToast } from './CommonActions'
import { checkHasNeverBeenOnServer } from '../../util/util-sync'

export const SALE_TYPE_ORDER = 'order'
export const SALE_TYPE_SALE = 'sale'

export const setUnsycedSales = ({ unsycedSales, salesType }) => ({
	type: SALE_UPDATE_UNSYCED_SALES,
	payload: { value: unsycedSales, salesType },
})

export const changeApiError = (hasApiError) => ({ type: COMMON_API_ERROR, payload: hasApiError })

const getShowCanceledSales = (getState) => getState().preference.account.showCanceledSales
const generateSalesFetchOptions = (getState, type, length, reboot, fetchOnline) => {
	const { preference, sales: salesState, auth, common } = getState()
	const { user } = auth
	const { isOnline } = common
	const { account } = preference

	const isOrder = type === SalesTypeEnum.ORDER

	// set right filter
	const filter = isOrder ? salesState.filterOrders : salesState.filterSales
	// list size settings
	const size = { limit: salesState.fetchLimit, length }
	// extract filter infos
	const {
		status,
		search,
		users,
		period,
		days,
		cancelledSales,
		showCatalogOrdersOnly,
		paymentMethods,
		gatewayMethods,
		customer,
	} = filter
	const showCanceledSales = getShowCanceledSales(getState)
	const showOtherUsersSales = checkUserPermission(user.permissions).allowViewOtherSales

	const usersUid = users.map((u) => u)
	const filterUid = users.length ? usersUid : null

	const uid = showOtherUsersSales ? filterUid : [user]
	const selectedDays = days.start || days.end ? days : null
	const initStatus = isOrder ? [...getDefaultStatuses(), ...getAccountStatuses(account)] : ['closed']
	const filterStatus = status.length && isOrder ? status : initStatus
	const filterCatalogOrders = Boolean(showCatalogOrdersOnly)

	// filter options
	let filters = {
		status: filterStatus,
		search,
		period,
		days: selectedDays,
		paymentMethods,
		gatewayMethods,
		uid,
		cancelled: cancelledSales,
		opened: isOrder,
		showCanceledSales,
		showCatalogOrdersOnly: filterCatalogOrders,
		customer,
	}

	const hasDayFilters = !!filters.days && !!filters.days.start && !!filters.days.end

	if (!hasDayFilters && filters.period === null && !isOrder) {
		filters = { ...filters, period: Period.items.last30days.period }
	}

	const sales = type === SalesTypeEnum.ORDER ? salesState.ordersGroupsResult.list : salesState.salesGroupsResult.list
	const lastItem = !sales ? sales[sales.length - 1] : null
	const lastItemCheck = !reboot && !!lastItem ? lastItem.id : null
	return {
		filters,
		size,
		status: filters.status,
		isOrder,
		isOnline,
		reboot,
		fetchOnline,
		lastItem: lastItemCheck,
	}
}

export const fetchLocalSales =
	({ successCallback, type = SalesTypeEnum.SALE, length = 0, reboot }) =>
	async (dispatch, getState) => {
		const fetchSalesOptions = generateSalesFetchOptions(getState, type, length, reboot, false)
		const { filters, size } = fetchSalesOptions
		const result = await fetchSale(filters, size)
		const items =
			size.length >= result.items.length ? result.items : result.items.slice(size.length, size.length + size.limit)

		const dailyTotals = groupSalesDailyTotals(result.items, fetchSalesOptions.status)
		const salesTotals = getSalesTotals(dailyTotals)
		const listSize = items.length

		dispatch({
			type: fetchSalesOptions.isOrder ? ORDERS_FETCH : SALES_FETCH,
			payload: {
				sales: formatSalesDateInts(items),
				status: fetchSalesOptions.status,
				listSize,
				dailyTotals,
				salesTotals,
				reboot,
				salesFetchType: SalesFetchTypeEnum.LOCAL,
			},
		})
		successCallback?.({ items, listSize, dailyTotals, salesTotals })
	}

export const fetchServerSales =
	({ errorCallback, successCallback, type, defaultStatus, lastId, sort, period, customerId, userId, reboot }) =>
	async (dispatch, getState) => {
		const isOrder = type === SalesTypeEnum.ORDER
		const { filterOrders, filterSales, fetchLimit } = getState().sales
		const { aid, user } = getState().auth
		const { permissions, uid } = user
		const { allowViewOtherSales } = checkUserPermission(permissions)
		const reducerFilter = isOrder ? filterOrders : filterSales
		const status = reducerFilter.status?.length ? reducerFilter.status : defaultStatus
		const userQuery = allowViewOtherSales ? userId : uid

		const serverFilters = getFilterQuery({
			...reducerFilter,
			status,
			fetchLimit,
			lastId,
			sort,
			customerId,
			userId: userQuery,
			period: reducerFilter.period || period,
		})

		try {
			const { filters: localFilters } = generateSalesFetchOptions(getState, type, fetchLimit, reboot, false)
			const options = { ...localFilters, syncStatus: SyncStatus.NEVER_ON_SERVER }

			const response = await kyteQueryGetSales(serverFilters, aid)
			const { items: unsycedSales = [] } = (await fetchSale(options)) ?? {}

			const nonSyncedSum =
				unsycedSales.reduce((prev, current) => (prev?.totalNet ?? 0) + (current?.totalNet ?? 0), undefined) ?? 0
			const { _sales, totalAmount = 0, totalSales = 0 } = response.data

			// - Removing current updating sales from server list
			const serverSales = unsycedSales.length
				? _sales.forEach((sale) => {
						const syncingSale = unsycedSales.find((s) => s.id === sale.id)
						if (syncingSale) return syncingSale
						return sale
				  })
				: _sales

			const sales = sortSales([...unsycedSales, ...serverSales])

			const dailyTotals = groupSalesDailyTotals(sales, defaultStatus)
			const salesCount = totalSales + unsycedSales.length
			const salesAmount = totalAmount + nonSyncedSum
			const salesTotals = { amount: salesCount, total: salesAmount?.toFixed(2) }
			const listSize = sales.length

			const payload = {
				sales,
				status: [],
				listSize,
				dailyTotals,
				salesTotals,
				reboot,
				salesFetchType: SalesFetchTypeEnum.SERVER,
			}

			dispatch({
				type: isOrder ? ORDERS_FETCH : SALES_FETCH,
				payload,
			})
			successCallback?.(payload)
		} catch (error) {
			errorCallback?.()
		}
	}

export const fetchUnsycedSales = () => async (dispatch, getState) => {
	const { sales } = getState()
	const ordersOptions = {
		...generateSalesFetchOptions(getState, SalesTypeEnum.ORDER, sales.fetchLimit, false, false),
		syncStatus: SyncStatus.NEVER_ON_SERVER,
	}
	const salesOptions = {
		...generateSalesFetchOptions(getState, SalesTypeEnum.SALE, sales.fetchLimit, false, false),
		syncStatus: SyncStatus.NEVER_ON_SERVER,
	}

	try {
		const { items: unsycedOrders } = await fetchSale(ordersOptions)
		const { items: unsycedSales } = await fetchSale(salesOptions)

		dispatch(setUnsycedSales({ unsycedSales: unsycedOrders, salesType: SalesTypeEnum.ORDER }))
		dispatch(setUnsycedSales({ unsycedSales, salesType: SalesTypeEnum.SALE }))
	} catch {
		/* */
	}
}

export const salesLengthByCustomer = (customerId) => {
	const numberOfSales = numberOfSalesByCustomer(customerId)
	return numberOfSales
}

export const saleDetail = (sale) => ({ type: SALE_DETAIL, payload: sale })

export const salesUpdateListItem =
	({ salesType, salesList, updatedSale }) =>
	(dispatch) => {
		const updatedList = updateSalesListItem(updatedSale, salesList)

		dispatch({ type: SALES_UPDATE_LIST_ITEM, payload: { salesType, updatedList } })
	}

export const saleFetchById = (saleID, cb) => async (dispatch) => {
	let sale

	sale = await fetchOneByID(SALE, saleID)
	if (!sale) {
		const serverSale = await kyteQueryGetSale(saleID)
		sale = adapterObjectToModel(SALE, serverSale.data)
	}
	dispatch(saleDetail(sale))
	cb?.(sale)
}

export const salesSetFilter = (value, property) => (dispatch) => {
	dispatch({ type: SALES_SET_FILTER, payload: { value, property, salesType: SalesTypeEnum.SALE } })
}

export const ordersSetFilter = (value, property) => (dispatch) => {
	dispatch({
		type: ORDERS_SET_FILTER,
		payload: { value, property, salesType: SalesTypeEnum.ORDER },
	})
}

export const salesSetExpandedItems = (value, salesType) => (dispatch) =>
	dispatch({ type: SALES_SET_EXPANDED_ITEMS, payload: { value, salesType } })

export const salesReplaceFilter = (newFilters) => (dispatch) => {
	dispatch({ type: SALES_REPLACE_FILTER, payload: { newFilters, salesType: SalesTypeEnum.SALE } })
}

export const ordersReplaceFilter = (newFilters) => (dispatch) => {
	dispatch({ type: SALES_REPLACE_FILTER, payload: { newFilters, salesType: SalesTypeEnum.ORDER } })
}

export const salesSetFilterType = (value) => (dispatch) => {
	dispatch({ type: SALES_SET_FILTER_TYPE, payload: value })
}

export const updateSaleQuantity = (qtt) => (dispatch) => {
	dispatch({ type: SALES_UPDATE_QUANTITY, payload: qtt })
}

export const salesClearFilter = () => ({
	type: SALES_CLEAR_FILTER,
	payload: { salesType: SalesTypeEnum.SALE },
})

export const ordersClearFilter = () => ({
	type: SALES_CLEAR_FILTER,
	payload: { salesType: SalesTypeEnum.ORDER },
})

const registerFirebaseLastSale = () =>
	firebaseSetUserProperty(FirebaseUserProperties.DT_LAST_SALE, momentFirebaseUserProperties(new Date()))

export const saleSave =
	({ currentSale, dontSetSale = false, cb, isPixGenerate = false }) =>
	async (dispatch, getState) => {
		if (!currentSale.status) return {}
		if (isPixGenerate) dispatch(startLoading())
		let lastSaleNumber = currentSale.number ?? getState().sales.lastSaleNumber

		if (!currentSale.number) {
			lastSaleNumber = getSaleNumber(lastSaleNumber)

			dispatch({ type: SALES_LAST_NUMBER, payload: lastSaleNumber })
		}

		dispatch({ type: SET_CONCLUSION_STATE, payload: true })
		dispatch(changeApiError(false))

		const deviceCountry = RNLocalize.getCountry()
		const { preference, auth, sales } = getState()
		const { currencyCode } = preference.account.currency
		const isClosed = currentSale.status === 'closed'
		const didAccountMakeOrder = preference.account?.didAccountMakeOrder
		const { unsycedList: unsycedSales } = isClosed ? sales.salesGroupsResult : sales.ordersGroupsResult
		const { uid, email: userEmail } = auth.user
		const { store, user } = auth
		const statusInfo = getStatusInfo(getState, currentSale.status)
		const isCatalogSale = currentSale.did === 'c' || currentSale.userName === 'catalog'
		const did = !isCatalogSale ? auth.did.toString() : 'c'
		const buildStatus = manageOrderStatus(currentSale.prevStatus, currentSale.status)
		const hasCustomer = currentSale.customer
		const isCreating = !currentSale.id
		const sale = {
			...currentSale,
			customer: hasCustomer ? getCustomerUid(currentSale, getState) : null,
			currencyCode,
			deviceCountry,
			userEmail,
			status: buildStatus,
			statusInfo,
			did,
			lang: I18n.t('locale'),
		}
		let newCurrentSale = getUpdatedSale({ sale, user, store, lastSaleNumber })
		const setLastSale = (lastSale) => {
			if (cb) cb(lastSale)
			if (!dontSetSale) dispatch({ type: LAST_SALE_SET, payload: lastSale })
		}
		const proceed = async () => {
			// After Sale is Saved:
			const { status, prevStatus } = newCurrentSale
			const updateVirtual = updateVirtualStock(prevStatus, status)
			const isConfirmed = newCurrentSale.timeline.find(
				(t) => t.status === OrderStatus.items[OrderStatus.CONFIRMED].status
			)

			if (updateVirtual && !isConfirmed) productsUpdateStockVirtualData(newCurrentSale)

			const totals = await totalLocalData()
			await dispatch(updateSaleQuantity(totals.totalSale))

			// Firebase Analytics set last_sale property
			registerFirebaseLastSale()
			if (isClosed) {
				dispatch(preferenceAddCoreAction(CoreAction.FirstSale))
			} else if (!didAccountMakeOrder) {
				dispatch(preferenceSetHasFirstOrder(true))
			}
		}
		let shouldProceed = true
		try {
			// - Always renew current sale on save, except when generating Pix
			if (!isPixGenerate) dispatch(currentSaleRenew())
			dispatch(setIsSyncingSale(currentSale.id))

			newCurrentSale = !isPixGenerate
				? await saveSale(newCurrentSale, uid, setLastSale)
				: await saveSaleAndGeneratePix({ sale: newCurrentSale, uid, setLastSaleCallback: setLastSale })
			// Renew current sale on save and generate Pix after save
			if (isPixGenerate) dispatch(currentSaleRenew())
			dispatch(stopLoading())
			dispatch(changeApiError(false))

			const updatedUnsycedSales = checkHasNeverBeenOnServer(newCurrentSale)
				? [...unsycedSales, newCurrentSale]
				: unsycedSales.filter((unsycedSale) => unsycedSale.id !== newCurrentSale.id)

			dispatch(
				setUnsycedSales({
					unsycedSales: updatedUnsycedSales,
					salesType: newCurrentSale.status === 'closed' ? SalesTypeEnum.SALE : SalesTypeEnum.ORDER,
				})
			)
		} catch {
			shouldProceed = isCreating

			if (isCreating && !isPixGenerate) {
				dispatch(
					setUnsycedSales({
						unsycedSales: [...unsycedSales, newCurrentSale],
						salesType: newCurrentSale.status === 'closed' ? SalesTypeEnum.SALE : SalesTypeEnum.ORDER,
					})
				)
			} else {
				dispatch(changeApiError(true))
			}
		}

		if (shouldProceed) {
			proceed()
		}

		const shouldUpdateSyncingSalesMap = newCurrentSale.id && !isCreating

		if (shouldUpdateSyncingSalesMap) {
			dispatch(setIsSyncingSale(newCurrentSale.id))
		}
		dispatch(stopLoading())
		return newCurrentSale
	}

// only use in status update
export const saleUpdate =
	(currentSale, shouldSetLastSale = true) =>
	async (dispatch, getState) => {
		let lastSaleNumber = currentSale.number ?? getState().sales.lastSaleNumber

		if (!currentSale.number) {
			lastSaleNumber = getSaleNumber(lastSaleNumber)

			dispatch({ type: SALES_LAST_NUMBER, payload: lastSaleNumber })
		}

		dispatch({ type: SET_CONCLUSION_STATE, payload: true })
		dispatch(setIsSyncingSale(currentSale.id))

		const isConfirmed = currentSale.timeline?.some?.(
			(t) => t.status === OrderStatus.items[OrderStatus.CONFIRMED].status
		)
		const isPaid = currentSale.timeline?.some?.((t) => t.status === OrderStatus.items[OrderStatus.PAID].status)
		const hasCustomer = !!currentSale.customer
		const statusInfo = getStatusInfo(getState, currentSale.status)
		const status = manageOrderStatus(currentSale.prevStatus, currentSale.status)
		const { auth } = getState()
		const { store, user } = auth
		const { uid } = user
		const sale = {
			...(currentSale.toJSON?.() ?? currentSale),
			status,
			statusInfo,
			customer: hasCustomer ? getCustomerUid(currentSale, getState) : null,
		}
		let updatedSale
		try {
			updatedSale = await saveSale(getUpdatedSale({ sale, user, store }), uid)
			if (!isConfirmed && !isPaid) productsUpdateStockVirtualData(currentSale)
			const salesType = updatedSale.status !== 'closed' ? SalesTypeEnum.ORDER : SalesTypeEnum.SALE
			const isOrder = salesType === SalesTypeEnum.ORDER
			const { sales: salesState } = getState()
			const { unsycedList: unsycedSales } = isOrder ? salesState.ordersGroupsResult : salesState.salesGroupsResult
			const updatedUnsycedSales = unsycedSales.filter((unsycedSale) => unsycedSale.id !== updatedSale.id)

			dispatch({
				type: SALE_UPDATE_ITEM,
				payload: {
					sale: updatedSale,
					salesType,
				},
			})
			if (shouldSetLastSale) dispatch({ type: LAST_SALE_SET, payload: updatedSale })
			dispatch(changeApiError(false))
			dispatch(setUnsycedSales({ unsycedSales: updatedUnsycedSales, salesType }))
		} catch {
			dispatch(changeApiError(true))
		}

		dispatch(setIsNotSyncingSale(currentSale.id))

		return updatedSale
	}

export const saleCancel = (sale, callback) => async (dispatch, getState) => {
	dispatch(startLoading())

	const _sale = cloneSale(sale)

	const cancelledSale = await cancelSale(_sale)
	if (_sale.status !== 'opened') await productsUpdateStockVirtualData(cancelledSale)

	const isOrder = _sale.status !== 'closed'
	const salesType = isOrder ? SalesTypeEnum.ORDER : SalesTypeEnum.SALE
	const sales = isOrder ? getState().sales.ordersGroupsResult.list : getState().sales.salesGroupsResult.list
	const saleIndex = findIndex(_sale, (s) => s.id === cancelledSale.id)
	sales[saleIndex] = { ...sales[saleIndex], sale: cancelledSale }

	dispatch({
		type: SALE_UPDATE_ITEM,
		payload: {
			sale: cancelledSale,
			salesType,
		},
	})

	dispatch(stopLoading())
	callback?.(cancelledSale)
}

export const saleSaveWithPaymentLink = (currentSale, navigate) => async (dispatch, getState) => {
	const { store } = getState().auth
	dispatch(startLoading())
	const newSale = await dispatch(saleSave({ currentSale, shouldRenewCurrentSale: false }))

	const findGatewayKey = store.checkoutGateways.find((c) => c.active)
	try {
		const response = await kyteGeneratePaymentLink(newSale, store, findGatewayKey.key)
		const { paymentLink } = response.data
		const updatedSale = await dispatch(saleUpdate({ ...cloneSale(newSale), paymentLink }))

		dispatch({ type: SALE_SAVE_WITH_PAYMENT_LINK, payload: paymentLink })
		dispatch({ type: LAST_SALE_SET, payload: updatedSale })
		dispatch(currentSaleRenew())
		navigate()
		dispatch(stopLoading())
	} catch (error) {
		navigate()
		dispatch(stopLoading())
	}
}

export const generatePaymentLink = (sale, errorCb) => async (dispatch, getState) => {
	const { store } = getState().auth
	const findGatewayKey = store.checkoutGateways.find((c) => c.active)

	try {
		const response = await kyteGeneratePaymentLink(sale, store, findGatewayKey.key)
		const { paymentLink } = response.data
		const updatedSale = await dispatch(saleUpdate({ ...sale, paymentLink }))

		dispatch({ type: SALE_GENERATE_PAYMENT_LINK, payload: paymentLink })
		dispatch({ type: LAST_SALE_SET, payload: updatedSale })
	} catch {
		if (errorCb) errorCb()
	}
}

export const updateQuantitySales = (status) => async (dispatch, getState) => {
	let salesCount = 0
	const { aid, user } = getState().auth && getState().auth
	const { account } = getState().preference
	const { permissions, uid } = user
	const { allowViewOtherSales } = checkUserPermission(permissions)

	try {
		const params = status ? { status } : {}
		const response = await kyteQueryGetTotalSales({ aid, uid, allowViewOtherSales, params })
		const { data } = response
		salesCount = data._total
	} catch (error) {
		if (!status) {
			salesCount = await countOrdersByStatus(null, 'closed', account.showCanceledSales).then((list) => list.length)
		}
	}

	const actionType = status === 'closed' ? SALES_UPDATE_QUANTITY_CLOSED : SALES_UPDATE_QUANTITY_OPENED
	dispatch({ type: actionType, payload: salesCount })
}

export const updateSelectedUsersAtHistory = (users) => (dispatch) => {
	dispatch({ type: SALES_UPDATE_SELECTED_USERS_HISTORY, payload: users })
}

export const salesClear = () => ({ type: SALES_CLEAR })
export const salesClearDetail = () => ({ type: SALES_CLEAR_DETAIL })

export const salesResetListSize = () => (dispatch) => dispatch({ type: SALES_RESET_LIST_SIZE })

export const salesResetGroup = (salesType) => (dispatch) =>
	dispatch({ type: SALES_RESET_GROUP, payload: { salesType } })

export const syncSales =
	(unsycedSales = [], salesType = SalesTypeEnum.ORDER) =>
	async (dispatch, getState) => {
		const hasUnsycedSales = Boolean(unsycedSales.length)
		const requests = unsycedSales.map((unsycedSale) => dispatch(saleUpdate(unsycedSale, false)))

		await Promise.allSettled(requests)

		const { sales } = getState()
		const { unsycedList: updatedUnsycedSales } = checkIsOrderType(salesType)
			? sales.ordersGroupsResult
			: sales.salesGroupsResult

		if (hasUnsycedSales) {
			const didSyncAll = !updatedUnsycedSales.length
			const toastMessage = didSyncAll ? I18n.t('allOrdersSynced') : I18n.t('syncedError')
			dispatch(startToast(toastMessage))
		}
	}

export const generateQrCode =
	({ sale, callback }) =>
	async (dispatch) => {
		try {
			const updateSale = await kyteGeneratePixQRCode(sale.id, sale.aid, sale?.customer?.uid || sale?.uid)
			const { data } = updateSale

			const itemsFormatted = data.items.map((item) => ({
				...item,
				product: {
					...item.product,
					variations: Array.isArray(item.product.variations) ? item.product.variations : [],
				},
			}))

			const timelineFormatted = data.timeline.map((item) => ({
				...item,
				timeStamp: convertTimeStampToDate(item.timeStamp),
			}))

			data.items = itemsFormatted
			data.timeline = timelineFormatted

			dispatch(saleUpdate(data))
			callback?.()

			return data
		} catch (err) {
			callback?.(err)
			return null
		}
	}

// Util local para converter timestamp (epoch ms/seg ou string) em Date (declarado no topo para evitar uso antes da definição)
function convertTimeStampToDate(ts) {
	if (!ts) return ts
	try {
		if (ts instanceof Date) return ts
		if (typeof ts === 'number') {
			// se for em segundos (10 dígitos), converter para ms
			const isSeconds = ts.toString().length === 10
			return new Date(isSeconds ? ts * 1000 : ts)
		}
		if (typeof ts === 'string') return new Date(ts)
		return ts
	} catch {
		return ts
	}
}
