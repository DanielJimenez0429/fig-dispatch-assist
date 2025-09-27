// ============================================================================
// HTTP CLIENT - Implementación concreta del cliente HTTP
// ============================================================================

import { IHttpClient, RequestConfig, HttpClientConfig, ApiError } from './interfaces';

/**
 * Cliente HTTP usando fetch API
 * Principio: Single Responsibility - Solo maneja comunicación HTTP
 */
export class HttpClient implements IHttpClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  private timeout: number;

  constructor(config: HttpClientConfig) {
    this.baseURL = config.baseURL;
    this.timeout = config.timeout || 10000;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...config.headers,
    };
  }

  /**
   * Realiza petición GET
   */
  async get<T>(url: string, config?: RequestConfig): Promise<T> {
    return this.request<T>('GET', url, undefined, config);
  }

  /**
   * Realiza petición POST
   */
  async post<T>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>('POST', url, data, config);
  }

  /**
   * Realiza petición PUT
   */
  async put<T>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>('PUT', url, data, config);
  }

  /**
   * Realiza petición PATCH
   */
  async patch<T>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>('PATCH', url, data, config);
  }

  /**
   * Realiza petición DELETE
   */
  async delete<T>(url: string, config?: RequestConfig): Promise<T> {
    return this.request<T>('DELETE', url, undefined, config);
  }

  /**
   * Método privado para realizar peticiones HTTP
   */
  private async request<T>(
    method: string,
    url: string,
    data?: any,
    config?: RequestConfig
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const headers = {
        ...this.defaultHeaders,
        ...config?.headers,
      };

      // Agregar token de autenticación si existe
      const token = this.getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const fullUrl = this.buildUrl(url, config?.params);
      
      const response = await fetch(fullUrl, {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw await this.handleErrorResponse(response);
      }

      // Manejar respuesta vacía
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        return {} as T;
      }

      return response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      
      throw error;
    }
  }

  /**
   * Construye URL completa con parámetros
   */
  private buildUrl(endpoint: string, params?: Record<string, any>): string {
    const url = new URL(endpoint, this.baseURL);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    
    return url.toString();
  }

  /**
   * Maneja errores de respuesta HTTP
   */
  private async handleErrorResponse(response: Response): Promise<ApiError> {
    let errorData: any;
    
    try {
      errorData = await response.json();
    } catch {
      errorData = { message: response.statusText };
    }

    const apiError: ApiError = {
      code: String(response.status),
      message: errorData.message || `HTTP ${response.status}: ${response.statusText}`,
      details: errorData,
    };

    return apiError;
  }

  /**
   * Obtiene token de autenticación del storage
   */
  private getAuthToken(): string | null {
    // Primero intenta sessionStorage, luego localStorage
    return sessionStorage.getItem('telconova-token') || 
           localStorage.getItem('telconova-token');
  }

  /**
   * Actualiza headers por defecto (útil para tokens)
   */
  updateDefaultHeaders(headers: Record<string, string>): void {
    this.defaultHeaders = { ...this.defaultHeaders, ...headers };
  }
}

/**
 * Factory para crear instancia del cliente HTTP
 * Patrón: Factory - Encapsula creación del cliente
 */
export class HttpClientFactory {
  private static instance: HttpClient;

  static create(config?: Partial<HttpClientConfig>): HttpClient {
    const defaultConfig: HttpClientConfig = {
      baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
      timeout: 10000,
      withCredentials: true,
    };

    const finalConfig = { ...defaultConfig, ...config };
    
    if (!this.instance) {
      this.instance = new HttpClient(finalConfig);
    }

    return this.instance;
  }

  static getInstance(): HttpClient {
    if (!this.instance) {
      return this.create();
    }
    return this.instance;
  }
}