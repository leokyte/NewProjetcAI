import React from 'react'
import { View, TouchableOpacity, Platform } from 'react-native'
import { KyteIcon, KyteText } from '../common'
import { colors } from '../../styles'
import { OrderStatus } from '../../enums'
import I18n from '../../i18n/i18n'
import { capitalizeFirstLetterOfString, setOrderIcon } from '../../util'

const StatusSelector = (props) => {
	const { statusList, status, onPress, gateway, disabled } = props

	// Styles
	const selectorContainer = {
		height: '100%',
		alignItems: 'center',
		flexDirection: 'row',
		color: props.showDisabled ? colors.lightBorder : colors.primaryColor,
		backgroundColor: '#FFF',
		borderRadius: 4,
		padding: 5,
		flexShrink: 1,
	}
	const statusText = {
		paddingHorizontal: 8,
		alignSelf: 'center',
		color: props.showDisabled ? colors.lightBorder : colors.primaryColor,
		maxWidth: '100%',
		overflow: 'hidden',
	}
	const iconPositioning = { top: Platform.OS === 'ios' ? -1 : 1, paddingRight: 4 }

	const selectedStatus = statusList.find((s) => s.status === status[0])
	const moreThanOne = status.length > 1
	const aliasInfo = () => (moreThanOne ? I18n.t('expressions.moreThanOne') : selectedStatus?.alias)

	return (
		<TouchableOpacity onPress={onPress} style={selectorContainer} disabled={disabled}>
			<KyteIcon
				style={iconPositioning}
				size={18}
				name={status.length && !moreThanOne ? setOrderIcon(selectedStatus?.status) : 'clock-small'}
				color={
					props.showDisabled
						? colors.lightBorder
						: status.length && !moreThanOne
						? selectedStatus?.color
						: colors.primaryColor
				}
			/>
			<View style={selectorContainer}>
				<KyteText ellipsizeMode="tail" weight={500} numberOfLines={1} size={13} style={statusText}>
					{capitalizeFirstLetterOfString(status.length ? aliasInfo() : OrderStatus.items[OrderStatus.ALL].alias)} 
				</KyteText>
				<KyteIcon
					style={iconPositioning}
					size={12}
					name="nav-arrow-down"
					color={props.showDisabled ? colors.lightBorder : colors.primaryColor}
				/>
				{gateway && gateway}
			</View>
		</TouchableOpacity>
	)
}

export default StatusSelector
