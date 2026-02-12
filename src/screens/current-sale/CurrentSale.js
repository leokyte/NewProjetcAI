import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { useViewport, Viewports } from '@kyteapp/kyte-ui-components'
import { ScreenModal } from '../../components/common'
import { modalScreenOptions, renderScreenAsModal } from '../../util'
// import { headerStyles } from '../../styles';

import ProductSaleContainer from '../../components/current-sale/product-sale/ProductSaleContainer'
import QuickSale from '../../components/current-sale/quick-sale/QuickSaleContainer'
import ItemDescription from '../../components/current-sale/quick-sale/ItemDescription'
import Quantity from '../../components/current-sale/quantity/Quantity'
import QuantityFractioned from '../../components/current-sale/quantity/QuantityFractioned'
import CustomerSave from '../../components/customers/customer/CustomerSave'
import BarcodeReader from '../../components/products/detail/BarcodeReader'
import CurrentStockManager from '../../components/products/detail/CurrentStockManager'
import MinimumStockManager from '../../components/products/detail/MinimumStockManager'
import StockHistory from '../../components/products/detail/StockHistory'
import StockHistoryFilter from '../../components/products/detail/StockHistoryFilter'
import ProductShareOptions from '../../components/products/share/ProductShareOptions'
import ReceiptShareOptions from '../../components/current-sale/receipt/ReceiptShareOptions'
import ConfigReceipt from '../../components/config/receipt/ConfigReceipt'
import CatalogStore from '../../components/config/catalog/CatalogStore'
import ReceiptSendEmail from '../../components/current-sale/receipt/ReceiptSendEmail'
import ProductDetail from '../products/ProductDetail'
import { CustomerAddStack, CustomerDetailStack } from '..'

const Stack = createStackNavigator()
const screenOptions = { headerShown: false }
const modalScreen = (isMobile, screen) => renderScreenAsModal(isMobile, screen, ScreenModal)

const QuickSaleStack = () => (
	<Stack.Navigator initialRouteName="QuickSale" screenOptions={screenOptions}>
		<Stack.Screen name="QuickSale" component={QuickSale} />
		<Stack.Screen name="ItemDescription" component={ItemDescription} />
	</Stack.Navigator>
)

const CurrentSaleStack = () => {
	const viewport = useViewport()
	const isMobile = viewport === Viewports.Mobile

	return (
		<Stack.Navigator mode={isMobile ? 'card' : 'modal'} initialRouteName="ProductSale" screenOptions={screenOptions}>
			<Stack.Screen name="ProductSale" component={ProductSaleContainer} />
			<Stack.Screen name="CustomerAdd" component={CustomerAddStack} />
			<Stack.Screen name="CustomerDetail" component={CustomerDetailStack} />
			<Stack.Screen name="CustomerCreate" component={CustomerSave} />
			<Stack.Screen name="ProductDetail" component={ProductDetail} initialParams={{ isBackButtonInvisible: false }} />
			<Stack.Screen name="BarcodeReader" component={BarcodeReader} />
			<Stack.Screen name="CurrentStockManager" component={CurrentStockManager} />
			<Stack.Screen name="MinimumStockManager" component={MinimumStockManager} />
			<Stack.Screen name="StockHistory" component={StockHistory} />
			<Stack.Screen name="StockHistoryFilter" component={StockHistoryFilter} />
			<Stack.Screen name="ProductShareOptions" component={ProductShareOptions} />
			<Stack.Screen name="ReceiptShareOptions" component={ReceiptShareOptions} />
			<Stack.Screen name="ConfigReceipt" component={ConfigReceipt} />
			<Stack.Screen name="CatalogStore" component={CatalogStore} />
			<Stack.Screen name="ReceiptSendEmail" component={ReceiptSendEmail} />
			<Stack.Screen
				name="QuickSale"
				options={modalScreenOptions(isMobile)}
				component={modalScreen(isMobile, QuickSaleStack)}
			/>
			<Stack.Screen
				name="QuantityFractioned"
				options={modalScreenOptions(isMobile)}
				component={modalScreen(isMobile, QuantityFractioned)}
			/>
			<Stack.Screen
				name="Quantity"
				options={modalScreenOptions(isMobile)}
				component={modalScreen(isMobile, Quantity)}
			/>
		</Stack.Navigator>
	)
}

export default CurrentSaleStack
