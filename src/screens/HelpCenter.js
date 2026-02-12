import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { TabletScreenContainer } from '../components/common';
//import { headerStyles } from '../styles';

import HelpcenterContainer from '../components/help-center/HelpcenterContainer';

const Stack = createStackNavigator();
const screenOptions = { headerShown: false };

const HelpcenterStack = () => (
  <TabletScreenContainer>
    <Stack.Navigator initialRouteName={'Helpcenter'} screenOptions={screenOptions}>
      <Stack.Screen name={'Helpcenter'} component={HelpcenterContainer} />
    </Stack.Navigator>
  </TabletScreenContainer>
);

export default HelpcenterStack;
