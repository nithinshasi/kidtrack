import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, KeyboardAvoidingView, Platform, Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../services/api';

interface Props {
  onLogin: (user: any) => void;
}

export const LoginScreen: React.FC<Props> = ({ onLogin }) => {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    if (!phone || phone.length < 10) {
      Alert.alert('Invalid Number', 'Please enter a valid mobile number');
      return;
    }
    setLoading(true);
    try {
      await authApi.sendOtp(phone);
      setStep('otp');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Phone number not registered');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter the 6-digit OTP');
      return;
    }
    setLoading(true);
    try {
      const { data } = await authApi.verifyOtp(phone, otp);
      await AsyncStorage.setItem('kidtrack_token', data.token);
      await AsyncStorage.setItem('kidtrack_user', JSON.stringify(data));
      onLogin(data);
    } catch (err: any) {
      Alert.alert('Error', 'Invalid or expired OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.card}>
        <Text style={styles.emoji}>🚌</Text>
        <Text style={styles.title}>KidTrack</Text>
        <Text style={styles.subtitle}>Safe School Transport</Text>

        {step === 'phone' ? (
          <>
            <Text style={styles.label}>Parent Mobile Number</Text>
            <TextInput
              style={styles.input}
              placeholder="+91 9876543210"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              maxLength={15}
            />
            <TouchableOpacity style={styles.button} onPress={handleSendOtp} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Send OTP</Text>}
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.label}>Enter OTP sent to {phone}</Text>
            <TextInput
              style={[styles.input, styles.otpInput]}
              placeholder="• • • • • •"
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
              maxLength={6}
            />
            <TouchableOpacity style={styles.button} onPress={handleVerifyOtp} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Verify & Login</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setStep('phone')} style={styles.backBtn}>
              <Text style={styles.backText}>← Change Number</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1e3a5f' },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 32, width: '88%', alignItems: 'center', elevation: 8 },
  emoji: { fontSize: 56, marginBottom: 8 },
  title: { fontSize: 28, fontWeight: '800', color: '#1e3a5f' },
  subtitle: { fontSize: 14, color: '#6b7280', marginBottom: 32 },
  label: { alignSelf: 'flex-start', fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  input: { width: '100%', borderWidth: 1.5, borderColor: '#d1d5db', borderRadius: 10, padding: 14, fontSize: 16, marginBottom: 16 },
  otpInput: { fontSize: 24, letterSpacing: 12, textAlign: 'center' },
  button: { width: '100%', backgroundColor: '#2563eb', padding: 16, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  backBtn: { marginTop: 16 },
  backText: { color: '#6b7280', fontSize: 14 },
});
