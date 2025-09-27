// ============================================================================
// ORDERS FEATURE - Hook para manejo de órdenes
// ============================================================================

import { useEffect, useCallback } from 'react';
import { useOrderStore } from '@/store/orderStore';
import { useTechnicianStore } from '@/store/technicianStore';
import { CreateOrderRequest, OrderFilters, AssignOrderRequest, Order } from '@/models/entities';
import { CommandFactory, GlobalCommandInvoker } from '@/utils/patterns/commandPattern';
import { OrderRepository } from '@/services/repositories/orderRepository';
import { TechnicianRepository } from '@/services/repositories/technicianRepository';

/**
 * Hook personalizado para manejo de órdenes
 * Principio: Single Responsibility - Solo lógica de órdenes
 * Patrón: Command - Usa comandos para deshacer operaciones
 */
export const useOrders = () => {
  const orderStore = useOrderStore();
  const technicianStore = useTechnicianStore();
  
  const {
    orders,
    pendingOrders,
    assignedOrders,
    selectedOrder,
    filters,
    isLoading,
    error,
    loadOrders,
    createOrder,
    updateOrder,
    deleteOrder,
    assignOrder,
    unassignOrder,
    setFilters,
    clearFilters,
    selectOrder,
    clearError,
  } = orderStore;

  // Servicios para comandos
  const orderService = new OrderRepository();
  const technicianService = new TechnicianRepository();
  const commandInvoker = GlobalCommandInvoker.getInstance();

  // Cargar órdenes al montar el hook
  useEffect(() => {
    if (orders.length === 0 && !isLoading) {
      loadOrders();
    }
  }, [orders.length, isLoading, loadOrders]);

  /**
   * Crea nueva orden con validaciones
   */
  const handleCreateOrder = useCallback(async (data: CreateOrderRequest) => {
    // Validaciones
    if (!data.zona || !data.servicio.trim() || !data.descripcion.trim()) {
      throw new Error('Todos los campos son requeridos');
    }

    if (data.servicio.length < 3) {
      throw new Error('El nombre del servicio debe tener al menos 3 caracteres');
    }

    if (data.descripcion.length < 10) {
      throw new Error('La descripción debe tener al menos 10 caracteres');
    }

    return await createOrder(data);
  }, [createOrder]);

  /**
   * Asigna orden usando Command Pattern
   */
  const handleAssignOrder = useCallback(async (request: AssignOrderRequest) => {
    const order = orders.find(o => o.id === request.orderId);
    if (!order) {
      throw new Error('Orden no encontrada');
    }

    const command = CommandFactory.createAssignOrderCommand(
      orderService,
      technicianService,
      request,
      order
    );

    await commandInvoker.executeCommand(command);
    
    // Recargar datos en ambos stores
    await loadOrders();
    await technicianStore.loadTechnicians();

    return command;
  }, [orders, orderService, technicianService, commandInvoker, loadOrders, technicianStore.loadTechnicians]);

  /**
   * Deshace la última asignación
   */
  const undoLastAssignment = useCallback(async () => {
    const success = await commandInvoker.undo();
    if (success) {
      await loadOrders();
      await technicianStore.loadTechnicians();
    }
    return success;
  }, [commandInvoker, loadOrders, technicianStore.loadTechnicians]);

  /**
   * Busca órdenes con debounce
   */
  const searchOrders = useCallback((searchTerm: string) => {
    const timeoutId = setTimeout(() => {
      setFilters({ searchTerm });
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [setFilters]);

  /**
   * Obtiene órdenes por zona
   */
  const getOrdersByZone = useCallback((zona: string) => {
    return orders.filter(order => order.zona === zona);
  }, [orders]);

  /**
   * Obtiene órdenes asignadas a un técnico
   */
  const getOrdersByTechnician = useCallback((technicianId: string) => {
    return assignedOrders.filter(order => order.assignedTo === technicianId);
  }, [assignedOrders]);

  /**
   * Verifica si una orden puede ser asignada
   */
  const canAssignOrder = useCallback((orderId: string, technicianId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return false;

    const technician = technicianStore.technicians.find(t => t.id === technicianId);
    return technician ? technician.carga < 5 : false;
  }, [orders, technicianStore.technicians]);

  /**
   * Obtiene estadísticas de órdenes
   */
  const getStats = useCallback(() => {
    const total = orders.length;
    const pending = pendingOrders.length;
    const assigned = assignedOrders.length;
    const completionRate = total > 0 ? Math.round((assigned / total) * 100) : 0;

    // Estadísticas por zona
    const zoneStats = orders.reduce((acc, order) => {
      const zona = order.zona;
      if (!acc[zona]) {
        acc[zona] = { total: 0, pending: 0, assigned: 0 };
      }
      acc[zona].total++;
      if (order.assignedTo) {
        acc[zona].assigned++;
      } else {
        acc[zona].pending++;
      }
      return acc;
    }, {} as Record<string, { total: number; pending: number; assigned: number }>);

    return {
      total,
      pending,
      assigned,
      completionRate,
      zoneStats,
    };
  }, [orders, pendingOrders, assignedOrders]);

  /**
   * Obtiene órdenes urgentes (creadas hace más de 24h sin asignar)
   */
  const getUrgentOrders = useCallback(() => {
    const now = new Date().getTime();
    const dayInMs = 24 * 60 * 60 * 1000;

    return pendingOrders.filter(order => {
      const createdTime = new Date(order.creadoEn).getTime();
      return (now - createdTime) > dayInMs;
    });
  }, [pendingOrders]);

  return {
    // Estado
    orders,
    pendingOrders,
    assignedOrders,
    selectedOrder,
    filters,
    isLoading,
    error,
    
    // Acciones básicas
    createOrder: handleCreateOrder,
    updateOrder,
    deleteOrder,
    selectOrder,
    clearError,
    
    // Asignaciones con Command Pattern
    assignOrder: handleAssignOrder,
    unassignOrder,
    undoLastAssignment,
    canUndo: commandInvoker.canUndo(),
    lastCommandDescription: commandInvoker.getLastCommandDescription(),
    
    // Filtros y búsqueda
    setFilters,
    clearFilters,
    searchOrders,
    
    // Queries y helpers
    getOrdersByZone,
    getOrdersByTechnician,
    canAssignOrder,
    getStats,
    getUrgentOrders,
    
    // Estado computado
    hasFilters: Object.values(filters).some(value => !!value),
    isEmpty: orders.length === 0,
    hasPendingOrders: pendingOrders.length > 0,
    hasUrgentOrders: useCallback(() => getUrgentOrders().length > 0, [getUrgentOrders])(),
    
    // Acciones de UI
    refresh: loadOrders,
  };
};