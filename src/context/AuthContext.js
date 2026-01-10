import React, { createContext, useState, useEffect, useContext } from 'react';
import { validateStartupSession, clearSession } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    loadStorageData();
  }, []);

  const loadStorageData = async () => {
    try {
      const isValid = await validateStartupSession();
      setIsAuthenticated(isValid);
    } catch (e) {
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = () => {
    setIsAuthenticated(true);
  };

  const signOut = async () => {
    await clearSession();
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isLoading, isAuthenticated, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);