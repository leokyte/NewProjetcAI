import moment from 'moment/min/moment-with-locales'
import Config from 'react-native-config'
import * as packages from '../../../package'
import { INTERNAL_SET_LAST_VERSION, INTERNAL_SET_URLS, INTERNAL_SET_GLOBAL } from '../actions/types'

const INITIAL_STATE = {
	services: {
		lastUpdate: null,
		urls: {
			pay: Config.KYTE_API_URL,
			userAccount: Config.KYTE_USER_ACCOUNT_URL,
			data: Config.KYTE_DATA_URL,
			sender: Config.KYTE_SENDER_URL,
			stats: Config.KYTE_STATS_URL,
		},
	},
	version: {
		current: packages.version,
		last: null,
	},
	global: {},
}

export default (state = INITIAL_STATE, action) => {
	switch (action.type) {
		case INTERNAL_SET_LAST_VERSION:
			return { ...state, version: { ...state.version, last: action.payload } }
		case INTERNAL_SET_URLS:
			return { ...state, services: { lastUpdate: moment().unix(), urls: action.payload } }
		case INTERNAL_SET_GLOBAL: {
			return { ...state, global: action.payload }
		}
		default:
			return state
	}
}
