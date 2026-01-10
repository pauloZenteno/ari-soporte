import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useClients } from '../context/ClientContext';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../utils/colors';

export default function SettingsScreen() {
  const { userProfile } = useClients();
  const { signOut } = useAuth();

  const getInitials = () => {
    if (!userProfile) return '';
    const first = userProfile.firstName ? userProfile.firstName.charAt(0).toUpperCase() : '';
    const last = userProfile.lastName ? userProfile.lastName.charAt(0).toUpperCase() : '';
    return `${first}${last}`;
  };

  const handleLogout = () => {
    Alert.alert(
      "Cerrar Sesión",
      "¿Estás seguro que deseas salir de la aplicación?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Salir", 
          style: "destructive",
          onPress: () => {
            signOut(); 
          }
        }
      ]
    );
  };

  const handleNotifications = () => {
    Alert.alert("Próximamente", "La configuración de notificaciones estará disponible pronto.");
  };

  return (
    <View style={styles.mainContainer}>
      <View style={styles.content}>
        
        <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
                <Text style={styles.avatarText}>
                    {getInitials() || '?'}
                </Text>
            </View>
            
            <Text style={styles.nameText}>
                {userProfile ? `${userProfile.firstName} ${userProfile.lastName}` : 'Usuario'}
            </Text>
            <Text style={styles.jobText}>
                {userProfile ? userProfile.jobPosition : ''}
            </Text>
        </View>

        <View style={styles.menuContainer}>
            <Text style={styles.sectionHeader}>GENERAL</Text>
            
            <TouchableOpacity style={styles.menuItem} onPress={handleNotifications} activeOpacity={0.7}>
                <View style={[styles.menuIconBox, { backgroundColor: '#EFF6FF' }]}>
                    <Ionicons name="notifications-outline" size={20} color={COLORS.primary} />
                </View>
                <Text style={styles.menuText}>Notificaciones</Text>
                <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
            </TouchableOpacity>

            <View style={{ height: 20 }} />

            <TouchableOpacity style={styles.menuItem} onPress={handleLogout} activeOpacity={0.7}>
                <View style={[styles.menuIconBox, { backgroundColor: '#FEF2F2' }]}>
                    <Ionicons name="log-out-outline" size={20} color={COLORS.danger} />
                </View>
                <Text style={[styles.menuText, { color: COLORS.danger }]}>Cerrar Sesión</Text>
                <Ionicons name="chevron-forward" size={20} color="#FCA5A5" />
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
    backgroundColor: COLORS.background,
    paddingTop: 30, 
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20
  },
  avatarContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: COLORS.primary, 
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
    borderWidth: 4,
    borderColor: COLORS.white
  },
  avatarText: {
    fontSize: 34,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 1
  },
  nameText: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  jobText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontWeight: '500'
  },
  menuContainer: {
    flex: 1,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9CA3AF',
    marginBottom: 10,
    marginLeft: 4,
    letterSpacing: 0.5
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
    marginBottom: 8
  },
  menuIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
    marginBottom: 10,
  },
  versionText: {
    color: '#D1D5DB',
    fontSize: 12,
    fontWeight: '500'
  },
});