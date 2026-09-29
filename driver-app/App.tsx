import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LoginScreen } from './src/screens/LoginScreen';
import { DriverHomeScreen } from './src/screens/DriverHomeScreen';

export default function App() {
  const [driver, setDriver] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      const stored = await AsyncStorage.getItem('kidtrack_user');
      if (stored) setDriver(JSON.parse(stored));
      setLoading(false);
    };
    bootstrap();
  }, []);

  const handleLogin = async (user: any) => {
    await AsyncStorage.setItem('kidtrack_token', user.token);
    await AsyncStorage.setItem('kidtrack_user', JSON.stringify(user));
    setDriver(user);
  };

  const handleLogout = async () => {
    await AsyncStorage.multiRemove(['kidtrack_token', 'kidtrack_user']);
    setDriver(null);
  };

  if (loading) return null;

  return driver
    ? <DriverHomeScreen driver={driver} onLogout={handleLogout} />
    : <LoginScreen onLogin={handleLogin} />;
}
