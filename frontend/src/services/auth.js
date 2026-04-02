import api from './api';

export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

// --- FIX: Removed '/api' prefix here ---
export const registerReseller = async (resellerData) => {
  const response = await api.post('/auth/register-reseller', resellerData);
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const updateProfile = async (userData) => {
  const response = await api.put('/auth/profile', userData);
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('authToken');
};

export const authApi = {
  register,
  login,
  logout,
  getCurrentUser,
  updateProfile,
  registerReseller
};

export default authApi;