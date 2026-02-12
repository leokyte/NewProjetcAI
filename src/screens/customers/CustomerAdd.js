import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
//import { headerStyles } from '../../styles';

import CustomerAdd from '../../components/customers/customer/CustomerAdd';
import CustomerImportContainer from '../../components/customers/import/CustomerImportContainer';
import CustomerSave from '../../components/customers/customer/CustomerSave';

const Stack = createStackNavigator();
const screenOptions = { headerShown: false };

const CustomerAddStack = () => (
  <Stack.Navigator initialRouteName={'CustomerAdd'} screenOptions={screenOptions}>
    <Stack.Screen name={'CustomerAdd'} component={CustomerAdd} />
    <Stack.Screen name={'CustomerImport'} component={CustomerImportContainer} />
    <Stack.Screen name={'CustomerCreate'} component={CustomerSave} />
  </Stack.Navigator>
);

export default CustomerAddStack;
