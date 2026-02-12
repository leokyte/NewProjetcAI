import React from 'react'
import { TouchableOpacity, Platform } from 'react-native'
import { KyteText, KyteIcon } from './'
import { colors } from '../../styles'

const Capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1)
const selectorContainer = { flex: 1, height: '100%', alignItems: 'center', flexDirection: 'row' }
const statusText = { paddingHorizontal: 8, alignSelf: 'center' }
const iconPositioning = { top: Platform.OS === 'ios' ? -1 : 1 }

/**
 * @param {{
 * onPress?: () => undefined
 * icon?: { name?: string, color?: string }
 * labelSize?: number
 * label?: string
 * }} props
 */
const Selector = (props) => (
	<TouchableOpacity style={selectorContainer} onPress={() => props.onPress()}>
		{props.icon ? (
			<KyteIcon
				style={iconPositioning}
				size={18}
				name={props.icon.name}
				color={props.icon.color || colors.primaryColor}
			/>
		) : null}
		<KyteText ellipsizeMode={'tail'} numberOfLines={1} size={props.labelSize || 13} style={statusText}>
			{Capitalize(props.label)}
		</KyteText>
		<KyteIcon style={iconPositioning} size={12} name={'nav-arrow-down'} color={colors.primaryColor} />
	</TouchableOpacity>
)

export { Selector }
