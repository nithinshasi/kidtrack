import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'https://kidtrack-api.azurewebsites.net/api';

const api = axios.create({ baseURL: API_BASE, timeout: 15000 });

api.interceptors.request.use(async config => {
  const token = await AsyncStorage.getItem('kidtrack_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  async err => {
    if (err.response?.status === 401) {
      await AsyncStorage.multiRemove(['kidtrack_token', 'kidtrack_user']);
    }
    return Promise.reject(err);
  }
);

export const authApi = {
  sendOtp: (phone: string) => api.post('/auth/login', { phone }, { params: { userType: 'Parent' } }),
  verifyOtp: (phone: string, otp: string) =>
    api.post('/auth/verify', { phone, otp, userType: 'Parent' }),
  updateFcmToken: (token: string) => api.post('/auth/fcm-token', { fcmToken: token }),
};

export const studentApi = {
  getAll: () => api.get('/students'),
  getById: (id: number) => api.get(`/students/${id}`),
};

export const busApi = {
  getLocation: (id: number) => api.get(`/bus/${id}/location`),
};

export const attendanceApi = {
  getByStudent: (studentId: number, from: string, to: string) =>
    api.get('/attendance', { params: { studentId, from, to } }),
};

export const notificationApi = {
  getAll: (page = 1) => api.get('/notifications', { params: { page } }),
  markRead: (id: number) => api.post(`/notifications/${id}/read`),
};

export const tripApi = {
  getActive: (busId: number) => api.get('/trips/active', { params: { busId } }),
};

export default api;
