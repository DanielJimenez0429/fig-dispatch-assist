export interface Technician {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  zona: string;
  especialidad: string;
  carga: number; // 0-5
  disponibilidad: string[];
  fotoUrl?: string;
}

export interface Order {
  id: string;
  zona: string;
  creadoEn: string;
  servicio: string;
  descripcion: string;
  assignedTo: string | null;
}

export interface User {
  email: string;
  password: string;
}

// Mock data as requested
export const mockTechnicians: Technician[] = [
  { 
    "id": "t1", 
    "nombre": "Carlos Pérez", 
    "email": "carlos.perez@example.com", 
    "telefono": "+57-300-1111111", 
    "zona": "zona norte", 
    "especialidad": "Eléctrico", 
    "carga": 2, 
    "disponibilidad": ["06:00-12:00", "12:00-18:00"] 
  },
  { 
    "id": "t2", 
    "nombre": "Ana Gómez", 
    "email": "ana.gomez@example.com", 
    "telefono": "+57-300-2222222", 
    "zona": "zona sur", 
    "especialidad": "Plomería", 
    "carga": 4, 
    "disponibilidad": ["00:00-06:00", "18:00-00:00"] 
  },
  { 
    "id": "t3", 
    "nombre": "Luis Martínez", 
    "email": "luis.martinez@example.com", 
    "telefono": "+57-300-3333333", 
    "zona": "zona centro", 
    "especialidad": "HVAC", 
    "carga": 5, 
    "disponibilidad": ["06:00-12:00"] 
  },
  { 
    "id": "t4", 
    "nombre": "María Ruiz", 
    "email": "maria.ruiz@example.com", 
    "telefono": "+57-300-4444444", 
    "zona": "zona oeste", 
    "especialidad": "Redes", 
    "carga": 1, 
    "disponibilidad": ["12:00-18:00", "18:00-00:00"] 
  },
  { 
    "id": "t5", 
    "nombre": "Jorge López", 
    "email": "jorge.lopez@example.com", 
    "telefono": "+57-300-5555555", 
    "zona": "zona este", 
    "especialidad": "Eléctrico", 
    "carga": 0, 
    "disponibilidad": ["00:00-06:00", "06:00-12:00"] 
  },
  { 
    "id": "t6", 
    "nombre": "Sofia Herrera", 
    "email": "sofia.herrera@example.com", 
    "telefono": "+57-300-6666666", 
    "zona": "zona norte", 
    "especialidad": "Plomería", 
    "carga": 3, 
    "disponibilidad": ["12:00-18:00"] 
  }
];

export const mockOrders: Order[] = [
  { 
    "id": "O-1001", 
    "zona": "zona norte", 
    "creadoEn": "2025-09-22T10:12:00Z", 
    "servicio": "Instalación eléctrica", 
    "descripcion": "Cambio de tablero", 
    "assignedTo": null 
  },
  { 
    "id": "O-1002", 
    "zona": "zona sur", 
    "creadoEn": "2025-09-22T11:00:00Z", 
    "servicio": "Reparación de cañería", 
    "descripcion": "Fuga en planta baja", 
    "assignedTo": "t2" 
  },
  {
    "id": "O-1003",
    "zona": "zona centro", 
    "creadoEn": "2025-09-22T14:30:00Z",
    "servicio": "Instalación HVAC",
    "descripcion": "Sistema de climatización oficina",
    "assignedTo": null
  },
  {
    "id": "O-1004",
    "zona": "zona oeste",
    "creadoEn": "2025-09-22T15:45:00Z", 
    "servicio": "Configuración de red",
    "descripcion": "Setup de red empresarial",
    "assignedTo": "t4"
  },
  {
    "id": "O-1005",
    "zona": "zona este",
    "creadoEn": "2025-09-22T16:20:00Z",
    "servicio": "Mantenimiento eléctrico", 
    "descripcion": "Revisión general instalaciones",
    "assignedTo": null
  },
  {
    "id": "O-1006",
    "zona": "zona norte",
    "creadoEn": "2025-09-22T09:15:00Z",
    "servicio": "Reparación plomería",
    "descripcion": "Obstrucción en tubería principal", 
    "assignedTo": "t6"
  },
  {
    "id": "O-1007",
    "zona": "zona sur", 
    "creadoEn": "2025-09-22T13:40:00Z",
    "servicio": "Instalación eléctrica",
    "descripcion": "Nuevos puntos de luz",
    "assignedTo": null
  },
  {
    "id": "O-1008",
    "zona": "zona centro",
    "creadoEn": "2025-09-22T17:10:00Z", 
    "servicio": "Mantenimiento HVAC",
    "descripcion": "Limpieza y calibración",
    "assignedTo": null
  }
];

export const mockUsers: User[] = [
  {
    email: "supervisor@example.com",
    password: "Admin123."
  }
];

export const zonas = ["zona centro", "zona sur", "zona norte", "zona oeste", "zona este"];
export const especialidades = ["Eléctrico", "Plomería", "HVAC", "Redes"];
export const horarios = ["00:00-06:00", "06:00-12:00", "12:00-18:00", "18:00-00:00"];