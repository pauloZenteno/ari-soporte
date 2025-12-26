import React, { createContext, useState, useEffect, useContext } from 'react';
import { getClientsFiltered } from '../services/api';

const ClientContext = createContext();

export const ClientProvider = ({ children }) => {
  // --- ESTADOS PARA DEMOS ---
  const [demos, setDemos] = useState([]);
  const [loadingDemos, setLoadingDemos] = useState(false);
  const [demoPage, setDemoPage] = useState(1);
  const [hasMoreDemos, setHasMoreDemos] = useState(true);
  
  const [activeDemoFilter, setActiveDemoFilter] = useState({ 
    sortParam: 'TrialEndsAt', 
    isDescending: false,
    sellerId: null 
  });

  // --- ESTADOS PARA ACTIVOS ---
  const [actives, setActives] = useState([]);
  const [loadingActives, setLoadingActives] = useState(false);
  const [activePage, setActivePage] = useState(1);
  const [hasMoreActives, setHasMoreActives] = useState(true);

  // --- ESTADOS PARA INACTIVOS ---
  const [inactives, setInactives] = useState([]);
  const [loadingInactives, setLoadingInactives] = useState(false);
  const [inactivePage, setInactivePage] = useState(1);
  const [hasMoreInactives, setHasMoreInactives] = useState(true);

  const PAGE_SIZE = 10;

  const fetchGeneric = async (category, page, filters) => {
    let params = {
      pageNumber: page,
      pageSize: PAGE_SIZE,
      sortParam: 'BusinessName',
      isDescending: false,
      filterActives: true, 
      ...filters 
    };

    // Limpieza de parámetros nulos/undefined
    Object.keys(params).forEach(key => (params[key] === null || params[key] === undefined) && delete params[key]);

    try {
      const result = await getClientsFiltered(params);
      const newItems = Array.isArray(result) ? result : (result.items || result.data || []);
      return { newItems, totalCount: result.totalCount || 0, success: true }; 
    } catch (error) {
      console.error(`Error cargando ${category} (Página ${page}):`, error.message);
      return { newItems: [], totalCount: 0, success: false };
    }
  };

  const appendUnique = (prevItems, newItems) => {
    const existingIds = new Set(prevItems.map(item => item.id));
    const uniqueNew = newItems.filter(item => !existingIds.has(item.id));
    return [...prevItems, ...uniqueNew];
  };

  // 1. Cargar DEMOS
  const fetchDemos = async (page = 1, filters = activeDemoFilter, shouldRefresh = false) => {
    if (loadingDemos || (!hasMoreDemos && !shouldRefresh)) return;
    setLoadingDemos(true);

    const apiFilters = {
      sortParam: filters.sortParam,
      isDescending: filters.isDescending,
      sellerId: filters.sellerId,
      statuses: 1, 
      types: true,  
      filterActives: true
    };

    const { newItems, success } = await fetchGeneric('demos', page, apiFilters);

    if (shouldRefresh || page === 1) {
      setDemos(newItems);
      setDemoPage(1);
      setHasMoreDemos(success && newItems.length >= PAGE_SIZE);
    } else {
      if (success && newItems.length > 0) {
        setDemos(prev => appendUnique(prev, newItems));
        setDemoPage(page);
        setHasMoreDemos(newItems.length >= PAGE_SIZE);
      } else {
        setHasMoreDemos(false);
      }
    }
    setLoadingDemos(false);
  };

  // 2. Cargar ACTIVOS
  const fetchActives = async (page = 1, shouldRefresh = false) => {
    if (loadingActives || (!hasMoreActives && !shouldRefresh)) return;
    setLoadingActives(true);

    const apiFilters = {
      statuses: 1,    
      types: false,   
      sortParam: 'CreatedAt', 
      isDescending: true,
      filterActives: true
    };

    const { newItems, success } = await fetchGeneric('actives', page, apiFilters);

    if (shouldRefresh || page === 1) {
      setActives(newItems);
      setActivePage(1);
      setHasMoreActives(success && newItems.length >= PAGE_SIZE);
    } else {
      if (success && newItems.length > 0) {
        setActives(prev => appendUnique(prev, newItems));
        setActivePage(page);
        setHasMoreActives(newItems.length >= PAGE_SIZE);
      } else {
        setHasMoreActives(false);
      }
    }
    setLoadingActives(false);
  };

  // 3. Cargar INACTIVOS
  const fetchInactives = async (page = 1, shouldRefresh = false) => {
    if (loadingInactives || (!hasMoreInactives && !shouldRefresh)) return;
    setLoadingInactives(true);

    const apiFilters = {
      statuses: 2,
      sortParam: 'CreatedAt', 
      isDescending: true,
      filterActives: true
    };

    const { newItems, success } = await fetchGeneric('inactives', page, apiFilters);

    if (shouldRefresh || page === 1) {
      setInactives(newItems);
      setInactivePage(1);
      setHasMoreInactives(success && newItems.length >= PAGE_SIZE);
    } else {
      if (success && newItems.length > 0) {
        setInactives(prev => appendUnique(prev, newItems));
        setInactivePage(page);
        setHasMoreInactives(newItems.length >= PAGE_SIZE);
      } else {
        setHasMoreInactives(false);
      }
    }
    setLoadingInactives(false);
  };

  const applyDemoFilter = (newSortParam, isDesc, newSellerId) => {
    const newFilters = { 
        ...activeDemoFilter,
        sortParam: newSortParam !== undefined ? newSortParam : activeDemoFilter.sortParam,
        isDescending: isDesc !== undefined ? isDesc : activeDemoFilter.isDescending,
        sellerId: newSellerId !== undefined ? newSellerId : activeDemoFilter.sellerId
    };
    setActiveDemoFilter(newFilters);
    setHasMoreDemos(true); 
    fetchDemos(1, newFilters, true);
  };

  useEffect(() => {
    fetchDemos(1, activeDemoFilter, true);
    fetchActives(1, true);
    fetchInactives(1, true);
  }, []);

  return (
    <ClientContext.Provider value={{ 
      demos, loadingDemos, hasMoreDemos,
      fetchDemos: () => fetchDemos(demoPage + 1), 
      refreshDemos: () => fetchDemos(1, activeDemoFilter, true),
      applyDemoFilter, activeDemoFilter,

      actives, loadingActives, hasMoreActives,
      fetchActives: () => fetchActives(activePage + 1),
      refreshActives: () => fetchActives(1, true),

      inactives, loadingInactives, hasMoreInactives,
      fetchInactives: () => fetchInactives(inactivePage + 1),
      refreshInactives: () => fetchInactives(1, true),
    }}>
      {children}
    </ClientContext.Provider>
  );
};

export const useClients = () => useContext(ClientContext);