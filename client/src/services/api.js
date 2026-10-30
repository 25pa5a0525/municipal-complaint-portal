import axios from 'axios';

// Configure Axios instance
// In development, Vite proxies '/api' to 'http://localhost:5000'
// In production, the backend serves the frontend from the same origin
const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Citizen Public API
export const getComplaintStats = async () => {
  const response = await api.get('/complaints/stats');
  return response.data;
};

export const registerComplaint = async (complaintData) => {
  const response = await api.post('/complaints', complaintData);
  return response.data;
};

export const trackComplaintById = async (trackingId) => {
  const response = await api.get(`/complaints/track/${encodeURIComponent(trackingId)}`);
  return response.data;
};

// Administrator API
export const loginAdmin = async (credentials) => {
  const response = await api.post('/admin/login', credentials);
  return response.data;
};

export const logoutAdmin = async () => {
  const response = await api.post('/admin/logout');
  return response.data;
};

export const checkAdminAuth = async () => {
  const response = await api.get('/admin/me');
  return response.data;
};

export const getAdminDashboard = async () => {
  const response = await api.get('/admin/dashboard');
  return response.data;
};

export const getAdminComplaints = async (filters = {}) => {
  const response = await api.get('/admin/complaints', { params: filters });
  return response.data;
};

export const getAdminComplaintDetails = async (id) => {
  const response = await api.get(`/admin/complaints/${id}`);
  return response.data;
};

export const updateComplaintStatus = async (id, payload) => {
  const response = await api.patch(`/admin/complaints/${id}/status`, payload);
  return response.data;
};

export default api;
