import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = 'https://arierp.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de Solicitud (Request)
api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de Respuesta (Response)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Detectar 401 y evitar bucle infinito marcando _retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const userId = await SecureStore.getItemAsync('userId');
        const currentRefreshToken = await SecureStore.getItemAsync('refreshToken');
        const currentAccessToken = await SecureStore.getItemAsync('accessToken');

        if (!userId || !currentRefreshToken) {
          throw new Error('No hay credenciales para refrescar');
        }

        // Llamada directa con axios (no la instancia 'api') para evitar bucles
        const refreshResponse = await axios.post(
          `${API_URL}/administration/Users/${userId}/refreshTokenMobile`,
          {
            accessToken: currentAccessToken || "",
            refreshToken: currentRefreshToken,
            expiresAt: new Date().toISOString()
          },
          { headers: { 'Content-Type': 'application/json' } }
        );

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = refreshResponse.data;

        if (newAccessToken) {
          await SecureStore.setItemAsync('accessToken', newAccessToken);
          // Algunos backends rotan el refresh token también, es bueno guardarlo si viene
          if (newRefreshToken) {
            await SecureStore.setItemAsync('refreshToken', newRefreshToken);
          }

          // Actualizar el header de la petición original y reintentar
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
          
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Si falla el refresh, borramos todo para forzar logout
        console.error("Error refrescando token, cerrando sesión...");
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('refreshToken');
        await SecureStore.deleteItemAsync('userInfo');
        await SecureStore.deleteItemAsync('userId');
        
        // Rechazamos la promesa para que el UI sepa que falló
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;