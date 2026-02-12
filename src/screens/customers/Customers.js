import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { TabletScreenContainer } from '../../components/common';
//import { headerStyles } from '../../styles';

import CustomerContainer from '../../components/customers/CustomerContainer';
import CustomerSave from '../../components/customers/customer/CustomerSave';
import CustomerImportContainer from '../../components/customers/import/CustomerImportContainer';
import CustomerDetailStack from './CustomerDetail';
import ReportExport from '../../components/config/report-export/ReportExport';

const Stack = createStackNavigator();
const screenOptions = { headerShown: false, unmountOnBlur: true };

const CustomerStack = () => (
  <TabletScreenContainer>
    <Stack.Navigator initialRouteName={'CustomerIndex'} screenOptions={screenOptions}>
      <Stack.Screen name={'CustomerIndex'} component={CustomerContainer} />
      <Stack.Screen name={'CustomerCreate'} component={CustomerSave} />
      <Stack.Screen name={'CustomerDetail'} component={CustomerDetailStack} />
      <Stack.Screen name={'CustomerImport'} component={CustomerImportContainer} />
      <Stack.Screen name={'DataExport'} component={ReportExport} />
    </Stack.Navigator>
  </TabletScreenContainer>
);

export default CustomerStack;
