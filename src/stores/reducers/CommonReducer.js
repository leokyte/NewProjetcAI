import { Dimensions } from 'react-native'
import { colors } from '../../styles'
import {
  SET_COMMON,
  CHAT_NOTIFICATION,
  RECEIPT_MAIL_TO,
  RECEIPT_MAIL_SENT,
  RESET_MAIL_TO,
  CURRENT_SALE_RENEW,
  CURRENT_SALE_RETRIEVE_DATA,
  CURRENT_SALE_SET_IN_SPLIT_PAYMENT,
  UPDATE_DRAWER_VISIBILITY,
  CURRENCY_SET,
  COMMON_UPDATE_USER_CHECKED_OPENED_SALES,
  COMMON_START_LOADING,
  COMMON_STOP_LOADING,
  COMMON_START_GLOBAL_LOADING,
  COMMON_STOP_GLOBAL_LOADING,
  COMMON_USER_REACHED_LIMIT,
  SET_INITIAL_ROUTE_NAME,
  SET_ACTUAL_ROUTE_NAME,
  SET_CONCLUSION_STATE,
  LOGOUT,
  COMMON_SET_NOPRODUCTS_HELPER_VISIBILITY,
  COMMON_SET_FIRSTPRODUCT_HELPER_VISIBILITY,
  COMMON_SET_FIRSTSALE_HELPER_VISIBILITY,
  COMMON_SET_ISONLINE,
  COMMON_START_TOAST,
  COMMON_STOP_TOAST,
  CHECKOUT_EDITION_MODE,
  COMMON_SET_VALUES,
  SET_LAST_DINC,
  SET_CHECKOUT_PRODUCT_STYLE,
  COMMON_REFRESH_CUSTOMER_STATEMENTS,
  COMMON_OPEN_GENERIC_MODAL,
  COMMON_HIDE_GENERIC_MODAL,
  COMMON_SET_LOAD_GENERIC_MODAL,
  COMMON_OPEN_TERMS_MODAL,
  COMMON_HIDE_TERMS_MODAL,
  COMMON_HAS_UPDATED_DEVICE_INFO,
  COMMON_SET_BARCODE_VISIBILITY,
  SET_VIEWPORT,
  COMMON_IS_CANCELLING_SALE,
  COMMON_API_ERROR,
  COMMON_SET_NUMBER_OF_MESSAGES,
  SET_ENABLED_DRAWER_SWIPE,
	SHOW_NEED_CONFIGURE_CATALOG_MODAL_FOR_COUPONS,
	COMMON_SET_AUDIO_PERMISSION_REQUESTED
} from '../actions/types';
import I18n from '../../i18n/i18n';
import { calculateViewport } from '../../util/util-screens';
import { isCatalogApp } from '../../util/util-flavors';

const initialViewport = calculateViewport(Dimensions.get('window').width)

const INITIAL_STATE = {
	receiptEmailReceiver: {},
	receiptEmailSent: false,

	drawerVisible: false,
	stayIntoPayment: false,
	userHasCheckedOpenedSales: true,
	unreadChat: false,
	currency: I18n.t('currencyType'),

	loader: { visible: false },
	globalLoader: { visible: false },
	userHasReachedLimit: false,
	goToConfirmationScreen: false,
	goToBlockScreen: false,
	initialRouteName: isCatalogApp() ? 'OnlineCatalog' : 'CurrentSale',
	actualRouteName: '',

	checkoutEditionMode: false,

	noProductsHelperVisible: false,
	firstProductHelperVisible: false,
	firstSaleHelperVisible: false,
	isOnline: true,
	isAtConclusion: false,

	toast: {
		visible: false,
		text: '',
	},

	lastDinc: null,
	isInSplitPayment: false,
	barcodeBeep: false,
	barcodeVisibility: false,

	checkoutProductStyle: 'grid',
	refreshCustomerStatements: false,

	genericModal: {
		isVisible: false,
		path: '',
		content: {},
		loading: false,
		button: {
			type: 'text',
			name: '',
			backgroundColor: colors.actionColor,
			onPress: () => null,
			onPressClose: () => null,
		},
		disabledComponents: [],
	},

  isTermsModalVisible: false,
  hasUpdatedDeviceInfo: false,
  saleDetailShowConfirmedTip: true,
  viewport: initialViewport,
  hasApiError: false,
  isCancellingSale: false,
  intercomUnreadConversation: 0,
  enabledDrawerSwipe: true,
  audioPermissionRequested: false
};

export default (state = INITIAL_STATE, action) => {
	switch (action.type) {
		case SET_COMMON: {
			return { ...state, ...action.payload }
		}
		case CHAT_NOTIFICATION: {
			return { ...state, unreadChat: action.payload }
		}
		case RECEIPT_MAIL_TO: {
			return { ...state, receiptEmailReceiver: action.payload }
		}
		case RECEIPT_MAIL_SENT: {
			return { ...state, receiptEmailSent: action.payload }
		}
		case RESET_MAIL_TO: {
			return { ...state, receiptEmailReceiver: null }
		}
		case UPDATE_DRAWER_VISIBILITY:
			return { ...state, drawerVisible: action.payload }
		case CURRENCY_SET: {
			return { ...state, currency: action.payload }
		}
		case COMMON_UPDATE_USER_CHECKED_OPENED_SALES: {
			return { ...state, userHasCheckedOpenedSales: action.payload }
		}
		case COMMON_START_LOADING: {
			return { ...state, loader: { ...state.loader, visible: true } }
		}
		case COMMON_STOP_LOADING: {
			return { ...state, loader: { ...state.loader, visible: false } }
		}
		case CURRENT_SALE_RENEW: {
			return {
				...state,
				receiptEmailReceiver: {},
				receiptEmailSent: false,
				stayIntoPayment: false,
				checkoutEditionMode: false,
			}
		}
		case CURRENT_SALE_RETRIEVE_DATA: {
			return { ...state, stayIntoPayment: true, initialRouteName: 'SalePersist' }
		}
		case CURRENT_SALE_SET_IN_SPLIT_PAYMENT: {
			return { ...state, isInSplitPayment: action.payload }
		}
		case COMMON_USER_REACHED_LIMIT: {
			// TODO: return { ...state, userHasReachedLimit: action.payload } ( Temporary validation bug fix )
			return { ...state, userHasReachedLimit: false }
		}
		case SET_INITIAL_ROUTE_NAME: {
			return { ...state, initialRouteName: action.payload }
		}
		case SET_ACTUAL_ROUTE_NAME: {
			return { ...state, actualRouteName: action.payload }
		}
		case SET_CONCLUSION_STATE: {
			return { ...state, isAtConclusion: action.payload }
		}
		case CHECKOUT_EDITION_MODE:
			return { ...state, checkoutEditionMode: action.payload }
		case COMMON_SET_NOPRODUCTS_HELPER_VISIBILITY:
			return { ...state, noProductsHelperVisible: action.payload }
		case COMMON_SET_FIRSTPRODUCT_HELPER_VISIBILITY:
			return { ...state, firstProductHelperVisible: action.payload }
		case COMMON_SET_FIRSTSALE_HELPER_VISIBILITY:
			return { ...state, firstSaleHelperVisible: action.payload }
		case COMMON_SET_ISONLINE:
			return { ...state, isOnline: action.payload }
		case LOGOUT: {
			return { ...INITIAL_STATE }
		}
		case COMMON_START_TOAST: {
			return { ...state, toast: { ...state.toast, visible: true, text: action.payload } }
		}
		case COMMON_STOP_TOAST: {
			return { ...state, toast: { ...state.toast, visible: false, text: '' } }
		}
		case SET_LAST_DINC: {
			return { ...state, lastDinc: action.payload }
		}
		case COMMON_SET_VALUES: {
			return { ...state, ...action.payload }
		}
		case SET_CHECKOUT_PRODUCT_STYLE: {
			return { ...state, checkoutProductStyle: action.payload }
		}
		case COMMON_REFRESH_CUSTOMER_STATEMENTS: {
			return { ...state, refreshCustomerStatements: action.payload }
		}
		case COMMON_OPEN_GENERIC_MODAL: {
			const { isVisible, path, content, button, disabledComponents } = action.payload
			// path relativo ao arquivo AppContainer.js

      return {
        ...state,
        genericModal: {
          isVisible,
          path,
          content,
          disabledComponents,
          button: { ...state.genericModal.button, ...button },
        },
      };
    }
    case COMMON_HIDE_GENERIC_MODAL: {
      return { ...state, genericModal: INITIAL_STATE.genericModal };
    }
    case COMMON_SET_LOAD_GENERIC_MODAL: {
      return { ...state, genericModal: { ...state.genericModal, loading: true } };
    }
    case COMMON_OPEN_TERMS_MODAL:
      return { ...state, isTermsModalVisible: true };
    case COMMON_HIDE_TERMS_MODAL:
      return { ...state, isTermsModalVisible: false };
    case COMMON_HAS_UPDATED_DEVICE_INFO:
      return { ...state, hasUpdatedDeviceInfo: action.payload };
    case COMMON_SET_BARCODE_VISIBILITY:
      return { ...state, barcodeVisibility: action.payload };
    case SET_VIEWPORT:
      return { ...state, viewport: action.payload };
    case COMMON_START_GLOBAL_LOADING: {
      return { ...state, globalLoader: true };
    }
    case COMMON_STOP_GLOBAL_LOADING: {
      return { ...state, globalLoader: false };
    }
    case COMMON_API_ERROR: {
      return { ...state, hasApiError: action.payload };
    }
	case COMMON_IS_CANCELLING_SALE: {
		return { ...state, isCancellingSale: action.payload }
	}
	case COMMON_SET_NUMBER_OF_MESSAGES:
      return { ...state, intercomUnreadConversation: action.payload }
	case SET_ENABLED_DRAWER_SWIPE:
      return { ...state, enabledDrawerSwipe: action.payload }
	case SHOW_NEED_CONFIGURE_CATALOG_MODAL_FOR_COUPONS:
		return { ...state, showNeedConfigureCatalogModalForCoupons: action.payload }
	case COMMON_SET_AUDIO_PERMISSION_REQUESTED:
		return { ...state, audioPermissionRequested: action.payload }
	default:
		return state;
  }

};
