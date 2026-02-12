import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
// import { headerStyles } from '../../styles';

import ReceiptContainer from '../../components/current-sale/receipt/ReceiptContainer'
import PaymentLink from '../../components/current-sale/payment-link/PaymentLinkContainer'
import ReceiptShareOptions from '../../components/current-sale/receipt/ReceiptShareOptions'
import ConfigReceipt from '../../components/config/receipt/ConfigReceipt'
import CatalogStore from '../../components/config/catalog/CatalogStore'
import ReceiptSendEmail from '../../components/current-sale/receipt/ReceiptSendEmail'
import StoreDetailContainer from '../../components/config/store/StoreDetailContainer'
import CustomerSaleAccountBalance from '../../components/customers/customer/CustomerSaleAccountBalance'
import Payment from '../../components/current-sale/payments/PaymentsContainer'
import PaymentEdition from '../../components/current-sale/payment-edition/PaymentEditionContainer'
import SplitPayment from '../../components/current-sale/split-payment/SplitPaymentContainer'
import PaymentOthers from '../../components/current-sale/payments/PaymentOthers'
import CartObservation from '../../components/current-sale/cart/CartObservation'
import { CustomerDetailStack, CustomerAddStack, SaleDetailStack } from '..'
import StorePrinter from '../../components/config/printers/StorePrinter'
import StorePrinterConfirm from '../../components/config/printers/StorePrinterConfirm'
import SaleQRCodePayment from '../../components/sales/SaleQRCodePayment'
import SalePixPaymentConfirmation from '../../components/sales/SalePixPaymentConfirmation'
import PixDataConfig from '../../components/config/payments/PixDataConfig'

const Stack = createStackNavigator()
const screenOptions = { headerShown: false }

const ReceiptStack =
	(initialRoute = 'Receipt') =>
	() =>
		(
			<Stack.Navigator initialRouteName={initialRoute} screenOptions={screenOptions}>
				<Stack.Screen name="Receipt" component={ReceiptContainer} />
				<Stack.Screen name="PaymentLink" component={PaymentLink} />
				<Stack.Screen name="Payment" component={Payment} />
				<Stack.Screen name="PaymentEdition" component={PaymentEdition} />
				<Stack.Screen name="SplitPayment" component={SplitPayment} />
				<Stack.Screen name="PaymentOthers" component={PaymentOthers} />
				<Stack.Screen name="ReceiptShareOptions" component={ReceiptShareOptions} />
				<Stack.Screen name="CartObservation" component={CartObservation} />
				<Stack.Screen name="ConfigReceipt" component={ConfigReceipt} />
				<Stack.Screen name="CatalogStore" component={CatalogStore} />
				<Stack.Screen name="StoreReceipt" component={StoreDetailContainer} />
				<Stack.Screen name="SaleDetail" component={SaleDetailStack} />
				<Stack.Screen name="CustomerDetail" component={CustomerDetailStack} />
				<Stack.Screen name="CustomerSaleAccountBalance" component={CustomerSaleAccountBalance} />
				<Stack.Screen name="StorePrinter" component={StorePrinter} />
				<Stack.Screen name="StorePrinterConfirm" component={StorePrinterConfirm} />
				<Stack.Screen name="CustomerAdd" component={CustomerAddStack} />
				<Stack.Screen name="ReceiptSendEmail" component={ReceiptSendEmail} />
				<Stack.Screen name="SaleQRCodePayment" component={SaleQRCodePayment} />
				<Stack.Screen name="SalePixPaymentConfirmation" component={SalePixPaymentConfirmation} />
				<Stack.Screen name="PixDataConfigReceipt" component={PixDataConfig} />
			</Stack.Navigator>
		)

export default ReceiptStack
