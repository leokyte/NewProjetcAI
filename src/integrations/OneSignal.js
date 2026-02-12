import Config from 'react-native-config'
import { OneSignal, LogLevel } from 'react-native-onesignal'
import { pushNotificationOnPress, toggleBillingMessage } from '../stores/actions'
import NavigationService from '../services/kyte-navigation'
import { oneSignalRoutesMap } from '../enums'
import { isPOSApp } from '../util/util-flavors'

const SALE_PAYMENT_GATEWAY_NOTIFICATION = 'sale-payment-gateway'
const CATALOG_ORDER = 'catalog-order'

const oneSignalConfig = {
	appId: isPOSApp() ? Config.ONESIGNAL_POS_APP_ID : Config.ONESIGNAL_CATALOG_APP_ID,
}

let reduxDispatch = null
let notificationClickListener = null
let notificationWillDisplayListener = null
const onOpenNotification = (openResult) => {
	if (__DEV__) {
		console.tron.logImportant({ openResult, ble: 'bla' })
	}

	const hasAdditionalData = !!openResult.notification.additionalData

	if (hasAdditionalData) {
		const { additionalData } = openResult.notification
		const { type, sale, deepLink } = additionalData
		const route = oneSignalRoutesMap[deepLink]

		if (type && sale && (type === SALE_PAYMENT_GATEWAY_NOTIFICATION || type === CATALOG_ORDER)) {
			reduxDispatch(toggleBillingMessage(false))
			setTimeout(async () => reduxDispatch(pushNotificationOnPress(sale)), 1000)
		}

		if (deepLink && route) {
			setTimeout(() => NavigationService.navigate(...route), 1000)
		}
	}
}

export const initializeOneSignal = (reduxStoreDispatch, callback) => {
	if (__DEV__) {
		OneSignal.Debug.setLogLevel(LogLevel.Verbose)
	}

	OneSignal.initialize(oneSignalConfig.appId)
	if (notificationWillDisplayListener) {
		OneSignal.Notifications.removeEventListener('willDisplay', notificationWillDisplayListener)
	}
	notificationWillDisplayListener = (event) => {
		// Restored notifications reference stale resource IDs on fresh installs; swallow them for now.
		const isRestored = event?.notification?.restored
		if (isRestored) {
			try {
				event.preventDefault?.()
				event.complete?.(null)
			} catch {
				/* ignore */
			}
		}
	}
	OneSignal.Notifications.addEventListener('willDisplay', notificationWillDisplayListener)
	reduxDispatch = reduxStoreDispatch
	if (callback) callback()
}

// Get Push Notification Properties- You can call this function to get userId(player ID) for example
// async function getDeviceState() {
//   const deviceState = await OneSignal.getDeviceState();
//   console.log('deviceState: ', deviceState);
// }

export const setOneSignalExternalId = (aid) => {
	OneSignal.login(aid)
	if (__DEV__) console.tron.log('Setting OneSignal user login', aid)
}

export const removeOneSignalExternalId = () => {
	OneSignal.logout()
	if (__DEV__) console.tron.log('Removing OneSignal user login')
}

export const registerOneSignalListeners = () => {
	if (notificationClickListener) {
		OneSignal.Notifications.removeEventListener('click', notificationClickListener)
	}

	notificationClickListener = (notification) => {
		onOpenNotification(notification)
	}

	OneSignal.Notifications.addEventListener('click', notificationClickListener)
}

export const registerOneSignalTag = (tagName, tagValue) => {
	try {
		return OneSignal.User.addTag(tagName, tagValue)
	} catch {
		/* do nothing */
	}
}

export const unregisterOneSignalTag = (tagName) => {
	try {
		OneSignal.User.removeTag(tagName)
	} catch {
		/* do nothing */
	}
}
