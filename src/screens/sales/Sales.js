import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { TabletScreenContainer } from '../../components/common';
//import { headerStyles } from '../../styles';

import SalesList from '../../components/sales/SalesHistoryContainer';
import SalesPeriod from '../../components/sales/SalesPeriod';
import ReportExport from '../../components/config/report-export/ReportExport';
import { SaleDetailStack } from '../';

const Stack = createStackNavigator();
const screenOptions = { headerShown: false };

const SalesStack = (salesType) => () => (
  <TabletScreenContainer>
    <Stack.Navigator initialRouteName={'SalesList'} screenOptions={screenOptions}>
      <Stack.Screen name={'SalesList'} component={SalesList} initialParams={{ salesType }}/>
      <Stack.Screen name={'SalesPeriod'} component={SalesPeriod} />
      <Stack.Screen name={'SaleDetail'} component={SaleDetailStack} />
      <Stack.Screen name={'DataExport'} component={ReportExport} />
    </Stack.Navigator>
  </TabletScreenContainer>
);

export default SalesStack;
