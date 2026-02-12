
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
//import { TabletScreenContainer } from '../components/common';
//import { headerStyles } from '../styles';

import ShippingFees from '../components/config/shipping-fees/ShippingFees';
import ShippingFeeEdit from '../components/config/shipping-fees/ShippingFeeEdit';

const Stack = createStackNavigator();
const screenOptions = { headerShown: false };

const SheppingFeesStack = () => (
  <Stack.Navigator initialRouteName={'ShippingFees'} screenOptions={screenOptions}>
    <Stack.Screen name={'ShippingFees'} component={ShippingFees} />
    <Stack.Screen name={'ShippingFeeEdit'} component={ShippingFeeEdit} />
  </Stack.Navigator>
);

export default SheppingFeesStack;
