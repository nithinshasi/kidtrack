import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use(config => {
  const token = localStorage.getItem('kidtrack_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('kidtrack_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authApi = {
  sendOtp: (phone: string, userType = 'Admin') =>
    api.post('/auth/login', { phone }, { params: { userType } }),
  verifyOtp: (phone: string, otp: string, userType = 'Admin') =>
    api.post('/auth/verify', { phone, otp, userType }),
};

export const schoolApi = {
  getAll: () => api.get('/schools'),
  getById: (id: number) => api.get(`/schools/${id}`),
  create: (data: any) => api.post('/schools', data),
  update: (id: number, data: any) => api.put(`/schools/${id}`, data),
  getDashboard: (id: number) => api.get(`/schools/${id}/dashboard`),
};

export const studentApi = {
  getAll: (params?: any) => api.get('/students', { params }),
  getById: (id: number) => api.get(`/students/${id}`),
  create: (data: any) => api.post('/students', data),
  update: (id: number, data: any) => api.put(`/students/${id}`, data),
  delete: (id: number) => api.delete(`/students/${id}`),
  getParents: (id: number) => api.get(`/students/${id}/parents`),
};

export const busApi = {
  getAll: (params?: any) => api.get('/bus', { params }),
  getLocation: (id: number) => api.get(`/bus/${id}/location`),
  create: (data: any) => api.post('/bus', data),
};

export const driverApi = {
  getAll: (params?: any) => api.get('/drivers', { params }),
  getById: (id: number) => api.get(`/drivers/${id}`),
  create: (data: any) => api.post('/drivers', data),
  delete: (id: number) => api.delete(`/drivers/${id}`),
};

export const routeApi = {
  getAll: (params?: any) => api.get('/routes', { params }),
  getById: (id: number) => api.get(`/routes/${id}`),
  create: (data: any) => api.post('/routes', data),
  getStudents: (id: number) => api.get(`/routes/${id}/students`),
};

export const attendanceApi = {
  get: (params: any) => api.get('/attendance', { params }),
  checkIn: (data: any) => api.post('/attendance/checkin', data),
};

export const tripApi = {
  getAll: (schoolId: number, date?: string) =>
    api.get('/trips', { params: { schoolId, date } }),
  getActive: (busId: number) => api.get('/trips/active', { params: { busId } }),
  start: (data: any) => api.post('/trips/start', data),
  complete: (id: number, data: any) => api.post(`/trips/${id}/complete`, data),
};

export const notificationApi = {
  getAll: (params?: any) => api.get('/notifications', { params }),
  send: (data: any) => api.post('/notifications/send', data),
  sendEmergency: (data: any) => api.post('/notifications/emergency', data),
};

export default api;
