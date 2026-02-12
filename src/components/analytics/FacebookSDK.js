import { connect } from 'react-redux'
import react, { useCallback, useEffect } from 'react'
import { Settings, AppEventsLogger } from 'react-native-fbsdk-next'
import { logError } from '../../integrations'

/**
 * This component initializes Facebook SDK and sets the user data.
 * @ReactNode FacebookSDK - Initialize Facebook SDK
 * @returns {void} Returns nothing.
 **/
export const FacebookSDK = ({ user, isLogged, countryCode }) => {
	/**
	 * @function initFacebookSDK - Initialize Facebook SDK
	 * @returns {void} Returns nothing.
	 */
	const initFacebookSDK = useCallback(() => {
		try {
			Settings.initializeSDK()
			Settings.setAutoLogAppEventsEnabled(true)
			Settings.setAdvertiserIDCollectionEnabled(true)
		} catch (error) {
			logError(error, '[error] Error initializing Facebook SDK')
		}
	}, [])

	/**
	 * @function setFacebookUserData - Set Facebook user data
	 * @returns {void} Returns nothing.
	 **/
	const setFacebookUserData = useCallback(() => {
		if (user && isLogged) {
			try {
				AppEventsLogger.setUserID(user.uid)
				AppEventsLogger.setUserData({ email: user.email, firstName: user.displayName, country: countryCode })
			} catch (error) {
				logError(error, '[error] Error setting Facebook user data')
			}
		}
	}, [user])

	useEffect(() => {
		initFacebookSDK()
	}, [initFacebookSDK])

	useEffect(() => {
		setFacebookUserData()
	}, [setFacebookUserData])

	return null
}

const mapStateToProps = ({ auth, preference }) => ({
	user: auth.user,
	isLogged: auth.isLogged,
	countryCode: preference.account?.countryCode,
})

export default connect(mapStateToProps, null)(FacebookSDK)
