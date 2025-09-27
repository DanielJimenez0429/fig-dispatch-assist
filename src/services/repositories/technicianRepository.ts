// ============================================================================
// TECHNICIAN REPOSITORY - Patrón Repository para encapsular acceso a datos
// ============================================================================

import { ITechnicianService, IHttpClient } from '../api/interfaces';
import { Technician, CreateTechnicianRequest, TechnicianFilters } from '@/models/entities';
import { HttpClientFactory } from '../api/httpClient';
import { mockTechnicians } from './mockData';

/**
 * Implementación del Repository Pattern para técnicos
 * Principio: Single Responsibility - Solo acceso a datos de técnicos
 * Principio: Dependency Inversion - Depende de abstracciones
 */
export class TechnicianRepository implements ITechnicianService {
  private httpClient: IHttpClient;
  private readonly STORAGE_KEY = 'telconova-technicians';

  constructor(httpClient?: IHttpClient) {
    this.httpClient = httpClient || HttpClientFactory.getInstance();
  }

  /**
   * Obtiene todos los técnicos con filtros opcionales
   */
  async getAll(filters?: TechnicianFilters): Promise<Technician[]> {
    try {
      const params = this.buildFilterParams(filters);
      return await this.httpClient.get<Technician[]>('/technicians', { params });
    } catch (error) {
      // Fallback a datos locales/mock
      return this.getFromLocalStorage(filters);
    }
  }

  /**
   * Obtiene técnico por ID
   */
  async getById(id: string): Promise<Technician | null> {
    try {
      return await this.httpClient.get<Technician>(`/technicians/${id}`);
    } catch (error) {
      // Fallback a datos locales
      const technicians = this.getFromLocalStorage();
      return technicians.find(t => t.id === id) || null;
    }
  }

  /**
   * Crea nuevo técnico
   */
  async create(technician: CreateTechnicianRequest): Promise<Technician> {
    try {
      return await this.httpClient.post<Technician>('/technicians', technician);
    } catch (error) {
      // Fallback a creación local
      return this.createInLocalStorage(technician);
    }
  }

  /**
   * Actualiza técnico existente
   */
  async update(id: string, updates: Partial<Technician>): Promise<Technician> {
    try {
      return await this.httpClient.put<Technician>(`/technicians/${id}`, updates);
    } catch (error) {
      // Fallback a actualización local
      return this.updateInLocalStorage(id, updates);
    }
  }

  /**
   * Elimina técnico
   */
  async delete(id: string): Promise<void> {
    try {
      await this.httpClient.delete(`/technicians/${id}`);
    } catch (error) {
      // Fallback a eliminación local
      this.deleteFromLocalStorage(id);
    }
  }

  /**
   * Actualiza carga de trabajo del técnico
   */
  async updateWorkload(id: string, workload: number): Promise<void> {
    try {
      await this.httpClient.patch(`/technicians/${id}/workload`, { workload });
    } catch (error) {
      // Fallback a actualización local
      await this.update(id, { carga: workload as any });
    }
  }

  /**
   * Construye parámetros de filtro para la API
   */
  private buildFilterParams(filters?: TechnicianFilters): Record<string, any> {
    if (!filters) return {};

    return {
      zones: filters.zonas.join(','),
      specialties: filters.especialidades.join(','),
      timeSlots: filters.horarios.join(','),
      maxWorkload: filters.maxCarga,
      search: filters.searchTerm,
    };
  }

  /**
   * Obtiene técnicos del localStorage (fallback)
   */
  private getFromLocalStorage(filters?: TechnicianFilters): Technician[] {
    let technicians: Technician[];
    
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      technicians = stored ? JSON.parse(stored) : mockTechnicians;
    } catch {
      technicians = mockTechnicians;
    }

    return this.applyFilters(technicians, filters);
  }

  /**
   * Aplica filtros a la lista de técnicos
   */
  private applyFilters(technicians: Technician[], filters?: TechnicianFilters): Technician[] {
    if (!filters) return technicians;

    return technicians.filter(tech => {
      // Filtro por zonas
      if (filters.zonas.length > 0 && !filters.zonas.includes(tech.zona)) {
        return false;
      }

      // Filtro por especialidades
      if (filters.especialidades.length > 0 && !filters.especialidades.includes(tech.especialidad)) {
        return false;
      }

      // Filtro por horarios
      if (filters.horarios.length > 0 && !tech.disponibilidad.some(h => filters.horarios.includes(h))) {
        return false;
      }

      // Filtro por carga máxima
      if (tech.carga > filters.maxCarga) {
        return false;
      }

      // Filtro por búsqueda de texto
      if (filters.searchTerm) {
        const search = filters.searchTerm.toLowerCase();
        return tech.nombre.toLowerCase().includes(search) ||
               tech.email.toLowerCase().includes(search) ||
               tech.telefono.toLowerCase().includes(search);
      }

      return true;
    });
  }

  /**
   * Crea técnico en localStorage (fallback)
   */
  private createInLocalStorage(technicianData: CreateTechnicianRequest): Technician {
    const technicians = this.getFromLocalStorage();
    const newId = `t${technicians.length + 1}`;
    
    const newTechnician: Technician = {
      ...technicianData,
      id: newId,
    };
    
    technicians.push(newTechnician);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(technicians));
    
    return newTechnician;
  }

  /**
   * Actualiza técnico en localStorage (fallback)
   */
  private updateInLocalStorage(id: string, updates: Partial<Technician>): Technician {
    const technicians = this.getFromLocalStorage();
    const index = technicians.findIndex(t => t.id === id);
    
    if (index === -1) {
      throw new Error(`Técnico con ID ${id} no encontrado`);
    }
    
    technicians[index] = { ...technicians[index], ...updates };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(technicians));
    
    return technicians[index];
  }

  /**
   * Elimina técnico del localStorage (fallback)
   */
  private deleteFromLocalStorage(id: string): void {
    const technicians = this.getFromLocalStorage();
    const filtered = technicians.filter(t => t.id !== id);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
  }
}