import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { TabletScreenContainer } from '../components/common';
//import { headerStyles } from '../styles';

import UsersList from '../components/users/UsersList';
import UserAdd from '../components/users/UserAdd';
import UserEdit from '../components/users/UserEdit';
import SigninPassword from '../components/auth/SigninPassword';
import PageConfirmation from '../components/common/PageConfirmation';
import SaleDetail from '../components/sales/SaleDetail';
import CustomerDetail from '../components/customers/customer/CustomerDetail';
import Payment from '../components/current-sale/payments/PaymentsContainer';
import ReceiptShareOptions from '../components/current-sale/receipt/ReceiptShareOptions';
import ConfigReceipt from '../components/config/receipt/ConfigReceipt';
import CatalogStore from '../components/config/catalog/CatalogStore';
import SalesPeriod from '../components/sales/SalesPeriod';
import ReceiptSendEmail from '../components/current-sale/receipt/ReceiptSendEmail';

const Stack = createStackNavigator();
const screenOptions = { headerShown: false };

const UsersStack = () => (
  <TabletScreenContainer maxHeight={620}>
    <Stack.Navigator initialRouteName={'UsersList'} screenOptions={screenOptions}>
      <Stack.Screen name={'UsersList'} component={UsersList} />
      <Stack.Screen name={'UserEdit'} component={UserEdit} />
      <Stack.Screen name={'UserAdd'} component={UserAdd} />
      <Stack.Screen name={'UserConfirmPassword'} component={SigninPassword} />
      <Stack.Screen name={'UserConfirmation'} component={PageConfirmation} />
      <Stack.Screen name={'SaleDetail'} component={SaleDetail} />
      <Stack.Screen name={'SalesPeriod'} component={SalesPeriod} />
      <Stack.Screen name={'CustomerDetail'} component={CustomerDetail} />
      <Stack.Screen name={'Payment'} component={Payment} />
      <Stack.Screen name={'ReceiptShareOptions'} component={ReceiptShareOptions} />
      <Stack.Screen name={'ConfigReceipt'} component={ConfigReceipt} />
      <Stack.Screen name={'CatalogStore'} component={CatalogStore} />
      <Stack.Screen name={'ReceiptSendEmail'} component={ReceiptSendEmail} />
    </Stack.Navigator>
  </TabletScreenContainer>
);

export default UsersStack;
