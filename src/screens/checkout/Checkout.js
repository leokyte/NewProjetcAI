import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
//import { headerStyles } from '../../styles';

import Cart from './Cart';
import Payment from './Payment';

const Stack = createStackNavigator();
const screenOptions = { headerShown: false };

const CheckoutStack = () => (
  <Stack.Navigator initialRouteName={'Cart'} screenOptions={screenOptions}>
    <Stack.Screen name={'Cart'} component={Cart} />
    <Stack.Screen name={'Payment'} component={Payment} />
  </Stack.Navigator>
);

export default CheckoutStack;
