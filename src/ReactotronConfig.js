import Reactotron from 'reactotron-react-native'
import { reactotronRedux } from 'reactotron-redux'
import { NativeModules } from 'react-native'
import SourceCode from 'react-native/Libraries/NativeModules/specs/NativeSourceCode'
import AsyncStorage from '@react-native-community/async-storage'

// adb reverse tcp:9090 tcp:9090

const REACTOTRON_PORT = 9090
const DEFAULT_HOST = 'localhost'

const resolveScriptURL = () => {
	try {
		if (SourceCode?.getConstants) {
			const constants = SourceCode.getConstants()
			if (constants?.scriptURL) {
				return constants.scriptURL
			}
		}
	} catch (error) {
		if (__DEV__) {
			console.warn('[Reactotron] Unable to read SourceCode constants', error)
		}
	}

	return NativeModules?.SourceCode?.scriptURL
}

const extractHostname = (scriptURL) => {
	if (typeof scriptURL !== 'string') {
		return null
	}

	try {
		return new URL(scriptURL).hostname
	} catch (error) {
		const match = scriptURL.match(/^[^:]+:\/\/([^/:]+)/)
		return match ? match[1] : null
	}
}

const scriptHostname = extractHostname(resolveScriptURL()) ?? DEFAULT_HOST

const KyteReactotron = Reactotron.configure({
	name: 'Kyte',
	host: scriptHostname,
	port: REACTOTRON_PORT,
})
	.useReactNative()
	.setAsyncStorageHandler(AsyncStorage)

KyteReactotron.use(reactotronRedux())
KyteReactotron.connect()
KyteReactotron.clear()

console.tron = Reactotron

export default KyteReactotron
