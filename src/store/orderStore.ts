// ============================================================================
// ORDER STORE - Estado global de órdenes de servicio
// ============================================================================

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Order, CreateOrderRequest, AssignOrderRequest, OrderFilters } from '@/models/entities';
import { OrderRepository } from '@/services/repositories/orderRepository';
import { IOrderService } from '@/services/api/interfaces';

/**
 * Interface del estado de órdenes
 */
interface OrderState {
  orders: Order[];
  pendingOrders: Order[];
  assignedOrders: Order[];
  selectedOrder: Order | null;
  filters: OrderFilters;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadOrders: () => Promise<void>;
  createOrder: (data: CreateOrderRequest) => Promise<Order>;
  updateOrder: (id: string, updates: Partial<Order>) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  assignOrder: (request: AssignOrderRequest) => Promise<void>;
  unassignOrder: (orderId: string) => Promise<void>;
  setFilters: (filters: Partial<OrderFilters>) => void;
  clearFilters: () => void;
  selectOrder: (order: Order | null) => void;
  clearError: () => void;
}

/**
 * Store de órdenes
 * Principio: Single Responsibility - Solo maneja estado de órdenes
 */
export const useOrderStore = create<OrderState>()(
  devtools(
    (set, get) => {
      const orderService: IOrderService = new OrderRepository();

      // Filtros iniciales
      const initialFilters: OrderFilters = {
        searchTerm: '',
      };

      // Función helper para separar órdenes
      const separateOrders = (orders: Order[]) => {
        const pending = orders.filter(order => !order.assignedTo);
        const assigned = orders.filter(order => order.assignedTo);
        return { pending, assigned };
      };

      return {
        // Estado inicial
        orders: [],
        pendingOrders: [],
        assignedOrders: [],
        selectedOrder: null,
        filters: initialFilters,
        isLoading: false,
        error: null,

        // Cargar órdenes
        loadOrders: async () => {
          set({ isLoading: true, error: null });

          try {
            const { filters } = get();
            const orders = await orderService.getAll(filters);
            const { pending, assigned } = separateOrders(orders);

            set({ 
              orders,
              pendingOrders: pending,
              assignedOrders: assigned,
              isLoading: false 
            });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error cargando órdenes';
            set({ 
              error: errorMessage, 
              isLoading: false 
            });
          }
        },

        // Crear orden
        createOrder: async (data: CreateOrderRequest) => {
          set({ isLoading: true, error: null });

          try {
            const newOrder = await orderService.create(data);
            
            set((state) => {
              const updatedOrders = [...state.orders, newOrder];
              const { pending, assigned } = separateOrders(updatedOrders);
              
              return {
                orders: updatedOrders,
                pendingOrders: pending,
                assignedOrders: assigned,
                isLoading: false
              };
            });

            return newOrder;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error creando orden';
            set({ 
              error: errorMessage, 
              isLoading: false 
            });
            throw error;
          }
        },

        // Actualizar orden
        updateOrder: async (id: string, updates: Partial<Order>) => {
          set({ isLoading: true, error: null });

          try {
            const updatedOrder = await orderService.update(id, updates);
            
            set((state) => {
              const updatedOrders = state.orders.map(o => 
                o.id === id ? updatedOrder : o
              );
              const { pending, assigned } = separateOrders(updatedOrders);
              
              return {
                orders: updatedOrders,
                pendingOrders: pending,
                assignedOrders: assigned,
                selectedOrder: state.selectedOrder?.id === id 
                  ? updatedOrder 
                  : state.selectedOrder,
                isLoading: false
              };
            });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error actualizando orden';
            set({ 
              error: errorMessage, 
              isLoading: false 
            });
          }
        },

        // Eliminar orden
        deleteOrder: async (id: string) => {
          set({ isLoading: true, error: null });

          try {
            await orderService.delete(id);
            
            set((state) => {
              const updatedOrders = state.orders.filter(o => o.id !== id);
              const { pending, assigned } = separateOrders(updatedOrders);
              
              return {
                orders: updatedOrders,
                pendingOrders: pending,
                assignedOrders: assigned,
                selectedOrder: state.selectedOrder?.id === id 
                  ? null 
                  : state.selectedOrder,
                isLoading: false
              };
            });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error eliminando orden';
            set({ 
              error: errorMessage, 
              isLoading: false 
            });
          }
        },

        // Asignar orden
        assignOrder: async (request: AssignOrderRequest) => {
          set({ isLoading: true, error: null });

          try {
            await orderService.assign(request);
            
            // Recargar órdenes para reflejar cambios
            await get().loadOrders();
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error asignando orden';
            set({ 
              error: errorMessage, 
              isLoading: false 
            });
            throw error;
          }
        },

        // Desasignar orden
        unassignOrder: async (orderId: string) => {
          set({ isLoading: true, error: null });

          try {
            await orderService.unassign(orderId);
            
            // Recargar órdenes para reflejar cambios
            await get().loadOrders();
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desasignando orden';
            set({ 
              error: errorMessage, 
              isLoading: false 
            });
          }
        },

        // Establecer filtros
        setFilters: (newFilters: Partial<OrderFilters>) => {
          const updatedFilters = { ...get().filters, ...newFilters };
          set({ filters: updatedFilters });
          
          // Recargar con nuevos filtros
          get().loadOrders();
        },

        // Limpiar filtros
        clearFilters: () => {
          set({ filters: initialFilters });
          get().loadOrders();
        },

        // Seleccionar orden
        selectOrder: (order: Order | null) => {
          set({ selectedOrder: order });
        },

        // Limpiar error
        clearError: () => {
          set({ error: null });
        },
      };
    },
    { name: 'OrderStore' }
  )
);