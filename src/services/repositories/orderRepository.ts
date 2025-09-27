// ============================================================================
// ORDER REPOSITORY - Patrón Repository para órdenes de servicio
// ============================================================================

import { IOrderService, IHttpClient } from '../api/interfaces';
import { Order, CreateOrderRequest, AssignOrderRequest, OrderFilters } from '@/models/entities';
import { HttpClientFactory } from '../api/httpClient';
import { mockOrders } from './mockData';

/**
 * Implementación del Repository Pattern para órdenes
 * Principio: Single Responsibility - Solo acceso a datos de órdenes
 */
export class OrderRepository implements IOrderService {
  private httpClient: IHttpClient;
  private readonly STORAGE_KEY = 'telconova-orders';

  constructor(httpClient?: IHttpClient) {
    this.httpClient = httpClient || HttpClientFactory.getInstance();
  }

  /**
   * Obtiene todas las órdenes con filtros
   */
  async getAll(filters?: OrderFilters): Promise<Order[]> {
    try {
      const params = this.buildFilterParams(filters);
      return await this.httpClient.get<Order[]>('/orders', { params });
    } catch (error) {
      return this.getFromLocalStorage(filters);
    }
  }

  /**
   * Obtiene orden por ID
   */
  async getById(id: string): Promise<Order | null> {
    try {
      return await this.httpClient.get<Order>(`/orders/${id}`);
    } catch (error) {
      const orders = this.getFromLocalStorage();
      return orders.find(o => o.id === id) || null;
    }
  }

  /**
   * Crea nueva orden
   */
  async create(order: CreateOrderRequest): Promise<Order> {
    try {
      return await this.httpClient.post<Order>('/orders', order);
    } catch (error) {
      return this.createInLocalStorage(order);
    }
  }

  /**
   * Actualiza orden existente
   */
  async update(id: string, updates: Partial<Order>): Promise<Order> {
    try {
      return await this.httpClient.put<Order>(`/orders/${id}`, updates);
    } catch (error) {
      return this.updateInLocalStorage(id, updates);
    }
  }

  /**
   * Elimina orden
   */
  async delete(id: string): Promise<void> {
    try {
      await this.httpClient.delete(`/orders/${id}`);
    } catch (error) {
      this.deleteFromLocalStorage(id);
    }
  }

  /**
   * Asigna orden a técnico
   */
  async assign(request: AssignOrderRequest): Promise<Order> {
    try {
      return await this.httpClient.post<Order>('/orders/assign', request);
    } catch (error) {
      return this.assignInLocalStorage(request);
    }
  }

  /**
   * Desasigna orden
   */
  async unassign(orderId: string): Promise<Order> {
    try {
      return await this.httpClient.post<Order>(`/orders/${orderId}/unassign`);
    } catch (error) {
      return this.updateInLocalStorage(orderId, { assignedTo: null });
    }
  }

  /**
   * Construye parámetros de filtro
   */
  private buildFilterParams(filters?: OrderFilters): Record<string, any> {
    if (!filters) return {};

    return {
      search: filters.searchTerm,
      zone: filters.zona,
      status: filters.status,
      assigned: filters.assignedOnly,
    };
  }

  /**
   * Obtiene órdenes del localStorage (fallback)
   */
  private getFromLocalStorage(filters?: OrderFilters): Order[] {
    let orders: Order[];
    
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      orders = stored ? JSON.parse(stored) : mockOrders;
    } catch {
      orders = mockOrders;
    }

    return this.applyFilters(orders, filters);
  }

  /**
   * Aplica filtros a las órdenes
   */
  private applyFilters(orders: Order[], filters?: OrderFilters): Order[] {
    if (!filters) return orders;

    return orders.filter(order => {
      // Filtro por búsqueda de texto
      if (filters.searchTerm) {
        const search = filters.searchTerm.toLowerCase();
        return order.id.toLowerCase().includes(search) ||
               order.servicio.toLowerCase().includes(search) ||
               order.descripcion.toLowerCase().includes(search);
      }

      // Filtro por zona
      if (filters.zona && order.zona !== filters.zona) {
        return false;
      }

      // Filtro por estado de asignación
      if (filters.assignedOnly !== undefined) {
        const isAssigned = !!order.assignedTo;
        return filters.assignedOnly ? isAssigned : !isAssigned;
      }

      return true;
    });
  }

  /**
   * Crea orden en localStorage (fallback)
   */
  private createInLocalStorage(orderData: CreateOrderRequest): Order {
    const orders = this.getFromLocalStorage();
    const newId = `O-${1000 + orders.length + 1}`;
    
    const newOrder: Order = {
      ...orderData,
      id: newId,
      creadoEn: new Date().toISOString(),
      assignedTo: null,
    };
    
    orders.push(newOrder);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(orders));
    
    return newOrder;
  }

  /**
   * Actualiza orden en localStorage (fallback)
   */
  private updateInLocalStorage(id: string, updates: Partial<Order>): Order {
    const orders = this.getFromLocalStorage();
    const index = orders.findIndex(o => o.id === id);
    
    if (index === -1) {
      throw new Error(`Orden con ID ${id} no encontrada`);
    }
    
    orders[index] = { ...orders[index], ...updates };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(orders));
    
    return orders[index];
  }

  /**
   * Elimina orden del localStorage (fallback)
   */
  private deleteFromLocalStorage(id: string): void {
    const orders = this.getFromLocalStorage();
    const filtered = orders.filter(o => o.id !== id);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
  }

  /**
   * Asigna orden en localStorage (fallback)
   */
  private assignInLocalStorage(request: AssignOrderRequest): Order {
    const updatedOrder = this.updateInLocalStorage(request.orderId, {
      assignedTo: request.technicianId
    });
    
    // Nota: La actualización de workload del técnico debe manejarse 
    // en la capa de servicio de dominio, no en el repository
    
    return updatedOrder;
  }
}