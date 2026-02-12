import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { TabletScreenContainer } from '../components/common';

import { Plans } from '../components/plans/Plans';
import { RedirectCheckoutWeb } from '../components/plans/RedirectCheckoutWeb';

const Stack = createStackNavigator();
const screenOptions = { headerShown: false };

const PlansStack = () => (
  <TabletScreenContainer>
    <Stack.Navigator initialRouteName="PlansContainer" screenOptions={screenOptions}>
      <Stack.Screen name="PlansContainer" component={Plans} />
      <Stack.Screen name="RedirectCheckoutWebContainer" component={RedirectCheckoutWeb} />
    </Stack.Navigator>
  </TabletScreenContainer>
);

export default PlansStack;
