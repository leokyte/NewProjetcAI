import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useViewport, Viewports } from '@kyteapp/kyte-ui-components';
import { ScreenModal } from '../../components/common';
import { modalScreenOptions,renderScreenAsModal } from '../../util';
//import { headerStyles } from '../../styles';

import Cart from '../../components/current-sale/cart/CartContainer';
import QuantityFractioned from '../../components/current-sale/quantity/QuantityFractioned';
import Quantity from '../../components/current-sale/quantity/Quantity';
import CartItemUpdate from '../../components/current-sale/cart/CartItemUpdate';
import CartItemDescription from '../../components/current-sale/cart/CartItemDescription';
import CartItemDiscount from '../../components/current-sale/cart/CartItemDiscount';
import CartObservation from '../../components/current-sale/cart/CartObservation';
import Discount from '../../components/current-sale/discount/DiscountContainer';
import ShippingFeesTip from '../../components/current-sale/shipping-fees/ShippingFeesTip';
import ShippingFeesApply from '../../components/current-sale/shipping-fees/ShippingFeesApply';
import { CustomerAddStack, ShippingFeesStack } from '../';

const Stack = createStackNavigator();
const screenOptions = { headerShown: false };
const modalScreen = (isMobile, screen) => renderScreenAsModal(isMobile, screen, ScreenModal);

const CartStack = ({ initialParams}) =>  {
  const viewport = useViewport();
  const isMobile = viewport === Viewports.Mobile;

  return (
    <Stack.Navigator initialRouteName={'Cart'} screenOptions={screenOptions}>
      <Stack.Screen name={'Cart'} component={Cart} initialParams={{ hideTitle: !isMobile, ...initialParams }} />
      <Stack.Screen name={'CartObservation'} component={CartObservation} />
      <Stack.Screen name={'CustomerAdd'} component={CustomerAddStack} />
      <Stack.Screen name={'ShippingFees'} component={ShippingFeesStack} />
      <Stack.Screen name={'ShippingFeesTip'} component={ShippingFeesTip} />
      <Stack.Screen name={'ShippingFeesApply'} component={ShippingFeesApply} />
      <Stack.Screen
        name={'Discount'}
        component={modalScreen(isMobile, Discount)}
        options={modalScreenOptions(isMobile)}
      />
      <Stack.Screen
        name={'CartItemDiscount'}
        component={modalScreen(isMobile, CartItemDiscount)}
        options={modalScreenOptions(isMobile)}
      />
      <Stack.Screen
        name={'CartItemDescription'}
        component={modalScreen(isMobile, CartItemDescription)}
        options={modalScreenOptions(isMobile)}
      />
      <Stack.Screen
        name={'CartItemUpdate'}
        component={modalScreen(isMobile, CartItemUpdate)}
        options={modalScreenOptions(isMobile)}
      />
      <Stack.Screen
        name={'Quantity'}
        component={modalScreen(isMobile, Quantity)}
        options={modalScreenOptions(isMobile)}
      />
       <Stack.Screen
        name={'QuantityFractioned'}
        component={modalScreen(isMobile, QuantityFractioned)}
        options={modalScreenOptions(isMobile)}
      />
    </Stack.Navigator>
  );
};


export default CartStack;
