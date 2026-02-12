import { colors } from './colors'

const modalStyles = {
	modalBase: (height, border, edges, topRadius, width, isMobile) => ({
		height,
		borderRadius: border,
		backgroundColor: '#FFFFFF',
		marginRight: edges,
		marginLeft: edges,
		borderTopLeftRadius: topRadius,
		borderTopRightRadius: topRadius,
		width: isMobile ? width : width || 420,
		alignSelf: isMobile ? 'auto' : 'center',
	}),
	modalHeader: {
		height: 65,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 18,
	},
	modalFooter: {
		height: 50,
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'center',
		borderTopWidth: 1,
		borderColor: colors.borderColor,
	},
	modalTitle: {
		flex: 1,
		fontFamily: 'Graphik-Medium',
		fontSize: 16,
		color: colors.primaryColor,
	},
	modalBody: (padding) => ({
		padding,
	}),
	modalClose: {
		color: colors.primaryColor,
	},
	modalButtons: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		alignSelf: 'stretch',
	},
	backdropFooter: {
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0,
	},
	backdropHeader: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
	},
	buttonNormal: {
		color: colors.primaryColor,
	},
	buttonWhite: {
		color: '#FFF',
	},
	modalShadow: {
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.3,
		shadowRadius: 5,
	},
	modalSliderIndicatorRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 10,
	},
	modalSliderIndicator: {
		backgroundColor: '#CECECE',
		height: 4,
		width: 45,
	},
}

export { modalStyles }
