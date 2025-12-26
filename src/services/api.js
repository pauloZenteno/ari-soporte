import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = 'https://arierp.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const setSession = async (accessToken, refreshToken) => {
  if (accessToken) {
    await SecureStore.setItemAsync('accessToken', accessToken);
    api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
  } else {
    await SecureStore.deleteItemAsync('accessToken');
    delete api.defaults.headers.common.Authorization;
  }

  if (refreshToken) {
    await SecureStore.setItemAsync('refreshToken', refreshToken);
  } else {
    await SecureStore.deleteItemAsync('refreshToken');
  }
};

export const setUserInfo = async (user) => {
  await SecureStore.setItemAsync('userInfo', JSON.stringify(user));
};

export const getUserInfo = async () => {
  const json = await SecureStore.getItemAsync('userInfo');
  return json ? JSON.parse(json) : null;
};

export const clearSession = async () => {
  await SecureStore.deleteItemAsync('accessToken');
  await SecureStore.deleteItemAsync('refreshToken');
  await SecureStore.deleteItemAsync('userInfo');
  delete api.defaults.headers.common.Authorization;
};

export const getClients = async () => {
  const response = await api.get('/administration/Clients');
  return response.data;
};

export const getClientsFiltered = async (params) => {
    const response = await api.get('/administration/Clients/Filtered', { params });
    return response.data;
};

export default api;