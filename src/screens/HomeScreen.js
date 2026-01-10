import React, { useState, useRef, useMemo, useEffect } from 'react';
import { 
  StyleSheet, Text, View, Animated, LayoutAnimation, Platform, UIManager, ActivityIndicator 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useClients } from '../context/ClientContext';
import ClientFilterHeader from '../components/ClientFilterHeader';
import ClientCard from '../components/cards/ClientCard';
import { COLORS } from '../utils/colors';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function HomeScreen() { 
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  
  const [controlsHeight, setControlsHeight] = useState(0);
  const scrollY = useRef(new Animated.Value(0)).current; 
  
  useEffect(() => {
    const listenerId = scrollY.addListener(() => {});
    return () => {
      scrollY.removeListener(listenerId);
    };
  }, []);

  const { demos, loadingDemos, fetchDemos, refreshDemos, applyDemoFilter, activeDemoFilter, hasMoreDemos } = useClients();

  const { translateY, onScroll } = useMemo(() => {
    const heightToHide = controlsHeight || 1; 

    const clampedScrollY = scrollY.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
        extrapolateLeft: 'clamp',
    });

    const diffClamp = Animated.diffClamp(clampedScrollY, 0, heightToHide);

    const translate = diffClamp.interpolate({
        inputRange: [0, heightToHide],
        outputRange: [0, -heightToHide],
        extrapolate: 'clamp',
    });

    return {
        translateY: translate,
        onScroll: Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
        )
    };
  }, [controlsHeight, scrollY]);

  const handleExpand = (id) => { 
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); 
      setExpandedId(expandedId === id ? null : id); 
  };

  const dataToRender = demos.filter(item => 
    (item.businessName || item.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isReady = controlsHeight > 0;

  return (
    <View style={styles.container}>
      
      <Animated.View 
        style={[
            styles.collapsibleWrapper, 
            { 
                top: 0, 
                transform: [{ translateY }],
                opacity: isReady ? 1 : 0 
            }
        ]}
        onLayout={(e) => setControlsHeight(e.nativeEvent.layout.height)}
      >
        <ClientFilterHeader 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filters={activeDemoFilter}
            onApplyFilter={applyDemoFilter}
            titleSellers="Vendedores"
        />
      </Animated.View>

      {isReady ? (
          <Animated.FlatList
            data={dataToRender}
            keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
            renderItem={({ item }) => (
                <ClientCard 
                    item={item} 
                    isExpanded={expandedId === item.id} 
                    onPress={() => handleExpand(item.id)} 
                />
            )}
            
            contentContainerStyle={{
                paddingTop: controlsHeight + 10,
                paddingBottom: 120,
                paddingHorizontal: 20
            }}
            
            showsVerticalScrollIndicator={false}
            
            onScroll={onScroll}
            scrollEventThrottle={16}

            initialNumToRender={8}
            maxToRenderPerBatch={5}
            windowSize={5}
            removeClippedSubviews={true}

            onEndReached={fetchDemos} 
            onEndReachedThreshold={0.5} 
            onRefresh={refreshDemos}
            refreshing={loadingDemos && demos.length === 0} 
            
            ListFooterComponent={ 
                loadingDemos && demos.length > 0 && hasMoreDemos 
                ? <View style={{ padding: 20 }}><ActivityIndicator size="small" color={COLORS.primary} /></View> 
                : null 
            }
            ListEmptyComponent={ 
                !loadingDemos && (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="folder-open-outline" size={48} color={COLORS.border} />
                        <Text style={styles.emptyText}>No hay demos disponibles</Text>
                    </View>
                ) 
            }
          />
      ) : (
          <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  
  collapsibleWrapper: {
    position: 'absolute',
    left: 0, right: 0,
    zIndex: 50,
    elevation: 5,
    backgroundColor: COLORS.background,
    paddingTop: 10,
  },

  emptyContainer: { alignItems: 'center', marginTop: 80 },
  emptyText: { marginTop: 10, color: COLORS.textSecondary, fontSize: 15 },
  
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.background,
    zIndex: 999,
    justifyContent: 'center',
    alignItems: 'center'
  }
});