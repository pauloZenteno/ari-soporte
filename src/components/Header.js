import React from 'react';
import { View, StyleSheet, Platform, StatusBar, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function Header() {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#2b5cb5', '#1e40af']} 
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.logoContainer}>
          <Image 
            source={require('../assets/header_logo.png')} 
            style={styles.logo} 
          />
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    shadowColor: '#2b5cb5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
    
    backgroundColor: 'white', 
    borderBottomLeftRadius: 20, 
    borderBottomRightRadius: 20,
    overflow: 'hidden', 
    zIndex: 10,
  },
  headerGradient: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 8 : 50,
    paddingBottom: 12,
    paddingHorizontal: 20, 
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'flex-start', 
    justifyContent: 'center',
  },
  logo: {
    width: 160, 
    height: 45, 
    resizeMode: 'contain', 
  },
});