import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const QuoteCard = ({ item, onEdit, onDownload, formatCurrency }) => {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.headerText}>
            <Text style={styles.companyName} numberOfLines={1}>{item.companyName || 'Sin Empresa'}</Text>
            <Text style={styles.clientName} numberOfLines={1}>{item.clientName || 'Sin Cliente'}</Text>
            <Text style={styles.folioText}>{item.folio}</Text>
        </View>
        <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{item.isActive ? 'Activa' : 'Inactiva'}</Text>
        </View>
      </View>
      <View style={styles.divider} />
      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
            <Ionicons name="person-circle-outline" size={20} color="#6B7280" />
            <Text style={styles.infoLabel}>Vendedor:</Text>
            <Text style={styles.infoValue} numberOfLines={1}>
                {item.employeeName ? item.employeeName.split(' ')[0] : 'N/A'}
            </Text>
        </View>
        <View style={styles.infoRow}>
            <Ionicons name="cash-outline" size={20} color="#6B7280" />
            <Text style={styles.infoLabel}>Total:</Text>
            <Text style={styles.amountValue}>
                {formatCurrency(item.totalMonthly || item.moduleSupTotalMonthly || 0)}
            </Text>
        </View>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.filterButtonStyle} onPress={() => onEdit(item.id)}>
            <Ionicons name="create-outline" size={18} color="#4B5563" />
            <Text style={styles.filterButtonText}>Editar</Text>
        </TouchableOpacity>
        <View style={{width: 10}} />
        <TouchableOpacity style={styles.filterButtonStyle} onPress={() => onDownload(item.id)}>
            <Ionicons name="cloud-download-outline" size={18} color="#2b5cb5" />
            <Text style={[styles.filterButtonText, { color: '#2b5cb5' }]}>Descargar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { 
    backgroundColor: 'white', borderRadius: 16, marginBottom: 16, 
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
    borderWidth: 1, borderColor: '#F3F4F6'
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: 16, paddingBottom: 12 },
  headerText: { flex: 1, marginRight: 10 },
  companyName: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 2 },
  clientName: { fontSize: 14, color: '#4B5563' },
  folioText: { fontSize: 12, color: '#9CA3AF', marginTop: 4, fontWeight: '500' },
  statusBadge: { backgroundColor: '#ECFDF5', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  statusText: { color: '#10B981', fontSize: 11, fontWeight: '700' },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginHorizontal: 16 },
  cardBody: { padding: 16, paddingTop: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  infoLabel: { fontSize: 14, color: '#6B7280', marginLeft: 8, marginRight: 6 },
  infoValue: { fontSize: 14, fontWeight: '500', color: '#374151', flex: 1 },
  amountValue: { fontSize: 16, fontWeight: '700', color: '#10B981' },
  cardActions: { flexDirection: 'row', padding: 16, paddingTop: 0, justifyContent: 'space-between' },
  filterButtonStyle: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'white', paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  filterButtonText: { fontSize: 14, fontWeight: '600', color: '#4B5563', marginLeft: 6 }
});

export default memo(QuoteCard);