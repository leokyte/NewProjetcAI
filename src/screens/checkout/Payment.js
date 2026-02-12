import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { TabletScreenContainer } from '../../components/common'
// import { headerStyles } from '../../styles';

import Payment from '../../components/current-sale/payments/PaymentsContainer'
import PaymentEdition from '../../components/current-sale/payment-edition/PaymentEditionContainer'
import SplitPayment from '../../components/current-sale/split-payment/SplitPaymentContainer'
import PaymentOthers from '../../components/current-sale/payments/PaymentOthers'
import AllowPayLater from '../../components/current-sale/payments/AllowPayLater'
import ProductDetail from '../../components/products/detail/ProductDetail'
import CustomerSaleAccountBalance from '../../components/customers/customer/CustomerSaleAccountBalance'
import ConfigOnlinePayments from '../../components/config/payments/online-payments/ConfigOnlinePayments'
import ConfigIntegratedPayments from '../../components/config/payments/ConfigIntegratedPayments'
import { CustomerAddStack } from '..'
import SaleQRCodePayment from '../../components/sales/SaleQRCodePayment'
import SalePixPaymentConfirmation from '../../components/sales/SalePixPaymentConfirmation'
import ConfigOnlinePaymentsWizard from '../../components/config/payments/online-payments/ConfigOnlinePaymentsWizard'

const Stack = createStackNavigator()
const screenOptions = { headerShown: false }

const PaymentStack = (props) => (
	<TabletScreenContainer maxHeight={700}>
		<Stack.Navigator initialRouteName="Payment" screenOptions={screenOptions}>
			<Stack.Screen name="Payment" component={Payment} initialParams={props.route?.params} />
			<Stack.Screen name="PaymentEdition" component={PaymentEdition} />
			<Stack.Screen name="SplitPayment" component={SplitPayment} />
			<Stack.Screen name="PaymentOthers" component={PaymentOthers} />
			<Stack.Screen name="CustomerAdd" component={CustomerAddStack} />
			<Stack.Screen name="AllowPayLater" component={AllowPayLater} />
			<Stack.Screen name="ProductDetail" component={ProductDetail} />
			<Stack.Screen name="CustomerSaleAccountBalance" component={CustomerSaleAccountBalance} />
			<Stack.Screen name="ConfigIntegratedPayments" component={ConfigIntegratedPayments} />
			<Stack.Screen name="ConfigOnlinePayments" component={ConfigOnlinePayments} />
			<Stack.Screen name="ConfigOnlinePaymentsWizard" component={ConfigOnlinePaymentsWizard} />
			<Stack.Screen name="SaleQRCodePayment" component={SaleQRCodePayment} />
			<Stack.Screen name="SalePixPaymentConfirmation" component={SalePixPaymentConfirmation} />
		</Stack.Navigator>
	</TabletScreenContainer>
)

export default PaymentStack
