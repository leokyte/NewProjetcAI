import * as ReactNative from 'react-native'
import {
	ImagePropTypes,
	TextPropTypes,
	ViewPropTypes,
} from 'deprecated-react-native-prop-types'

const defineStaticPropTypes = (namespace, key, value) => {
	if (!namespace) {
		return
	}

	const descriptor = Object.getOwnPropertyDescriptor(namespace, key)

	if (descriptor && descriptor.value === value) {
		return
	}

	Object.defineProperty(namespace, key, {
		value,
		writable: false,
		configurable: true,
		enumerable: false,
	})
}

defineStaticPropTypes(ReactNative, 'ViewPropTypes', ViewPropTypes)
defineStaticPropTypes(ReactNative, 'TextPropTypes', TextPropTypes)
defineStaticPropTypes(ReactNative, 'ImagePropTypes', ImagePropTypes)
