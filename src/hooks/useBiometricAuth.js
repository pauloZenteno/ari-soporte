import { useState, useEffect } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';

export const useBiometricAuth = () => {
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [biometricType, setBiometricType] = useState(null); 
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const compatible = await LocalAuthentication.hasHardwareAsync();
        const enrolled = await LocalAuthentication.isEnrolledAsync();
        
        setIsBiometricSupported(compatible && enrolled);

        if (compatible) {
          const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
          if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
            setBiometricType('FACE');
          } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
            setBiometricType('FINGERPRINT');
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsChecking(false);
      }
    })();
  }, []);

  const authenticate = async () => {
    try {
      if (!isBiometricSupported) return false;

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Verificar identidad',
        fallbackLabel: 'Usar código',
        disableDeviceFallback: false,
        cancelLabel: 'Cancelar'
      });

      return result.success;
    } catch (error) {
      return false;
    }
  };

  return {
    isBiometricSupported,
    biometricType, 
    isChecking,
    authenticate
  };
};