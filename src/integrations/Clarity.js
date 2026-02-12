import { LogLevel, initialize, setCustomUserId, setCustomTag } from '@microsoft/react-native-clarity'
import Config from 'react-native-config'
import { isCatalogApp } from '../util/util-flavors'

const POS_KEY = Config.CLARITY_POS_KEY
const CATALOG_KEY = Config.CLARITY_CATALOG_KEY
const CLARITY_CONFIG = {
	logLevel: LogLevel.None, // Verbose
	allowMeteredNetworkUsage: false,
}

export const initClarity = () => {
	try {
		const currentAppKey = isCatalogApp() ? CATALOG_KEY : POS_KEY
		initialize(currentAppKey, CLARITY_CONFIG)
		if (__DEV__) console.tron.log('Clarity initialized...')
	} catch (error) {
		if (__DEV__) console.tron.logImportant('Clarity init error: ', error.message)
	}
}

export const setClarityUserId = (aid) => {
	try {
		setCustomUserId(aid)
	} catch (error) {
		if (__DEV__) console.tron.logImportant('Set Clarity custom user ID error: ', error.message)
	}
}

export const getClarityTags = (getState) => {
	try {
		const { auth, billing } = getState()
		const { user } = auth

		const userTags = {
			is_owner: Boolean(user?.permissions?.isOwner).toString(),
			plan: billing?.plan,
			billing_status: billing?.status,
		}
		return userTags
	} catch (error) {
		if (__DEV__) console.tron.logImportant('getClarityTags error: ', error.message)
	}
}

export const setClarityCustomTags = (tags) => {
	try {
		Object.entries(tags).forEach(([key, value]) => {
			setCustomTag(key, value)
		})
	} catch (error) {
		if (__DEV__) console.tron.logImportant('Set Clarity custom tags error: ', error.message)
	}
}
