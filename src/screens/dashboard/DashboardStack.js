import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import Dashboard from '../../components/dashboard/Dashboard'
import ProductDetail from '../products/ProductDetail'
import CustomerAddStack from '../customers/CustomerAdd'
import ConfirmationOrUserAdd from '../../components/users/ConfirmationOrUserAdd'
import SaleDetailStack from '../sales/SalesDetail'

const Stack = createStackNavigator()
const screenOptions = { headerShown: false }

const DashboardStack = () => (
	<Stack.Navigator initialRouteName="Dashboard" screenOptions={screenOptions}>
		<Stack.Screen name="Dashboard" component={Dashboard} />
		<Stack.Screen name="ProductCreate" component={ProductDetail} initialParams={{ isBackButtonInvisible: false }} />
		<Stack.Screen name="CustomerAdd" component={CustomerAddStack} />
		<Stack.Screen name="ConfirmationOrUserAdd" component={ConfirmationOrUserAdd} />
		<Stack.Screen name="SaleDetail" component={SaleDetailStack} />
	</Stack.Navigator>
)

export default DashboardStack
