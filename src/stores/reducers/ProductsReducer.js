import _ from 'lodash'
import {
	PRODUCTS_FETCH,
	PRODUCTS_LIST_FETCH,
	PRODUCT_DETAIL,
	PRODUCTS_CLEAR,
	PRODUCT_MANAGEMENT_SET_VALUE,
	PRODUCT_STOCK_HISTORY_SET_FILTER,
	PRODUCT_STOCK_HISTORY_CLEAR_FILTER,
	PRODUCT_SAVE_BY_QUICKSALE,
	PRODUCTS_UPDATE_QUANTITY,
	PRODUCT_MANAGEMENT_RESET,
	PRODUCT_GET_STOCK_HISTORY,
	PRODUCT_FILTER_STOCK_HISTORY,
	LOGOUT,
	UPDATE_SHARE_CATALOG_MODAL_VISIBILITY,
	PRODUCT_SORT_TYPE_SET,
	PRODUCTS_SET_SEARCH_TEXT,
	PRODUCTS_LIST_SERVER_FETCH,
	PRODUCTS_LIST_SERVER_FETCH_ERROR,
	PRODUCT_AI_PRODUCT_DESCRIPTION,
	PRODUCT_AI_IMAGE_SUGGESTIONS,
	CLEAR_PRODUCT_AI_SUGGESTIONS,
	PRODUCT_AI_SUGGESTIONS_APPLIED,
	SET_SELECTED_VARIATION_FOR_PHOTO_EDIT,
} from '../actions/types'
import { buildProductManaging } from '../../util'

export const INITIAL_STATE = {
	searchText: '',
	list: [],
	serverList: null,
	innerList: [],
	detail: {},
	detailOrigin: null,
	productManaging: {
		initialStock: 0,
		currentStock: 0,
		minimumStock: 0,
		productPhoto: '',
		productOtherPhotos: [],
		productColor: '',
		category: null,
		isFractioned: false,
		isStockEnabled: false,
		contentHasChanged: false,
	},
	stockHistory: [],
	stockHistoryTotal: 0,
	stockHistoryFilter: {
		startDate: '',
		endDate: '',
		historicalTypes: [],
		users: [],
	},
	saveFromQuickSale: false,
	shareCatalogModalVisible: false,
	productsQuantity: 0,
	listSize: 0,
	innerListSize: 0,
	sortType: { key: 'dateCreation', isDesc: false },
	filters: null,
	checkoutProductStyle: 'grid',
	aiSuggestions: {
		name: null,
		description: null,
		price: null,
		category: null,
		image: null,
	},
	aiSuggestionsApplied: false,
}

export default (state = INITIAL_STATE, action) => {
	switch (action.type) {
		case PRODUCTS_FETCH: {
			const { items, reboot, listSize } = action.payload
			const appendList = [...state.list, ...items]

			return { ...state, list: reboot ? items : appendList, listSize, fetchSize: items.length }
		}
		case PRODUCTS_LIST_FETCH: {
			const { items, reboot, listSize } = action.payload
			const appendList = [...state.innerList, ...items]

			return { ...state, innerList: reboot ? items : appendList, innerListSize: listSize, innerFetchSize: items.length }
		}
		case PRODUCTS_LIST_SERVER_FETCH: {
			const { products, reboot, params, innerFetchSize } = action.payload
			const serverList = reboot ? products : (state.serverList ?? []).concat(products)

			return { ...state, serverList, innerFetchSize }
		}
		case PRODUCTS_LIST_SERVER_FETCH_ERROR: {
			return { ...state, serverList: null }
		}
		case SET_SELECTED_VARIATION_FOR_PHOTO_EDIT: {
			return {...state, selectedVariationForPhotoEdit: action.payload }
		}
		case PRODUCTS_CLEAR:
		case LOGOUT: {
			return { ...INITIAL_STATE }
		}
		case PRODUCT_DETAIL: {
			const { product, detailOrigin, detailTabKey } = action.payload
			const initial = state.productManaging
			const productManaging = buildProductManaging(product, initial)

			return {
				...state,
				detail: product,
				detailOrigin,
				productManaging,
				detailTabKey,
			}
		}
		case PRODUCT_MANAGEMENT_SET_VALUE: {
			const { value, property, set } = action.payload
			const { contentHasChanged } = state.productManaging

			const productProps = ['productPhoto', 'productColor', 'category', 'isFractioned', 'isStockEnabled']
			const isInitial = set === 'initial'
			const contentChangeCheck = () => {
				if (isInitial) return false
				return _.includes(productProps, property)
			}

			return {
				...state,
				productManaging: {
					...state.productManaging,
					[property]: value,
					contentHasChanged: contentHasChanged || contentChangeCheck(),
				},
			}
		}
		case PRODUCT_STOCK_HISTORY_SET_FILTER: {
			const { value, property } = action.payload
			return {
				...state,
				stockHistoryFilter: { ...state.stockHistoryFilter, [property]: value },
			}
		}

		case PRODUCT_STOCK_HISTORY_CLEAR_FILTER: {
			return { ...state, stockHistoryFilter: INITIAL_STATE.stockHistoryFilter }
		}
		case PRODUCT_MANAGEMENT_RESET: {
			return { ...state, productManaging: INITIAL_STATE.productManaging }
		}
		case PRODUCT_SAVE_BY_QUICKSALE: {
			return { ...state, saveFromQuickSale: action.payload }
		}
		case UPDATE_SHARE_CATALOG_MODAL_VISIBILITY: {
			return { ...state, shareCatalogModalVisible: action.payload }
		}
		case PRODUCTS_UPDATE_QUANTITY: {
			return { ...state, productsQuantity: action.payload }
		}
		case PRODUCT_GET_STOCK_HISTORY: {
			return { ...state, stockHistory: action.payload.data, stockHistoryTotal: action.payload.total }
		}
		case PRODUCT_FILTER_STOCK_HISTORY: {
			return { ...state, stockHistory: action.payload }
		}
		case PRODUCT_SORT_TYPE_SET: {
			return { ...state, sortType: action.payload }
		}
		case PRODUCTS_SET_SEARCH_TEXT: {
			return { ...state, searchText: action.payload }
		}
		case PRODUCT_AI_PRODUCT_DESCRIPTION: {
			return { ...state, aiDescription: action.payload }
		}
		case PRODUCT_AI_IMAGE_SUGGESTIONS: {
			return { ...state, aiSuggestions: action.payload }
		}
		case CLEAR_PRODUCT_AI_SUGGESTIONS: {
			return {
				...state,
				aiSuggestions: {
					name: null,
					description: null,
					price: null,
					category: null,
					image: null,
				},
			}
		}
		case PRODUCT_AI_SUGGESTIONS_APPLIED: {
			return {
				...state,
				aiSuggestionsApplied: action.payload,
			}
		}
		default:
			return state
	}
}
