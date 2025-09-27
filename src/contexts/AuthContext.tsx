// ============================================================================
// AUTH CONTEXT - Refactorizado para usar nueva arquitectura
// ============================================================================

import React, { createContext, useContext } from 'react';
import { useAuth as useAuthHook } from '@/features/auth/hooks/useAuth';

// Mantenemos compatibilidad con la API existente
const AuthContext = createContext<ReturnType<typeof useAuthHook> | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const authHook = useAuthHook();
  
  return (
    <AuthContext.Provider value={authHook}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}