import React from 'react'
import { View, Text, TouchableOpacity, Platform } from 'react-native'
import { renderBoldText } from '../../util'
import { colors } from '../../styles'
import { KyteIcon, KyteProLabel, KyteTagNew } from '.'

const renderTitle = (isFree, title, style, rightSideExtra, isDisabled = false) => {
	if (typeof title === 'string') {
		return (
			<Text style={[styles.switchText, { opacity: isDisabled && !isFree  ? 0.4 : 1 }, style, rightSideExtra ? { flex: 1 } : {}]}>
				{title}
			</Text>
		)
	}
	return title
}
const renderDescription = (description, customStyle, disabled) => {
	if (typeof description === 'string')
		return (
			<Text style={[styles.infoText, customStyle, { opacity: disabled ? 0.4 : 1 }]}>
				{renderBoldText(description, {...styles.infoText, ...customStyle, opacity: disabled ? 0.4 : 1 })} 
			</Text>)
	return description
}

const renderProBadge = () => (
	<View style={{ marginLeft: 10, justifyContent: 'center' }}>
		<KyteProLabel />
	</View>
)

const renderTip = (tipAction, tipNotFilled) => (
	<TouchableOpacity onPress={tipAction} style={{ paddingHorizontal: 15 }}>
		<KyteIcon name={tipNotFilled ? 'help' : 'help-filled'} size={20} color={colors.grayBlue} />
	</TouchableOpacity>
)

const SwitchContainer = (props) => (
	<TouchableOpacity
		onPress={props.disabled ? null : props.onPress}
		activeOpacity={props.disabled ? 1 : 0.8}
		{...props.testProps}
	>
		<View style={[styles.contentContainer, props.style]}>
			<View style={styles.switchContainer}>
				<View style={styles.textContainer}>
					{renderTitle(props.isFree, props.title, props.titleStyle, props.rightSideExtra, !!props.disabled)}
					{props.tipAction ? renderTip(props.tipAction, props.tipNotFilled) : null}
					{props.renderProBadge ? renderProBadge() : null}
					{props.tagNew && !props.betaCatalogActive &&
						<View style={styles.tagNewContainer}>
							<KyteTagNew style={styles.tagNew} isFromNewCatalog />   
						</View>
					}
					
				</View>	
				{props.children}
			</View>
			{props.description ? renderDescription(props.description, props.descriptionStyle, !!props.disabled) : null}
		</View>
	</TouchableOpacity>
)

const styles = {
	switchContainer: {
		flexDirection: 'row',
		...Platform.select({
			ios: {
				alignItems: 'center',
				justifyContent: 'center',
			},
		}),
	},
	contentContainer: {
		paddingVertical: 15,
		paddingHorizontal: 20,
		borderBottomWidth: 1,
		borderColor: colors.borderColor,
	},
	textContainer: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
	},
	switchText: {
		fontSize: 16,
		fontFamily: 'Graphik-SemiBold',
		color: colors.primaryColor,
	},
	infoText: {
		fontSize: 14,
		color: colors.primaryColor,
	},
	tagNewContainer: {
		marginLeft: 8
	},
	tagNew: {
		borderRadius: 24,
		paddingVertical: 6,
		paddingHorizontal: 6
	}
}

export { SwitchContainer }
