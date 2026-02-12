import { Platform } from 'react-native'
import DeviceInfo from 'react-native-device-info'

const isFunction = (fn) => typeof fn === 'function'

const getBoolean = (value, fallback) => {
	if (typeof value === 'boolean') return value
	return fallback
}

export const shouldSkipIAPInit = () => {
	if (Platform.OS !== 'android') return false

	try {
		const isEmulator = isFunction(DeviceInfo.isEmulatorSync) ? DeviceInfo.isEmulatorSync() : false
		const hasGms = isFunction(DeviceInfo.hasGmsSync) ? DeviceInfo.hasGmsSync() : true

		return getBoolean(isEmulator, false) || !getBoolean(hasGms, true)
	} catch (error) {
		// If we fail to detect capabilities, default to initialising IAP so real devices are not blocked
		return false
	}
}

export default shouldSkipIAPInit
