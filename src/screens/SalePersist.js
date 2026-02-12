
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { TabletScreenContainer } from '../components/common';
//import { headerStyles } from '../styles';

import SplitPayment from '../components/current-sale/split-payment/SplitPaymentContainer';
import CustomerAdd from '../components/customers/customer/CustomerAdd';

const Stack = createStackNavigator();
const screenOptions = { headerShown: false };

const SalePersistStack = () => (
  <TabletScreenContainer maxHeight={600}>
    <Stack.Navigator initialRouteName={'SplitPayment'} screenOptions={screenOptions}>
      <Stack.Screen name={'SplitPayment'} component={SplitPayment} />
      <Stack.Screen name={'CustomerAdd'} component={CustomerAdd} />
    </Stack.Navigator>
  </TabletScreenContainer>
);

export default SalePersistStack;
