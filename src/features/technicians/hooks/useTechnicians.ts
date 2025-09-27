// ============================================================================
// TECHNICIANS FEATURE - Hook para manejo de técnicos
// ============================================================================

import { useEffect, useCallback } from 'react';
import { useTechnicianStore } from '@/store/technicianStore';
import { CreateTechnicianRequest, TechnicianFilters } from '@/models/entities';
import { FilterSortFactory } from '@/utils/patterns/strategyPattern';

/**
 * Hook personalizado para manejo de técnicos
 * Principio: Single Responsibility - Solo lógica de técnicos
 * Patrón: Strategy - Usa estrategias de filtrado
 */
export const useTechnicians = () => {
  const {
    technicians,
    filteredTechnicians,
    selectedTechnician,
    filters,
    isLoading,
    error,
    loadTechnicians,
    createTechnician,
    updateTechnician,
    deleteTechnician,
    setFilters,
    clearFilters,
    selectTechnician,
    updateWorkload,
    clearError,
  } = useTechnicianStore();

  // Cargar técnicos al montar el hook
  useEffect(() => {
    if (technicians.length === 0 && !isLoading) {
      loadTechnicians();
    }
  }, [technicians.length, isLoading, loadTechnicians]);

  /**
   * Crea nuevo técnico con validaciones
   */
  const handleCreateTechnician = useCallback(async (data: CreateTechnicianRequest) => {
    // Validaciones adicionales
    if (!data.nombre.trim()) {
      throw new Error('El nombre es requerido');
    }

    if (!data.email || !data.email.includes('@')) {
      throw new Error('Email inválido');
    }

    if (!data.telefono.trim()) {
      throw new Error('El teléfono es requerido');
    }

    if (!data.zona || !data.especialidad) {
      throw new Error('Zona y especialidad son requeridos');
    }

    if (data.disponibilidad.length === 0) {
      throw new Error('Debe seleccionar al menos un horario');
    }

    return await createTechnician(data);
  }, [createTechnician]);

  /**
   * Aplica filtros con estrategia
   */
  const applyFilters = useCallback((newFilters: Partial<TechnicianFilters>) => {
    setFilters(newFilters);
  }, [setFilters]);

  /**
   * Busca técnicos con debounce
   */
  const searchTechnicians = useCallback((searchTerm: string) => {
    const timeoutId = setTimeout(() => {
      applyFilters({ searchTerm });
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [applyFilters]);

  /**
   * Obtiene técnicos disponibles (carga < 5)
   */
  const availableTechnicians = useCallback(() => {
    return filteredTechnicians.filter(tech => tech.carga < 5);
  }, [filteredTechnicians]);

  /**
   * Obtiene técnicos por zona
   */
  const getTechniciansByZone = useCallback((zona: string) => {
    return filteredTechnicians.filter(tech => tech.zona === zona);
  }, [filteredTechnicians]);

  /**
   * Obtiene técnicos por especialidad
   */
  const getTechniciansBySpecialty = useCallback((especialidad: string) => {
    return filteredTechnicians.filter(tech => tech.especialidad === especialidad);
  }, [filteredTechnicians]);

  /**
   * Verifica si un técnico está disponible
   */
  const isTechnicianAvailable = useCallback((technicianId: string) => {
    const tech = technicians.find(t => t.id === technicianId);
    return tech ? tech.carga < 5 : false;
  }, [technicians]);

  /**
   * Obtiene estadísticas de técnicos
   */
  const getStats = useCallback(() => {
    const total = technicians.length;
    const available = technicians.filter(t => t.carga < 5).length;
    const busy = technicians.filter(t => t.carga >= 4).length;
    const idle = technicians.filter(t => t.carga === 0).length;

    return {
      total,
      available,
      busy,
      idle,
      utilization: total > 0 ? Math.round(((total - available) / total) * 100) : 0,
    };
  }, [technicians]);

  return {
    // Estado
    technicians: filteredTechnicians,
    allTechnicians: technicians,
    selectedTechnician,
    filters,
    isLoading,
    error,
    
    // Acciones básicas
    createTechnician: handleCreateTechnician,
    updateTechnician,
    deleteTechnician,
    selectTechnician,
    updateWorkload,
    clearError,
    
    // Filtros y búsqueda
    setFilters: applyFilters,
    clearFilters,
    searchTechnicians,
    
    // Helpers y queries
    availableTechnicians,
    getTechniciansByZone,
    getTechniciansBySpecialty,
    isTechnicianAvailable,
    getStats,
    
    // Estado computado
    hasFilters: Object.values(filters).some(value => 
      Array.isArray(value) ? value.length > 0 : !!value
    ),
    isEmpty: filteredTechnicians.length === 0,
    
    // Acciones de UI
    refresh: loadTechnicians,
  };
};