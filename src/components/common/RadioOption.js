import React from 'react'
import { View, TouchableOpacity, Dimensions } from 'react-native'
import { KyteText } from '.'
import { colors } from '../../styles'

const RadioOption = (props) => {
	const { selected, item, onPress, revert, disabled } = props
	const marginCircle = revert ? { marginLeft: 20 } : { marginRight: 20 }
	const renderExtraContent = () => item.extraContent()
	const renderRadio = () => (
		<View style={{ ...styles.outerCircle, ...marginCircle }}>
			<View style={styles.innerCircle(selected ? colors.actionColor : '#FFF')} />
		</View>
	)

	return (
		<TouchableOpacity onPress={() => onPress(item)}>
			<View style={styles.optionContainer}>
				{!revert && renderRadio()}

				<View style={styles.labelContainer}>
					<KyteText color={disabled ? colors.disabledColor : colors.darkGrey} size={13}>
						{item.label}
					</KyteText>
				</View>
				{item.extraContent ? renderExtraContent() : null}

				{revert && renderRadio()}
			</View>
		</TouchableOpacity>
	)
}

const SCREEN_WIDTH = Dimensions.get('window').width
const circleSize = 20

const styles = {
	optionContainer: {
		minHeight: 55,
		width: '100%',
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 20,
		borderBottomWidth: 1,
		borderColor: colors.borderColor,
	},
	outerCircle: {
		width: circleSize,
		height: circleSize,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#FFF',
		borderWidth: 1,
		borderColor: colors.littleDarkGray,
		borderRadius: circleSize / 2,
	},
	innerCircle: (backgroundColor = '#FFF') => ({
		width: circleSize / 2,
		height: circleSize / 2,
		borderRadius: circleSize / 4,
		backgroundColor,
	}),
	labelContainer: {
		flex: 1,
		width: SCREEN_WIDTH - circleSize,
	},
}

export { RadioOption }
