import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { createDrawerNavigator } from '@react-navigation/drawer'
import { useIsSmallScreen } from '@kyteapp/kyte-ui-components'
import DrawerBadge from './components/common/DrawerBadge'
import DrawerIcon from './components/common/DrawerIcon'
import DrawerNavigator from './components/common/DrawerNavigator'
import PageConfirmation from './components/common/PageConfirmation'
import LoadingProgressBar from './components/common/LoadingProgressBar'
import I18n from './i18n/i18n'
import * as Screens from './screens'
import { drawerStyles } from './styles'
import { hasCatalog, setShowNeedConfigureCatalogModalForCoupons } from './stores/actions'
import AdminProtectionRoute from './components/config/AdminProtectionRoute'
import { canAccessSmartAssistant } from './util'
import { remoteConfigGetValue } from './integrations'

const Drawer = createDrawerNavigator()

const CouponsWrapper = ({ navigation, hasCatalogAction, setShowConfigureCatalogModal, catalogVersion }) => {
  React.useEffect(() => {
    if (!hasCatalogAction()) {
      navigation.closeDrawer()
      setShowConfigureCatalogModal(true)
      return navigation.goBack()
    }
  }, [])

  return hasCatalogAction() ? (
    <AdminProtectionRoute initialRouteName="CurrentSale">
      <Screens.CouponsStack isDrawerNavigation />
    </AdminProtectionRoute>
  ) : null
}

const MainDrawerNavigatorComponent = ({
	initialRouteName,
	openedSalesQuantity,
	actualRouteName,
	intercomUnreadConversation,
	hasCatalog: hasCatalogAction,
	setShowNeedConfigureCatalogModalForCoupons: setShowConfigureCatalogModal,
	billing,
	userPermissions,
}) => {
	const [smartAssistantPlan, setSmartAssistantPlan] = useState(); 

	const createCommonDrawerOptions = (labelKey, iconName) => ({
		drawerLabel: I18n.t(labelKey),
		drawerIcon: (isOpen) => <DrawerIcon isOpen={isOpen} name={iconName} />,
	})

	const isMobile = useIsSmallScreen()
	const hideMenu = ['PostEmail']
	const hasUnreadConversation = intercomUnreadConversation > 0

	useEffect(() => {
		remoteConfigGetValue('SmartAssistantPlan', (value) => {
			if (value) {
				setSmartAssistantPlan(value.toLowerCase());
			}
		})
	}, [])

	const showSmartAssistant = canAccessSmartAssistant({
		billing,
		userPermissions,
		smartAssistantPlan,
	})

	const onlineStackComponent = (props) => (
		<Screens.OnlineCatalogStack {...props} hasCatalogAction={hasCatalogAction} isDrawerNavigation />
	)

	// Defensive: Ensure we never pass an invalid initialRouteName to DrawerNavigator
	const effectiveInitialRoute = initialRouteName && initialRouteName.trim() !== '' ? initialRouteName : 'CurrentSale'

	return (
		<DrawerNavigator
			initialRouteName={effectiveInitialRoute}
			Drawer={Drawer}
			gestureEnabled={!hideMenu.find((route) => route === actualRouteName)}
		>
			<Drawer.Screen
				name="Dashboard"
				component={Screens.DashboardStack}
				options={{ ...createCommonDrawerOptions('sideMenu.dashboard', 'store'), unmountOnBlur: true }}
			/>
			<Drawer.Screen
				name="CurrentSale"
				component={isMobile ? Screens.CurrentSaleStack : Screens.CurrentSaleTablet}
				options={{
					// unmountOnBlur: false,
					...createCommonDrawerOptions('sideMenu.currentSale', 'check-in'),
				}}
			/>
			<Drawer.Screen
				name="OpenedSales"
				component={Screens.SalesStack('order')}
				options={{
					drawerLabel: I18n.t('sideMenu.orders'),
					drawerIcon: (isOpen) => <DrawerBadge isOpen={isOpen}>{openedSalesQuantity}</DrawerBadge>,
				}}
			/>
			<Drawer.Screen
				name="Products"
				component={isMobile ? Screens.ProductsStack : Screens.ProductsStackTablet}
				options={createCommonDrawerOptions('sideMenu.products', 'products')}
			/>
			{showSmartAssistant && (
				<Drawer.Screen
					name="SmartAssistant"
					component={Screens.SmartAssistantStack}
					options={{
						...createCommonDrawerOptions('assistant.header.title', 'kai'),
						isBeta: true,
					}}
				/>
			)}
			<Drawer.Screen
				name="OnlineCatalog"
				component={onlineStackComponent}
				options={{
					unmountOnBlur: false,
					...createCommonDrawerOptions('sideMenu.onlineCatalog', 'cart'),
				}}
			/>
			<Drawer.Screen
        name="Coupons"
        options={createCommonDrawerOptions('coupons.title', 'coupon-icon')}
        component={(props) => (
         <CouponsWrapper
           {...props}
           hasCatalogAction={hasCatalogAction}
           setShowConfigureCatalogModal={setShowConfigureCatalogModal}
         />
        )}
      />
			<Drawer.Screen
				name="Customers"
				component={Screens.CustomerStack}
				options={{
					...createCommonDrawerOptions('sideMenu.customers', 'customer'),
				}}
			/>
			<Drawer.Screen
				name="Sales"
				component={Screens.SalesStack('sale')}
				options={{
					drawerLabel: I18n.t('sideMenu.sales'),
					drawerIcon: (isOpen) => <DrawerIcon name="dollar-sign" size={drawerStyles.iconSize + 2} isOpen={isOpen} />,
				}}
			/>
			<Drawer.Screen
				name="Statistics"
				component={Screens.StatisticsStack}
				options={createCommonDrawerOptions('sideMenu.statistics', 'stats')}
			/>
			<Drawer.Screen
				name="Users"
				component={Screens.UsersStack}
				options={createCommonDrawerOptions('sideMenu.users', 'users')}
			/>
			<Drawer.Screen
				name="Config"
				component={Screens.ConfigStack}
				options={{
					unmountOnBlur: false,
					...createCommonDrawerOptions('sideMenu.config', 'cog'),
				}}
			/>
			<Drawer.Screen
				name="Helpcenter"
				component={Screens.HelpcenterStack}
				options={{
					unmountOnBlur: false,
					drawerLabel: I18n.t('sideMenu.helpCenter'),
					drawerIcon: (isOpen) => <DrawerIcon isOpen={isOpen} name="help" notification={hasUnreadConversation} />,
				}}
			/>
			<Drawer.Screen name="Receipt" component={isMobile ? Screens.ReceiptStack() : Screens.ReceiptTablet()} />
			<Drawer.Screen
				name="PaymentLink"
				component={isMobile ? Screens.ReceiptStack('PaymentLink') : Screens.ReceiptTablet('PaymentLink')}
			/>
			<Drawer.Screen name="Payment" component={Screens.PaymentStack} />
			<Drawer.Screen name="Cart" component={Screens.CartStack} />
			<Drawer.Screen name="SalePersist" component={Screens.SalePersistStack} />
			<Drawer.Screen name="Confirmation" component={Screens.ConfirmationStack} />
			<Drawer.Screen name="Account" component={Screens.AccountStack} />
			<Drawer.Screen name="UsersLock" component={Screens.UsersLockStack} />
			<Drawer.Screen name="PostEmail" component={Screens.PostEmailStack} />
			<Drawer.Screen name="PageConfirmation" component={PageConfirmation} />
			<Drawer.Screen name="ClosedSaleCart" component={Screens.CartStack} />
			<Drawer.Screen name="LoadingProgressBar" component={LoadingProgressBar} />
			<Drawer.Screen name="PushSaleDetail" component={Screens.SaleDetailStack} />
			<Drawer.Screen name="Plans" component={Screens.PlansStack} />
		</DrawerNavigator>
	)
}

const mapStateToProps = ({ sales: { openedSalesQuantity }, common: { intercomUnreadConversation }, billing, auth }) => ({
	openedSalesQuantity,
	intercomUnreadConversation,
	billing,
	userPermissions: auth.user.permissions,
})
export const MainDrawerNavigator = connect(mapStateToProps, { hasCatalog, setShowNeedConfigureCatalogModalForCoupons })(MainDrawerNavigatorComponent)
