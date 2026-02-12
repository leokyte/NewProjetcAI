import 'react-native-reanimated'
import 'react-native-gesture-handler'
import './src/polyfills/reanimatedCompat'

import { AppRegistry } from 'react-native'
import { Buffer } from 'buffer'
import { setJSExceptionHandler, setNativeExceptionHandler } from 'react-native-exception-handler'
import * as RNLocalize from 'react-native-localize'
import App from './src/App'
import './src/polyfills/legacyPropTypes'

if (typeof global !== 'undefined' && !global.Buffer) {
	global.Buffer = Buffer
}

const logNative = (message) => {
	if (typeof global?.nativeLoggingHook === 'function') {
		global.nativeLoggingHook(String(message), 0)
	}
}

logNative(`JS boot start (__DEV__=${__DEV__})`)

RNLocalize.getLocales = (() => {
	const original = RNLocalize.getLocales
	return () => {
		try {
			const locales = typeof original === 'function' ? original() : []
			if (Array.isArray(locales) && locales.length > 0) {
				return locales
			}
		} catch (error) {
			// ignore and fall back to defaults
		}
		return [
			{
				countryCode: 'US',
				languageTag: 'en-US',
				languageCode: 'en',
				isRTL: false,
			},
		]
	}
})()

if (typeof global !== 'undefined' && global.ReanimatedError == null) {
	global.ReanimatedError = Error
}
import KyteErrorHandler from './src/integrations/ErrorHandler'

if (global.ErrorUtils) {
	const defaultHandler = global.ErrorUtils.getGlobalHandler?.() ?? global.ErrorUtils._globalHandler
	global.ErrorUtils.setGlobalHandler?.((error, isFatal) => {
		if (typeof global?.nativeLoggingHook === 'function') {
			const stack = error?.stack ?? String(error)
			let moduleHints = ''
			try {
				if (global.__r?.getModules && typeof stack === 'string') {
					const modules = global.__r.getModules()
					const ids = Array.from(new Set(Array.from(stack.matchAll(/@(\d+):/g), (m) => Number(m[1]))))
					if (ids.length > 0) {
						const resolved = ids
							.map((id) => {
								const mod = modules?.[id]
								const name = mod?.verboseName || mod?.name || mod?.path
								return name ? `${id}:${name}` : `${id}:<unknown>`
							})
							.filter(Boolean)
						if (resolved.length > 0) {
							moduleHints = ` | modules: ${resolved.join(', ')}`
						}
					}
				}
			} catch (hintError) {
				moduleHints = ` | module-lookup-failed: ${hintError?.message ?? hintError}`
			}
			global.nativeLoggingHook(`JSException: ${stack}${moduleHints}`, 0)
		}
		if (defaultHandler) {
			defaultHandler(error, isFatal)
		}
	})
}

setJSExceptionHandler(
	(error, isFatal) => {
		logNative(`setJSExceptionHandler fatal=${isFatal}: ${error?.stack || error}`)
		KyteErrorHandler.addItemInErrorsQueue(error)
	},
	true
)

setNativeExceptionHandler((errorString) => KyteErrorHandler.addItemInErrorsQueue(new Error(errorString)), false, true)

AppRegistry.registerComponent('kyte', () => App)
