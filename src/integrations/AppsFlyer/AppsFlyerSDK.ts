import { NativeModules, Platform } from 'react-native'
import appsFlyer, { ConversionData, OnAppOpenAttributionData } from './appsFlyerClient'
import Config from 'react-native-config'

const APPS_FLYER_DEV_KEY = Config.APPS_FLYER_DEV_KEY
const iosAppId = 'id1345983058'

/**
 * Initializes the AppsFlyer SDK with the provided configuration.
 *
 * This function sets up the AppsFlyer SDK using the developer key and iOS app ID.
 * It also enables debug mode and configures the time to wait for ATT user authorization.
 */
const initAppsFlyer = () => {
	// Avoid calling into a missing native module (iOS build without AppsFlyer linked)
	if (!NativeModules?.RNAppsFlyer) {
		if (__DEV__) {
			// eslint-disable-next-line no-console
			console.warn('[AppsFlyer] RNAppsFlyer native module not available; skipping init.')
		}
		return
	}

	appsFlyer.initSdk(
		{
			devKey: String(APPS_FLYER_DEV_KEY),
			isDebug: __DEV__,
			appId: iosAppId,
			timeToWaitForATTUserAuthorization: 10,
		},
		(result) => {
			if (__DEV__) {
				const message = `AppsFlyer SDK initialized successfully with devKey: ${APPS_FLYER_DEV_KEY}`
				console.log(message, result)
				console.tron.log(message, result)
			}
		},
		(error) => {
			if (__DEV__) {
				console.tron.error('AppsFlyer SDK initialization failed:', error)
			}
		}
	)
}

/**
 * Extracts UTM and attribution data from an AppsFlyer install conversion event.
 *
 * @param {ConversionData} res - The AppsFlyer conversion data response object.
 * @returns {object} An object containing UTM and attribution properties (utm_source, utm_campaign, utm_medium).
 */
export const appsFlyerOnConversionUTMData = (res: ConversionData) => ({
	utm_source: res?.data?.media_source || '',
	utm_campaign: res?.data?.campaign || '',
	utm_medium: String(res?.data?.af_status).toLowerCase || '',
})

/**
 * Extracts all relevant UTM and attribution data from an AppsFlyer app open attribution event.
 *
 * @param {OnAppOpenAttributionData} res - The AppsFlyer app open attribution data response object.
 * @returns {object} An object containing all mapped attribution properties from the event.
 */
export const appsFlyerOnAppOpenUTMData = (res: OnAppOpenAttributionData): object => ({
	utm_source: res?.data?.media_source || '',
	utm_campaign: res?.data?.campaign || '',
	af_dp: res?.data?.af_dp || '',
	is_retargeting: res?.data?.is_retargeting || '',
	af_channel: res?.data?.af_channel || '',
	af_cost_currency: res?.data?.af_cost_currency || '',
	c: res?.data?.c || '',
	af_adset: res?.data?.af_adset || '',
	af_click_lookback: res?.data?.af_click_lookback || '',
	deep_link_sub1: res?.data?.deep_link_sub1 || '',
	deep_link_value: res?.data?.deep_link_value || '',
	link: res?.data?.link || '',
	pid: res?.data?.pid || '',
	path: res?.data?.path || '',
	host: res?.data?.host || '',
	shortlink: res?.data?.shortlink || '',
	scheme: res?.data?.scheme || '',
	af_sub1: res?.data?.af_sub1 || '',
	af_sub2: res?.data?.af_sub2 || '',
	af_sub3: res?.data?.af_sub3 || '',
	af_sub4: res?.data?.af_sub4 || '',
	af_sub5: res?.data?.af_sub5 || '',
})

export default initAppsFlyer
