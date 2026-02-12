import {
	LOGIN_SUCCESS,
	LOGIN_FAIL,
	LOGOUT,
	SET_SIGNIN_EMAIL,
	SET_SIGNIN_PASSWORD,
	SET_AUTH_CONFIRMED,
	USER_SET,
	ACCOUNT_STORE_SAVE,
	UPDATE_USER_ACCOUNT,
	SET_MULTI_USERS,
	ADD_USER_FAIL,
	SET_DID,
	STORE_IMAGE_SET,
	USER_ALREADY_SEEN_CATALOG_HELPER,
	AUTH_INITIALIZE,
	CATALOG_TAX_SAVE,
	SET_USER_CUSTOM_INFO,
	SET_CAMPAIGN_PROPS,
	BEHAVIOR_FETCH,
	SET_KID_IN_AUTH,
	LOADING_AUTHENTICATION,
	PIX_DATA_CONFIG,
	PROMOTION_CREATE,
	PROMOTION_LIST,
	PROMOTION_EDIT,
} from '../actions/types'
import { showAlert } from '../../util'
import I18n from '../../i18n/i18n'

const INITIAL_STATE = {
	isLogged: null,
	signinEmail: '',
	signinPassword: '',
	signinType: '',
	aid: '',
	did: '',
	multiUsers: [],
	campaignProps: null,
	loadingAuthentication: null,
	invalidateToken: false,
	behavior: {
		helper: {
			enabled: false,
		},
	},
}

export default (state = INITIAL_STATE, action) => {
	switch (action.type) {
		case LOGIN_SUCCESS: {
			return {
				...state,
				isLogged: true,
				signinEmail: action.payload.user.email,
				user: action.payload.user,
				aid: action.payload.user.aid,
				account: action.payload.account || {},
				store: action.payload.store || {},
				multiUsers: action.payload.multiUsers || [],
			}
		}
		case AUTH_INITIALIZE: {
			const { user, store = {}, account = {}, multiUsers = [] } = action.payload

			return {
				...state,
				user,
				aid: user?.aid,
				store: {
					...(store || {}),
					imageSet: store?.image,
					customerExtra: store.customerExtra ?? true,
				},
				account,
				multiUsers,
			}
		}
		case BEHAVIOR_FETCH: {
			return { ...state, behavior: action.payload }
		}
		case SET_MULTI_USERS: {
			return { ...state, multiUsers: action.payload }
		}
		case LOGIN_FAIL: {
			const failMessage = () => {
				switch (action.payload.code || action.payload.message) {
					case 'auth/wrong-password':
						return I18n.t('loginFailedWrongPassword')
					case 'auth/email-already-in-use':
						return I18n.t('loginFailedEmailAlreadyInUse')
					case 'auth/account-exists-with-different-credential':
						return I18n.t('loginFailedEmailAlreadyInUse')
					case 'error-valid-signin':
						return I18n.t('words.m.youDontHaveLoginPermission')
					default:
						return I18n.t('loginFailedDescription')
				}
			}

			showAlert(I18n.t('loginFailedTitle'), failMessage(), [{ text: I18n.t('alertOk') }])
			return { ...state, isLogged: false }
		}
		case ADD_USER_FAIL: {
			const failMessage = () => {
				switch (action.payload.code) {
					case 'auth/email-already-in-use':
						return I18n.t('loginFailedEmailAlreadyInUse')
					default:
						return I18n.t('loginFailedDescription')
				}
			}

			showAlert(I18n.t('failedToCreateUser'), failMessage(), [{ text: I18n.t('alertOk') }])
			return state
		}
		case LOGOUT: {
			return { ...INITIAL_STATE, isLogged: false, loadingAuthentication: false }
		}
		case SET_SIGNIN_EMAIL: {
			return { ...state, signinEmail: action.payload }
		}
		case SET_SIGNIN_PASSWORD: {
			return { ...state, signinPassword: action.payload }
		}
		case USER_SET: {
			return { ...state, user: action.payload }
		}
		case ACCOUNT_STORE_SAVE: {
			return { ...state, store: action.payload }
		}
		case PIX_DATA_CONFIG: {
			return { ...state, store: action.payload }
		}
		case STORE_IMAGE_SET: {
			return { ...state, store: { ...state.store, imageSet: action.payload } }
		}
		case SET_DID: {
			return { ...state, did: action.payload }
		}
		case UPDATE_USER_ACCOUNT: {
			return { ...state, account: action.payload }
		}
		case USER_ALREADY_SEEN_CATALOG_HELPER: {
			let { user } = state
			let { appInfo } = user

			appInfo = { ...appInfo, alreadySeenCatalogHelper: action.payload }
			user = { ...user, appInfo }

			return { ...state, user }
		}
		case CATALOG_TAX_SAVE: {
			const { store } = state
			const catalog = { ...store.catalog, taxes: [action.payload] }
			return { ...state, store: { ...store, catalog: { ...catalog } } }
		}
		case SET_AUTH_CONFIRMED: {
			const { user } = state
			return { ...state, user: { ...user, authVerified: true } }
		}
		case SET_USER_CUSTOM_INFO: {
			return {
				...state,
				user: { ...state.user, appInfo: { ...state.user.appInfo, ...action.payload } },
			}
		}
		case SET_CAMPAIGN_PROPS: {
			return { ...state, campaignProps: { ...state.campaignProps, ...action.payload } }
		}
		case SET_KID_IN_AUTH: {
			return { ...state, kid: action.payload }
		}
		case LOADING_AUTHENTICATION: {
			return { ...state, loadingAuthentication: action.payload }
		}
		case PROMOTION_CREATE: {
			const statePromotions = state?.promotions || []
			return { ...state, promotions: [...statePromotions, action.payload.data ]}
		}
		case PROMOTION_LIST: {
			return { ...state, promotions: action.payload.data.data }
		}
		case PROMOTION_EDIT: {
			return { ...state, promotions: [...state.promotions, action.payload.data ]}
		}

		default:
			return state
	}
}
