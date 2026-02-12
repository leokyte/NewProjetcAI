import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { connect } from 'react-redux'
import { TabletScreenContainer } from '../components/common'
import CatalogConfigIndex from '../components/config/catalog/CatalogConfigIndex'
import CatalogUrlFriendly from '../components/config/catalog/CatalogUrlFriendly'
import CatalogLegalId from '../components/config/catalog/CatalogLegalId'
import CatalogTermsAndConditions from '../components/config/catalog/CatalogTermsAndConditions'
import CatalogStore from '../components/config/catalog/CatalogStore'
import CatalogTheme from '../components/config/catalog/CatalogTheme'
import CatalogColorTemplate from '../components/config/catalog/CatalogColorTemplate'
import CatalogStoreLogo from '../components/config/catalog/CatalogStoreLogo'
import CatalogLayout from '../components/config/catalog/CatalogLayout'
import CatalogSocialNetwork from '../components/config/catalog/CatalogSocialNetwork'
import CatalogOnlineOrders from '../components/config/catalog/CatalogOnlineOrders'
import CatalogOnlineOrderSettings from '../components/config/catalog/catalog-settings/CatalogOnlineOrderSettings'
import CatalogOrderStatusAdd from '../components/config/catalog/order-settings/CatalogOrderStatusAdd'
import CatalogOrderStatus from '../components/config/catalog/order-settings/CatalogOrderStatus'
import CatalogOrderPayments from '../components/config/catalog/order-settings/CatalogOrderPayments'
import CatalogOrderStock from '../components/config/catalog/stock-management/CatalogOrderStock'
import CatalogBanner from '../components/config/catalog/banner/CatalogBanner'
import ConfigOnlinePayments from '../components/config/payments/online-payments/ConfigOnlinePayments'
import SocialMediaIntegration from '../components/config/socialmedia-integration/SocialMediaIntegration'
import TiktokPage from '../components/config/socialmedia-integration/partners/Tiktok'
import InstagramPage from '../components/config/socialmedia-integration/partners/Instagram'
import FBEPage from '../components/config/socialmedia-integration/partners/FBE/FBE'
import GoogleShoppingPage from '../components/config/socialmedia-integration/partners/GoogleShopping'
import FacebookPixelPage from '../components/config/socialmedia-integration/partners/facebookPixel/FacebookPixel'
import FacebookPixelIntegratedPage from '../components/config/socialmedia-integration/partners/facebookPixel/FacebookPixelIntegrated'
import { ShippingFeesStack } from '.'
import PostOrder from '../components/config/catalog/PostOrder'
import CatalogVersion from '../components/config/catalog/CatalogVersion'
import PixDataConfig from '../components/config/payments/PixDataConfig'
import ConfigOnlinePaymentsWizard from '../components/config/payments/online-payments/ConfigOnlinePaymentsWizard'
import CouponsTypeChoice from './coupons/CouponsTypeChoice'
import CouponsOnBoarding from './coupons/CouponsOnBoarding'

const Stack = createStackNavigator()
const screenOptions = { headerShown: false }

const OnlineCatalogStack = ({ isDrawerNavigation = false, store }) => {
	const itHasCatalog = !!store?.catalog

	return (
		<TabletScreenContainer maxHeight={680}>
			<Stack.Navigator
				initialRouteName={itHasCatalog ? 'CatalogConfigIndex' : 'CatalogUrlFriendly'}
				screenOptions={screenOptions}
			>
				<Stack.Screen name="CatalogConfigIndex" component={CatalogConfigIndex} initialParams={{
					isDrawerNavigation,
				}} />
				<Stack.Screen 
					name='CouponsOnBoarding'
					component={CouponsOnBoarding} 
					initialParams={{
						isDrawerNavigation,
					}}
				/>
				<Stack.Screen 
					name='CouponsTypeChoice'
					component={CouponsTypeChoice}
					initialParams={{
						isDrawerNavigation,
					}}
				/>
				<Stack.Screen name="CatalogUrlFriendly" component={CatalogUrlFriendly} initialParams={{
					isDrawerNavigation,
				}} />
				<Stack.Screen name="CatalogLegalId" component={CatalogLegalId} />
				<Stack.Screen name="CatalogTermsAndConditions" component={CatalogTermsAndConditions} />
				<Stack.Screen name="CatalogStoreLogo" component={CatalogStoreLogo} />
				<Stack.Screen name="CatalogStore" component={CatalogStore} />
				<Stack.Screen name="CatalogTheme" component={CatalogTheme} />
				<Stack.Screen name="CatalogColorTemplate" component={CatalogColorTemplate} />
				<Stack.Screen name="CatalogLayout" component={CatalogLayout} />
				<Stack.Screen name="CatalogSocialNetwork" component={CatalogSocialNetwork} />
				<Stack.Screen name="CatalogOnlineOrders" component={CatalogOnlineOrders} />
				<Stack.Screen name="CatalogOnlineOrderSettings" component={CatalogOnlineOrderSettings} />
				<Stack.Screen name="CatalogOrderStatusAdd" component={CatalogOrderStatusAdd} />
				<Stack.Screen name="CatalogOrderStatus" component={CatalogOrderStatus} />
				<Stack.Screen name="CatalogOrderPayments" component={CatalogOrderPayments} />
				<Stack.Screen name="CatalogOrderStock" component={CatalogOrderStock} />
				<Stack.Screen name="CatalogBanner" component={CatalogBanner} />
				<Stack.Screen name="ConfigOnlinePayments" component={ConfigOnlinePayments} />
				<Stack.Screen name="ConfigOnlinePaymentsWizard" component={ConfigOnlinePaymentsWizard} />
				<Stack.Screen name="SocialMediaIntegration" component={SocialMediaIntegration} />
				<Stack.Screen name="InstagramPage" component={InstagramPage} />
				<Stack.Screen name="GoogleShoppingPage" component={GoogleShoppingPage} />
				<Stack.Screen name="FBEPage" component={FBEPage} />
				<Stack.Screen name="TiktokPage" component={TiktokPage} />
				<Stack.Screen name="FacebookPixelPage" component={FacebookPixelPage} />
				<Stack.Screen name="FacebookPixelIntegratedPage" component={FacebookPixelIntegratedPage} />
				<Stack.Screen name="ShippingFees" component={ShippingFeesStack} />
				<Stack.Screen name="PostOrder" component={PostOrder} />
				<Stack.Screen name="CatalogVersion" component={CatalogVersion} />
				<Stack.Screen name="PixDataConfig" component={PixDataConfig} />
			</Stack.Navigator>
		</TabletScreenContainer>
	)
}

const mapStateToProps = ({ auth }) => ({
	store: auth.store,
})

export default connect(mapStateToProps)(OnlineCatalogStack);
