import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, TextInput, FlatList, TouchableOpacity, 
  LayoutAnimation, Platform, UIManager, ActivityIndicator, ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useClients } from '../context/ClientContext';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// MAPEO OFICIAL DE VENDEDORES (IDs Numéricos)
const SELLER_MAP = {
  1: 'Ana Paola Valle',
  2: 'Karen Giffard'
};

const SELLER_OPTIONS = [
  { id: 1, name: 'Ana Paola' },
  { id: 2, name: 'Karen' }
];

const FilterChip = ({ label, icon, isActive, onPress }) => (
  <TouchableOpacity 
    style={[styles.chip, isActive && styles.chipActive]} 
    onPress={onPress}
  >
    {icon && <Ionicons name={icon} size={14} color={isActive ? "white" : "#4B5563"} style={{marginRight: 6}} />}
    <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{label}</Text>
  </TouchableOpacity>
);

const ClientCard = ({ item, isExpanded, onPress }) => {
    const trialEnd = new Date(item.trialEndsAt || Date.now());
    const now = new Date();
    const diffTime = trialEnd - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const daysLeft = diffDays > 0 ? diffDays : 0;
    const formattedDate = trialEnd.toLocaleDateString('es-MX');

    // Obtenemos el nombre usando el ID numérico
    const sellerName = SELLER_MAP[item.sellerId] || 'Sin asignar';

    return (
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
            <View style={styles.cardMainRow}>
            <View style={styles.infoContainer}>
                <Text style={styles.clientName}>{item.businessName || item.name}</Text>
                <Text style={styles.clientAlias}>@{item.alias}</Text>
                <View style={styles.typeBadge}>
                    <Ionicons name="time" size={12} color="#4F46E5" style={{marginRight: 4}} />
                    <Text style={styles.typeText}>Demo</Text>
                </View>
            </View>
            <View style={styles.statusContainer}>
                <Text style={styles.daysHighlight}>{daysLeft} días</Text>
                <Text style={styles.daysLabel}>restantes</Text>
                <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={20} color="#9CA3AF" style={{ marginTop: 8 }} />
            </View>
            </View>
            <View style={styles.progressBarContainer}>
            <LinearGradient colors={['#F2C94C', '#6FCF97']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.progressBarFill, { width: '60%' }]} />
            </View>
            {isExpanded && (
            <View style={styles.expandedContent}>
                <View style={styles.divider} />
                
                <View style={styles.sellerRow}>
                  <Ionicons name="person-circle-outline" size={18} color="#6B7280" />
                  <Text style={styles.sellerText}> Vendedor: <Text style={styles.sellerHighlight}>{sellerName}</Text></Text>
                </View>

                <View style={styles.sellerRow}>
                  <Ionicons name="calendar-outline" size={18} color="#6B7280" />
                  <Text style={styles.sellerText}> Fin de prueba: <Text style={styles.sellerHighlight}>{formattedDate}</Text></Text>
                </View>

                <View style={styles.actionsContainer}>
                  <TouchableOpacity style={[styles.actionButton, styles.btnContact]}><Ionicons name="chatbubble-ellipses-outline" size={16} color="white" /><Text style={styles.actionText}>Contactar</Text></TouchableOpacity>
                  <TouchableOpacity style={[styles.actionButton, styles.btnActivate]}><Ionicons name="checkmark-circle-outline" size={16} color="white" /><Text style={styles.actionText}>Activar</Text></TouchableOpacity>
                </View>
            </View>
            )}
        </TouchableOpacity>
    );
};

export default function HomeScreen() { 
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  
  const { demos, loadingDemos, fetchDemos, refreshDemos, applyDemoFilter, activeDemoFilter, hasMoreDemos } = useClients();

  const handleExpand = (id) => { LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); setExpandedId(expandedId === id ? null : id); };

  const dataToRender = demos.filter(item => 
    (item.businessName || item.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSeller = (id) => {
    const newId = activeDemoFilter.sellerId === id ? null : id;
    applyDemoFilter(undefined, undefined, newId);
  };

  return (
    <View style={styles.container}>
      
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
        <TextInput 
            style={styles.searchInput} 
            placeholder="Buscar demo..." 
            placeholderTextColor="#9ca3af" 
            value={searchQuery} 
            onChangeText={setSearchQuery} 
        />
        {searchQuery.length > 0 && <TouchableOpacity onPress={() => setSearchQuery('')}><Ionicons name="close-circle" size={18} color="#9ca3af" /></TouchableOpacity>}
      </View>

      <View style={styles.filtersWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersContainer}>
            
            {SELLER_OPTIONS.map((seller) => (
              <FilterChip
                key={seller.id}
                label={seller.name}
                icon="person"
                isActive={activeDemoFilter.sellerId === seller.id}
                onPress={() => toggleSeller(seller.id)}
              />
            ))}
            
            <View style={styles.verticalDivider} />

            <FilterChip 
                label="Por Vencer" 
                icon="alert-circle-outline"
                isActive={activeDemoFilter.sortParam === 'TrialEndsAt' && !activeDemoFilter.isDescending}
                onPress={() => applyDemoFilter('TrialEndsAt', false, undefined)}
            />
            <FilterChip 
                label="Recientes" 
                icon="time-outline"
                isActive={activeDemoFilter.sortParam === 'CreatedAt' && activeDemoFilter.isDescending}
                onPress={() => applyDemoFilter('CreatedAt', true, undefined)}
            />
            <FilterChip 
                label="A-Z" 
                icon="text-outline"
                isActive={activeDemoFilter.sortParam === 'BusinessName' && !activeDemoFilter.isDescending}
                onPress={() => applyDemoFilter('BusinessName', false, undefined)}
            />
        </ScrollView>
      </View>

      <FlatList
        data={dataToRender}
        keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
        renderItem={({ item }) => <ClientCard item={item} isExpanded={expandedId === item.id} onPress={() => handleExpand(item.id)} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        
        onEndReached={fetchDemos} 
        onEndReachedThreshold={0.5} 
        
        onRefresh={refreshDemos}
        refreshing={loadingDemos && demos.length === 0} 

        ListFooterComponent={
            // Solo mostrar spinner si NO es el primer load y SÍ hay más datos
            loadingDemos && demos.length > 0 && hasMoreDemos ? (
                <View style={{ padding: 20 }}>
                    <ActivityIndicator size="small" color="#2b5cb5" />
                </View>
            ) : null
        }
        
        ListEmptyComponent={
            !loadingDemos && (
                <View style={styles.emptyContainer}>
                    <Ionicons name="folder-open-outline" size={48} color="#D1D5DB" />
                    <Text style={styles.emptyText}>No se encontraron demos.</Text>
                </View>
            )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6', paddingTop: 20 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', marginHorizontal: 20, paddingHorizontal: 15, paddingVertical: 12, borderRadius: 12, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16, color: '#374151' },
  filtersWrapper: { height: 50, marginBottom: 5 },
  filtersContainer: { paddingHorizontal: 20, alignItems: 'center' },
  verticalDivider: { width: 1, height: 20, backgroundColor: '#D1D5DB', marginHorizontal: 10 },
  chip: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 10, borderWidth: 1, borderColor: '#E5E7EB' },
  chipActive: { backgroundColor: '#2b5cb5', borderColor: '#2b5cb5' },
  chipText: { fontSize: 13, fontWeight: '600', color: '#4B5563' },
  chipTextActive: { color: 'white' },
  listContent: { paddingHorizontal: 20, paddingBottom: 120, paddingTop: 10 },
  emptyContainer: { alignItems: 'center', marginTop: 50 },
  emptyText: { marginTop: 10, color: '#9ca3af', fontSize: 16 },
  card: { backgroundColor: 'white', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2, borderLeftWidth: 5, borderLeftColor: '#F59E0B' },
  cardMainRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  infoContainer: { flex: 1, justifyContent: 'center' },
  clientName: { fontSize: 16, fontWeight: 'bold', color: '#1F2937', marginBottom: 2 },
  clientAlias: { fontSize: 13, color: '#6B7280', marginBottom: 6 },
  typeBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EEF2FF', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  typeText: { fontSize: 11, color: '#4F46E5', fontWeight: '600' }, 
  statusContainer: { alignItems: 'flex-end' },
  daysHighlight: { fontSize: 18, fontWeight: '800', color: '#F59E0B' },
  daysLabel: { fontSize: 11, color: '#6B7280' },
  progressBarContainer: { height: 6, backgroundColor: '#F3F4F6', borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 4 },
  expandedContent: { marginTop: 15 },
  divider: { height: 1, backgroundColor: '#E5E7EB', marginBottom: 15 },
  sellerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  sellerText: { fontSize: 14, color: '#4B5563', marginLeft: 5 },
  sellerHighlight: { fontWeight: 'bold', color: '#1F2937' },
  actionsContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  actionButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8, paddingHorizontal: 10, borderRadius: 8, flex: 1, marginHorizontal: 3 },
  btnContact: { backgroundColor: '#3B82F6' },
  btnActivate: { backgroundColor: '#10B981' },
  actionText: { color: 'white', fontSize: 11, fontWeight: 'bold', marginLeft: 4 },
});