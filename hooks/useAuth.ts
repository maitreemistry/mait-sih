import { useCallback, useState } from 'react';
import { authService } from '../services/api/auth.service';
import type { AuthResponse, FarmerRegistrationData, LoginCredentials, User } from '../types/auth.types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (credentials: LoginCredentials): Promise<AuthResponse> => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.login(credentials);
      if (response.success && response.user) {
        setUser(response.user);
        setIsAuthenticated(true);
      } else {
        setError(response.message || 'Login failed');
      }
      return response;
    } catch (err) {
      setError((err as Error).message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const registerFarmer = useCallback(async (data: FarmerRegistrationData): Promise<AuthResponse> => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.registerFarmer(data);
      if (response.success && response.user) {
        setUser(response.user);
        setIsAuthenticated(true);
      } else {
        setError(response.message || 'Registration failed');
      }
      return response;
    } catch (err) {
      setError((err as Error).message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    logout,
    registerFarmer,
  };
};
