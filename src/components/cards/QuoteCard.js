import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PERIODICITIES } from '../../utils/quoteConstants';

const QuoteCard = ({ item, onEdit, onDownload, formatCurrency, isDownloading }) => {
  
  const periodicityId = item.periodicity || 1;
  const periodObj = PERIODICITIES.find(p => p.id === periodicityId) || PERIODICITIES[0];
  const periodLabel = periodObj.description;

  const totalService = item.total ?? item.totalMonthly ?? 0;
  
  const totalHardware = item.totalProducts || 0;
  const granTotal = totalService + totalHardware;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.headerContent}>
            <Text style={styles.companyName} numberOfLines={1}>
                {item.companyName || 'Sin Empresa'}
            </Text>
            <View style={styles.subHeaderRow}>
                <Ionicons name="person-outline" size={13} color="#6B7280" />
                <Text style={styles.clientName} numberOfLines={1}>
                    {item.clientName || 'Sin Cliente'}
                </Text>
            </View>
        </View>
        <View style={styles.badge}>
            <Text style={styles.badgeText}>{periodLabel}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.financialContainer}>
        <View style={styles.priceBlock}>
            <Text style={styles.priceLabel}>TOTAL {periodLabel}</Text>
            <Text style={styles.priceMain}>
                {formatCurrency(totalService)}
            </Text>
            {totalHardware > 0 && (
                <Text style={styles.hardwareText}>
                    + {formatCurrency(totalHardware)} (Hardware)
                </Text>
            )}
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity 
            style={[styles.actionButton, styles.btnEditSoft]} 
            onPress={() => onEdit(item.id)}
            activeOpacity={0.7}
        >
            <Ionicons name="create-outline" size={18} color="#4B5563" />
            <Text style={styles.btnTextEdit}>Editar</Text>
        </TouchableOpacity>
        
        <View style={{width: 12}} />

        <TouchableOpacity 
            style={[styles.actionButton, styles.btnDownloadTinted]} 
            onPress={() => onDownload(item.id)}
            activeOpacity={0.7}
            disabled={isDownloading}
        >
            <Ionicons name="cloud-download-outline" size={18} color={isDownloading ? "#9CA3AF" : "#2b5cb5"} />
            <Text style={[styles.btnTextDownload, isDownloading && {color: '#9CA3AF'}]} numberOfLines={1}>
                {isDownloading ? 'Generando...' : 'PDF'}
            </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { 
    backgroundColor: 'white', 
    borderRadius: 16, 
    padding: 20, 
    marginBottom: 16,
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.08, 
    shadowRadius: 8, 
    elevation: 4,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  headerContent: { flex: 1, marginRight: 10 },
  companyName: { fontSize: 17, fontWeight: '700', color: '#111827', marginBottom: 4, letterSpacing: -0.3 },
  subHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  clientName: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  
  badge: { backgroundColor: '#EFF6FF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, alignSelf: 'flex-start', borderWidth: 1, borderColor: '#BFDBFE' },
  badgeText: { color: '#2b5cb5', fontSize: 10, fontWeight: '700' },

  divider: { height: 1, backgroundColor: '#F3F4F6', marginBottom: 16 },
  
  financialContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  priceBlock: { alignItems: 'center' },
  priceLabel: { fontSize: 11, color: '#9CA3AF', marginBottom: 6, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  priceMain: { fontSize: 28, fontWeight: '800', color: '#2b5cb5', letterSpacing: -0.5 },
  hardwareText: { fontSize: 12, color: '#6B7280', marginTop: 4, fontWeight: '500' },

  actionsContainer: { flexDirection: 'row', justifyContent: 'space-between', height: 48 },
  actionButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 12, paddingHorizontal: 12 },
  btnEditSoft: { backgroundColor: '#F3F4F6' },
  btnTextEdit: { fontSize: 14, fontWeight: '600', color: '#4B5563', marginLeft: 8 },
  btnDownloadTinted: { backgroundColor: '#EFF6FF' },
  btnTextDownload: { fontSize: 14, fontWeight: '700', color: '#2b5cb5', marginLeft: 8 }
});

export default memo(QuoteCard);