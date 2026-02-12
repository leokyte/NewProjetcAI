import {
	SYNC_DOWN_CHANGE,
	SYNC_DOWN_RESTORE,
	SYNC_LOGOUT,
	SYNC_SET_IS_FIRST_NOTIFICATION,
	SET_SYNCING_SALES_MAP,
} from '../actions/types'
import { SyncDownStatus, SyncUpStatus } from '../../sync'
import { checkIsChildProduct } from '@kyteapp/kyte-utils'

const INITIAL_STATE = {
	syncUpStatus: SyncUpStatus.BLANK,
	syncingSalesMap: {},
	syncDownResult: {
		syncDownStatus: SyncDownStatus.BLANK,
		syncDownResultDocuments: {
			hasProduct: 0,
			hasOpenedSales: 0,
			hasCategories: 0,
			hasCustomers: 0,
		},
		syncUpdatedDocument: {},
	},

	isFirstNotification: true,
}

export default (state = INITIAL_STATE, action) => {
	switch (action.type) {
		case SYNC_DOWN_CHANGE: {
			const { documents } = action.payload
			const syncDownResultDocuments = getSyncDownResultDocuments(documents)
			const syncUpdatedDocument = !!documents && documents.length > 0 ? documents[0].data : {}

			const syncDownResult = {
				syncDownStatus: action.payload.syncDownStatus,
				syncDownResultDocuments,
				syncUpdatedDocument,
			}
			return { ...state, syncDownResult }
		}
		case SYNC_DOWN_RESTORE: {
			return {
				...state,
				syncDownResult: {
					...state.syncDownResult,
					syncDownStatus: state.syncDownResult.syncDownStatus,
					syncDownResultDocuments: { hasProduct: 0, hasOpenedSales: 0, hasCategories: 0 },
				},
			}
		}

		case SET_SYNCING_SALES_MAP: {
			return {
				...state,
				syncingSalesMap: action.payload,
			}
		}
		case SYNC_LOGOUT: {
			return { ...INITIAL_STATE }
		}

		case SYNC_SET_IS_FIRST_NOTIFICATION:
			return { ...state, isFirstNotification: action.payload }

		default:
			return state
	}
}

const getSyncDownResultDocuments = (documents) => {
	if (!documents) return null

	// Documents
	const customerDocuments = documents.filter((d) => d.metadata.model === 'Customer')

	// Length
	const hasOpenedSales = documents.filter((d) => d.metadata.model === 'Sale' && d.data.status !== 'closed').length
	const hasClosedSales = documents.filter((d) => d.metadata.model === 'Sale' && d.data.status === 'closed').length
	const hasCustomers = customerDocuments.length
	const hasProduct = documents.filter((d) => d.metadata.model === 'Product' && !checkIsChildProduct(d.data)).length
	const hasCategories = documents.filter((d) => d.metadata.model === 'ProductCategory').length

	// Models
	const models = { customer: hasCustomers ? customerDocuments[0].data : null }

	return { hasProduct, hasOpenedSales, hasClosedSales, hasCategories, hasCustomers, models }
}
