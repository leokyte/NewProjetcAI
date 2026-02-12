import { colors } from '../../../styles'

const triangleContent = {
	position: 'absolute',
	width: 0,
	height: 0,
	backgroundColor: 'transparent',
	borderStyle: 'solid',
	borderTopWidth: 0,
	borderTopColor: 'transparent',
	borderRightColor: 'transparent',
	borderBottomColor: colors.actionColor,
	borderLeftColor: 'transparent',
	transform: [{ rotate: '45deg' }],
}

const styles = {
	container: {
		justifyContent: 'center',
		alignItems: 'center',
	},
	simplePlan: {
		backgroundColor: '#ffffff',
		borderColor: colors.disabledIcon,
	},
	starPlan: {
		backgroundColor: '#F0FFFC',
		borderColor: colors.actionColor,
	},
	triangle: {
		lg: {
			...triangleContent,
			top: -8,
			right: -32,
			borderRightWidth: 50,
			borderBottomWidth: 50,
			borderLeftWidth: 50,
		},
		sm: {
			...triangleContent,
			top: -4,
			right: -15,
			borderRightWidth: 23,
			borderBottomWidth: 23,
			borderLeftWidth: 23,
		},
	},
	star: {
		lg: {
			position: 'absolute',
			top: 10,
			right: 10,
		},
		sm: {
			position: 'absolute',
			top: 3,
			right: 3,
		},
	},
	planCard: {
		borderColor: colors.disabledColor,
	},
	planCardStar: {
		borderColor: colors.actionColor,
	},
}

export { styles }
