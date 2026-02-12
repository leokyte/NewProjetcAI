import { colors } from './'

const drawerStyles = {
	labelContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		height: 50,
	},
	activeTintColor: '#FFF',
	activeBackgroundColor: colors.secondaryBg,
	labelInner: {
		flexDirection: 'row',
		alignItems: 'center',
		height: '100%',
	},
	labelStyle: {
		fontFamily: 'Graphik-Medium',
		color: '#FFF',
		fontSize: 15,
		marginLeft: 0,
		lineHeight: 15,
	},
	badge: {
		height: 18,
		backgroundColor: colors.actionColor,
		borderRadius: 3,
		paddingHorizontal: 5,
		justifyContent: 'center',
		alignItems: 'center',
		marginLeft: 15,
	},
	badgeText: {
		fontFamily: 'Graphik-Semibold',
		fontSize: 9,
		color: '#FFF',
	},
	iconSize: 16,
}

export { drawerStyles }
