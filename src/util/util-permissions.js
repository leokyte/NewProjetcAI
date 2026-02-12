import { LogBox, PermissionsAndroid, Alert } from 'react-native'
import {
	requestNotifications,
	PERMISSIONS,
	RESULTS,
	request,
	check,
	checkNotifications,
	requestMultiple,
	checkMultiple,
	openSettings,
} from 'react-native-permissions'
import { Settings } from 'react-native-fbsdk-next'

import I18n from '../i18n/i18n'
import { permissionTypes } from '../enums'

export const disableDevWarnings = () => {
	if (__DEV__) {
		LogBox.ignoreLogs([
			'Sending `StateChangeEvent` with no listeners',
			"Module RCTLocale requires main queue setup since it overrides `constantsToExport` but doesn't implement `requiresMainQueueSetup`. In a future release React Native will default to initializing all native modules on a background thread unless explicitly opted-out of.",
			"Module RNFetchBlob requires main queue setup since it overrides `constantsToExport` but doesn't implement `requiresMainQueueSetup`. In a future release React Native will default to initializing all native modules on a background thread unless explicitly opted-out of.",
			"Module IntercomEventEmitter requires main queue setup since it overrides `constantsToExport` but doesn't implement `requiresMainQueueSetup`. In a future release React Native will default to initializing all native modules on a background thread unless explicitly opted-out of.",
			"Module RNGoogleSignin requires main queue setup since it overrides `constantsToExport` but doesn't implement `requiresMainQueueSetup`. In a future release React Native will default to initializing all native modules on a background thread unless explicitly opted-out of.",
			"Module RCTImageLoader requires main queue setup since it overrides `init` but doesn't implement `requiresMainQueueSetup`. In a future release React Native will default to initializing all native modules on a background thread unless explicitly opted-out of.",
			"Module RNBluetoothClassic requires main queue setup since it overrides `init` but doesn't implement `requiresMainQueueSetup`. In a future release React Native will default to initializing all native modules on a background thread unless explicitly opted-out of.",
			'RCTBridge required dispatch_sync to load RCTDevLoadingView. This may lead to deadlocks',
			'Warning: Failed frame type',
			'Require cycle',
			'ListView is deprecated and will be removed',
			'currentlyFocusedField is deprecated and will be removed in a future release. Use currentlyFocusedInput',
			'Task orphaned for request',
			'RNCNetInfo - You are using the deprecated API.',
			'YellowBox has been replaced',
		])
	}
}
export const requestTrackingPermission = async () => {
	const checkPermission = await check(PERMISSIONS.IOS.APP_TRACKING_TRANSPARENCY)
	if (checkPermission === RESULTS.DENIED) {
		const requestPermission = await request(PERMISSIONS.IOS.APP_TRACKING_TRANSPARENCY)
		if (requestPermission === RESULTS.GRANTED) {
			Settings.setAdvertiserTrackingEnabled(true)
		}
	}
}

export const requestBluetoothPermissions = async () => {
	const permissions = [PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT, PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN]
	try {
		const granted = await PermissionsAndroid.requestMultiple(permissions)
		if (granted === PermissionsAndroid.RESULTS.GRANTED) {
			// Permission 'granted'
			return granted
		}
		// Permission 'denied'
		return granted
	} catch (error) {
		console.warn(error)
	}
}

export const requestNotificationPermission = async () => {
	try {
		const checkPermission = await checkNotifications()
		if (checkPermission.status !== RESULTS.GRANTED) {
			await requestNotifications(['alert', 'sound', 'badge'])
		}
	} catch (error) {
		console.warn(error)
	}
}

const handlePermissionAlert = (result, message) => {
	if (result === RESULTS.BLOCKED) {
		Alert.alert(I18n.t('words.s.attention'), message, [
			{ text: I18n.t('expressions.redirectOsConfig'), onPress: () => openSettings() },
			{ text: I18n.t('alertDismiss') },
		])
		return false
	}

	if (result === RESULTS.DENIED) {
		return false
	}

	return true
}

export const requestPermission = async (permissionType) => {
	const permissionContent = permissionTypes[permissionType].type
	const noPermissionNeeded =
		!permissionContent || (Array.isArray(permissionContent) && permissionContent.length === 0)

	if (noPermissionNeeded) {
		return true
	}

	const isMultiple = Array.isArray(permissionContent)
	const permissionsToCheck = isMultiple ? permissionContent : [permissionContent]

	try {
		const permissionStatus = await checkMultiple(permissionsToCheck)
		const hasDeniedPermission = Object.values(permissionStatus).some(
			(value) => value === RESULTS.DENIED || value === RESULTS.UNAVAILABLE || value === RESULTS.BLOCKED
		)

		if (hasDeniedPermission) {
			const deniedPermissions = []
			permissionsToCheck.map(
				(permissionItem) =>
					(permissionStatus[permissionItem] === RESULTS.DENIED ||
						permissionStatus[permissionItem] === RESULTS.BLOCKED ||
						permissionStatus[permissionItem] === RESULTS.UNAVAILABLE) &&
					deniedPermissions.push(permissionItem)
			)

			const requestedPermissions = await requestMultiple(deniedPermissions)
			for (const [_, status] of Object.entries(requestedPermissions)) {
				const newStatus = handlePermissionAlert(status, permissionTypes[permissionType].message)
				return newStatus
			}
		}
		return !hasDeniedPermission
	} catch (error) {
		console.log('[error] requestPermission', error)
	}
}
