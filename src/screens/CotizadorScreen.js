import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useClients } from '../context/ClientContext';
import { Ionicons } from '@expo/vector-icons';
import ClientFilterHeader from '../components/ClientFilterHeader';
import Header from '../components/Header';
import QuoteCard from '../components/cards/QuoteCard';
import { SELLER_OPTIONS } from '../utils/constants';
import { getQuoteById, downloadQuotePdf } from '../services/quoteService';

const CotizadorScreen = ({ navigation }) => {
  const { quotes, loadingQuotes, hasMoreQuotes, fetchQuotes, refreshQuotes } = useClients();

  const [headerHeight, setHeaderHeight] = useState(0);      
  const [controlsHeight, setControlsHeight] = useState(0); 
  const [downloadingId, setDownloadingId] = useState(null);

  const scrollY = useRef(new Animated.Value(0)).current;
  
  const clampedScrollY = scrollY.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
    extrapolateLeft: 'clamp', 
  });

  const diffClamp = Animated.diffClamp(clampedScrollY, 0, controlsHeight || 1);
  
  const translateY = diffClamp.interpolate({
    inputRange: [0, controlsHeight || 1],
    outputRange: [0, -(controlsHeight || 1)], 
    extrapolate: 'clamp'
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState(''); 
  const [activeFilters, setActiveFilters] = useState({ 
    sortParam: 'TrialEndsAt', isDescending: false, sellerId: null 
  });

  useFocusEffect(
    useCallback(() => {
      refreshQuotes();
    }, [])
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 400); 

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filteredData = useMemo(() => {
    let data = [...quotes];
    
    if (debouncedQuery) {
      const query = debouncedQuery.toLowerCase();
      data = data.filter(item => 
        (item.clientName || '').toLowerCase().includes(query) ||
        (item.companyName || '').toLowerCase().includes(query) ||
        (item.folio || '').toLowerCase().includes(query)
      );
    }
    
    if (activeFilters.sellerId) {
      const sellerOption = SELLER_OPTIONS.find(s => s.id === activeFilters.sellerId);
      if (sellerOption) {
        data = data.filter(item => (item.employeeName || '').toLowerCase().includes(sellerOption.name.toLowerCase()));
      }
    }
    
    if (activeFilters.sortParam === 'BusinessName') {
      data.sort((a, b) => (a.companyName || '').localeCompare(b.companyName || ''));
    } else {
      data.sort((a, b) => new Date(b.created) - new Date(a.created));
    }
    
    return data;
  }, [quotes, debouncedQuery, activeFilters]);

  const handleApplyFilter = (sortParam, isDescending, sellerId) => {
    setActiveFilters(prev => ({
      ...prev,
      sortParam: sortParam !== undefined ? sortParam : prev.sortParam,
      isDescending: isDescending !== undefined ? isDescending : prev.isDescending,
      sellerId: sellerId !== undefined ? sellerId : prev.sellerId
    }));
  };

  const formatCurrency = (amount) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
  
  const handleCreate = () => {
    navigation.navigate('QuoteCreate');
  };

  const handleEdit = (id) => {
    navigation.navigate('QuoteCreate', { id });
  };

  const handleDownload = async (id) => {
    if (downloadingId) return; 
    setDownloadingId(id);
    
    try {
      Alert.alert("Generando PDF", "Descargando cotización, por favor espere...");
      const fullQuoteData = await getQuoteById(id);
      await downloadQuotePdf(fullQuoteData);
    } catch (error) {
      Alert.alert("Error", "No se pudo descargar el archivo.");
      console.error(error);
    } finally {
      setDownloadingId(null);
    }
  };

  const renderItem = useCallback(({ item }) => (
    <QuoteCard 
      item={item} 
      onEdit={handleEdit} 
      onDownload={handleDownload} 
      formatCurrency={formatCurrency}
      isDownloading={downloadingId === item.id} 
    />
  ), [downloadingId]);

  return (
    <View style={styles.container}>
      
      <View 
        style={styles.fixedHeaderWrapper} 
        onLayout={(e) => setHeaderHeight(e.nativeEvent.layout.height)}
      >
          <Header navigation={navigation} />
      </View>

      <Animated.View 
        style={[
            styles.collapsibleWrapper, 
            { 
                opacity: headerHeight > 0 ? 1 : 0, 
                top: headerHeight, 
                transform: [{ translateY }] 
            }
        ]}
      >
          <View onLayout={(e) => setControlsHeight(e.nativeEvent.layout.height)}>
              <View style={styles.controlsContent}>
                  
                  <View style={{ marginBottom: 10 }}>
                    <ClientFilterHeader 
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery} 
                        filters={activeFilters}
                        onApplyFilter={handleApplyFilter}
                        titleSellers="Vendedores" 
                    />
                  </View>

                  <TouchableOpacity style={styles.createButton} onPress={handleCreate} activeOpacity={0.8}>
                      <View style={styles.createIconBg}>
                          <Ionicons name="add" size={20} color="white" />
                      </View>
                      <Text style={styles.createButtonText}>Crear Cotización</Text>
                  </TouchableOpacity>

              </View>
          </View>
      </Animated.View>

      <Animated.FlatList
        data={filteredData}
        keyExtractor={(item) => item?.id?.toString() || Math.random().toString()}
        renderItem={renderItem}
        
        contentContainerStyle={{ 
            paddingTop: headerHeight + controlsHeight + 20, 
            paddingBottom: 100, 
            paddingHorizontal: 20 
        }}
        
        refreshing={loadingQuotes}
        onRefresh={refreshQuotes}
        onEndReached={hasMoreQuotes ? fetchQuotes : null}
        onEndReachedThreshold={0.5}

        initialNumToRender={8}
        maxToRenderPerBatch={10}
        windowSize={5} 
        removeClippedSubviews={true} 
        updateCellsBatchingPeriod={50}
        
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}

        ListEmptyComponent={
          <View style={styles.center}>
              <Ionicons name="document-text-outline" size={48} color="#E5E7EB" />
              <Text style={styles.emptyText}>
                  {debouncedQuery ? 'No hay resultados.' : 'No hay cotizaciones.'}
              </Text>
          </View>
        }
        
        ListFooterComponent={
            (loadingQuotes && quotes.length > 0) ? (
                <View style={{ paddingVertical: 20 }}>
                    <ActivityIndicator size="small" color="#2b5cb5" />
                </View>
            ) : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  
  fixedHeaderWrapper: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    zIndex: 100, 
    elevation: 10,
    backgroundColor: 'transparent', 
  },

  collapsibleWrapper: {
    position: 'absolute',
    left: 0, right: 0,
    zIndex: 50, 
    backgroundColor: '#F9FAFB', 
  },
  
  controlsContent: {
    paddingHorizontal: 0, 
    paddingTop: 15, 
    paddingBottom: 10, 
  },

  createButton: {
    flexDirection: 'row',
    backgroundColor: '#ecfdf5', 
    paddingVertical: 10, 
    paddingHorizontal: 20,
    borderRadius: 14, 
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#d1fae5', 
    marginBottom: 5,
    marginHorizontal: 20, 
    shadowColor: '#15c899',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },
  createIconBg: {
    backgroundColor: '#15c899', 
    borderRadius: 8,
    width: 28, 
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10
  },
  createButtonText: {
    color: '#15c899', 
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3
  },

  center: { marginTop: 100, justifyContent: 'center', alignItems: 'center' },
  emptyText: { marginTop: 10, color: '#9CA3AF', fontSize: 16 },
});

export default CotizadorScreen;