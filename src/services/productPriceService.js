import api from './api';

export const getProductPriceSchemes = async () => {
  try {
    // Ajusta la URL si es diferente en tu backend, basado en el Angular parece ser un get all simple
    const response = await api.get('/administration/ProductPriceScheme'); 
    return response.data;
  } catch (error) {
    console.error("Error fetching price schemes", error);
    return [];
  }
};