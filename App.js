import React, { useState } from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';

import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import ClientsScreen from './src/screens/ClientsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import CotizadorScreen from './src/screens/CotizadorScreen';
import QuoteCreateScreen from './src/screens/QuoteCreateScreen';
import ReportsScreen from './src/screens/ReportsScreen';
import GeneralReportScreen from './src/screens/reports/GeneralReportScreen';
import UsageReportScreen from './src/screens/reports/UsageReportScreen';

import Header from './src/components/Header';
import BottomNav from './src/components/BottomNav';
import AnimatedSplashScreen from './src/screens/AnimatedSplashScreen'; 

import { ClientProvider } from './src/context/ClientContext'; 
import { AuthProvider, useAuth } from './src/context/AuthContext';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs({ navigation }) {
  return (
    <View style={{ flex: 1 }}>
      <Header navigation={navigation} />
      <Tab.Navigator
        tabBar={(props) => <BottomNav {...props} />} 
        screenOptions={{ headerShown: false }}
      >
        <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Demos', tabBarIconName: 'time' }} />
        <Tab.Screen name="Clients" component={ClientsScreen} options={{ tabBarLabel: 'Clientes', tabBarIconName: 'people' }} />
        <Tab.Screen name="Cotizador" component={CotizadorScreen} options={{ tabBarLabel: 'Cotizar', tabBarIconName: 'calculator' }} />
        <Tab.Screen name="Reportes" component={ReportsScreen} options={{ tabBarLabel: 'Reportes', tabBarIconName: 'bar-chart' }} />
        <Tab.Screen name="Settings" component={SettingsScreen} options={{ tabBarLabel: 'Ajustes', tabBarIconName: 'settings' }} />
      </Tab.Navigator>
    </View>
  );
}

function AppNavigation() {
  const { isLoading, isAuthenticated } = useAuth();
  const [isSplashFinished, setIsSplashFinished] = useState(false);

  if (isLoading || !isSplashFinished) {
    return (
      <AnimatedSplashScreen 
        onFinish={() => setIsSplashFinished(true)} 
      />
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="light" backgroundColor="transparent" translucent={true} />
      <Stack.Navigator 
        screenOptions={{ 
          headerShown: false,
          animation: 'default',
          gestureEnabled: true,
        }}
      >
        {isAuthenticated ? (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen name="QuoteCreate" component={QuoteCreateScreen} />
            <Stack.Screen name="GeneralReport" component={GeneralReportScreen} />
            <Stack.Screen name="UsageReport" component={UsageReportScreen} />
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ClientProvider>
        <AppNavigation />
      </ClientProvider>
    </AuthProvider>
  );
}