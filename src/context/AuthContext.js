import React, { createContext, useState, useEffect, useContext } from 'react';
import { validateStartupSession, clearSession, getUserInfo, setUserInfo } from '../services/authService';

const AuthContext = createContext();

const HARDCODED_SELLER_RELATIONS = {
  'b8QWwNJYxAGr5gER': 'NZ9DezJWqMQOnRE3',
  '5m2XOBMXzJ4NZkwr': 'lK20zbAk4JRDVEa1',
};

export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    loadStorageData();
  }, []);

  const getPatchedUser = async () => {
    try {
      const user = await getUserInfo();
      
      if (user && user.id) {
        if (HARDCODED_SELLER_RELATIONS[user.id]) {
          user.sellerId = HARDCODED_SELLER_RELATIONS[user.id];
        }
        return user;
      }
    } catch (error) {
      console.log("Error recuperando usuario:", error);
    }
    return null;
  };

  const loadStorageData = async () => {
    try {
      const isValid = await validateStartupSession();
      
      if (isValid) {
        const user = await getPatchedUser();
        
        if (user) {
            setUserProfile(user);
            setIsAuthenticated(true);
        } else {
            await signOut();
        }
      } else {
        await signOut();
      }
    } catch (e) {
      await signOut();
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (userData) => {
    let userToSet = userData;

    if (!userToSet) {
        userToSet = await getPatchedUser();
    }

    if (userToSet && userToSet.id) {
        if (HARDCODED_SELLER_RELATIONS[userToSet.id]) {
            userToSet.sellerId = HARDCODED_SELLER_RELATIONS[userToSet.id];
        }

        // ELIMINADO: await setUserInfo(userToSet); 
        // Ya no forzamos el guardado aquí. Dejamos que LoginScreen decida.

        setUserProfile(userToSet);
        setIsAuthenticated(true);
    } else {
        console.error("Error crítico: No se recibieron datos de usuario válidos en signIn.");
    }
  };

  const signOut = async () => {
    try {
        await clearSession();
    } catch (error) {
        console.log("Error al limpiar sesión", error);
    }
    setIsAuthenticated(false);
    setUserProfile(null);
  };

  return (
    <AuthContext.Provider value={{ isLoading, isAuthenticated, userProfile, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);