import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, TextInput, FlatList, TouchableOpacity, LayoutAnimation, Platform, UIManager, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useClients } from '../context/ClientContext';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const ActiveClientCard = ({ item, isExpanded, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
    <View style={styles.cardMainRow}>
      <View style={styles.infoContainer}>
        <Text style={styles.clientName} numberOfLines={1}>{item.businessName || item.name}</Text>
        <Text style={styles.clientAlias}>@{item.alias}</Text>
        <View style={styles.statusBadge}>
            <Ionicons name="checkmark-circle" size={14} color="#15803d" style={{marginRight: 4}} />
            <Text style={styles.statusText}>Cliente Activo</Text>
        </View>
      </View>
      <View style={styles.kpiContainer}>
        <Text style={styles.kpiLabel}>RFC</Text>
        <Text style={[styles.kpiValue, {fontSize:14, fontWeight:'bold', color: '#374151'}]}>
          {item.rfc || 'Sin RFC'}
        </Text>
        <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={20} color="#9CA3AF" style={{ marginTop: 8, alignSelf: 'flex-end' }} />
      </View>
    </View>
    {isExpanded && (
      <View style={styles.expandedContent}>
        <View style={styles.divider} />
        <View style={styles.metaRow}>
            <Ionicons name="calendar-outline" size={14} color="#6B7280" />
            <Text style={styles.metaText}>
              Registro: {item.createdAt ? new Date(item.createdAt).toLocaleDateString('es-MX') : 'N/A'}
            </Text>
        </View>
        <View style={styles.actionsContainer}>
            <TouchableOpacity style={[styles.actionButton, styles.btnContact]}><Ionicons name="call" size={18} color="white" /><Text style={styles.actionText}>Contactar</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, styles.btnSuspend]}><Ionicons name="pause-circle" size={18} color="white" /><Text style={styles.actionText}>Suspender</Text></TouchableOpacity>
        </View>
      </View>
    )}
  </TouchableOpacity>
);

export default function ActiveClientsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  
  // Usamos los nuevos estados del Contexto
  const { actives, loadingActives, fetchActives, refreshActives } = useClients();

  // Filtrado visual local (mientras escribes)
  // Nota: Para búsqueda real server-side necesitarías un endpoint de búsqueda
  const filteredData = actives ? actives.filter(item => 
    (item.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.businessName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.alias || '').toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  const handleExpand = (id) => { LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); setExpandedId(expandedId === id ? null : id); };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
        <TextInput 
          style={styles.searchInput} 
          placeholder="Buscar cliente activo..." 
          placeholderTextColor="#9ca3af" 
          value={searchQuery} 
          onChangeText={setSearchQuery} 
        />
        {searchQuery.length > 0 && <TouchableOpacity onPress={() => setSearchQuery('')}><Ionicons name="close-circle" size={18} color="#9ca3af" /></TouchableOpacity>}
      </View>
      
      <FlatList
        data={filteredData}
        keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
        renderItem={({ item }) => <ActiveClientCard item={item} isExpanded={expandedId === item.id} onPress={() => handleExpand(item.id)} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        
        // Paginación
        onEndReached={fetchActives}
        onEndReachedThreshold={0.5}
        
        // Refresh
        onRefresh={refreshActives}
        refreshing={loadingActives && actives.length === 0}
        
        ListFooterComponent={
            loadingActives && actives.length > 0 ? (
                <View style={{ padding: 20 }}>
                    <ActivityIndicator size="small" color="#10B981" />
                </View>
            ) : null
        }
        
        ListEmptyComponent={
          !loadingActives && (
            <Text style={styles.emptyText}>No se encontraron clientes activos.</Text>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6', paddingTop: 20 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', marginHorizontal: 20, paddingHorizontal: 15, paddingVertical: 12, borderRadius: 12, marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16, color: '#374151' },
  listContent: { paddingHorizontal: 20, paddingBottom: 120 },
  emptyText: { textAlign: 'center', marginTop: 20, color: '#9ca3af' },
  card: { backgroundColor: 'white', borderRadius: 16, marginBottom: 12, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2, borderLeftWidth: 4, borderLeftColor: '#10B981' }, 
  cardMainRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  infoContainer: { flex: 1, marginRight: 10 },
  clientName: { fontSize: 16, fontWeight: 'bold', color: '#1F2937', marginBottom: 2 },
  clientAlias: { fontSize: 13, color: '#6B7280', marginBottom: 8 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#DCFCE7', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 }, 
  statusText: { color: '#15803d', fontSize: 11, fontWeight: '700' }, 
  kpiContainer: { alignItems: 'flex-end' },
  kpiLabel: { fontSize: 11, color: '#6B7280', marginBottom: 2 },
  kpiValue: { fontSize: 18, fontWeight: '800', color: '#374151' },
  expandedContent: { marginTop: 15 },
  divider: { height: 1, backgroundColor: '#E5E7EB', marginBottom: 15 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  metaText: { fontSize: 13, color: '#6B7280', marginLeft: 6 },
  actionsContainer: { flexDirection: 'row', gap: 10 },
  actionButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 8 },
  btnContact: { backgroundColor: '#3B82F6' },
  btnSuspend: { backgroundColor: '#EF4444' }, 
  actionText: { color: 'white', fontWeight: 'bold', marginLeft: 6, fontSize: 13 },
});