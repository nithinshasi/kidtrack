import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, KeyboardAvoidingView, Platform, Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../services/api';

export const LoginScreen: React.FC<{ onLogin: (user: any) => void }> = ({ onLogin }) => {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    setLoading(true);
    try {
      await authApi.sendOtp(phone);
      setStep('otp');
    } catch {
      Alert.alert('Error', 'Driver not found. Contact your school admin.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setLoading(true);
    try {
      const { data } = await authApi.verifyOtp(phone, otp);
      onLogin(data);
    } catch {
      Alert.alert('Error', 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.card}>
        <Text style={{ fontSize: 56 }}>🚌</Text>
        <Text style={styles.title}>KidTrack Driver</Text>
        <Text style={styles.sub}>School Bus Companion App</Text>

        {step === 'phone' ? (
          <>
            <Text style={styles.label}>Your Mobile Number</Text>
            <TextInput
              style={styles.input}
              placeholder="+91 9876543210"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
            <TouchableOpacity style={styles.btn} onPress={handleSendOtp} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Send OTP</Text>}
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.label}>OTP sent to {phone}</Text>
            <TextInput
              style={[styles.input, { letterSpacing: 10, textAlign: 'center', fontSize: 22 }]}
              placeholder="• • • • • •"
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
              maxLength={6}
            />
            <TouchableOpacity style={styles.btn} onPress={handleVerify} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Login</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setStep('phone')} style={{ marginTop: 12 }}>
              <Text style={{ color: '#6b7280' }}>← Change Number</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 32, width: '88%', alignItems: 'center' },
  title: { fontSize: 26, fontWeight: '800', color: '#0f172a', marginTop: 8 },
  sub: { fontSize: 13, color: '#6b7280', marginBottom: 32 },
  label: { alignSelf: 'flex-start', fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  input: { width: '100%', borderWidth: 1.5, borderColor: '#d1d5db', borderRadius: 10, padding: 14, fontSize: 16, marginBottom: 16 },
  btn: { width: '100%', backgroundColor: '#0f172a', padding: 16, borderRadius: 10, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
