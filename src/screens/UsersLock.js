import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { TabletScreenContainer } from '../components/common';
//import { headerStyles } from '../styles';

import UsersLock from '../components/users/UsersLock';
import SigninPassword from '../components/auth/SigninPassword';
import AccountConfirmation from '../components/auth/AccountConfirmation';
import Helpcenter from '../components/help-center/HelpcenterContainer';
import PageConfirmation from '../components/common/PageConfirmation';

const Stack = createStackNavigator();
const screenOptions = { headerShown: false };

const UsersLockStack = () => (
  <TabletScreenContainer maxHeight={620}>
    <Stack.Navigator initialRouteName={'UsersLockContent'} screenOptions={screenOptions}>
      <Stack.Screen name={'UsersLockContent'} component={UsersLock} />
      <Stack.Screen name={'UsersLockPassword'} component={SigninPassword} />
      <Stack.Screen name={'UsersLockCode'} component={AccountConfirmation} />
      <Stack.Screen name={'UsersLockHelpcenter'} component={Helpcenter} />
      <Stack.Screen name={'UsersLockConfirmation'} component={PageConfirmation} />
    </Stack.Navigator>
  </TabletScreenContainer>
);

export default UsersLockStack;
