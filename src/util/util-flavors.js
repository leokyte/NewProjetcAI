import { Platform } from 'react-native'
import DeviceInfo from 'react-native-device-info'
import { BundleEnum } from '../enums/Flavors'

const bundleId = DeviceInfo.getBundleId()
const isAndroid = Platform.OS === 'android'

export const isCatalogApp = () => {
	if (isAndroid) return bundleId === BundleEnum.CATALOG_ANDROID
	return bundleId === BundleEnum.CATALOG_IOS
}

export const isPOSApp = () => {
	if (isAndroid) return bundleId === BundleEnum.POS_ANDROID
	return bundleId === BundleEnum.POS_IOS
}
