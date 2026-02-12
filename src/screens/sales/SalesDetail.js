import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
// import { headerStyles } from '../../styles';

import SaleDetail from '../../components/sales/SaleDetail';
import ReceiptShareOptions from '../../components/current-sale/receipt/ReceiptShareOptions';
import ConfigReceipt from '../../components/config/receipt/ConfigReceipt';
import CatalogStore from '../../components/config/catalog/CatalogStore';
import ReceiptSendEmail from '../../components/current-sale/receipt/ReceiptSendEmail';
import CartObservation from '../../components/current-sale/cart/CartObservation';
import StorePrinter from '../../components/config/printers/StorePrinter';
import StorePrinterConfirm from '../../components/config/printers/StorePrinterConfirm';
import CatalogOrderStatusAdd from '../../components/config/catalog/order-settings/CatalogOrderStatusAdd';
import CatalogOrderStatus from '../../components/config/catalog/order-settings/CatalogOrderStatus';
import { CustomerDetailStack } from "..";
import ReceiptContainer from '../../components/current-sale/receipt/ReceiptContainer';
import AllowPayLater from '../../components/current-sale/payments/AllowPayLater';
import PixDataConfig from '../../components/config/payments/PixDataConfig';

const Stack = createStackNavigator();
const screenOptions = { headerShown: false, unmountOnBlur: true };

const SaleDetailStack = () => (
  <Stack.Navigator initialRouteName="SaleDetail" screenOptions={screenOptions}>
    <Stack.Screen name="SaleDetail" component={SaleDetail} />
    <Stack.Screen name="Receipt" component={ReceiptContainer} />
    <Stack.Screen name="ReceiptShareOptions" component={ReceiptShareOptions} />
    <Stack.Screen name="ConfigReceipt" component={ConfigReceipt} />
    <Stack.Screen name="CatalogStore" component={CatalogStore} />
    <Stack.Screen name="ReceiptSendEmail" component={ReceiptSendEmail} />
    <Stack.Screen name="CartObservation" component={CartObservation} />
    <Stack.Screen name="StorePrinter" component={StorePrinter} />
    <Stack.Screen name="StorePrinterConfirm" component={StorePrinterConfirm} />
    <Stack.Screen name="CatalogOrderStatusAdd" component={CatalogOrderStatusAdd} />
    <Stack.Screen name="CatalogOrderStatus" component={CatalogOrderStatus} />
    <Stack.Screen name="CustomerDetail" component={CustomerDetailStack} />
    <Stack.Screen name="AllowPayLater" component={AllowPayLater} />
    <Stack.Screen name="PixDataConfig" component={PixDataConfig} />
  </Stack.Navigator>
);

export default SaleDetailStack;
