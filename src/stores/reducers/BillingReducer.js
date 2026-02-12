import {
	BILLING_FETCH,
	TOGGLE_BILLING_MESSAGE,
	TOGGLE_BLOCK_MANAGE,
	UPDATE_BILLING_UNIQUE_MESSAGES,
	RESET_BILLING_UNIQUE_MESSAGES,
	BILLING_SET_SUCCESSFUL_MODAL,
	BILLING_SET_ERROR_MODAL,
	LOGOUT,
} from '../actions/types'
import { billingMessages } from '../../messages'
import { trialRemaningDays, countUniqueMessages } from '../../util'

const INITIAL_STATE = {
	status: 'new',
	endDate: new Date(),
	planInfo: {
		label: 'Pro',
		name: 'pro',
		features: ['all'],
	},
	isMessageVisible: false,
	message: billingMessages.Pro,
	webview: '',
	trialDays: 0,
	uniqueMessages: [
		// { type: 'millennium', count: 0 },
		// { type: 'paid', count: 0 },
		{ type: 'toleranceExpired', count: 0 },
	],
	isSuccessfulMessageVisible: false,
	isErrorMessageVisible: false,
	showBlockManagePlan: false,
}

export default (state = INITIAL_STATE, action) => {
	switch (action.type) {
		case BILLING_FETCH: {
			const { endDate, status } = action.payload
			const trialDays = status === 'trial' ? trialRemaningDays(endDate) : ''
			const intermediaryInfo = action?.payload?.intermediaryInfo || {}

			return { ...state, ...action.payload, trialDays, planInfo: { ...state.planInfo, ...intermediaryInfo } }
		}

		case TOGGLE_BILLING_MESSAGE: {
			const { visibility, message, webview } = action.payload
			if (visibility) {
				const customMessage = billingMessages[message]
				if (!customMessage) return { ...state }

				const uniqueMessages = countUniqueMessages(state.uniqueMessages, message)
				const useMessage = message ? customMessage : INITIAL_STATE.message

				return {
					...state,
					isMessageVisible: visibility,
					message: useMessage,
					webview,
					uniqueMessages,
				}
			}
			return { ...state, isMessageVisible: visibility }
		}

		case TOGGLE_BLOCK_MANAGE: {
			return { ...state, showBlockManagePlan: action.payload }
		}

		case UPDATE_BILLING_UNIQUE_MESSAGES: {
			const stateMessages = state.uniqueMessages.length
			const newMessages = INITIAL_STATE.uniqueMessages.filter((msg, i) => i > stateMessages - 1)
			const uniqueMessages = newMessages.length ? [...state.uniqueMessages, ...newMessages] : state.uniqueMessages

			return { ...state, uniqueMessages }
		}

		case RESET_BILLING_UNIQUE_MESSAGES: {
			const type = action.payload
			const otherMessages = state.uniqueMessages.filter((msg) => msg.type !== type)

			return { ...state, uniqueMessages: [...otherMessages, { type, count: 0 }] }
		}
		case LOGOUT: {
			return { ...INITIAL_STATE }
		}
		case BILLING_SET_SUCCESSFUL_MODAL: {
			const { visibility, fromManageButton } = action.payload
			return { ...state, isSuccessfulMessageVisible: visibility, fromManageButton }
		}
		case BILLING_SET_ERROR_MODAL: {
			const { visibility } = action.payload
			return { ...state, isErrorMessageVisible: visibility }
		}
		default:
			return state
	}
}
