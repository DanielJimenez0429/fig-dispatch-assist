// ============================================================================
// AUTH STORE - Estado global de autenticación (Patrón Observer)
// ============================================================================

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { User, LoginRequest } from '@/models/entities';
import { AuthServiceFactory } from '@/services/api/authService';
import { IAuthService } from '@/services/api/interfaces';

/**
 * Interface del estado de autenticación
 * Principio: Interface Segregation - Solo propiedades necesarias
 */
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (credentials: LoginRequest) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  clearError: () => void;
  refreshUser: () => Promise<void>;
}

/**
 * Store de autenticación usando Zustand
 * Patrón: Observer - Notifica cambios automáticamente
 * Principio: Single Responsibility - Solo maneja estado de auth
 */
export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => {
        const authService: IAuthService = AuthServiceFactory.getInstance();

        return {
          // Estado inicial
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,

          // Acción de login
          login: async (credentials: LoginRequest) => {
            set({ isLoading: true, error: null });

            try {
              const result = await authService.login(credentials);
              
              if (result.success) {
                set({ 
                  user: result.user || null, 
                  isAuthenticated: true,
                  isLoading: false 
                });
                return { success: true, message: result.message };
              } else {
                set({ 
                  error: result.message, 
                  isLoading: false 
                });
                return { success: false, message: result.message };
              }
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : 'Error de conexión';
              set({ 
                error: errorMessage, 
                isLoading: false 
              });
              return { success: false, message: errorMessage };
            }
          },

          // Acción de logout
          logout: async () => {
            set({ isLoading: true });

            try {
              await authService.logout();
            } catch (error) {
              console.warn('Error during logout:', error);
            } finally {
              set({ 
                user: null, 
                isAuthenticated: false, 
                isLoading: false,
                error: null 
              });
            }
          },

          // Limpiar errores
          clearError: () => {
            set({ error: null });
          },

          // Refrescar datos del usuario
          refreshUser: async () => {
            if (!authService.isAuthenticated()) {
              set({ user: null, isAuthenticated: false });
              return;
            }

            try {
              const user = await authService.getCurrentUser();
              set({ 
                user, 
                isAuthenticated: !!user 
              });
            } catch (error) {
              console.warn('Failed to refresh user:', error);
              set({ user: null, isAuthenticated: false });
            }
          },
        };
      },
      {
        name: 'telconova-auth-store',
        // Solo persistir datos no sensibles
        partialize: (state) => ({ 
          user: state.user,
          isAuthenticated: state.isAuthenticated 
        }),
      }
    ),
    { name: 'AuthStore' }
  )
);