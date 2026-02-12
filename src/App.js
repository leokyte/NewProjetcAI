import { Platform, Text, View } from 'react-native'
import React, { useCallback, useEffect } from 'react'
import { Provider } from 'react-redux'
import moment from 'moment/min/moment-with-locales'
import { GoogleSignin } from '@react-native-google-signin/google-signin'
import * as RNLocalize from 'react-native-localize'
import AsyncStorage from '@react-native-community/async-storage'
import { enableScreens } from 'react-native-screens'
import ViewportProvider from '@kyteapp/kyte-ui-components/src/packages/utilities/viewport-provider/ViewportProvider'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { firebaseInit, remoteConfigSetDefaults } from './integrations'
import { AppContainer } from './components/AppContainer'
import { withIAPContext } from 'react-native-iap'
import createStore from './configureStore'
import KyteErrorHandler from './integrations/ErrorHandler'
import { initializeOneSignal, registerOneSignalListeners } from './integrations/OneSignal'

import { generateRandomString, googleSigninConfig, disableDevWarnings, LOGIN_TRACKER_SESSION_ID } from './util'
import { Breakpoints } from './enums'
import ViewportSync from './components/common/ViewportSync'
import { initClarity } from './integrations/Clarity'
import { getGeoLocation } from './services/kyte-common'
import { USER_IP_STORAGE_KEY } from './constants/common'
import { Settings } from 'react-native-fbsdk-next'
import initAppsFlyer from './integrations/AppsFlyer/AppsFlyerSDK'

const store = createStore()
enableScreens(true)

if (__DEV__) {
	import('./ReactotronConfig').then(() =>
		console.tron.logImportant('Reactotron is loaded successfully! Welcome to Kyte :)')
	)
}

const App = () => {
	const initGooglePlayServices = async () => {
		const hasPlayServices = await GoogleSignin.hasPlayServices({
			showPlayServicesUpdateDialog: true,
			autoResolve: true,
		})
		if (hasPlayServices) {
			GoogleSignin.configure(googleSigninConfig)
		}
	}
	const setLocale = () => {
		const locales = RNLocalize.getLocales()
		moment.locale(locales[0].languageTag)
	}

	/**
	 * Get user's IP address and store it in AsyncStorage
	 * IP address is used on Mixpanel properties and events.
	 **/
	const getUserIPAddress = useCallback(async () => {
		const userIP = await AsyncStorage.getItem(USER_IP_STORAGE_KEY)
		if (userIP) return

		const geoLocation = await getGeoLocation()
		AsyncStorage.setItem(USER_IP_STORAGE_KEY, geoLocation?.query || '')
	}, [])

	const facebookSdkInit = () => {
		Settings.initializeSDK()
	}

	useEffect(() => {
		disableDevWarnings()
		firebaseInit()
		remoteConfigSetDefaults()
		setLocale()
		initGooglePlayServices()
		getUserIPAddress()
		facebookSdkInit()
		initAppsFlyer()
		KyteErrorHandler.processErrorsQueue()
		// Generating session_id
		AsyncStorage.setItem(LOGIN_TRACKER_SESSION_ID, generateRandomString(30))
		if (Platform.OS === 'android') initClarity()
		setTimeout(() => {
			// Initializing OneSignal and registering its listeners.
			initializeOneSignal(store.dispatch)
			registerOneSignalListeners()
		}, 1)
	}, [])

	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<ViewportProvider breakpoints={Breakpoints}>
				<Provider store={store}>
					<ViewportSync>
						<AppContainer />
					</ViewportSync>
				</Provider>
			</ViewportProvider>
		</GestureHandlerRootView>
	)
}

export default withIAPContext(App)
export { store }
