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
} from '../actions/types'

const INITIAL_STATE = {
	sessionsList: [],
	isCreatingSession: false,
	isFetchingSessions: false,
	isDeletingSession: false,
	isLoadingSessionDetail: false,
	sessionDetail: null,
	error: null,
}

export default (state = INITIAL_STATE, action) => {
	switch (action.type) {
		case SMART_ASSISTANT_FETCH_SESSIONS_REQUEST:
			return { ...state, isFetchingSessions: true, error: null }
		case SMART_ASSISTANT_FETCH_SESSIONS_SUCCESS:
			return {
				...state,
				isFetchingSessions: false,
				sessionsList: action.payload?.sessions ?? [],
			}
		case SMART_ASSISTANT_FETCH_SESSIONS_FAILURE:
			return {
				...state,
				isFetchingSessions: false,
				error: action.payload,
			}
		case SMART_ASSISTANT_CREATE_SESSION_REQUEST:
			return { ...state, isCreatingSession: true, error: null }
		case SMART_ASSISTANT_CREATE_SESSION_SUCCESS: {
			const session = action.payload

			return {
				...state,
				isCreatingSession: false,
				sessionDetail: {
					session_id: session.session_id,
					active: session.active,
					messages: [],
					title: session.title,
				},
			}
		}
		case SMART_ASSISTANT_CREATE_SESSION_FAILURE:
			return { ...state, isCreatingSession: false, error: action.payload }
		case SMART_ASSISTANT_DELETE_SESSION_REQUEST:
			return { ...state, isDeletingSession: true, error: null }
		case SMART_ASSISTANT_DELETE_SESSION_SUCCESS: {
			const sessionId = action.payload?.session_id
			return {
				...state,
				isDeletingSession: false,
				sessionDetail: state.sessionDetail?.session_id === sessionId ? null : state.sessionDetail,
			}
		}
		case SMART_ASSISTANT_DELETE_SESSION_FAILURE:
			return { ...state, isDeletingSession: false, error: action.payload }
		case SMART_ASSISTANT_FETCH_SESSION_DETAIL_REQUEST:
			return { ...state, isLoadingSessionDetail: true, error: null }
		case SMART_ASSISTANT_FETCH_SESSION_DETAIL_SUCCESS:
			return { ...state, isLoadingSessionDetail: false, sessionDetail: action.payload ?? null }
		case SMART_ASSISTANT_FETCH_SESSION_DETAIL_FAILURE:
			return { ...state, isLoadingSessionDetail: false, error: action.payload }
		case SMART_ASSISTANT_CLEAR_SESSION_DETAIL:
			return { ...state, sessionDetail: null }
		default:
			return state
	}
}
