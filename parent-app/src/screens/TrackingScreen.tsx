import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { busApi, tripApi } from '../services/api';

interface Props {
  student: any;
  onBack: () => void;
}

export const TrackingScreen: React.FC<Props> = ({ student, onBack }) => {
  const [busLocation, setBusLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [busInfo, setBusInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const intervalRef = useRef<any>(null);

  const fetchLocation = async () => {
    if (!student?.routeId) return;
    try {
      // Get active trip for student's route bus
      const busId = student.busId || 1; // In production, derive from route assignment
      const [locRes, tripRes] = await Promise.allSettled([
        busApi.getLocation(busId),
        tripApi.getActive(busId),
      ]);

      if (locRes.status === 'fulfilled') {
        setBusLocation({
          latitude: locRes.value.data.latitude,
          longitude: locRes.value.data.longitude,
        });
        setBusInfo(locRes.value.data);
        setLastUpdate(new Date().toLocaleTimeString());
      }
    } catch (e) {
      console.warn('Location fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocation();
    intervalRef.current = setInterval(fetchLocation, 10000); // Poll every 10s
    return () => clearInterval(intervalRef.current);
  }, [student]);

  const defaultRegion = {
    latitude: 13.0827, longitude: 80.2707, // Default: Chennai
    latitudeDelta: 0.05, longitudeDelta: 0.05,
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Live Tracking</Text>
          <Text style={styles.headerSub}>{student.firstName} {student.lastName}</Text>
        </View>
      </View>

      {/* Map */}
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={busLocation ? {
          ...busLocation, latitudeDelta: 0.02, longitudeDelta: 0.02
        } : defaultRegion}
        region={busLocation ? {
          ...busLocation, latitudeDelta: 0.02, longitudeDelta: 0.02
        } : undefined}
        showsUserLocation
      >
        {busLocation && (
          <Marker
            coordinate={busLocation}
            title="School Bus"
            description={`Bus: ${busInfo?.registrationNumber || '—'}`}
          >
            <Text style={{ fontSize: 32 }}>🚌</Text>
          </Marker>
        )}
      </MapView>

      {/* Info Bar */}
      <View style={styles.infoBar}>
        {loading ? (
          <ActivityIndicator color="#2563eb" />
        ) : busLocation ? (
          <>
            <View style={styles.statusBadge}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Live</Text>
            </View>
            <Text style={styles.updateText}>Updated: {lastUpdate}</Text>
            <Text style={styles.busText}>🚌 {busInfo?.registrationNumber}</Text>
          </>
        ) : (
          <Text style={{ color: '#6b7280', fontSize: 14 }}>
            Bus location not available. Trip may not have started yet.
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e3a5f', paddingTop: 52, paddingHorizontal: 16, paddingBottom: 16 },
  backBtn: { padding: 8, marginRight: 8 },
  backText: { color: '#fff', fontSize: 15 },
  headerInfo: { flex: 1 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  headerSub: { color: 'rgba(255,255,255,0.7)', fontSize: 13 },
  map: { flex: 1 },
  infoBar: { backgroundColor: '#fff', padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, elevation: 8, minHeight: 64 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#dcfce7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#16a34a', marginRight: 6 },
  statusText: { color: '#16a34a', fontWeight: '700', fontSize: 13 },
  updateText: { flex: 1, color: '#6b7280', fontSize: 12 },
  busText: { color: '#374151', fontWeight: '600', fontSize: 13 },
});
