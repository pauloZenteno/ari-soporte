import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Alert, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { getUserInfo, logout } from '../services/authService';

export default function SettingsScreen({ navigation }) {
  const [userInfo, setUserInfoState] = useState(null);
  const [imageSource, setImageSource] = useState(require('../assets/header_logo.png')); 

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        const user = await getUserInfo();
        const token = await SecureStore.getItemAsync('accessToken');

        if (user) {
          setUserInfoState(user);
          
          if (user.id && token) {
            setImageSource({
              uri: `https://arierp.com/api/humanresources/employees/${user.id}/photo`,
              headers: { Authorization: `Bearer ${token}` }
            });
          }
        }
      } catch (error) {
        console.error('Error cargando perfil:', error);
      }
    };

    loadProfileData();
  }, []);

  const handleLogout = () => {
    Alert.alert(
      "Cerrar Sesión",
      "¿Estás seguro que deseas salir?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Salir", 
          style: "destructive",
          onPress: async () => {
            try {
              await logout();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error) {
              console.error("Error al cerrar sesión:", error);
              navigation.replace('Login');
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.mainContainer}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mi Perfil</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.profileCard}>
            <View style={styles.imageContainer}>
            <Image 
                source={imageSource}
                style={styles.profileImage}
                onError={() => setImageSource(require('../assets/header_logo.png'))} 
            />
            </View>
            
            <Text style={styles.nameText}>
            {userInfo ? `${userInfo.firstName} ${userInfo.lastName}` : 'Cargando...'}
            </Text>
            <Text style={styles.jobText}>
            {userInfo ? userInfo.jobPosition : ''}
            </Text>
        </View>

        <View style={styles.menuContainer}>
            <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
            <View style={styles.menuIconDanger}>
                <Ionicons name="log-out-outline" size={22} color="#EF4444" />
            </View>
            <Text style={styles.menuTextDanger}>Cerrar Sesión</Text>
            <Ionicons name="chevron-forward" size={20} color="#EF4444" />
            </TouchableOpacity>
        </View>

        <View style={styles.footer}>
            <Text style={styles.versionText}>Ari Soporte v1.0.0</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#F0F2F5',
    paddingTop: Constants.statusBarHeight, 
  },
  content: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#F0F2F5',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  profileCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 30,
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
  },
  imageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F3F4F6',
    marginBottom: 15,
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  nameText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 5,
    textAlign: 'center',
  },
  jobText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '500'
  },
  menuContainer: {
    paddingHorizontal: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 18,
    borderRadius: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  menuIconDanger: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuTextDanger: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 10,
  },
  versionText: {
    color: '#9CA3AF',
    fontSize: 13,
  },
});