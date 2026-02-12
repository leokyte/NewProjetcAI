import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
// import { headerStyles } from '../../styles';

import CustomerDetail from '../../components/customers/customer/CustomerDetail'
import CustomerAccountEdit from '../../components/customers/customer/CustomerAccountEdit'
import CustomerAccountBalance from '../../components/customers/customer/CustomerAccountBalance'
import CustomerAccountFilter from '../../components/customers/customer/CustomerAccountFilter'
import CustomerAccountReceipt from '../../components/customers/customer/CustomerAccountReceipt'
import CustomerStatements from '../../components/customers/customer/CustomerStatements'
import CustomerStatementDetail from '../../components/customers/customer/CustomerStatementDetail'
import CustomerStatementsShare from '../../components/customers/customer/CustomerStatementsShare'

// Sales (Turn this routes into SaleDetailStack when finding a solution to nested stack params)
import SaleDetail from '../../components/sales/SaleDetail'
import ReceiptShareOptions from '../../components/current-sale/receipt/ReceiptShareOptions'
import ConfigReceipt from '../../components/config/receipt/ConfigReceipt'
import CatalogStore from '../../components/config/catalog/CatalogStore'
import ReceiptSendEmail from '../../components/current-sale/receipt/ReceiptSendEmail'
import CartObservation from '../../components/current-sale/cart/CartObservation'
import StorePrinter from '../../components/config/printers/StorePrinter'
import StorePrinterConfirm from '../../components/config/printers/StorePrinterConfirm'
import CatalogOrderStatusAdd from '../../components/config/catalog/order-settings/CatalogOrderStatusAdd'
import CatalogOrderStatus from '../../components/config/catalog/order-settings/CatalogOrderStatus'
import SalesPeriod from '../../components/sales/SalesPeriod'

const Stack = createStackNavigator()
const screenOptions = { headerShown: false, unmountOnBlur: true }

const CustomerDetailStack = () => (
	<Stack.Navigator initialRouteName="CustomerDetail" screenOptions={screenOptions}>
		<Stack.Screen name="CustomerDetail" component={CustomerDetail} />
		<Stack.Screen name="CustomerAccountEdit" component={CustomerAccountEdit} />
		<Stack.Screen name="CustomerAccountBalance" component={CustomerAccountBalance} />
		<Stack.Screen name="CustomerAccountFilter" component={CustomerAccountFilter} />
		<Stack.Screen name="CustomerAccountReceipt" component={CustomerAccountReceipt} />
		<Stack.Screen name="CustomerStatements" component={CustomerStatements} />
		<Stack.Screen name="CustomerStatementDetail" component={CustomerStatementDetail} />
		<Stack.Screen name="CustomerStatementsShare" component={CustomerStatementsShare} />
		<Stack.Screen name="SaleDetail" component={SaleDetail} />
		<Stack.Screen name="ReceiptShareOptions" component={ReceiptShareOptions} />
		<Stack.Screen name="ConfigReceipt" component={ConfigReceipt} />
		<Stack.Screen name="CatalogStore" component={CatalogStore} />
		<Stack.Screen name="ReceiptSendEmail" component={ReceiptSendEmail} />
		<Stack.Screen name="CartObservation" component={CartObservation} />
		<Stack.Screen name="StorePrinter" component={StorePrinter} />
		<Stack.Screen name="StorePrinterConfirm" component={StorePrinterConfirm} />
		<Stack.Screen name="CatalogOrderStatusAdd" component={CatalogOrderStatusAdd} />
		<Stack.Screen name="CatalogOrderStatus" component={CatalogOrderStatus} />
		<Stack.Screen name="SalesPeriod" component={SalesPeriod} />
	</Stack.Navigator>
)

export default CustomerDetailStack
