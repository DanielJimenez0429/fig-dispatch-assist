// ============================================================================
// API INTERFACES - Abstracciones para servicios (Dependency Inversion Principle)
// ============================================================================

import {
  User,
  Technician,
  Order,
  LoginRequest,
  LoginResponse,
  CreateOrderRequest,
  CreateTechnicianRequest,
  AssignOrderRequest,
  TechnicianFilters,
  OrderFilters
} from '@/models/entities';

/**
 * Interface para servicio de autenticación
 * Principio: Interface Segregation - Solo métodos de auth
 */
export interface IAuthService {
  login(credentials: LoginRequest): Promise<LoginResponse>;
  logout(): Promise<void>;
  refreshToken(): Promise<string | null>;
  getCurrentUser(): Promise<User | null>;
  isAuthenticated(): boolean;
}

/**
 * Interface para servicio de técnicos
 * Principio: Single Responsibility - Solo operaciones de técnicos
 */
export interface ITechnicianService {
  getAll(filters?: TechnicianFilters): Promise<Technician[]>;
  getById(id: string): Promise<Technician | null>;
  create(technician: CreateTechnicianRequest): Promise<Technician>;
  update(id: string, updates: Partial<Technician>): Promise<Technician>;
  delete(id: string): Promise<void>;
  updateWorkload(id: string, workload: number): Promise<void>;
}

/**
 * Interface para servicio de órdenes
 * Principio: Open/Closed - Extensible para nuevos tipos de órdenes
 */
export interface IOrderService {
  getAll(filters?: OrderFilters): Promise<Order[]>;
  getById(id: string): Promise<Order | null>;
  create(order: CreateOrderRequest): Promise<Order>;
  update(id: string, updates: Partial<Order>): Promise<Order>;
  delete(id: string): Promise<void>;
  assign(request: AssignOrderRequest): Promise<Order>;
  unassign(orderId: string): Promise<Order>;
}

/**
 * Interface para manejo de errores de API
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

/**
 * Interface para respuestas paginadas
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Interface para configuración de HTTP client
 */
export interface HttpClientConfig {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
  withCredentials?: boolean;
}

/**
 * Interface para el cliente HTTP
 * Principio: Dependency Inversion - Abstracción del cliente HTTP
 */
export interface IHttpClient {
  get<T>(url: string, config?: RequestConfig): Promise<T>;
  post<T>(url: string, data?: any, config?: RequestConfig): Promise<T>;
  put<T>(url: string, data?: any, config?: RequestConfig): Promise<T>;
  patch<T>(url: string, data?: any, config?: RequestConfig): Promise<T>;
  delete<T>(url: string, config?: RequestConfig): Promise<T>;
}

export interface RequestConfig {
  headers?: Record<string, string>;
  params?: Record<string, any>;
  timeout?: number;
}