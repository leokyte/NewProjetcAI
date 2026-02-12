import { Linking, Platform } from 'react-native'
import { getEncodeURIComponent, isBetaCatalog, kyteCatalogBetaDomain, kyteCatalogDomain } from "."

export function urlFriendlyClearStr(rawString) {
	const regex = /(?![0-9a-z-])./g
	return rawString.toLowerCase().replace(regex, '')
}

/**
 *
 * @param {string} appUrl url that will be handled by the target app(deep/dynamic/universal link)
 * @param {object} options configuration to open app on playstore/app store
 * @param {options.locale} options.locale us | pt | es
 * @param {options.playStoreId} options.playStoreId app id on Playstore
 * @param {options.appStoreId} options.appStoreId app id on App Store
 */
export function openAppUrl(appUrl, options) {
	try {
		Linking.openURL(appUrl).catch(() => {
			const { playStoreId, locale = 'us', appStoreId } = options
			const androidUrl = `https://play.google.com/store/apps/details?id=${playStoreId}`
			const iosUrl = `https://apps.apple.com/${locale}/app/kyte/id${appStoreId}`
			const appOnStoreUrl = Platform.OS === 'ios' ? iosUrl : androidUrl

			Linking.openURL(appOnStoreUrl)
		})
	} catch (error) {
		// eslint-disable-next-line no-console
		console.error(`Error executing 'opennAppUrl function: ${error}'`)
	}
}

export const getCatalogoURLProduct = (product, store) => {
	let url = `https://${store.urlFriendly}`
	if(isBetaCatalog(store?.catalog?.version)){
		const productEncodedUrl = getEncodeURIComponent(product?.search || 'm')
		return url += `${kyteCatalogBetaDomain}/p/${productEncodedUrl}`
	}
	return url += kyteCatalogDomain
}
