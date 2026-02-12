import React from 'react'
import { View, TouchableOpacity } from 'react-native'
import { scaffolding } from '../../styles'

const SubHeaderButton = (props) => {
	const { subHeaderButton } = scaffolding
	return (
		<TouchableOpacity
			disabled={props.disabled}
			onPress={props.onPress}
			activeOpacity={0.8}
			style={props.style}
			{...props.testProps}
		>
			<View style={[subHeaderButton(props.width), props.style]}>{props.children}</View>
		</TouchableOpacity>
	)
}

export { SubHeaderButton }
