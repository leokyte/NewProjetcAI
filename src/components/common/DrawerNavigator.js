import React from 'react'
import { Platform, useWindowDimensions } from 'react-native'
import { connect } from 'react-redux'
import { createDrawerNavigator } from '@react-navigation/drawer'
import { Viewports } from '@kyteapp/kyte-ui-components'
import { colors, drawerStyles } from '../../styles'
import DrawerContent from './DrawerContent'
import { Breakpoints } from '../../enums'

const OPENED_DRAWER_WIDTH = 280
const COLLAPSED_DRAWER_WIDTH = 60
const defaultDrawer = createDrawerNavigator()

const DrawerNavigator = ({ Drawer = defaultDrawer, gestureEnabled, initialRouteName, ...props }) => {
	const { width, height } = useWindowDimensions()

	// Calculate isLargeScreen directly from window dimensions
	const isLargeScreen = width >= (Breakpoints?.[Viewports.Tablet] || 640)

	const [isDrawerOpen, setIsDrawerOpen] = React.useState(isLargeScreen)

	// Footer should only be visible on mobile OR when drawer is open on tablet
	const isDrawerFooterVisible = !isLargeScreen || isDrawerOpen

	// Sync drawer state when screen size changes
	React.useEffect(() => {
		setIsDrawerOpen(isLargeScreen)
	}, [isLargeScreen])

	const toggleDrawer = () => {
		setIsDrawerOpen(prev => !prev)
	}

	// Drawer width: collapsed (60) or expanded (280) on tablets, full width on mobile
	const drawerWidth = isLargeScreen
		? (isDrawerOpen ? OPENED_DRAWER_WIDTH : COLLAPSED_DRAWER_WIDTH)
		: OPENED_DRAWER_WIDTH

	return (
		<Drawer.Navigator
			initialRouteName={initialRouteName}
			defaultStatus={isLargeScreen ? 'open' : 'closed'}
			screenOptions={{
				drawerType: isLargeScreen ? 'permanent' : 'front',
				drawerPosition: 'left',
				drawerStyle: {
					width: drawerWidth,
				},
				swipeEnabled: !isLargeScreen && gestureEnabled && props.enabledDrawerSwipe,
				drawerLabelStyle: drawerStyles.labelStyle,
				drawerItemStyle: styles.drawerItem,
				drawerActiveBackgroundColor: drawerStyles.activeBackgroundColor,
				headerShown: false,
				unmountOnBlur: true,
			}}
			drawerContent={(argProps) => (
				<DrawerContent
					{...argProps}
					isOpen={isDrawerOpen}
					handleToggleDrawer={toggleDrawer}
					shouldOverlay={false}
					containerStyle={{ width: drawerWidth }}
					isFooterVisible={isDrawerFooterVisible}
				/>
			)}
			{...props}
		/>
	)
}

const styles = {
	drawerItem: {
		marginLeft: 0,
		width: '100%',
	},
	badge: {
		backgroundColor: colors.actionColor,
		borderRadius: 50,
		width: 24,
		height: 18,
		alignItems: 'center',
		...Platform.select({ ios: { justifyContent: 'center' } }),
	},
}

export default connect((state) => ({
	enabledDrawerSwipe: state.common.enabledDrawerSwipe,
}))(DrawerNavigator)
