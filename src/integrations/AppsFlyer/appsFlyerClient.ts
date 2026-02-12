// Thin wrapper so we have a single import point if we need to customize behavior later.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const appsFlyerModule = require('react-native-appsflyer')
const appsFlyer = appsFlyerModule.default ?? appsFlyerModule

export default appsFlyer
export * from 'react-native-appsflyer'
