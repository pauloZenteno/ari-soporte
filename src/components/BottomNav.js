import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, LayoutAnimation, UIManager } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function BottomNav({ state, descriptors, navigation }) {

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [state.index]);

  return (
    <View style={styles.container}>
      <View style={styles.glassBackground}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          
          let label = options.tabBarLabel;
          if (!label) label = route.name;
          
          let iconName = options.tabBarIconName; 
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              activeOpacity={0.8}
              style={[
                styles.tabItem,
                isFocused ? styles.tabItemActive : styles.tabItemInactive
              ]}
            >
              <View style={styles.contentContainer}>
                {/* ÍCONO: Si está activo es AZUL, si no, es GRIS */}
                <Ionicons 
                  name={isFocused ? iconName : `${iconName}-outline`} 
                  size={22} 
                  color={isFocused ? "#2b5cb5" : "#9CA3AF"} 
                />
                
                {isFocused && (
                  <Text style={styles.tabLabel} numberOfLines={1}>
                    {label}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 25,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 20, 
  },
  glassBackground: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%', 
    maxWidth: 500,
    height: 70,
    borderRadius: 40,
    backgroundColor: 'white',
    // Sombra premium suave
    shadowColor: '#2b5cb5',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 8,
    padding: 6, 
    borderWidth: 1,
    borderColor: '#F3F4F6', // Borde gris muy sutil
  },
  
  tabItem: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
    overflow: 'hidden',
  },
  
  tabItemInactive: {
    flex: 1, 
    backgroundColor: 'transparent',
  },
  
  // --- AQUÍ ESTÁ EL CAMBIO DE DISEÑO ---
  tabItemActive: {
    flex: 2.5, 
    // ESTILO RECOMENDADO ("Tinted"): Fondo azul muy claro + Texto Azul Fuerte
    backgroundColor: '#EFF6FF' 
  },
  
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  
  tabLabel: {
    color: '#2b5cb5', // Texto azul fuerte
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 8,
  },
});