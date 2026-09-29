import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView,
  FlatList, ActivityIndicator
} from 'react-native';
import * as Location from 'expo-location';
import { tripApi, attendanceApi, locationApi, routeApi, notificationApi } from '../services/api';

interface Props {
  driver: any;
  onLogout: () => void;
}

type TripState = 'idle' | 'selecting_route' | 'active';

export const DriverHomeScreen: React.FC<Props> = ({ driver, onLogout }) => {
  const [tripState, setTripState] = useState<TripState>('idle');
  const [routes, setRoutes] = useState<any[]>([]);
  const [activeTrip, setActiveTrip] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [checkedIn, setCheckedIn] = useState<Set<number>>(new Set());
  const [locationStatus, setLocationStatus] = useState<string>('Not tracking');
  const [loading, setLoading] = useState(false);
  const locationInterval = useRef<any>(null);
  const BUS_ID = driver.busId || 1; // In production, derived from driver assignment

  useEffect(() => {
    return () => clearInterval(locationInterval.current);
  }, []);

  const loadRoutes = async () => {
    setLoading(true);
    try {
      const res = await routeApi.getAll({ schoolId: driver.schoolId });
      setRoutes(res.data);
      setTripState('selecting_route');
    } catch {
      Alert.alert('Error', 'Could not load routes');
    } finally {
      setLoading(false);
    }
  };

  const startTrip = async (route: any, tripType: string) => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Location permission is needed to track the bus');
      return;
    }
    setLoading(true);
    try {
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const res = await tripApi.start({
        routeId: route.id,
        busId: BUS_ID,
        driverId: driver.userId,
        tripType,
        startLatitude: loc.coords.latitude,
        startLongitude: loc.coords.longitude,
      });
      setActiveTrip(res.data);

      // Load students for this route
      const studRes = await routeApi.getStudents(route.id);
      setStudents(studRes.data);

      setTripState('active');

      // Start GPS broadcasting every 10s
      locationInterval.current = setInterval(async () => {
        try {
          const l = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
          await locationApi.update(BUS_ID, l.coords.latitude, l.coords.longitude);
          setLocationStatus(`📍 ${l.coords.latitude.toFixed(4)}, ${l.coords.longitude.toFixed(4)}`);
        } catch {
          setLocationStatus('⚠️ Location update failed');
        }
      }, 10000);
    } catch {
      Alert.alert('Error', 'Could not start trip');
    } finally {
      setLoading(false);
    }
  };

  const checkInStudent = async (student: any) => {
    if (checkedIn.has(student.id)) return;
    try {
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      await attendanceApi.checkIn({
        tripHistoryId: activeTrip.id,
        studentId: student.id,
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
      setCheckedIn(prev => new Set([...prev, student.id]));
    } catch {
      Alert.alert('Error', 'Check-in failed');
    }
  };

  const completeTrip = async () => {
    Alert.alert('Complete Trip', 'Mark this trip as completed?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Complete', style: 'destructive', onPress: async () => {
          clearInterval(locationInterval.current);
          try {
            const loc = await Location.getCurrentPositionAsync({});
            await tripApi.complete(activeTrip.id, {
              endLatitude: loc.coords.latitude,
              endLongitude: loc.coords.longitude,
            });
            setTripState('idle');
            setActiveTrip(null);
            setStudents([]);
            setCheckedIn(new Set());
            setLocationStatus('Not tracking');
          } catch {
            Alert.alert('Error', 'Could not complete trip');
          }
        }
      }
    ]);
  };

  const sendEmergency = () => {
    Alert.alert('🚨 Emergency Alert', 'Send emergency alert to all parents?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Send Alert', style: 'destructive', onPress: async () => {
          await notificationApi.sendEmergency(driver.schoolId, '🚨 Emergency: Bus driver has triggered an emergency alert. Please contact the school immediately.');
          Alert.alert('Alert Sent', 'Emergency notification sent to all parents');
        }
      }
    ]);
  };

  // === IDLE STATE ===
  if (tripState === 'idle') return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerGreeting}>Welcome,</Text>
          <Text style={styles.headerName}>{driver.name} 🚌</Text>
        </View>
        <TouchableOpacity onPress={onLogout} style={styles.logoutBtn}>
          <Text style={{ color: '#fff', fontSize: 12 }}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        <View style={styles.idleCard}>
          <Text style={{ fontSize: 64 }}>🚌</Text>
          <Text style={styles.idleTitle}>No Active Trip</Text>
          <Text style={styles.idleSub}>Start a route to begin tracking</Text>
        </View>

        <TouchableOpacity style={styles.startBtn} onPress={loadRoutes} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.startBtnText}>Start New Trip</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.emergencyBtn} onPress={sendEmergency}>
          <Text style={styles.emergencyBtnText}>🚨 Emergency Alert</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // === ROUTE SELECTION ===
  if (tripState === 'selecting_route') return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setTripState('idle')} style={{ padding: 8 }}>
          <Text style={{ color: '#fff' }}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerName}>Select Route & Type</Text>
        <View style={{ width: 60 }} />
      </View>
      <FlatList
        data={routes}
        keyExtractor={r => r.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.routeCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.routeName}>{item.name}</Text>
              <Text style={styles.routeDesc}>{item.description}</Text>
            </View>
            <View style={{ gap: 8 }}>
              <TouchableOpacity style={styles.morningBtn} onPress={() => startTrip(item, 'Morning')}>
                <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700' }}>🌅 Morning</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.eveningBtn} onPress={() => startTrip(item, 'Evening')}>
                <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700' }}>🌆 Evening</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={<Text style={{ textAlign: 'center', color: '#6b7280', padding: 24 }}>No routes assigned</Text>}
      />
    </View>
  );

  // === ACTIVE TRIP ===
  return (
    <View style={styles.container}>
      <View style={[styles.header, { backgroundColor: '#16a34a' }]}>
        <View>
          <Text style={styles.headerGreeting}>Active Trip</Text>
          <Text style={styles.headerName}>{activeTrip?.routeName}</Text>
        </View>
        <TouchableOpacity style={styles.completeBtn} onPress={completeTrip}>
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 12 }}>Complete</Text>
        </TouchableOpacity>
      </View>

      {/* GPS Status */}
      <View style={styles.gpsBar}>
        <Text style={{ fontSize: 12, color: '#166534', fontWeight: '600' }}>{locationStatus}</Text>
      </View>

      {/* Student Checkin List */}
      <Text style={styles.sectionTitle}>
        Students ({checkedIn.size}/{students.length} boarded)
      </Text>

      <FlatList
        data={students}
        keyExtractor={s => s.id.toString()}
        renderItem={({ item }) => {
          const boarded = checkedIn.has(item.id);
          return (
            <TouchableOpacity
              style={[styles.studentItem, boarded && styles.studentBoarded]}
              onPress={() => checkInStudent(item)}
              disabled={boarded}
            >
              <View style={styles.studentAvatar}>
                <Text style={{ fontSize: 20 }}>{boarded ? '✅' : '👦'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.studentName, boarded && { color: '#16a34a' }]}>
                  {item.firstName} {item.lastName}
                </Text>
                <Text style={{ fontSize: 12, color: '#6b7280' }}>Roll: {item.rollNumber} | {item.grade}-{item.section}</Text>
              </View>
              <Text style={{ fontSize: 13, color: boarded ? '#16a34a' : '#d1d5db', fontWeight: '600' }}>
                {boarded ? 'Boarded' : 'Tap to check in'}
              </Text>
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      <TouchableOpacity style={styles.emergencyBtnFixed} onPress={sendEmergency}>
        <Text style={styles.emergencyBtnText}>🚨 Emergency</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  header: { backgroundColor: '#1e3a5f', paddingTop: 52, paddingHorizontal: 16, paddingBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerGreeting: { color: 'rgba(255,255,255,0.7)', fontSize: 13 },
  headerName: { color: '#fff', fontSize: 18, fontWeight: '700' },
  logoutBtn: { padding: 8, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 6 },
  body: { flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center' },
  idleCard: { alignItems: 'center', marginBottom: 32 },
  idleTitle: { fontSize: 22, fontWeight: '700', color: '#374151', marginTop: 12 },
  idleSub: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  startBtn: { width: '100%', backgroundColor: '#2563eb', padding: 18, borderRadius: 12, alignItems: 'center', marginBottom: 12 },
  startBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  emergencyBtn: { width: '100%', backgroundColor: '#dc2626', padding: 18, borderRadius: 12, alignItems: 'center' },
  emergencyBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  emergencyBtnFixed: { position: 'absolute', bottom: 24, left: 24, right: 24, backgroundColor: '#dc2626', padding: 16, borderRadius: 12, alignItems: 'center' },
  routeCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', elevation: 2 },
  routeName: { fontSize: 16, fontWeight: '700', color: '#1e3a5f' },
  routeDesc: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  morningBtn: { backgroundColor: '#f59e0b', padding: 8, borderRadius: 8 },
  eveningBtn: { backgroundColor: '#6366f1', padding: 8, borderRadius: 8 },
  gpsBar: { backgroundColor: '#dcfce7', padding: 10, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#374151', padding: 16, paddingBottom: 8 },
  studentItem: { flexDirection: 'row', backgroundColor: '#fff', marginHorizontal: 12, marginBottom: 6, borderRadius: 10, padding: 14, elevation: 1, alignItems: 'center' },
  studentBoarded: { backgroundColor: '#f0fdf4', borderWidth: 1, borderColor: '#86efac' },
  studentAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f3f4f6', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  studentName: { fontSize: 15, fontWeight: '600', color: '#374151' },
  completeBtn: { backgroundColor: '#15803d', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
});
