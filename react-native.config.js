// Polyfill upcoming array helpers expected by metro/CLI when running on Node < 20.
if (typeof Array.prototype.toReversed !== 'function') {
	Object.defineProperty(Array.prototype, 'toReversed', {
		value: function toReversed() {
			return Array.from(this).reverse()
		},
		writable: true,
		configurable: true,
		enumerable: false,
	})
}

const path = require('path')

module.exports = {
	project: {
	ios: {
			automaticPodsInstallation: true,
		},
		android: {},
	},
	assets: ['./assets/fonts/'],
	dependencies: {
		'@microsoft/react-native-clarity': {
			platforms: {
				android: {
					cmakeListsPath: path.resolve(__dirname, 'android/codegen/react-native-clarity/jni/CMakeLists.txt'),
				},
			},
		},
		'@kyteapp/react-native-locale': {
			platforms: {
				ios: null,
			},
		},
		'react-native-bluetooth-classic': {
			// Disable iOS autolinking to avoid ExternalAccessory init/crash; Android stays enabled.
			platforms: {
				ios: null,
			},
		},
		'react-native-config': {
			platforms: {
				android: {
					sourceDir: path.resolve(__dirname, 'node_modules/react-native-config/android'),
					packageImportPath: 'import com.lugg.RNCConfig.RNCConfigPackage;',
					packageInstance: 'new RNCConfigPackage()',
					libraryName: 'RNCConfigSpec',
					componentDescriptors: [],
					cmakeListsPath: path.resolve(__dirname, 'android/codegen/react-native-config/jni/CMakeLists.txt'),
				},
			},
		},
	},
}
