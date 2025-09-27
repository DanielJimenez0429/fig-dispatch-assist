// ============================================================================
// COMMAND PATTERN - Comandos para asignación de órdenes con deshacer
// ============================================================================

import { Order, Technician, AssignOrderRequest } from '@/models/entities';
import { IOrderService, ITechnicianService } from '@/services/api/interfaces';

/**
 * Interface base para comandos
 * Patrón: Command - Encapsula operaciones como objetos
 */
export interface Command {
  execute(): Promise<void>;
  undo(): Promise<void>;
  getDescription(): string;
}

/**
 * Comando para asignar orden a técnico
 * Principio: Single Responsibility - Solo maneja asignación
 */
export class AssignOrderCommand implements Command {
  private originalTechnicianId: string | null;
  
  constructor(
    private orderService: IOrderService,
    private technicianService: ITechnicianService,
    private request: AssignOrderRequest,
    private originalOrder: Order
  ) {
    this.originalTechnicianId = originalOrder.assignedTo;
  }

  async execute(): Promise<void> {
    // Asignar orden
    await this.orderService.assign(this.request);
    
    // Actualizar carga del técnico anterior (si existe)
    if (this.request.previousTechnicianId) {
      const prevTech = await this.technicianService.getById(this.request.previousTechnicianId);
      if (prevTech && prevTech.carga > 0) {
        await this.technicianService.updateWorkload(this.request.previousTechnicianId, prevTech.carga - 1);
      }
    }
    
    // Actualizar carga del nuevo técnico
    const newTech = await this.technicianService.getById(this.request.technicianId);
    if (newTech && newTech.carga < 5) {
      await this.technicianService.updateWorkload(this.request.technicianId, newTech.carga + 1);
    }
  }

  async undo(): Promise<void> {
    // Revertir asignación
    if (this.originalTechnicianId) {
      await this.orderService.assign({
        orderId: this.request.orderId,
        technicianId: this.originalTechnicianId,
        previousTechnicianId: this.request.technicianId
      });
    } else {
      await this.orderService.unassign(this.request.orderId);
    }
    
    // Revertir cargas de trabajo
    const currentTech = await this.technicianService.getById(this.request.technicianId);
    if (currentTech && currentTech.carga > 0) {
      await this.technicianService.updateWorkload(this.request.technicianId, currentTech.carga - 1);
    }
    
    if (this.originalTechnicianId) {
      const originalTech = await this.technicianService.getById(this.originalTechnicianId);
      if (originalTech && originalTech.carga < 5) {
        await this.technicianService.updateWorkload(this.originalTechnicianId, originalTech.carga + 1);
      }
    }
  }

  getDescription(): string {
    return `Asignar orden ${this.request.orderId} a técnico ${this.request.technicianId}`;
  }
}

/**
 * Comando para desasignar orden
 */
export class UnassignOrderCommand implements Command {
  private originalTechnicianId: string | null;
  
  constructor(
    private orderService: IOrderService,
    private technicianService: ITechnicianService,
    private orderId: string,
    private originalOrder: Order
  ) {
    this.originalTechnicianId = originalOrder.assignedTo;
  }

  async execute(): Promise<void> {
    // Desasignar orden
    await this.orderService.unassign(this.orderId);
    
    // Reducir carga del técnico si estaba asignado
    if (this.originalTechnicianId) {
      const tech = await this.technicianService.getById(this.originalTechnicianId);
      if (tech && tech.carga > 0) {
        await this.technicianService.updateWorkload(this.originalTechnicianId, tech.carga - 1);
      }
    }
  }

  async undo(): Promise<void> {
    // Reasignar al técnico original
    if (this.originalTechnicianId) {
      await this.orderService.assign({
        orderId: this.orderId,
        technicianId: this.originalTechnicianId
      });
      
      const tech = await this.technicianService.getById(this.originalTechnicianId);
      if (tech && tech.carga < 5) {
        await this.technicianService.updateWorkload(this.originalTechnicianId, tech.carga + 1);
      }
    }
  }

  getDescription(): string {
    return `Desasignar orden ${this.orderId}`;
  }
}

/**
 * Invoker - Maneja la ejecución de comandos y historial
 * Patrón: Command + Memento
 */
export class CommandInvoker {
  private history: Command[] = [];
  private currentPosition = -1;
  private readonly maxHistorySize = 50;

  async executeCommand(command: Command): Promise<void> {
    try {
      await command.execute();
      
      // Limpiar historial hacia adelante si estamos en medio
      this.history = this.history.slice(0, this.currentPosition + 1);
      
      // Agregar comando al historial
      this.history.push(command);
      this.currentPosition++;
      
      // Mantener tamaño máximo del historial
      if (this.history.length > this.maxHistorySize) {
        this.history.shift();
        this.currentPosition--;
      }
    } catch (error) {
      console.error('Error executing command:', error);
      throw error;
    }
  }

  async undo(): Promise<boolean> {
    if (this.canUndo()) {
      try {
        const command = this.history[this.currentPosition];
        await command.undo();
        this.currentPosition--;
        return true;
      } catch (error) {
        console.error('Error undoing command:', error);
        return false;
      }
    }
    return false;
  }

  async redo(): Promise<boolean> {
    if (this.canRedo()) {
      try {
        this.currentPosition++;
        const command = this.history[this.currentPosition];
        await command.execute();
        return true;
      } catch (error) {
        console.error('Error redoing command:', error);
        this.currentPosition--;
        return false;
      }
    }
    return false;
  }

  canUndo(): boolean {
    return this.currentPosition >= 0;
  }

  canRedo(): boolean {
    return this.currentPosition < this.history.length - 1;
  }

  getLastCommandDescription(): string | null {
    if (this.canUndo()) {
      return this.history[this.currentPosition].getDescription();
    }
    return null;
  }

  clearHistory(): void {
    this.history = [];
    this.currentPosition = -1;
  }

  getHistorySize(): number {
    return this.history.length;
  }
}

/**
 * Factory para crear comandos
 * Patrón: Factory
 */
export class CommandFactory {
  static createAssignOrderCommand(
    orderService: IOrderService,
    technicianService: ITechnicianService,
    request: AssignOrderRequest,
    originalOrder: Order
  ): AssignOrderCommand {
    return new AssignOrderCommand(orderService, technicianService, request, originalOrder);
  }

  static createUnassignOrderCommand(
    orderService: IOrderService,
    technicianService: ITechnicianService,
    orderId: string,
    originalOrder: Order
  ): UnassignOrderCommand {
    return new UnassignOrderCommand(orderService, technicianService, orderId, originalOrder);
  }
}

/**
 * Singleton para el invoker global
 */
export class GlobalCommandInvoker {
  private static instance: CommandInvoker;

  static getInstance(): CommandInvoker {
    if (!this.instance) {
      this.instance = new CommandInvoker();
    }
    return this.instance;
  }
}