import axios from 'axios'
import Config from 'react-native-config'
import {
	IListConversationSessionsParams,
	IListConversationSessionsResponse,
	ICreateConversationSessionBody,
	ICreateConversationSessionResponse,
	IDeleteConversationSessionBody,
	IDeleteConversationSessionResponse,
	IGetConversationSessionParams,
	IGetConversationSessionResponse,
} from '@kyteapp/kyte-utils/types'

const { APIM_SUBSCRIPTION_KEY, API_GATEWAY_BASE_URL } = Config

const kyteAiApi = axios.create({
	baseURL: `${API_GATEWAY_BASE_URL}/kyte-ai`,
	timeout: 30000,
	headers: {
		'Ocp-Apim-Subscription-Key': APIM_SUBSCRIPTION_KEY,
	},
})

export async function kyteQueryListConversationSessions(
	params: IListConversationSessionsParams
): Promise<IListConversationSessionsResponse> {
	const response = await kyteAiApi.get('/list-conversation-sessions', { params })
	return response.data as IListConversationSessionsResponse
}

export async function kyteQueryCreateConversationSession(
	body: ICreateConversationSessionBody
): Promise<ICreateConversationSessionResponse> {
	const response = await kyteAiApi.post('/create-conversation-session', body)
	return response.data as ICreateConversationSessionResponse
}

export async function kyteQueryDeleteConversationSession(
	body: IDeleteConversationSessionBody
): Promise<IDeleteConversationSessionResponse> {
	const response = await kyteAiApi.put('/remove-conversation-session', body)
	return response.data as IDeleteConversationSessionResponse
}

export async function kyteQueryGetConversationSession(
	params: IGetConversationSessionParams
): Promise<IGetConversationSessionResponse> {
	const response = await kyteAiApi.get('/conversation-session', {
		params: {
			session_id: params.session_id,
		},
	})
	return response.data as IGetConversationSessionResponse
}
