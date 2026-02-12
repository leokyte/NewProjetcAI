import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { TabletScreenContainer } from '../components/common'

import ConfigContainer from '../components/config/ConfigContainer'
import PixDataConfig from '../components/config/payments/PixDataConfig'
import StoreReset from '../components/config/general/StoreReset'
import StorePaymentContainer from '../components/config/payments/StorePaymentContainer'
import StorePaymentMercadoPago from '../components/config/payments/mercadopago/StorePaymentMercadoPago'
import StorePreferences from '../components/config/general/StorePreferences'
import StoreCurrency from '../components/config/general/StoreCurrency'
import StorePrinter from '../components/config/printers/StorePrinter'
import StorePrinterConfirm from '../components/config/printers/StorePrinterConfirm'
import StoreCatalogCode from '../components/config/partners/StoreCatalogCode'
import StoreCatalogConfirm from '../components/config/partners/StoreCatalogConfirm'
import ReceiptShareOptions from '../components/current-sale/receipt/ReceiptShareOptions'
import ReceiptSendEmail from '../components/current-sale/receipt/ReceiptSendEmail'
import StoreDetailContainer from '../components/config/store/StoreDetailContainer'
import OrdersAndSalesContainer from '../components/config/orders-and-sales/OrdersAndSalesContainer'
import ReportExport from '../components/config/report-export/ReportExport'
import ConfigReceipt from '../components/config/receipt/ConfigReceipt'
import CatalogStore from '../components/config/catalog/CatalogStore'
import ConfigIntegratedPayments from '../components/config/payments/ConfigIntegratedPayments' // path: 'integrated-payments/:configType'
import CatalogOrderPayments from '../components/config/catalog/order-settings/CatalogOrderPayments'
import ConfigOnlinePayments from '../components/config/payments/online-payments/ConfigOnlinePayments'
import CatalogOnlineOrders from '../components/config/catalog/CatalogOnlineOrders'
import CatalogOnlineOrderSettings from '../components/config/catalog/catalog-settings/CatalogOnlineOrderSettings'
import CatalogUrlFriendly from '../components/config/catalog/CatalogUrlFriendly'
import CatalogLegalId from '../components/config/catalog/CatalogLegalId'
import CatalogTermsAndConditions from '../components/config/catalog/CatalogTermsAndConditions'
import CatalogOrderStatus from '../components/config/catalog/order-settings/CatalogOrderStatus'
import SocialMediaIntegration from '../components/config/socialmedia-integration/SocialMediaIntegration'
import InstagramPage from '../components/config/socialmedia-integration/partners/Instagram'
import FBEPage from '../components/config/socialmedia-integration/partners/FBE/FBE'
import TiktokPage from '../components/config/socialmedia-integration/partners/Tiktok'
import FacebookPixelPage from '../components/config/socialmedia-integration/partners/facebookPixel/FacebookPixel'
import FacebookPixelIntegratedPage from '../components/config/socialmedia-integration/partners/facebookPixel/FacebookPixelIntegrated'
import GoogleShoppingPage from '../components/config/socialmedia-integration/partners/GoogleShopping'
import { OnlineCatalogStack, ShippingFeesStack } from '.'
import CardServiceConfig from '../components/config/payments/card-service/CardServiceConfig'
import CatalogVersion from '../components/config/catalog/CatalogVersion'

import { ProductCategoryUpsert, ProductCategoryList, ProductConfig } from '../components/products/config'
import VariationsManagerStack from './products/VariationsManager'
import ConfigOnlinePaymentsWizard from '../components/config/payments/online-payments/ConfigOnlinePaymentsWizard'

const Stack = createStackNavigator()
const screenOptions = { headerShown: false }

const ConfigStack = () => (
	<TabletScreenContainer maxHeight={620}>
		<Stack.Navigator initialRouteName="ConfigContainer" screenOptions={screenOptions}>
			{/* <Stack.Screen name={'SocialMediaIntegration'} component={SocialMediaIntegrationStack} /> */}

			<Stack.Screen name="SocialMediaIntegration" component={SocialMediaIntegration} />
			<Stack.Screen name="InstagramPage" component={InstagramPage} />
			<Stack.Screen name="GoogleShoppingPage" component={GoogleShoppingPage} />
			<Stack.Screen name="FBEPage" component={FBEPage} />
			<Stack.Screen name="TiktokPage" component={TiktokPage} />
			<Stack.Screen name="FacebookPixelPage" component={FacebookPixelPage} />
			<Stack.Screen name="FacebookPixelIntegratedPage" component={FacebookPixelIntegratedPage} />

			<Stack.Screen name="StoreReset" component={StoreReset} />
			<Stack.Screen name="StorePaymentContainer" component={StorePaymentContainer} />
			<Stack.Screen name="StorePaymentMercadoPago" component={StorePaymentMercadoPago} />
			<Stack.Screen name="StorePreferences" component={StorePreferences} />
			<Stack.Screen name="StoreCurrency" component={StoreCurrency} />
			<Stack.Screen name="StorePrinter" component={StorePrinter} />
			<Stack.Screen name="StorePrinterConfirm" component={StorePrinterConfirm} />
			<Stack.Screen name="StoreCatalogCode" component={StoreCatalogCode} />
			<Stack.Screen name="StoreCatalogConfirm" component={StoreCatalogConfirm} />
			<Stack.Screen name="StoreDetailContainer" component={StoreDetailContainer} />

			<Stack.Screen name="ReceiptShareOptions" component={ReceiptShareOptions} />
			<Stack.Screen name="ReceiptSendEmail" component={ReceiptSendEmail} />

			<Stack.Screen name="DataExport" component={ReportExport} />

			<Stack.Screen name="ConfigContainer" component={ConfigContainer} />
			<Stack.Screen name="ConfigReceipt" component={ConfigReceipt} />
			<Stack.Screen name="ConfigIntegratedPayments" component={ConfigIntegratedPayments} />
			<Stack.Screen name="ConfigCardService" component={CardServiceConfig} />
			<Stack.Screen name="ConfigOnlinePayments" component={ConfigOnlinePayments} />
			<Stack.Screen name="ConfigOnlinePaymentsWizard" component={ConfigOnlinePaymentsWizard} />

			<Stack.Screen name="CatalogStore" component={CatalogStore} />
			<Stack.Screen name="CatalogOrderPayments" component={CatalogOrderPayments} />
			<Stack.Screen name="CatalogOnlineOrderSettings" component={CatalogOnlineOrderSettings} />
			<Stack.Screen name="CatalogUrlFriendly" component={CatalogUrlFriendly} />
			<Stack.Screen name="CatalogLegalId" component={CatalogLegalId} />
			<Stack.Screen name="CatalogTermsAndConditions" component={CatalogTermsAndConditions} />
			<Stack.Screen name="CatalogOrderStatus" component={CatalogOrderStatus} />
			<Stack.Screen name="CatalogVersion" component={CatalogVersion} />

			<Stack.Screen name="OnlinePaymentsConfigOrder" component={CatalogOnlineOrders} />
			<Stack.Screen name="OnlineCatalogStack" component={OnlineCatalogStack} />

			<Stack.Screen name="ShippingFees" component={ShippingFeesStack} />
			<Stack.Screen name="Taxes" component={OrdersAndSalesContainer} />

			<Stack.Screen name="PixDataConfig" component={PixDataConfig} />

			{/* ProductConfigPage */}
			<Stack.Screen name="ProductConfigPage" component={ProductConfig} />

			<Stack.Screen name="ProductCategories" component={ProductCategoryList} />

			<Stack.Screen name="ProductCategoryCreate" component={ProductCategoryUpsert} />
			<Stack.Screen name="VariationsManager" component={VariationsManagerStack} />
		</Stack.Navigator>
	</TabletScreenContainer>
)

export default ConfigStack
