import { IUserContext } from '@kyteapp/kyte-utils'
import {
	USER_CONTEXT_FETCH_REQUEST,
	USER_CONTEXT_FETCH_SUCCESS,
	USER_CONTEXT_FETCH_FAILURE,
} from '../actions/types'
import { UserContextActionTypes } from '../actions/UserContextActions'

interface UserContextState {
	data: IUserContext | null
	loading: boolean
	error: string | null
}

const INITIAL_STATE: UserContextState = {
	data: null,
	loading: false,
	error: null,
}

export default (state = INITIAL_STATE, action: UserContextActionTypes): UserContextState => {
	switch (action.type) {
		case USER_CONTEXT_FETCH_REQUEST:
			return {
				...state,
				loading: true,
				error: null,
			}
		
		case USER_CONTEXT_FETCH_SUCCESS:
			return {
				...state,
				data: action.payload,
				loading: false,
				error: null,
			}
		
		case USER_CONTEXT_FETCH_FAILURE:
			return {
				...state,
				loading: false,
				error: action.payload,
			}
		
		default:
			return state
	}
}

