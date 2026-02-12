import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { TabletScreenContainer } from '../components/common'

import Account from '../components/account/Account'
import StoreDetailContainer from '../components/config/store/StoreDetailContainer'
import SigninPassword from '../components/auth/SigninPassword'
import PageConfirmation from '../components/common/PageConfirmation'

const Stack = createStackNavigator()
const screenOptions = { headerShown: false }

const AccountStack = () => (
	<TabletScreenContainer maxHeight={620}>
		<Stack.Navigator initialRouteName="Account" screenOptions={screenOptions}>
			<Stack.Screen name="Account" component={Account} />
			<Stack.Screen name="StoreDetail" component={StoreDetailContainer} />
			<Stack.Screen name="UserConfirmPassword" component={SigninPassword} />
			<Stack.Screen name="UserConfirmation" component={PageConfirmation} />
		</Stack.Navigator>
	</TabletScreenContainer>
)

export default AccountStack
