// ============================================================================
// AUTH FEATURE - Hook de autenticación refactorizado
// ============================================================================

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { LoginRequest } from '@/models/entities';

/**
 * Hook personalizado para manejo de autenticación
 * Principio: Single Responsibility - Solo maneja lógica de auth
 * Patrón: Facade - Simplifica interacción con el store
 */
export const useAuth = () => {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    clearError,
    refreshUser,
  } = useAuthStore();

  // Refrescar datos del usuario al montar el hook
  useEffect(() => {
    if (isAuthenticated && !user) {
      refreshUser();
    }
  }, [isAuthenticated, user, refreshUser]);

  /**
   * Maneja el login con validación adicional
   */
  const handleLogin = async (credentials: LoginRequest) => {
    // Limpiar errores previos
    if (error) {
      clearError();
    }

    // Validaciones client-side
    if (!credentials.email || !credentials.password) {
      return {
        success: false,
        message: 'Email y contraseña son requeridos',
      };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(credentials.email)) {
      return {
        success: false,
        message: 'Formato de email inválido',
      };
    }

    return await login(credentials);
  };

  /**
   * Maneja el logout con limpieza adicional
   */
  const handleLogout = async () => {
    await logout();
    // Aquí se podría agregar lógica adicional como limpiar otros stores
  };

  return {
    // Estado
    user,
    isAuthenticated,
    isLoading,
    error,
    
    // Acciones
    login: handleLogin,
    logout: handleLogout,
    clearError,
    refreshUser,
    
    // Helpers
    isAdmin: user?.role === 'admin',
    isSupervisor: user?.role === 'supervisor',
    userEmail: user?.email,
  };
};