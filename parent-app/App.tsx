import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LoginScreen } from './src/screens/LoginScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { TrackingScreen } from './src/screens/TrackingScreen';
import { NotificationsScreen } from './src/screens/NotificationsScreen';
import Toast from 'react-native-toast-message';

type Screen = 'Login' | 'Dashboard' | 'Tracking' | 'Notifications' | 'Attendance' | 'JourneyTimeline';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [screen, setScreen] = useState<Screen>('Login');
  const [screenParams, setScreenParams] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const stored = await AsyncStorage.getItem('kidtrack_user');
        if (stored) {
          setUser(JSON.parse(stored));
          setScreen('Dashboard');
        }
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, []);

  const navigate = (s: Screen, params?: any) => {
    setScreen(s);
    setScreenParams(params);
  };

  const logout = async () => {
    await AsyncStorage.multiRemove(['kidtrack_token', 'kidtrack_user']);
    setUser(null);
    setScreen('Login');
  };

  if (loading) return null;

  return (
    <>
      {screen === 'Login' && (
        <LoginScreen onLogin={u => { setUser(u); setScreen('Dashboard'); }} />
      )}
      {screen === 'Dashboard' && user && (
        <DashboardScreen user={user} onNavigate={navigate} />
      )}
      {screen === 'Tracking' && (
        <TrackingScreen student={screenParams?.student} onBack={() => setScreen('Dashboard')} />
      )}
      {screen === 'Notifications' && (
        <NotificationsScreen onBack={() => setScreen('Dashboard')} />
      )}
      <Toast />
    </>
  );
}
