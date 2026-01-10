import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import axios from 'axios';
import api from './api';

// RECOMENDACIÓN: Idealmente mueve esta URL a un archivo constants.js o config.js
// para no tenerla repetida en dos archivos.
const API_URL = 'https://arierp.com/api'; 

export const login = async (username, password) => {
  const response = await api.post('/administration/Users/login', {
    username,
    password
  });
  return response.data;
};

// --- GESTIÓN DE CREDENCIALES ---

export const storeUserCredentials = async (username, password) => {
  await SecureStore.setItemAsync('savedUsername', username);
  await SecureStore.setItemAsync('savedPassword', password);
};

export const getUserCredentials = async () => {
  const username = await SecureStore.getItemAsync('savedUsername');
  const password = await SecureStore.getItemAsync('savedPassword');
  return { username, password };
};

// --- GESTIÓN DE SESIÓN ---

export const setSession = async (accessToken, refreshToken) => {
  if (accessToken) {
    await SecureStore.setItemAsync('accessToken', accessToken);
  } else {
    await SecureStore.deleteItemAsync('accessToken');
  }

  if (refreshToken) {
    await SecureStore.setItemAsync('refreshToken', refreshToken);
  } else {
    await SecureStore.deleteItemAsync('refreshToken');
  }
};

export const setUserInfo = async (user) => {
  // Verificación extra para evitar guardar "undefined"
  if(user) {
      await SecureStore.setItemAsync('userInfo', JSON.stringify(user));
      if (user.id) {
        await SecureStore.setItemAsync('userId', user.id.toString());
      }
  }
};

export const getUserInfo = async () => {
  const json = await SecureStore.getItemAsync('userInfo');
  try {
    return json ? JSON.parse(json) : null;
  } catch (e) {
    return null; // Evita crash si el JSON está corrupto
  }
};

export const clearSession = async () => {
  await SecureStore.deleteItemAsync('accessToken');
  await SecureStore.deleteItemAsync('refreshToken');
};

export const clearFullStorage = async () => {
  await clearSession(); 
  await SecureStore.deleteItemAsync('userInfo');
  await SecureStore.deleteItemAsync('userId');
  await SecureStore.deleteItemAsync('savedUsername');
  await SecureStore.deleteItemAsync('savedPassword');
};

export const logout = async () => {
  await clearSession();
};

// --- BIOMETRÍA ---

export const checkBiometricSupport = async () => {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  return hasHardware && isEnrolled;
};

export const authenticateWithBiometrics = async () => {
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Valida tu identidad',
      fallbackLabel: 'Usar contraseña',
      cancelLabel: 'Cancelar',
      disableDeviceFallback: false, 
    });
    return result.success;
  } catch (error) {
    return false;
  }
};

// --- VALIDACIÓN AL INICIO ---

export const validateStartupSession = async () => {
  try {
    const refreshToken = await SecureStore.getItemAsync('refreshToken');
    const userId = await SecureStore.getItemAsync('userId');
    const currentAccessToken = await SecureStore.getItemAsync('accessToken');

    if (!refreshToken || !userId) {
      return false;
    }

    // Usamos axios puro para verificar si el refresh token sigue vivo
    const response = await axios.post(
      `${API_URL}/administration/Users/${userId}/refreshTokenMobile`,
      {
        accessToken: currentAccessToken || "",
        refreshToken: refreshToken,
        expiresAt: new Date().toISOString()
      },
      { headers: { 'Content-Type': 'application/json' } }
    );

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;

    if (newAccessToken) {
      await setSession(newAccessToken, newRefreshToken);
      return true;
    }
    
    // Si la respuesta es 200 OK pero no trae token (caso raro), asumimos false
    return false;

  } catch (error) {
    // IMPORTANTE: Si falla la validación inicial (ej: refresh token expirado),
    // limpiamos la sesión para que el usuario sea redirigido al Login limpiamente.
    await clearSession(); 
    return false;
  }
};