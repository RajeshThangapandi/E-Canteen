// App.js

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomePage from './components/Home';
import UserScreen from './components/User';
import OrdersScreen from './components/Order';
import UserOrdersScreen from './components/UserOrder';
import Admin from './components/Admin';  // Assuming your admin screen is in the App.js

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomePage} />
        <Stack.Screen name="Admin" component={Admin} />
        <Stack.Screen name="User" component={UserScreen} />
      
        <Stack.Screen name="OrdersScreen" component={OrdersScreen} />
        <Stack.Screen name="UserOrdersScreen" component={UserOrdersScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
