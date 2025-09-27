// ============================================================================
// ASSIGNMENTS FEATURE - Hook para manejo de asignaciones
// ============================================================================

import { useCallback } from 'react';
import { useOrders } from '@/features/orders/hooks/useOrders';
import { useTechnicians } from '@/features/technicians/hooks/useTechnicians';
import { AssignOrderRequest, Technician, Order } from '@/models/entities';

/**
 * Hook personalizado para manejo de asignaciones
 * Principio: Single Responsibility - Solo lógica de asignaciones
 * Combina funcionalidad de órdenes y técnicos
 */
export const useAssignments = () => {
  const orderHook = useOrders();
  const technicianHook = useTechnicians();

  /**
   * Encuentra el mejor técnico para una orden
   * Algoritmo: menor carga + misma zona + especialidad compatible
   */
  const findBestTechnician = useCallback((order: Order): Technician | null => {
    const availableTechnicians = technicianHook.availableTechnicians();
    
    if (availableTechnicians.length === 0) {
      return null;
    }

    // Filtrar por zona si es posible
    const sameZoneTechnicians = availableTechnicians.filter(
      tech => tech.zona === order.zona
    );

    // Usar técnicos de la misma zona si están disponibles
    const candidates = sameZoneTechnicians.length > 0 
      ? sameZoneTechnicians 
      : availableTechnicians;

    // Ordenar por carga de trabajo (menor primero)
    const sorted = candidates.sort((a, b) => a.carga - b.carga);

    return sorted[0] || null;
  }, [technicianHook.availableTechnicians]);

  /**
   * Asigna automáticamente la mejor combinación
   */
  const autoAssign = useCallback(async (orderId: string): Promise<boolean> => {
    const order = orderHook.orders.find(o => o.id === orderId);
    if (!order || order.assignedTo) {
      return false;
    }

    const bestTechnician = findBestTechnician(order);
    if (!bestTechnician) {
      return false;
    }

    const request: AssignOrderRequest = {
      orderId: order.id,
      technicianId: bestTechnician.id,
    };

    try {
      await orderHook.assignOrder(request);
      return true;
    } catch (error) {
      console.error('Auto-assignment failed:', error);
      return false;
    }
  }, [orderHook.orders, orderHook.assignOrder, findBestTechnician]);

  /**
   * Asigna automáticamente todas las órdenes pendientes
   */
  const autoAssignAll = useCallback(async (): Promise<{
    success: number;
    failed: number;
    results: Array<{ orderId: string; success: boolean; reason?: string }>
  }> => {
    const pendingOrders = orderHook.pendingOrders;
    const results: Array<{ orderId: string; success: boolean; reason?: string }> = [];
    
    let success = 0;
    let failed = 0;

    for (const order of pendingOrders) {
      try {
        const assigned = await autoAssign(order.id);
        if (assigned) {
          success++;
          results.push({ orderId: order.id, success: true });
        } else {
          failed++;
          results.push({ 
            orderId: order.id, 
            success: false, 
            reason: 'No hay técnicos disponibles' 
          });
        }
      } catch (error) {
        failed++;
        results.push({ 
          orderId: order.id, 
          success: false, 
          reason: error instanceof Error ? error.message : 'Error desconocido'
        });
      }
    }

    return { success, failed, results };
  }, [orderHook.pendingOrders, autoAssign]);

  /**
   * Obtiene recomendaciones de técnicos para una orden
   */
  const getRecommendations = useCallback((order: Order): Array<{
    technician: Technician;
    score: number;
    reasons: string[];
  }> => {
    const availableTechnicians = technicianHook.availableTechnicians();
    
    return availableTechnicians.map(technician => {
      let score = 0;
      const reasons: string[] = [];

      // Puntuación por carga de trabajo (menor es mejor)
      const workloadScore = (5 - technician.carga) * 20;
      score += workloadScore;
      reasons.push(`Carga: ${technician.carga}/5`);

      // Bonificación por misma zona
      if (technician.zona === order.zona) {
        score += 30;
        reasons.push('Misma zona');
      }

      // Bonificación por especialidad (heurística simple)
      const serviceType = order.servicio.toLowerCase();
      if (
        (technician.especialidad === 'Eléctrico' && serviceType.includes('eléctric')) ||
        (technician.especialidad === 'Plomería' && (serviceType.includes('plomer') || serviceType.includes('cañer') || serviceType.includes('fuga'))) ||
        (technician.especialidad === 'HVAC' && (serviceType.includes('hvac') || serviceType.includes('climat'))) ||
        (technician.especialidad === 'Redes' && (serviceType.includes('red') || serviceType.includes('config')))
      ) {
        score += 25;
        reasons.push('Especialidad compatible');
      }

      return {
        technician,
        score,
        reasons,
      };
    }).sort((a, b) => b.score - a.score);
  }, [technicianHook.availableTechnicians]);

  /**
   * Verifica conflictos de asignación
   */
  const checkConflicts = useCallback((technicianId: string, orderId: string): Array<{
    type: 'workload' | 'zone' | 'specialty';
    severity: 'warning' | 'error';
    message: string;
  }> => {
    const technician = technicianHook.allTechnicians.find(t => t.id === technicianId);
    const order = orderHook.orders.find(o => o.id === orderId);
    
    const conflicts: Array<{
      type: 'workload' | 'zone' | 'specialty';
      severity: 'warning' | 'error';
      message: string;
    }> = [];

    if (!technician || !order) {
      return conflicts;
    }

    // Verificar carga de trabajo
    if (technician.carga >= 5) {
      conflicts.push({
        type: 'workload',
        severity: 'error',
        message: 'El técnico tiene la carga máxima (5/5)',
      });
    } else if (technician.carga >= 4) {
      conflicts.push({
        type: 'workload',
        severity: 'warning',
        message: 'El técnico tiene alta carga de trabajo (4/5)',
      });
    }

    // Verificar zona
    if (technician.zona !== order.zona) {
      conflicts.push({
        type: 'zone',
        severity: 'warning',
        message: `Técnico en ${technician.zona}, orden en ${order.zona}`,
      });
    }

    return conflicts;
  }, [technicianHook.allTechnicians, orderHook.orders]);

  /**
   * Obtiene estadísticas de asignaciones
   */
  const getAssignmentStats = useCallback(() => {
    const orderStats = orderHook.getStats();
    const technicianStats = technicianHook.getStats();

    return {
      efficiency: {
        assignmentRate: orderStats.completionRate,
        technicianUtilization: technicianStats.utilization,
      },
      workload: {
        averageWorkload: technicianStats.total > 0 
          ? technicianHook.allTechnicians.reduce((sum, t) => sum + t.carga, 0) / technicianStats.total 
          : 0,
        overloadedTechnicians: technicianHook.allTechnicians.filter(t => t.carga >= 4).length,
        idleTechnicians: technicianStats.idle,
      },
      distribution: orderStats.zoneStats,
    };
  }, [orderHook.getStats, technicianHook.getStats, technicianHook.allTechnicians]);

  return {
    // Acciones de asignación
    autoAssign,
    autoAssignAll,
    assignOrder: orderHook.assignOrder,
    unassignOrder: orderHook.unassignOrder,
    
    // Recomendaciones y análisis
    findBestTechnician,
    getRecommendations,
    checkConflicts,
    
    // Estadísticas
    getAssignmentStats,
    
    // Estado de órdenes y técnicos
    orders: orderHook.orders,
    pendingOrders: orderHook.pendingOrders,
    assignedOrders: orderHook.assignedOrders,
    technicians: technicianHook.technicians,
    availableTechnicians: technicianHook.availableTechnicians,
    
    // Comandos
    canUndo: orderHook.canUndo,
    undoLastAssignment: orderHook.undoLastAssignment,
    lastCommandDescription: orderHook.lastCommandDescription,
    
    // Estado de carga
    isLoading: orderHook.isLoading || technicianHook.isLoading,
    error: orderHook.error || technicianHook.error,
  };
};