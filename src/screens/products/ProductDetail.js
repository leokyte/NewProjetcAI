import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'

import ProductDetail from '../../components/products/detail/ProductDetail'
import ProductPhotoSelector from '../../components/products/detail/ProductPhotoSelector'
import BarcodeReader from '../../components/products/detail/BarcodeReader'
import ProductShareOptions from '../../components/products/share/ProductShareOptions'
import StockHistory from '../../components/products/detail/StockHistory'
import StockHistoryFilter from '../../components/products/detail/StockHistoryFilter'
import MinimumStockManager from '../../components/products/detail/MinimumStockManager'
import CurrentStockManager from '../../components/products/detail/CurrentStockManager'
import SaleDetail from '../../components/sales/SaleDetail'
import ReceiptShareOptions from '../../components/current-sale/receipt/ReceiptShareOptions'
import ReceiptSendEmail from '../../components/current-sale/receipt/ReceiptSendEmail'
import ConfigReceipt from '../../components/config/receipt/ConfigReceipt'
import CatalogStore from '../../components/config/catalog/CatalogStore'
import VariantsWizard from './VariantsWizard'
import ProductVariantDetails from '../../components/products/variants/ProductVariantDetails'
import VariantStockDetail from './VariantStockDetail'
import { VariantsScreens } from '../../enums'
import CatalogVersion from '../../components/config/catalog/CatalogVersion'
import ProductVariationsManager from '../../components/products/variants/ProductVariationsManager'
import VariationsManagerStack from './VariationsManager'
import AIProductSuggestions from '../../components/products/magic-registration/AIProductSuggestions'

const Stack = createStackNavigator()
const screenOptions = { headerShown: false }

function ProductDetailStack({ route }) {
	return (
		<Stack.Navigator initialRouteName="ProductDetail" screenOptions={screenOptions}>
			<Stack.Screen
				name="ProductDetail"
				component={ProductDetail}
				initialParams={{ isBackButtonInvisible: route?.params?.isBackButtonInvisible ?? true }}
			/>
			<Stack.Screen name="ProductPhotoSelector" key="ProductPhotoSelectorPage" component={ProductPhotoSelector} />
			<Stack.Screen name="BarcodeReader" component={BarcodeReader} />
			<Stack.Screen name="VariantStockDetail" component={VariantStockDetail} />
			<Stack.Screen name="ProductShareOptions" component={ProductShareOptions} />
			<Stack.Screen name="StockHistory" component={StockHistory} />
			<Stack.Screen name="StockHistoryFilter" component={StockHistoryFilter} />
			<Stack.Screen name="MinimumStockManager" component={MinimumStockManager} />
			<Stack.Screen name="CurrentStockManager" component={CurrentStockManager} />
			<Stack.Screen name="stockHistoryDetail" component={SaleDetail} />
			<Stack.Screen name="ReceiptShareOptions" component={ReceiptShareOptions} />
			<Stack.Screen name="ReceiptSendEmail" component={ReceiptSendEmail} />
			<Stack.Screen name="ConfigReceipt" component={ConfigReceipt} />
			<Stack.Screen name="CatalogStore" component={CatalogStore} />
			<Stack.Screen name="VariantsWizard" component={VariantsWizard} />
			<Stack.Screen name="ProductVariantDetails" component={ProductVariantDetails} />
			<Stack.Screen name={VariantsScreens.CatalogVersion} component={CatalogVersion} />
			<Stack.Screen name="ProductVariationsManager" component={ProductVariationsManager} />
			<Stack.Screen name="VariationsManager" component={VariationsManagerStack} />
			<Stack.Screen name="AIProductSuggestions" component={AIProductSuggestions} />
		</Stack.Navigator>
	)
}

export default ProductDetailStack
