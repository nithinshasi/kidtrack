import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator
} from 'react-native';
import { notificationApi } from '../services/api';

interface Props {
  onBack: () => void;
}

const typeConfig: Record<string, { icon: string; color: string; bg: string }> = {
  Boarding: { icon: '🟢', color: '#16a34a', bg: '#dcfce7' },
  Alighting: { icon: '🏠', color: '#2563eb', bg: '#dbeafe' },
  Delay: { icon: '⏰', color: '#d97706', bg: '#fef3c7' },
  Emergency: { icon: '🚨', color: '#dc2626', bg: '#fee2e2' },
  General: { icon: '🔔', color: '#6b7280', bg: '#f3f4f6' },
};

export const NotificationsScreen: React.FC<Props> = ({ onBack }) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const load = async (p = 1) => {
    try {
      const res = await notificationApi.getAll(p);
      setNotifications(p === 1 ? res.data : [...notifications, ...res.data]);
    } catch (e) {
      console.warn('Notifications error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleRead = async (id: number) => {
    await notificationApi.markRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const renderItem = ({ item }: { item: any }) => {
    const cfg = typeConfig[item.type] || typeConfig.General;
    return (
      <TouchableOpacity
        style={[styles.item, !item.isRead && styles.unread]}
        onPress={() => handleRead(item.id)}
      >
        <View style={[styles.iconBox, { backgroundColor: cfg.bg }]}>
          <Text style={{ fontSize: 22 }}>{cfg.icon}</Text>
        </View>
        <View style={styles.content}>
          <Text style={[styles.title, !item.isRead && styles.boldTitle]}>{item.title}</Text>
          <Text style={styles.body} numberOfLines={2}>{item.body}</Text>
          <Text style={styles.time}>{new Date(item.createdAt).toLocaleString()}</Text>
        </View>
        {!item.isRead && <View style={styles.dot} />}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={{ padding: 8 }}>
          <Text style={{ color: '#fff', fontSize: 15 }}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 60 }} />
      </View>

      {loading ? (
        <ActivityIndicator style={{ flex: 1 }} color="#2563eb" />
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          onEndReached={() => { setPage(p => p + 1); load(page + 1); }}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            <View style={{ flex: 1, alignItems: 'center', padding: 40 }}>
              <Text style={{ fontSize: 40 }}>🔔</Text>
              <Text style={{ color: '#6b7280', marginTop: 12, fontSize: 16 }}>No notifications yet</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  header: { backgroundColor: '#1e3a5f', paddingTop: 52, paddingHorizontal: 16, paddingBottom: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  item: { flexDirection: 'row', backgroundColor: '#fff', marginHorizontal: 12, marginTop: 8, borderRadius: 12, padding: 14, elevation: 1 },
  unread: { borderLeftWidth: 3, borderLeftColor: '#2563eb' },
  iconBox: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: 12, flexShrink: 0 },
  content: { flex: 1 },
  title: { fontSize: 14, color: '#1f2328' },
  boldTitle: { fontWeight: '700' },
  body: { fontSize: 13, color: '#6b7280', marginTop: 3, lineHeight: 18 },
  time: { fontSize: 11, color: '#9ca3af', marginTop: 4 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#2563eb', alignSelf: 'center', marginLeft: 8 },
});
