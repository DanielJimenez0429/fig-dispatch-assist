// ============================================================================
// MODELS - Entidades del dominio (Clean Architecture - Entities Layer)
// ============================================================================

/**
 * Entidad Usuario - Representa un usuario del sistema
 * Principio: Single Responsibility - Solo define la estructura del usuario
 */
export interface User {
  readonly email: string;
  readonly id?: string;
  readonly role?: string;
}

/**
 * Entidad Técnico - Representa un técnico de servicio
 * Principio: Interface Segregation - Solo propiedades necesarias
 */
export interface Technician {
  readonly id: string;
  readonly nombre: string;
  readonly email: string;
  readonly telefono: string;
  readonly zona: Zone;
  readonly especialidad: Specialty;
  readonly carga: WorkLoad;
  readonly disponibilidad: TimeSlot[];
  readonly fotoUrl?: string;
}

/**
 * Entidad Orden - Representa una orden de servicio
 * Principio: Open/Closed - Extensible sin modificar la estructura base
 */
export interface Order {
  readonly id: string;
  readonly zona: Zone;
  readonly creadoEn: string;
  readonly servicio: string;
  readonly descripcion: string;
  readonly assignedTo: string | null;
  readonly status?: OrderStatus;
  readonly priority?: Priority;
}

/**
 * Value Objects - Objetos de valor inmutables
 */
export type Zone = 'zona centro' | 'zona sur' | 'zona norte' | 'zona oeste' | 'zona este';
export type Specialty = 'Eléctrico' | 'Plomería' | 'HVAC' | 'Redes';
export type TimeSlot = '00:00-06:00' | '06:00-12:00' | '12:00-18:00' | '18:00-00:00';
export type WorkLoad = 0 | 1 | 2 | 3 | 4 | 5;
export type OrderStatus = 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';

/**
 * DTOs - Data Transfer Objects para comunicación con API
 */
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
}

export interface CreateOrderRequest {
  zona: Zone;
  servicio: string;
  descripcion: string;
}

export interface CreateTechnicianRequest {
  nombre: string;
  email: string;
  telefono: string;
  zona: Zone;
  especialidad: Specialty;
  carga: WorkLoad;
  disponibilidad: TimeSlot[];
}

export interface AssignOrderRequest {
  orderId: string;
  technicianId: string;
  previousTechnicianId?: string;
}

/**
 * Filtros para búsquedas - Strategy Pattern
 */
export interface TechnicianFilters {
  zonas: Zone[];
  especialidades: Specialty[];
  horarios: TimeSlot[];
  maxCarga: WorkLoad;
  searchTerm?: string;
}

export interface OrderFilters {
  searchTerm?: string;
  zona?: Zone;
  status?: OrderStatus;
  assignedOnly?: boolean;
}

/**
 * Constantes del dominio
 */
export const DOMAIN_CONSTANTS = {
  ZONES: ['zona centro', 'zona sur', 'zona norte', 'zona oeste', 'zona este'] as const,
  SPECIALTIES: ['Eléctrico', 'Plomería', 'HVAC', 'Redes'] as const,
  TIME_SLOTS: ['00:00-06:00', '06:00-12:00', '12:00-18:00', '18:00-00:00'] as const,
  MAX_LOGIN_ATTEMPTS: 3,
  LOCKOUT_DURATION_MS: 15 * 60 * 1000, // 15 minutes
  MAX_WORKLOAD: 5 as WorkLoad,
} as const;