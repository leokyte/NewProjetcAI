import { Platform } from 'react-native'
import { PERMISSIONS } from 'react-native-permissions'
import I18n from '../i18n/i18n'

export const Permission = (name) => {
	switch (name) {
		case 'android.permission.CAMERA':
			return I18n.t('permission.CAMERA')
		case 'android.permission.READ_EXTERNAL_STORAGE':
		case 'android.permission.WRITE_EXTERNAL_STORAGE':
			return I18n.t('permission.EXTERNAL_STORAGE')
	}
}

const isAndroid13OrAbove = Platform.OS === 'android' && Platform.Version >= 33
export const PHOTO_LIBRARY = 'photoLibrary'
export const CAMERA = 'camera'
export const CONTACTS = 'contact'
export const BLUETOOTH = 'bluetooth'

export const permissionTypes = {
	[PHOTO_LIBRARY]: {
		type: Platform.select({
			ios: PERMISSIONS.IOS.PHOTO_LIBRARY,
			android: isAndroid13OrAbove
				? []
				: [PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE, PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE],
		}),
		message: I18n.t('permissionDeniedAlertDescriptionIOS'),
	},
	[CAMERA]: {
		type: Platform.select({
			ios: PERMISSIONS.IOS.CAMERA,
			android: PERMISSIONS.ANDROID.CAMERA,
		}),
		message: I18n.t('permissionDeniedAlertDescriptionIOS'),
	},
	[CONTACTS]: {
		type: Platform.select({
			ios: PERMISSIONS.IOS.CONTACTS,
			android: [PERMISSIONS.ANDROID.READ_CONTACTS, PERMISSIONS.ANDROID.WRITE_CONTACTS],
		}),
		message: I18n.t('customerImportError'),
	},
	[BLUETOOTH]: {
		type: Platform.select({
			ios: PERMISSIONS.IOS.BLUETOOTH,
			android: [PERMISSIONS.ANDROID.BLUETOOTH_SCAN, PERMISSIONS.ANDROID.BLUETOOTH_CONNECT],
		}),
		message: I18n.t('nearbyDevicesPermissionDenied'),
	},
}
