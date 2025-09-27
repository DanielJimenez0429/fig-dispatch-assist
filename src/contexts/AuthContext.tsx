import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockUsers } from '@/utils/mockData';
import { 
  recordFailedAttempt, 
  clearLoginAttempts, 
  isAccountBlocked, 
  formatBlockTime 
} from '@/utils/auth';

interface User {
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string; }>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('telconova-user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // Check if account is blocked
    const { blocked, unblockTime } = isAccountBlocked(email);
    if (blocked && unblockTime) {
      return {
        success: false,
        message: `Cuenta temporalmente bloqueada. Intente de nuevo a las ${formatBlockTime(unblockTime)}`
      };
    }

    // Validate credentials
    const validUser = mockUsers.find(u => u.email === email && u.password === password);
    
    if (validUser) {
      // Successful login
      const userData = { email };
      setUser(userData);
      localStorage.setItem('telconova-user', JSON.stringify(userData));
      clearLoginAttempts(email);
      
      return {
        success: true,
        message: 'Autenticación exitosa'
      };
    } else {
      // Failed login
      const attempts = recordFailedAttempt(email);
      
      if (attempts.blockedUntil) {
        return {
          success: false,
          message: `Cuenta temporalmente bloqueada. Intente de nuevo a las ${formatBlockTime(new Date(attempts.blockedUntil))}`
        };
      } else {
        const remainingAttempts = 3 - attempts.count;
        return {
          success: false,
          message: `Autenticación fallida: revise el correo electrónico o la contraseña. Intentos restantes: ${remainingAttempts}`
        };
      }
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('telconova-user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
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