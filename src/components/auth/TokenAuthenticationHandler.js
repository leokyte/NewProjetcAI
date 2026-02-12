import React, { useCallback, useEffect } from 'react'
import { connect } from 'react-redux'
import { Linking } from 'react-native'
import { doTokenSignIn, doSeamlessSignIn } from '../../stores/actions'
import { logError } from '../../integrations'
import { decodeURLParams } from '../../util'

const TokenAuthenticationHandler = (props) => {
	const { doTokenSignIn, doSeamlessSignIn, isLogged } = props
	/**
	 * Handles deep link URL containing a token and signs in user using doTokenSignIn action.
	 *
	 * Attempts to sign in user with the extracted token. If an error occurs during
	 * the sign-in process, record error on Crashlytics.
	 *
	 * @function tokenDeeplinkHandler
	 * @returns {void}
	 */
	const tokenDeeplinkHandler = useCallback(async () => {
		const tokenListener = Linking.addEventListener('url', async ({ url }) => {
			const params = decodeURLParams(url)
			if (params?.token) {
				try {
					await doTokenSignIn(params?.token)
				} catch (error) {
					logError(error, `tokenDeeplinkHandler error: ${error.message}}`)
				}
			}
		})
		return () => tokenListener.remove()
	}, [doTokenSignIn])

	/**
	 * Extract token from clipboard API using fingerprint as ID
	 * and signs in user through doSeamlessSignIn action.
	 *
	 * Attempts to sign in user with the extracted token. If an error occurs during
	 * the sign-in process, record error on Crashlytics.
	 *
	 * @function tokenFromClipboardHandler
	 * @returns {void}
	 **/
	const tokenFromClipboardHandler = useCallback(async () => {
		// Condition below calls doSeamlessSignIn only when user isn't logged and app isn't loading
		// null is used to represent the initial state of the application.
		// so: null = initial state, false = not logged, true = logged
		if (!isLogged && isLogged !== null) {
			try {
				await doSeamlessSignIn()
			} catch (error) {
				logError(error, `tokenFromClipboardHandler error: ${error.message}}`)
			}
		}
	}, [doSeamlessSignIn, isLogged])

	useEffect(() => {
		tokenFromClipboardHandler()
	}, [tokenFromClipboardHandler])

	useEffect(() => {
		tokenDeeplinkHandler()
	}, [tokenDeeplinkHandler])

	return null
}

const mapStateToProps = (state) => ({
	isLogged: state.auth.isLogged,
})

export default connect(mapStateToProps, { doTokenSignIn, doSeamlessSignIn })(TokenAuthenticationHandler)
