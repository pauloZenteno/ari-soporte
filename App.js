import React, { useState } from 'react';
import { View, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// 1. IMPORTAMOS LA LIBRERÍA NATIVA (La que instalaste)
import { createNativeBottomTabNavigator } from '@bottom-tabs/react-navigation';

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
import AnimatedSplashScreen from './src/screens/AnimatedSplashScreen'; 

import { ClientProvider } from './src/context/ClientContext'; 
import { AuthProvider, useAuth } from './src/context/AuthContext';

const Stack = createNativeStackNavigator();

// 2. CREAMOS EL NAVIGATOR NATIVO
const Tab = createNativeBottomTabNavigator();

function MainTabs({ navigation }) {
  return (
    <View style={{ flex: 1 }}>
      <Header navigation={navigation} />
      
      <Tab.Navigator
        // 3. Opciones Globales Nativas
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#2b5cb5', // Tu color azul
          
          // Estilo translúcido nativo de iOS (Blur automático)
          translucent: true, 
          
          // En esta librería, el estilo se define diferente
          tabBarStyle: {
            position: 'absolute',
            bottom: 0,
          }
        }}
      >
        <Tab.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ 
            tabBarLabel: 'Demos',
            // 4. AQUÍ CAMBIA: Usamos sfSymbol para iOS
            tabBarIcon: () => ({
              sfSymbol: 'clock.fill', // SF Symbol para "Time"
              // Para Android necesitarías un asset local, por ahora solo iOS se verá nativo 100%
            }),
          }} 
        />
        <Tab.Screen 
          name="Clients" 
          component={ClientsScreen} 
          options={{ 
            tabBarLabel: 'Clientes',
            tabBarIcon: () => ({
              sfSymbol: 'person.2.fill', // SF Symbol para "People"
            }),
          }} 
        />
        <Tab.Screen 
          name="Cotizador" 
          component={CotizadorScreen} 
          options={{ 
            tabBarLabel: 'Cotizar',
            tabBarIcon: () => ({
              sfSymbol: 'doc.text.fill', // SF Symbol para "Document"
            }),
          }} 
        />
        <Tab.Screen 
          name="Reportes" 
          component={ReportsScreen} 
          options={{ 
            tabBarLabel: 'Reportes',
            tabBarIcon: () => ({
              sfSymbol: 'chart.bar.fill', // SF Symbol para "Chart"
            }),
          }} 
        />
        <Tab.Screen 
          name="Settings" 
          component={SettingsScreen} 
          options={{ 
            tabBarLabel: 'Ajustes',
            tabBarIcon: () => ({
              sfSymbol: 'gearshape.fill', // SF Symbol para "Settings"
            }),
          }} 
        />
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