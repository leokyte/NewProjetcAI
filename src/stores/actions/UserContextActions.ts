import { Dispatch } from 'redux'
import {
	USER_CONTEXT_FETCH_REQUEST,
	USER_CONTEXT_FETCH_SUCCESS,
	USER_CONTEXT_FETCH_FAILURE,
} from './types'
import { kyteQueryGetUserContext } from '../../services/kyte-user-context'
import { logError } from '../../integrations'
import { IUserContext } from '@kyteapp/kyte-utils'

interface UserContextFetchRequestAction {
	type: typeof USER_CONTEXT_FETCH_REQUEST
}

interface UserContextFetchSuccessAction {
	type: typeof USER_CONTEXT_FETCH_SUCCESS
	payload: IUserContext
}

interface UserContextFetchFailureAction {
	type: typeof USER_CONTEXT_FETCH_FAILURE
	payload: string
}

export type UserContextActionTypes =
	| UserContextFetchRequestAction
	| UserContextFetchSuccessAction
	| UserContextFetchFailureAction

/**
 * Fetches user context data (business characteristics and active features)
 * @param {string} aid - The account ID
 * @returns {Function} Redux thunk action
 */
export function fetchUserContext(aid: string) {
	return async (dispatch: Dispatch<UserContextActionTypes, any>): Promise<IUserContext | void> => {
		dispatch({ type: USER_CONTEXT_FETCH_REQUEST })
		
		try {
			const response = await kyteQueryGetUserContext(aid)
			dispatch({
				type: USER_CONTEXT_FETCH_SUCCESS,
				payload: response.data,
			})
			return response.data
		} catch (error: any) {
			logError('UserContextActions:fetchUserContext', error)
			dispatch({
				type: USER_CONTEXT_FETCH_FAILURE,
				payload: error.message || 'Failed to fetch user context',
			})
			throw error
		}
	}
}

