import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { TabletScreenContainer } from '../components/common';
//import { headerStyles } from '../styles';

import StatisticsContainer from '../components/statistics/StatisticsContainer';
import StatisticsFilter from '../components/statistics/StatisticsFilter';
import StatisticsDetail from '../components/statistics/StatisticsDetail';

const Stack = createStackNavigator();
const screenOptions = { headerShown: false };

const StatisticsStack = () => (
  <TabletScreenContainer>
    <Stack.Navigator initialRouteName={'StatisticsContainer'} screenOptions={screenOptions}>
      <Stack.Screen name={'StatisticsContainer'} component={StatisticsContainer} />
      <Stack.Screen name={'StatisticsFilter'} component={StatisticsFilter} />
      <Stack.Screen name={'StatisticsDetail'} component={StatisticsDetail} />
    </Stack.Navigator>
  </TabletScreenContainer>
);

export default StatisticsStack;
