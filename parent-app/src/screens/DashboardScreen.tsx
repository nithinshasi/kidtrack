import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, StyleSheet } from 'react-native';
import { studentApi, busApi, notificationApi, tripApi } from '../services/api';

interface Props {
  user: any;
  onNavigate: (screen: string, params?: any) => void;
}

export const DashboardScreen: React.FC<Props> = ({ user, onNavigate }) => {
  const [children, setChildren] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const [studentsRes, notifRes] = await Promise.all([
        studentApi.getAll(),
        notificationApi.getAll(),
      ]);
      setChildren(studentsRes.data);
      setUnreadCount(notifRes.data.filter((n: any) => !n.isRead).length);
    } catch (e) {
      console.warn('Dashboard load error:', e);
    }
  };

  useEffect(() => { load(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good Morning,</Text>
          <Text style={styles.userName}>{user.name} 👋</Text>
        </View>
        <TouchableOpacity style={styles.notifBtn} onPress={() => onNavigate('Notifications')}>
          <Text style={styles.notifIcon}>🔔</Text>
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Children Cards */}
      <Text style={styles.sectionTitle}>Your Children</Text>
      {children.map(child => (
        <TouchableOpacity
          key={child.id}
          style={styles.childCard}
          onPress={() => onNavigate('Tracking', { student: child })}
        >
          <View style={styles.childAvatar}>
            <Text style={{ fontSize: 28 }}>👦</Text>
          </View>
          <View style={styles.childInfo}>
            <Text style={styles.childName}>{child.firstName} {child.lastName}</Text>
            <Text style={styles.childGrade}>Grade {child.grade} - {child.section}</Text>
            <Text style={styles.childRoll}>Roll: {child.rollNumber}</Text>
          </View>
          <View style={styles.trackBtn}>
            <Text style={{ color: '#2563eb', fontSize: 12, fontWeight: '700' }}>TRACK →</Text>
          </View>
        </TouchableOpacity>
      ))}

      {children.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={{ fontSize: 40 }}>📋</Text>
          <Text style={styles.emptyText}>No children assigned yet</Text>
          <Text style={styles.emptySubtext}>Contact your school admin</Text>
        </View>
      )}

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actions}>
        {[
          { icon: '📍', label: 'Live Tracking', screen: 'Tracking' },
          { icon: '📋', label: 'Attendance', screen: 'Attendance' },
          { icon: '🔔', label: 'Notifications', screen: 'Notifications' },
          { icon: '⏱️', label: 'Journey Log', screen: 'JourneyTimeline' },
        ].map(action => (
          <TouchableOpacity
            key={action.screen}
            style={styles.actionCard}
            onPress={() => onNavigate(action.screen)}
          >
            <Text style={{ fontSize: 28 }}>{action.icon}</Text>
            <Text style={styles.actionLabel}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  header: { backgroundColor: '#1e3a5f', padding: 24, paddingTop: 56, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { color: 'rgba(255,255,255,0.7)', fontSize: 14 },
  userName: { color: '#fff', fontSize: 20, fontWeight: '700' },
  notifBtn: { position: 'relative', padding: 8 },
  notifIcon: { fontSize: 24 },
  badge: { position: 'absolute', top: 4, right: 4, backgroundColor: '#ef4444', borderRadius: 10, minWidth: 18, height: 18, justifyContent: 'center', alignItems: 'center' },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#374151', padding: 16, paddingBottom: 8 },
  childCard: { flexDirection: 'row', backgroundColor: '#fff', margin: 8, marginHorizontal: 16, borderRadius: 12, padding: 16, elevation: 2, alignItems: 'center' },
  childAvatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#dbeafe', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  childInfo: { flex: 1 },
  childName: { fontSize: 16, fontWeight: '700', color: '#1e3a5f' },
  childGrade: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  childRoll: { fontSize: 12, color: '#9ca3af', marginTop: 1 },
  trackBtn: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#dbeafe', borderRadius: 8 },
  emptyState: { alignItems: 'center', padding: 32 },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#374151', marginTop: 12 },
  emptySubtext: { fontSize: 13, color: '#6b7280', marginTop: 4 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', padding: 8, paddingHorizontal: 12 },
  actionCard: { width: '46%', backgroundColor: '#fff', margin: '2%', borderRadius: 12, padding: 20, alignItems: 'center', elevation: 2 },
  actionLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginTop: 8 },
});
