import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return {
    user: context.user,
    token: context.token,
    loading: context.loading,
    login: context.login,
    logout: context.logout,
    isAuthenticated: !!context.token,
    isAdmin: context.user?.role === 'admin'
  };
};
