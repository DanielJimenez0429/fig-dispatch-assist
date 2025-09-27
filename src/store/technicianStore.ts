// ============================================================================
// TECHNICIAN STORE - Estado global de técnicos
// ============================================================================

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Technician, CreateTechnicianRequest, TechnicianFilters } from '@/models/entities';
import { TechnicianRepository } from '@/services/repositories/technicianRepository';
import { ITechnicianService } from '@/services/api/interfaces';

/**
 * Interface del estado de técnicos
 */
interface TechnicianState {
  technicians: Technician[];
  filteredTechnicians: Technician[];
  selectedTechnician: Technician | null;
  filters: TechnicianFilters;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadTechnicians: () => Promise<void>;
  createTechnician: (data: CreateTechnicianRequest) => Promise<Technician>;
  updateTechnician: (id: string, updates: Partial<Technician>) => Promise<void>;
  deleteTechnician: (id: string) => Promise<void>;
  setFilters: (filters: Partial<TechnicianFilters>) => void;
  clearFilters: () => void;
  selectTechnician: (technician: Technician | null) => void;
  updateWorkload: (id: string, workload: number) => Promise<void>;
  clearError: () => void;
}

/**
 * Store de técnicos
 * Principio: Single Responsibility - Solo maneja estado de técnicos
 */
export const useTechnicianStore = create<TechnicianState>()(
  devtools(
    (set, get) => {
      const technicianService: ITechnicianService = new TechnicianRepository();

      // Filtros iniciales
      const initialFilters: TechnicianFilters = {
        zonas: [],
        especialidades: [],
        horarios: [],
        maxCarga: 5,
        searchTerm: '',
      };

      return {
        // Estado inicial
        technicians: [],
        filteredTechnicians: [],
        selectedTechnician: null,
        filters: initialFilters,
        isLoading: false,
        error: null,

        // Cargar técnicos
        loadTechnicians: async () => {
          set({ isLoading: true, error: null });

          try {
            const { filters } = get();
            const technicians = await technicianService.getAll(filters);
            set({ 
              technicians, 
              filteredTechnicians: technicians,
              isLoading: false 
            });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error cargando técnicos';
            set({ 
              error: errorMessage, 
              isLoading: false 
            });
          }
        },

        // Crear técnico
        createTechnician: async (data: CreateTechnicianRequest) => {
          set({ isLoading: true, error: null });

          try {
            const newTechnician = await technicianService.create(data);
            
            set((state) => ({
              technicians: [...state.technicians, newTechnician],
              filteredTechnicians: [...state.filteredTechnicians, newTechnician],
              isLoading: false
            }));

            return newTechnician;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error creando técnico';
            set({ 
              error: errorMessage, 
              isLoading: false 
            });
            throw error;
          }
        },

        // Actualizar técnico
        updateTechnician: async (id: string, updates: Partial<Technician>) => {
          set({ isLoading: true, error: null });

          try {
            const updatedTechnician = await technicianService.update(id, updates);
            
            set((state) => ({
              technicians: state.technicians.map(t => 
                t.id === id ? updatedTechnician : t
              ),
              filteredTechnicians: state.filteredTechnicians.map(t => 
                t.id === id ? updatedTechnician : t
              ),
              selectedTechnician: state.selectedTechnician?.id === id 
                ? updatedTechnician 
                : state.selectedTechnician,
              isLoading: false
            }));
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error actualizando técnico';
            set({ 
              error: errorMessage, 
              isLoading: false 
            });
          }
        },

        // Eliminar técnico
        deleteTechnician: async (id: string) => {
          set({ isLoading: true, error: null });

          try {
            await technicianService.delete(id);
            
            set((state) => ({
              technicians: state.technicians.filter(t => t.id !== id),
              filteredTechnicians: state.filteredTechnicians.filter(t => t.id !== id),
              selectedTechnician: state.selectedTechnician?.id === id 
                ? null 
                : state.selectedTechnician,
              isLoading: false
            }));
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error eliminando técnico';
            set({ 
              error: errorMessage, 
              isLoading: false 
            });
          }
        },

        // Establecer filtros
        setFilters: (newFilters: Partial<TechnicianFilters>) => {
          const updatedFilters = { ...get().filters, ...newFilters };
          set({ filters: updatedFilters });
          
          // Recargar con nuevos filtros
          get().loadTechnicians();
        },

        // Limpiar filtros
        clearFilters: () => {
          set({ filters: initialFilters });
          get().loadTechnicians();
        },

        // Seleccionar técnico
        selectTechnician: (technician: Technician | null) => {
          set({ selectedTechnician: technician });
        },

        // Actualizar carga de trabajo
        updateWorkload: async (id: string, workload: number) => {
          try {
            await technicianService.updateWorkload(id, workload);
            await get().updateTechnician(id, { carga: workload as any });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error actualizando carga';
            set({ error: errorMessage });
          }
        },

        // Limpiar error
        clearError: () => {
          set({ error: null });
        },
      };
    },
    { name: 'TechnicianStore' }
  )
);