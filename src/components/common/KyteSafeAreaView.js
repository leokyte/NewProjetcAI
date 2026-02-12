import React from 'react'
import { Platform, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const majorVersionIOS = parseInt(Platform.Version, 10)
export const KyteSafeAreaView = (props) => {
	if (Platform.OS === 'ios' && majorVersionIOS < 11) {
		return <View {...props} style={[props.style, { paddingTop: 15 }]} />
	}
	return <SafeAreaView {...props} />
}
