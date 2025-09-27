import { Technician, Order, mockTechnicians, mockOrders } from './mockData';

const TECHNICIANS_KEY = 'telconova-technicians';
const ORDERS_KEY = 'telconova-orders';

// Initialize data if not exists
export function initializeStorage(): void {
  if (!localStorage.getItem(TECHNICIANS_KEY)) {
    localStorage.setItem(TECHNICIANS_KEY, JSON.stringify(mockTechnicians));
  }
  if (!localStorage.getItem(ORDERS_KEY)) {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(mockOrders));
  }
}

// Technicians
export function getTechnicians(): Technician[] {
  const data = localStorage.getItem(TECHNICIANS_KEY);
  return data ? JSON.parse(data) : mockTechnicians;
}

export function saveTechnicians(technicians: Technician[]): void {
  localStorage.setItem(TECHNICIANS_KEY, JSON.stringify(technicians));
}

export function addTechnician(technician: Omit<Technician, 'id'>): Technician {
  const technicians = getTechnicians();
  const newId = `t${technicians.length + 1}`;
  const newTechnician: Technician = { ...technician, id: newId };
  
  technicians.push(newTechnician);
  saveTechnicians(technicians);
  
  return newTechnician;
}

export function updateTechnician(id: string, updates: Partial<Technician>): void {
  const technicians = getTechnicians();
  const index = technicians.findIndex(t => t.id === id);
  
  if (index !== -1) {
    technicians[index] = { ...technicians[index], ...updates };
    saveTechnicians(technicians);
  }
}

// Orders
export function getOrders(): Order[] {
  const data = localStorage.getItem(ORDERS_KEY);
  return data ? JSON.parse(data) : mockOrders;
}

export function saveOrders(orders: Order[]): void {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

export function addOrder(order: Omit<Order, 'id'>): Order {
  const orders = getOrders();
  const newId = `O-${1000 + orders.length + 1}`;
  const newOrder: Order = { ...order, id: newId };
  
  orders.push(newOrder);
  saveOrders(orders);
  
  return newOrder;
}

export function assignOrder(orderId: string, technicianId: string | null, previousTechnicianId?: string): void {
  const orders = getOrders();
  const technicians = getTechnicians();
  
  // Update order
  const orderIndex = orders.findIndex(o => o.id === orderId);
  if (orderIndex !== -1) {
    orders[orderIndex].assignedTo = technicianId;
    saveOrders(orders);
  }
  
  // Update technician workload
  if (previousTechnicianId) {
    // Decrease previous technician's workload
    const prevTechIndex = technicians.findIndex(t => t.id === previousTechnicianId);
    if (prevTechIndex !== -1 && technicians[prevTechIndex].carga > 0) {
      technicians[prevTechIndex].carga--;
    }
  }
  
  if (technicianId) {
    // Increase new technician's workload
    const newTechIndex = technicians.findIndex(t => t.id === technicianId);
    if (newTechIndex !== -1 && technicians[newTechIndex].carga < 5) {
      technicians[newTechIndex].carga++;
    }
  }
  
  saveTechnicians(technicians);
}

// Reset to initial state (development only)
export function resetData(): void {
  localStorage.setItem(TECHNICIANS_KEY, JSON.stringify(mockTechnicians));
  localStorage.setItem(ORDERS_KEY, JSON.stringify(mockOrders));
}