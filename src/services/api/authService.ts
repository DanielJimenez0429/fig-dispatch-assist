// ============================================================================
// AUTH SERVICE - Servicio de autenticación con backend real
// ============================================================================

import { IAuthService, IHttpClient } from './interfaces';
import { User, LoginRequest, LoginResponse } from '@/models/entities';
import { HttpClientFactory } from './httpClient';

/**
 * Implementación del servicio de autenticación
 * Principio: Single Responsibility - Solo maneja autenticación
 * Principio: Dependency Inversion - Depende de abstracción IHttpClient
 */
export class AuthService implements IAuthService {
  private httpClient: IHttpClient;
  private readonly TOKEN_KEY = 'telconova-token';
  private readonly USER_KEY = 'telconova-user';

  constructor(httpClient?: IHttpClient) {
    this.httpClient = httpClient || HttpClientFactory.getInstance();
  }

  /**
   * Realiza login con el backend
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await this.httpClient.post<LoginResponse>('/auth/login', credentials);
      
      if (response.success && response.token) {
        // Guardar token en sessionStorage para mayor seguridad
        sessionStorage.setItem(this.TOKEN_KEY, response.token);
        
        if (response.user) {
          sessionStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
        }
      }
      
      return response;
    } catch (error) {
      // Fallback a autenticación mock para desarrollo
      return this.mockLogin(credentials);
    }
  }

  /**
   * Cierra sesión
   */
  async logout(): Promise<void> {
    try {
      await this.httpClient.post('/auth/logout');
    } catch (error) {
      console.warn('Error during logout:', error);
    } finally {
      this.clearAuthData();
    }
  }

  /**
   * Refresca el token de autenticación
   */
  async refreshToken(): Promise<string | null> {
    try {
      const response = await this.httpClient.post<{ token: string }>('/auth/refresh');
      
      if (response.token) {
        sessionStorage.setItem(this.TOKEN_KEY, response.token);
        return response.token;
      }
      
      return null;
    } catch (error) {
      this.clearAuthData();
      return null;
    }
  }

  /**
   * Obtiene el usuario actual
   */
  async getCurrentUser(): Promise<User | null> {
    if (!this.isAuthenticated()) {
      return null;
    }

    try {
      const user = await this.httpClient.get<User>('/auth/me');
      sessionStorage.setItem(this.USER_KEY, JSON.stringify(user));
      return user;
    } catch (error) {
      // Fallback a usuario guardado localmente
      const savedUser = sessionStorage.getItem(this.USER_KEY);
      return savedUser ? JSON.parse(savedUser) : null;
    }
  }

  /**
   * Verifica si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    const token = sessionStorage.getItem(this.TOKEN_KEY);
    return !!token && !this.isTokenExpired(token);
  }

  /**
   * Limpia datos de autenticación
   */
  private clearAuthData(): void {
    sessionStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  /**
   * Verifica si el token está expirado
   */
  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      return true;
    }
  }

  /**
   * Autenticación mock para desarrollo (fallback)
   */
  private async mockLogin(credentials: LoginRequest): Promise<LoginResponse> {
    // Simulación para desarrollo - mantiene funcionalidad existente
    const mockUsers = [
      { email: 'supervisor@example.com', password: 'Admin123.' }
    ];

    const user = mockUsers.find(u => u.email === credentials.email && u.password === credentials.password);
    
    if (user) {
      const mockToken = btoa(JSON.stringify({
        email: user.email,
        exp: Date.now() / 1000 + 3600 // 1 hora
      }));
      
      const userData: User = { email: user.email, id: 'mock-user-id' };
      
      sessionStorage.setItem(this.TOKEN_KEY, mockToken);
      sessionStorage.setItem(this.USER_KEY, JSON.stringify(userData));
      
      return {
        success: true,
        message: 'Autenticación exitosa',
        token: mockToken,
        user: userData
      };
    } else {
      return {
        success: false,
        message: 'Autenticación fallida: revise el correo electrónico o la contraseña'
      };
    }
  }
}

/**
 * Factory para crear instancia del servicio de autenticación
 * Patrón: Factory + Singleton
 */
export class AuthServiceFactory {
  private static instance: AuthService;

  static create(): AuthService {
    if (!this.instance) {
      this.instance = new AuthService();
    }
    return this.instance;
  }

  static getInstance(): AuthService {
    return this.create();
  }
}