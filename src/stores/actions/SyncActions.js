import { Alert } from 'react-native'
import {
	SYNC_DOWN_CHANGE,
	SYNC_RESET,
	PRODUCTS_CLEAR,
	CUSTOMERS_CLEAR,
	SALES_CLEAR,
	SYNC_DOWN_RESTORE,
	COMMON_UPDATE_USER_CHECKED_OPENED_SALES,
	PRODUCT_CATEGORY_CLEAR,
	STATISTICS_CLEAR,
	STOCK_CLEAR,
	SET_LAST_DINC,
	CLEAR_LAST_SALE,
	SET_SYNCING_SALES_MAP,
} from './types'
import { syncManagerInit, resetStore, SyncDownStatus } from '../../sync'
import { totalLocalData, fetchOneByID, SALE } from '../../repository'
import { logEvent } from '../../integrations'
import { saleDetail, updateSaleQuantity, currentSaleRenew, openGenericModal, hideGenericModal } from '.'
import { startGlobalLoading, stopGlobalLoading } from './CommonActions'
import I18n from '../../i18n/i18n'
import NavigationService from '../../services/kyte-navigation'
import { kyteQueryGetSale } from '../../services/kyte-query'
import { checkUserPermission } from '../../util'

const Strings = {
	SALES_PULL_TO_REFRESH: I18n.t('salesPullToRefresh'),
	ALERT_OK: I18n.t('alertOk'),
	ALERT_ATTENTION: I18n.t('warningWhatsAppModalTitle'),
	NOT_AUTHORIZED: I18n.t('notAuthoraziedAlert'),	
}

export const pushNotificationOnPress = (notificationSale) => async (dispatch, getState) => {
	dispatch(startGlobalLoading())
	const { aid, user } = getState().auth
	const hasViewOtherSalesPermission = checkUserPermission(user.permissions).allowViewOtherSales
	// for some reason this method is fired when an previous user receives a notification containing a sale
	// and the current user (different aid) receive the same notification, and then the generic modal is fired again.
	// to prevent this action, I added this condition.
	if (aid !== notificationSale.aid) return
	// if the user doesn't have permission to view other sales, an alert will be shown.
	if (!hasViewOtherSalesPermission) {
		Alert.alert(Strings.ALERT_ATTENTION, Strings.NOT_AUTHORIZED, [
		{ text: Strings.ALERT_OK},
		])

		return;
	}

	const incomingSale = { ...notificationSale, notification: true, timeline: [] }
	const repositorySale = () => fetchOneByID(SALE, incomingSale.id)
	const backendSale = async () => {
		const result = await kyteQueryGetSale(incomingSale.id)
		return result.data.data
	}
	const sale = repositorySale() || (await backendSale())
	const isSaleOpened = getState().sales.detail.id === sale.id

	const onPress = () => {
		dispatch(saleDetail(sale))
		dispatch(hideGenericModal())
		if (!isSaleOpened) {
			NavigationService.navigate(null, 'PushSaleDetail', { refreshSales: () => null })
		}
	}
	const button = {
		name: I18n.t('openedSalesOptions.editOrder'),
		onPress,
	}

	dispatch(stopGlobalLoading())
	dispatch(openGenericModal({ isVisible: true, path: 'sale-detail', content: sale, button, onPress, disabledComponents: ['top-button'] }))
}

export const syncInitialize = () => (dispatch, getState) => {
	const { lastDinc } = getState().common

	syncManagerInit(
		(syncDownStatus) => syncDownStatusDispatcher(dispatch, syncDownStatus),
		(documents) => syncDownDocumentDispatcher(dispatch, documents, getState().common.actualRouteName),
		{ lastDinc, cbLastDinc: (dinc) => setLastDincDispatcher(dispatch, dinc) }
	)
}

const syncDownStatusDispatcher = async (dispatch, syncDownStatus) => {
	if (syncDownStatus === SyncDownStatus.OK) {
		const totals = await totalLocalData()
		await dispatch(updateSaleQuantity(totals.totalSale))
	}
	dispatch({ type: SYNC_DOWN_CHANGE, payload: { syncDownStatus } })
}

const syncDownDocumentDispatcher = async (dispatch, documents, routeName) => {
	// Displaying a little toast when new sales is coming.
	const isSale = documents.some((d) => d.metadata.model === 'Sale')
	// if (isSale && routeName === 'SalesList') {
	//   dispatch(startToast(Strings.SALES_PULL_TO_REFRESH));
	// }
	dispatch({ type: SYNC_DOWN_CHANGE, payload: { syncDownStatus: SyncDownStatus.OK, documents } })
}

export const syncDownRestore = () => ({ type: SYNC_DOWN_RESTORE })

const setLastDincDispatcher = async (dispatch, lastDinc) => {
	dispatch({ type: SET_LAST_DINC, payload: lastDinc })
}

export const clearAllReducers = (dispatch) => {
	dispatch({ type: SYNC_RESET })
	dispatch({ type: CLEAR_LAST_SALE })
	dispatch({ type: PRODUCTS_CLEAR })
	dispatch({ type: STOCK_CLEAR })
	dispatch({ type: CUSTOMERS_CLEAR })
	dispatch({ type: SALES_CLEAR })
	dispatch(currentSaleRenew())
	dispatch({ type: COMMON_UPDATE_USER_CHECKED_OPENED_SALES, payload: true })
	dispatch({ type: PRODUCT_CATEGORY_CLEAR })
	dispatch({ type: STATISTICS_CLEAR })
	dispatch({ type: SET_LAST_DINC, payload: null })
	dispatch(updateSaleQuantity(0))
}

export const syncClearAllReducers = () => async (dispatch) => {
	await clearAllReducers(dispatch)
}

export const syncResetAllData = (cb) => async (dispatch) => {
	await clearAllReducers(dispatch)
	resetStore()
		.then(() => {
			if (cb) cb()
			logEvent('Account Reset')
		})
		.catch((ex) => {
			const errorMessage = ex.message ? ex.message : 'No error message provided.'
			logEvent('StoreResetError', errorMessage)
		})
}

export const setIsSyncingSale = (saleId) => (dispatch, getState) => {
	const { syncingSalesMap } = getState().sync
	const updatedSyncingSalesMap = { ...syncingSalesMap, [saleId]: true }

	if (saleId) {
		dispatch({ type: SET_SYNCING_SALES_MAP, payload: updatedSyncingSalesMap })
	}
}

export const setIsNotSyncingSale = (saleId) => (dispatch, getState) => {
	const { syncingSalesMap } = getState().sync
	const updatedSyncingSalesMap = { ...syncingSalesMap }

	if (saleId) {
		delete updatedSyncingSalesMap[saleId]
		dispatch({ type: SET_SYNCING_SALES_MAP, payload: updatedSyncingSalesMap })
	}
}
