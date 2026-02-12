import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { TabletScreenContainer } from '../components/common';
//import { headerStyles } from '../styles';

import SendCode from '../components/auth/SendCode';
import AccountConfirmation from '../components/auth/AccountConfirmation';
import PageConfirmation from '../components/common/PageConfirmation';

const Stack = createStackNavigator();
const screenOptions = { headerShown: false };

const ConfirmationStack = ({ route } = { }) => (
  <TabletScreenContainer maxHeight={620}>
    <Stack.Navigator initialRouteName={'SendCode'} screenOptions={screenOptions}>
      <Stack.Screen name={'SendCode'} component={SendCode} />
      <Stack.Screen name={'AccountConfirmation'} component={AccountConfirmation} />
      <Stack.Screen name={'PageConfirmation'} component={PageConfirmation} initialParams={route?.params ?? {}}/>
    </Stack.Navigator>
  </TabletScreenContainer>
);

export default ConfirmationStack;
