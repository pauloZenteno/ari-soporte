import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const QuoteCard = ({ item, onEdit, onDownload, formatCurrency }) => {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.headerContent}>
            <Text style={styles.companyName} numberOfLines={1}>{item.companyName || 'Sin Empresa'}</Text>
            <Text style={styles.clientName} numberOfLines={1}>
              {item.clientName || 'Sin Cliente'} • {item.employeeName ? item.employeeName.split(' ')[0] : 'N/A'}
            </Text>
        </View>
        <TouchableOpacity style={styles.iconButton} onPress={() => onEdit(item.id)}>
           <Ionicons name="ellipsis-horizontal" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      <View style={styles.financialContainer}>
        <View style={styles.priceBlock}>
            <Text style={styles.priceLabel}>MENSUAL</Text>
            <Text style={styles.priceMain}>
                {formatCurrency(item.totalMonthly || item.moduleSupTotalMonthly || 0)}
            </Text>
        </View>

        <View style={styles.verticalDivider} />

        <View style={styles.priceBlock}>
            <Text style={styles.priceLabel}>ANUAL</Text>
            <Text style={styles.priceSecondary}>
                {formatCurrency(item.totalAnnual || item.montoAnual || 0)}
            </Text>
        </View>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.actionButton} onPress={() => onEdit(item.id)}>
            <Ionicons name="create-outline" size={18} color="#4B5563" />
            <Text style={styles.actionText}>Editar</Text>
        </TouchableOpacity>
        
        <View style={{width: 12}} />

        <TouchableOpacity style={[styles.actionButton, styles.downloadBtn]} onPress={() => onDownload(item.id)}>
            <Ionicons name="cloud-download-outline" size={18} color="#2563EB" />
            <Text style={[styles.actionText, styles.downloadText]}>Descargar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { 
    backgroundColor: 'white', 
    borderRadius: 16, 
    marginBottom: 16, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.06, 
    shadowRadius: 8, 
    elevation: 3,
    borderWidth: 1, 
    borderColor: '#F3F4F6'
  },
  cardHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start', 
    padding: 16, 
    paddingBottom: 12 
  },
  headerContent: {
    flex: 1,
    marginRight: 8
  },
  companyName: { 
    fontSize: 17, 
    fontWeight: '700', 
    color: '#111827', 
    marginBottom: 4,
    letterSpacing: -0.3
  },
  clientName: { 
    fontSize: 13, 
    color: '#6B7280', 
    fontWeight: '500'
  },
  iconButton: {
    padding: 4
  },
  divider: { 
    height: 1, 
    backgroundColor: '#F3F4F6', 
    marginHorizontal: 16 
  },
  financialContainer: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  priceBlock: {
    flex: 1,
    alignItems: 'center'
  },
  verticalDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 8
  },
  priceLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    marginBottom: 4,
    fontWeight: '600',
    letterSpacing: 0.5
  },
  priceMain: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.5
  },
  priceSecondary: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B5563',
    letterSpacing: -0.3
  },
  cardActions: { 
    flexDirection: 'row', 
    padding: 16, 
    paddingTop: 0 
  },
  actionButton: { 
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: '#F9FAFB', 
    paddingVertical: 12, 
    borderRadius: 12, 
  },
  downloadBtn: {
    backgroundColor: '#EFF6FF'
  },
  actionText: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: '#4B5563', 
    marginLeft: 8 
  },
  downloadText: {
    color: '#2563EB'
  }
});

export default memo(QuoteCard);