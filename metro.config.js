const path = require('path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { resolve } = require('metro-resolver');
const exclusionList = require('metro-config/private/defaults/exclusionList').default;

const defaultConfig = getDefaultConfig(__dirname);
const kyteAgentCjsEntry = path.join(
	__dirname,
	'node_modules/@kyteapp/kyte-agent/dist/index.js',
);

const config = {
	resolver: {
		resolveRequest: (context, moduleName, platform) => {
			if (moduleName === '@kyteapp/kyte-agent') {
				return { type: 'sourceFile', filePath: kyteAgentCjsEntry };
			}
			return resolve(context, moduleName, platform);
		},
		blockList: exclusionList([/node_modules\/.*\/node_modules\/react-native\/.*/]),
		extraNodeModules: {
			'react-native-locale': path.resolve(__dirname, 'node_modules/@kyteapp/react-native-locale'),
		},
		sourceExts: ['jsx', 'js', 'ts', 'tsx', 'json', 'cjs', 'mjs'],
	},
	transformer: {
		getTransformOptions: async () => ({
			transform: {
				experimentalImportSupport: false,
				inlineRequires: false,
			},
		}),
	},
	server: {
		rewriteRequestUrl: url => {
			if (!url.endsWith('.bundle')) {
				return url;
			}
			return `${url}?platform=ios&dev=true&minify=false&modulesOnly=false&runModule=true`;
		},
	},
};

module.exports = mergeConfig(defaultConfig, config);
