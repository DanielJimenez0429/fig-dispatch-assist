// ============================================================================
// STRATEGY PATTERN - Estrategias de filtrado y ordenamiento
// ============================================================================

import { Technician, Order, TechnicianFilters, OrderFilters } from '@/models/entities';

/**
 * Interface para estrategias de filtrado
 * Patrón: Strategy - Define familia de algoritmos intercambiables
 */
export interface FilterStrategy<T, F> {
  apply(items: T[], filters: F): T[];
}

/**
 * Estrategia de filtrado para técnicos
 * Principio: Single Responsibility - Solo filtra técnicos
 */
export class TechnicianFilterStrategy implements FilterStrategy<Technician, TechnicianFilters> {
  apply(technicians: Technician[], filters: TechnicianFilters): Technician[] {
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
}

/**
 * Estrategia de filtrado para órdenes
 */
export class OrderFilterStrategy implements FilterStrategy<Order, OrderFilters> {
  apply(orders: Order[], filters: OrderFilters): Order[] {
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
}

/**
 * Interface para estrategias de ordenamiento
 */
export interface SortStrategy<T> {
  sort(items: T[]): T[];
}

/**
 * Estrategia de ordenamiento por carga de trabajo
 * Prioriza técnicos con menor carga
 */
export class WorkloadSortStrategy implements SortStrategy<Technician> {
  sort(technicians: Technician[]): Technician[] {
    return [...technicians].sort((a, b) => a.carga - b.carga);
  }
}

/**
 * Estrategia de ordenamiento por nombre alfabético
 */
export class AlphabeticalSortStrategy implements SortStrategy<Technician> {
  sort(technicians: Technician[]): Technician[] {
    return [...technicians].sort((a, b) => a.nombre.localeCompare(b.nombre));
  }
}

/**
 * Estrategia de ordenamiento por fecha de creación (órdenes)
 */
export class DateSortStrategy implements SortStrategy<Order> {
  constructor(private ascending: boolean = false) {}

  sort(orders: Order[]): Order[] {
    return [...orders].sort((a, b) => {
      const dateA = new Date(a.creadoEn).getTime();
      const dateB = new Date(b.creadoEn).getTime();
      return this.ascending ? dateA - dateB : dateB - dateA;
    });
  }
}

/**
 * Context para aplicar estrategias de filtrado y ordenamiento
 * Patrón: Strategy + Context
 */
export class FilterSortContext<T, F> {
  private filterStrategy?: FilterStrategy<T, F>;
  private sortStrategy?: SortStrategy<T>;

  setFilterStrategy(strategy: FilterStrategy<T, F>): void {
    this.filterStrategy = strategy;
  }

  setSortStrategy(strategy: SortStrategy<T>): void {
    this.sortStrategy = strategy;
  }

  process(items: T[], filters?: F): T[] {
    let result = items;

    // Aplicar filtros si hay estrategia y filtros
    if (this.filterStrategy && filters) {
      result = this.filterStrategy.apply(result, filters);
    }

    // Aplicar ordenamiento si hay estrategia
    if (this.sortStrategy) {
      result = this.sortStrategy.sort(result);
    }

    return result;
  }
}

/**
 * Factory para crear contextos predefinidos
 * Patrón: Factory + Strategy
 */
export class FilterSortFactory {
  static createTechnicianContext(): FilterSortContext<Technician, TechnicianFilters> {
    const context = new FilterSortContext<Technician, TechnicianFilters>();
    context.setFilterStrategy(new TechnicianFilterStrategy());
    context.setSortStrategy(new WorkloadSortStrategy());
    return context;
  }

  static createOrderContext(): FilterSortContext<Order, OrderFilters> {
    const context = new FilterSortContext<Order, OrderFilters>();
    context.setFilterStrategy(new OrderFilterStrategy());
    context.setSortStrategy(new DateSortStrategy()); // Más recientes primero
    return context;
  }
}