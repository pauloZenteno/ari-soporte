import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform, StatusBar, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function Header({ navigation }) {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#2b5cb5', '#1e40af']} 
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          
          <View style={styles.logoContainer}>
              <Image 
                source={require('../assets/header_logo.png')} 
                style={{ width: 180, height: 60, resizeMode: 'contain' }} 
              />
          </View>
          
          <TouchableOpacity 
            style={styles.iconButton} 
            onPress={() => navigation.navigate('Settings')}
            activeOpacity={0.7}
          >
            <Ionicons name="settings-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    shadowColor: '#2b5cb5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    marginBottom: 5,
    backgroundColor: 'white', 
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden', 
  },
  headerGradient: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 60,
    paddingBottom: 15,
    paddingHorizontal: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)', 
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)', 
  },
});