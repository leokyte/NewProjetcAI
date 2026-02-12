import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { TabletScreenContainer } from '../components/common';
//import { headerStyles } from '../styles';

import OnboardingCarousel from '../components/auth/OnboardingCarousel';
import Login from '../components/auth/LoginContainer';
import SignUp from '../components/auth/SignUp';
import SigninEmail from '../components/auth/SigninEmail';
import SigninPassword from '../components/auth/SigninPassword';
import PageConfirmation from '../components/common/PageConfirmation';
import AccountConfirmation from '../components/auth/AccountConfirmation';
import SendCode from '../components/auth/SendCode';

const Stack = createStackNavigator();
const screenOptions = { headerShown: false };

const SignInStack = () => (
  <TabletScreenContainer>
    <Stack.Navigator initialRouteName={'Login'} screenOptions={screenOptions}>
      <Stack.Screen name={'Login'} component={Login} />
      <Stack.Screen name={'SignUp'} component={SignUp} />
      <Stack.Screen name={'SigninEmail'} component={SigninEmail} />
      <Stack.Screen name={'SigninPassword'} component={SigninPassword} />
      <Stack.Screen name={'SendCode'} component={SendCode} />
      <Stack.Screen name={'AccountConfirmation'} component={AccountConfirmation} />
      <Stack.Screen name={'PageConfirmation'} component={PageConfirmation} />
      <Stack.Screen name={'OnboardingCarousel'} component={OnboardingCarousel} />
    </Stack.Navigator>
  </TabletScreenContainer>
);

export default SignInStack;
