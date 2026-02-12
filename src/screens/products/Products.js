import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
//import { headerStyles } from '../styles';

import ProductsIndex from '../../components/products/ProductsIndex';
// import ProductDetail from '../../components/products/detail/ProductDetail';

import CurrentStockManager from '../../components/products/detail/CurrentStockManager';
import ProductCategoryCreate from '../../components/products/categories/ProductCategoryCreate';
import CustomerDetail from '../../components/customers/customer/CustomerDetail';
import Payment from '../../components/current-sale/payments/PaymentsContainer';
import ReportExport from '../../components/config/report-export/ReportExport';
import CatalogOnlineOrders from '../../components/config/catalog/CatalogOnlineOrders';
import ProductDetail from './ProductDetail';

const Stack = createStackNavigator();
const screenOptions = {headerShown: false};

// ProductsIndex path: index
// ProductCreate path: create
const ProductsStack = () => (
  <Stack.Navigator
    initialRouteName={'ProductsIndex'}
    screenOptions={screenOptions}>
    <Stack.Screen name={'ProductsIndex'} component={ProductsIndex} />
    <Stack.Screen name={'ProductCreate'} component={ProductDetail} initialParams={{ isBackButtonInvisible: false }} />
    <Stack.Screen name={'ProductDetail'} component={ProductDetail} initialParams={{ isBackButtonInvisible: false }} />
    <Stack.Screen
      name={'CurrentStockManager'}
      component={CurrentStockManager}
    />
    <Stack.Screen
      name={'ProductCategoryCreate'}
      component={ProductCategoryCreate}
    />
    <Stack.Screen name={'CustomerDetail'} component={CustomerDetail} />
    <Stack.Screen name={'Payment'} component={Payment} />
    <Stack.Screen name={'DataExport'} component={ReportExport} />
    <Stack.Screen name={'CatalogOnlineOrders'} component={CatalogOnlineOrders} />
  </Stack.Navigator>
);

export default ProductsStack;
