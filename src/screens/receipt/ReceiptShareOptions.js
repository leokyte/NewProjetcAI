import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
//import { headerStyles } from '../../styles';

import ReceiptShareOptions from '../../components/current-sale/receipt/ReceiptShareOptions';
import ConfigReceipt from '../../components/config/receipt/ConfigReceipt';
import CatalogStore from '../../components/config/catalog/CatalogStore';
import ReceiptSendEmail from '../../components/current-sale/receipt/ReceiptSendEmail';
import StorePrinter from '../../components/config/printers/StorePrinter';
import StorePrinterConfirm from '../../components/config/printers/StorePrinterConfirm';

const Stack = createStackNavigator();
const screenOptions = { headerShown: false };

const ReceiptShareOptionsStack = ({ initialParams }) => (
  <Stack.Navigator initialRouteName={'ReceiptShareOptions'} screenOptions={screenOptions}>
    <Stack.Screen name={'ReceiptShareOptions'} component={ReceiptShareOptions} initialParams={initialParams ?? {}} />
    <Stack.Screen name={'ConfigReceipt'} component={ConfigReceipt} />
    <Stack.Screen name={'CatalogStore'} component={CatalogStore} />
    <Stack.Screen name={'ReceiptSendEmail'} component={ReceiptSendEmail} />
    <Stack.Screen name={'StorePrinter'} component={StorePrinter} />
    <Stack.Screen name={'StorePrinterConfirm'} component={StorePrinterConfirm} />
  </Stack.Navigator>
);

export default ReceiptShareOptionsStack;
