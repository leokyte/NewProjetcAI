import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
//import { headerStyles } from '../styles';

import PostEmail from '../components/auth/PostEmail';

const Stack = createStackNavigator();
const screenOptions = { headerShown: false };

const PostEmailStack = () => (
  <Stack.Navigator initialRouteName={'PostEmail'} screenOptions={screenOptions}>
    <Stack.Screen name={'PostEmail'} component={PostEmail} />
  </Stack.Navigator>
);

export default PostEmailStack;
