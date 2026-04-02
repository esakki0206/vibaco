import React, { createContext, useState, useCallback, useEffect } from 'react';
import api from '../services/api';
import authApi from '../services/auth';


export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const [loading, setLoading] = useState(false);

  // Fetch logged-in user
  const fetchCurrentUser = useCallback(async () => {
    if (!token) return;

    try {
      const response = await api.get('/auth/me');
      setUser(response.data.user);
    } catch (error) {
      console.error('Failed to fetch user', error);
      logout();
    }
  }, [token]);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  // Login (user OR admin)
  const login = useCallback(async (email, password) => {
    try {
      setLoading(true);

      const response = await api.post('/auth/login', { email, password });
      const { token: newToken, user: newUser } = response.data;

      setToken(newToken);
      setUser(newUser);
      localStorage.setItem('authToken', newToken);

      return { success: true, user: newUser };
    } catch (error) {
      const data = error.response?.data;
      return {
        success: false,
        error: data?.message || 'Invalid email or password',
        isPending: data?.isPending === true
      };
    } finally {
      setLoading(false);
    }
  }, []);

const registerReseller = useCallback(async (formData) => {
  try {
    setLoading(true);

    const response = await authApi.registerReseller(formData);

    return {
      success: response.success,
      message: response.message,
      user: response.user
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Registration failed'
    };
  } finally {
    setLoading(false);
  }
}, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        registerReseller,
        logout,
        isAuthenticated: !!token
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
