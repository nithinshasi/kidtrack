import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'https://kidtrack-api.azurewebsites.net/api';
const api = axios.create({ baseURL: API_BASE, timeout: 15000 });

api.interceptors.request.use(async config => {
  const token = await AsyncStorage.getItem('kidtrack_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const authApi = {
  sendOtp: (phone: string) =>
    api.post('/auth/login', { phone }, { params: { userType: 'Driver' } }),
  verifyOtp: (phone: string, otp: string) =>
    api.post('/auth/verify', { phone, otp, userType: 'Driver' }),
};

export const routeApi = {
  getAll: (params?: any) => api.get('/routes', { params }),
  getStudents: (id: number) => api.get(`/routes/${id}/students`),
};

export const tripApi = {
  start: (data: any) => api.post('/trips/start', data),
  complete: (id: number, data: any) => api.post(`/trips/${id}/complete`, data),
  getActive: (busId: number) => api.get('/trips/active', { params: { busId } }),
};

export const attendanceApi = {
  checkIn: (data: any) => api.post('/attendance/checkin', data),
  getTripAttendance: (tripId: number) => api.get('/attendance', { params: { tripId } }),
};

export const locationApi = {
  update: (busId: number, latitude: number, longitude: number) =>
    api.post('/bus/location', { busId, latitude, longitude }),
};

export const notificationApi = {
  sendEmergency: (schoolId: number, message: string) =>
    api.post('/notifications/emergency', { schoolId, message }),
};

export default api;
