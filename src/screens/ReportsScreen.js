import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../utils/colors';

const ReportOptionCard = ({ title, icon, color, bg, description, onPress }) => (
    <TouchableOpacity 
        style={styles.card} 
        activeOpacity={0.7} 
        onPress={onPress}
    >
        <View style={[styles.iconContainer, { backgroundColor: bg }]}>
            <Ionicons name={icon} size={28} color={color} />
        </View>
        <View style={styles.textContainer}>
            <Text style={styles.cardTitle}>{title}</Text>
            <Text style={styles.cardDescription}>{description}</Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color={COLORS.textSecondary} />
    </TouchableOpacity>
);

export default function ReportsScreen() {
  const navigation = useNavigation();

  return (
    <ScrollView style={styles.container}>
      
      <ReportOptionCard 
        title="Reporte General"
        description="Vista global de clientes, estatus y cartera."
        icon="pie-chart"
        color={COLORS.primary}
        bg="#EFF6FF"
        onPress={() => navigation.navigate('GeneralReport')}
      />

      <ReportOptionCard 
        title="Días sin Uso"
        description="Identifica clientes inactivos para seguimiento."
        icon="alert-circle"
        color="#F59E0B"
        bg="#FFFBEB"
        onPress={() => navigation.navigate('UsageReport')}
      />

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 20,
    paddingTop: 30
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16
  },
  textContainer: {
    flex: 1
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4
  },
  cardDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18
  }
});