import {
	SMART_ASSISTANT_CLEAR_SESSION_DETAIL,
	SMART_ASSISTANT_CREATE_SESSION_FAILURE,
	SMART_ASSISTANT_CREATE_SESSION_REQUEST,
	SMART_ASSISTANT_CREATE_SESSION_SUCCESS,
	SMART_ASSISTANT_DELETE_SESSION_FAILURE,
	SMART_ASSISTANT_DELETE_SESSION_REQUEST,
	SMART_ASSISTANT_DELETE_SESSION_SUCCESS,
	SMART_ASSISTANT_FETCH_SESSION_DETAIL_FAILURE,
	SMART_ASSISTANT_FETCH_SESSION_DETAIL_REQUEST,
	SMART_ASSISTANT_FETCH_SESSION_DETAIL_SUCCESS,
	SMART_ASSISTANT_FETCH_SESSIONS_FAILURE,
	SMART_ASSISTANT_FETCH_SESSIONS_REQUEST,
	SMART_ASSISTANT_FETCH_SESSIONS_SUCCESS,
} from './types'
import {
	kyteQueryCreateConversationSession,
	kyteQueryDeleteConversationSession,
	kyteQueryGetConversationSession,
	kyteQueryListConversationSessions,
} from '../../services/kyte-agent-api'
import {
	ICreateConversationSessionBody,
	ICreateConversationSessionResponse,
	IDeleteConversationSessionBody,
	IDeleteConversationSessionResponse,
	IGetConversationSessionResponse,
	IListConversationSessionsParams,
	IListConversationSessionsResponse,
} from '@kyteapp/kyte-utils/types'
import KyteMixpanel from '../../integrations/Mixpanel'

export const fetchSmartAssistantSessions =
	(params: IListConversationSessionsParams) =>
	async (dispatch: any): Promise<IListConversationSessionsResponse> => {
		dispatch({ type: SMART_ASSISTANT_FETCH_SESSIONS_REQUEST })
		try {
			const response = await kyteQueryListConversationSessions(params)
			dispatch({
				type: SMART_ASSISTANT_FETCH_SESSIONS_SUCCESS,
				payload: response,
			})
			return response
		} catch (error) {
			dispatch({
				type: SMART_ASSISTANT_FETCH_SESSIONS_FAILURE,
			})
			throw error
		}
	}

export const createSmartAssistantSession =
	(body: ICreateConversationSessionBody) =>
	async (dispatch: any): Promise<ICreateConversationSessionResponse> => {
		dispatch({ type: SMART_ASSISTANT_CREATE_SESSION_REQUEST })
		try {
			const response = await kyteQueryCreateConversationSession(body)
			dispatch({
				type: SMART_ASSISTANT_CREATE_SESSION_SUCCESS,
				payload: response,
			})
			KyteMixpanel.track('Smart AI Assistant Conversation Start', {
				session_id: response.session_id,
			})
			return response
		} catch (error) {
			dispatch({
				type: SMART_ASSISTANT_CREATE_SESSION_FAILURE,
			})
			throw error
		}
	}

export const deleteSmartAssistantSession =
	(body: IDeleteConversationSessionBody) =>
	async (dispatch: any): Promise<IDeleteConversationSessionResponse> => {
		dispatch({ type: SMART_ASSISTANT_DELETE_SESSION_REQUEST })
		try {
			const response = await kyteQueryDeleteConversationSession(body)
			dispatch({
				type: SMART_ASSISTANT_DELETE_SESSION_SUCCESS,
				payload: response,
			})
			return response
		} catch (error) {
			dispatch({
				type: SMART_ASSISTANT_DELETE_SESSION_FAILURE,
			})
			throw error
		}
	}

export const fetchSmartAssistantSessionDetail =
	(sessionId: string) =>
	async (dispatch: any): Promise<IGetConversationSessionResponse> => {
		dispatch({ type: SMART_ASSISTANT_FETCH_SESSION_DETAIL_REQUEST })
		try {
			const response = await kyteQueryGetConversationSession({ session_id: sessionId })
			dispatch({
				type: SMART_ASSISTANT_FETCH_SESSION_DETAIL_SUCCESS,
				payload: response,
			})
			return response
		} catch (error) {
			dispatch({
				type: SMART_ASSISTANT_FETCH_SESSION_DETAIL_FAILURE,
			})
			throw error
		}
	}

export const clearSmartAssistantSessionDetail = () => ({
	type: SMART_ASSISTANT_CLEAR_SESSION_DETAIL,
})
