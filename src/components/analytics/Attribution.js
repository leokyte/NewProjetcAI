import React, { useCallback, useEffect } from 'react'
import { connect } from 'react-redux'
import { NativeModules, Platform, Linking } from 'react-native'
import { PlayInstallReferrer } from 'react-native-play-install-referrer'
import appsFlyer from '../../integrations/AppsFlyer/appsFlyerClient'
import { logError, logEvent } from '../../integrations/Firebase-Integration'
import { setCampaignProps } from '../../stores/actions'
import { decodeParamsIntoObject, decodeURLParams } from '../../util'
import { setAnalyticsUserId } from '../../integrations'
import { appsFlyerOnAppOpenUTMData, appsFlyerOnConversionUTMData } from '../../integrations/AppsFlyer/AppsFlyerSDK'

const { AppleAdsAttribution } = NativeModules

/**
 * Grabs attribution data from deep links, Apple Ad Services and Play Install Referrer
 * stores it inside auth.campaignProps reducer and send it to attribution-save API.
 * @param {Object} props - Component props.
 * @param {Object} props.campaignProps - The current attribution campaign properties.
 * @param {string} props.aid - The current user's aid.
 * @param {Function} props.setCampaignProps - Action to set the campaign properties.
 * @returns {null} Returns null since this component does not render any UI.
 */

const Attribution = ({ campaignProps, aid, user, isLogged, setCampaignProps: setCampaignAction }) => {
	/**
	 * @function retrieveAttributionContent - Set the campaign properties.
	 * @param {Object.<string, string | number>} attributionContent - key value pairs of attribution data.
	 */
	const retrieveAttributionContent = (attributionContent) => setCampaignAction(attributionContent)

	/**
	 * @function getIOSServicesAttributionData - Get data from Apple Ad Services Attribution
	 * @returns {Promise<void>} Returns a promise that resolves when the function is complete.
	 */
	const getIOSServicesAttributionData = useCallback(async () => {
		if (Platform.OS === 'ios') {
			try {
				const data = await AppleAdsAttribution?.getAdServicesAttributionData?.()
				retrieveAttributionContent(data)
			} catch (error) {
				console.error('AdServicesAttributionData error', error)
			}
		}
	}, [])

	/**
	 * @function getAndroidServicesAttributionData - Get data from Play Install Referrer
	 * @returns {void} Returns nothing.
	 */
	const getAndroidServicesAttributionData = useCallback(() => {
		if (Platform.OS === 'android') {
			try {
				PlayInstallReferrer.getInstallReferrerInfo((playInstallReferrerInfo, error) => {
					if (error) {
						console.warn('PlayInstallReferrer error', error)
						return
					}
					const data = decodeParamsIntoObject(playInstallReferrerInfo?.installReferrer)
					retrieveAttributionContent(data)
				})
			} catch (error) {
				console.error('PlayInstallReferrer error', error)
			}
		}
	}, [])

	/**
	 * @function getLinkingParams - Get params from any linking URL
	 * @returns {Function} Returns a function to remove the event listener.
	 */
	const getLinkingParams = useCallback(() => {
		try {
			const handler = ({ url }) => {
				const params = decodeURLParams(url)
				retrieveAttributionContent({ ...(params || {}), url })
			}
			const subscription = Linking.addEventListener('url', handler)
			return () => subscription.remove()
		} catch (error) {
			console.error('Linking URL error', error)
			return undefined
		}
	}, [])

	/**
 * @function getInitialLink - Get initial deep link when the app launches
 * @returns {Promise<void>} Returns a promise that resolves when the function is complete.
 */
const getInitialLink = useCallback(async () => {
		try {
			const initialUrl = await Linking.getInitialURL()
			if (initialUrl) {
				const params = decodeURLParams(initialUrl)
				retrieveAttributionContent({ ...(params || {}), url: initialUrl })
			}
		} catch (error) {
			console.error('InitialLink error', error)
		}
	}, [])

	/**
	 * @function appsFlyerOnInstallConversionHandler
	 * Registers a listener for AppsFlyer install conversion events.
	 * When the event indicates the app's first launch, extracts UTM data and sends it to the campaign reducer.
	 * Handles errors using logError from Firebase-Integration.
	 * @returns {void}
	 */
	const appsFlyerOnInstallConversionHandler = useCallback(() => {
		try {
			appsFlyer.onInstallConversionData((res) => {
				// Check if the install is non-organic and it's the first launch
				if (res?.data?.af_status === 'Non-organic' && res?.data?.is_first_launch === 'true') {
					const utmData = appsFlyerOnConversionUTMData(res)
					logEvent('one_link_first_open', utmData) // Log the first open event
					retrieveAttributionContent(utmData) // Handle the attribution content
				}
			})
		} catch (error) {
			logError(error, '[error] Error in AppsFlyerInstallConversionHandler')
		}
	}, [])

	/**
	 * @function appsFlyerOnAppOpenAttributionHandler
	 * Registers a listener for AppsFlyer app open attribution events.
	 * Logs the attribution data and sends it to the campaign reducer.
	 * Handles errors using logError from Firebase-Integration.
	 * @returns {void}
	 */
	const appsFlyerOnAppOpenAttributionHandler = useCallback(() => {
		try {
			appsFlyer.onAppOpenAttribution((res) => {
				// Log the AppsFlyer app open attribution data
				if (res?.data) {
					const utmData = appsFlyerOnAppOpenUTMData(res)
					logEvent('one_link_app_open', utmData)
					retrieveAttributionContent(utmData)
				}
			})
		} catch (error) {
			logError(error, '[error] Error in AppsFlyerOnAppOpenAttributionHandler')
		}
	}, [])

	/**
	 * @function appsFlyerSetUUserIdentity - Set AppsFlyer user ID
	 * @returns {void} Returns nothing.
	 */
	const appsFlyerSetUUserIdentity = useCallback(() => {
		if (user && isLogged) {
			try {
				appsFlyer.setCustomerUserId(user.uid)
			} catch (error) {
				logError(error, '[error] Error setting AppsFlyer user ID')
			}
		}
	}, [user, isLogged])

	/**
	 * @function setCampaigPropsAid - Add aid to campaign properties and analytics user id.
	 * @returns {void} Returns nothing.
	 */
	const setCampaignPropsAid = useCallback(() => {
		if (aid) {
			retrieveAttributionContent({ aid })
			setAnalyticsUserId(aid)
		}
	}, [aid])

	useEffect(() => {
		getIOSServicesAttributionData()
	}, [getIOSServicesAttributionData])

useEffect(() => {
	const unsubscribe = getLinkingParams()
	return () => {
		if (typeof unsubscribe === 'function') {
			unsubscribe()
		}
	}
}, [getLinkingParams])

useEffect(() => {
	getInitialLink()
}, [getInitialLink])

	useEffect(() => {
		setCampaignPropsAid()
	}, [setCampaignPropsAid])

	useEffect(() => {
		getAndroidServicesAttributionData()
	}, [getAndroidServicesAttributionData])

	useEffect(() => {
		appsFlyerOnInstallConversionHandler()
	}, [appsFlyerOnInstallConversionHandler])

	useEffect(() => {
		appsFlyerOnAppOpenAttributionHandler()
	}, [appsFlyerOnAppOpenAttributionHandler])

	useEffect(() => {
		appsFlyerSetUUserIdentity()
	}, [appsFlyerSetUUserIdentity])

	return null
}

const mapStateToProps = (state) => ({
	campaignProps: state.auth.campaignProps,
	aid: state.auth.aid,
	user: state.auth.user,
	isLogged: state.auth.isLogged,
})

export default connect(mapStateToProps, {
	setCampaignProps,
})(Attribution)
