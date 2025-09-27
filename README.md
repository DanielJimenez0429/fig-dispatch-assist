# TelcoNova - Sistema de Asignaciones Técnicas

Sistema frontend para la gestión de asignaciones manuales de técnicos a órdenes de servicio, desarrollado con React, TypeScript, Tailwind CSS y shadcn/ui.

## 🚀 Características Principales

### ✅ Sistema de Autenticación
- Login seguro con validación de credenciales
- Bloqueo automático tras 3 intentos fallidos por 15 minutos
- Persistencia de sesión en localStorage
- Mensajes claros de estado de autenticación

### ✅ Gestión de Órdenes
- **Vista dividida**: Órdenes pendientes vs asignadas
- Búsqueda por número de orden (tiempo real)
- Creación de nuevas órdenes con validación
- Detalles completos: zona, servicio, descripción, timestamps

### ✅ Selección de Técnicos
- Lista completa con información de contacto
- Filtros avanzados: zona, especialidad, carga de trabajo, disponibilidad
- Indicadores visuales de disponibilidad y carga
- Búsqueda con debounce por nombre, email o teléfono
- Ordenamiento automático por menor carga de trabajo

### ✅ Gestión de Técnicos  
- Crear nuevos técnicos desde la interfaz
- Validación completa de formularios
- Actualización automática de cargas de trabajo
- Gestión de horarios de disponibilidad

### ✅ Funcionalidades Adicionales
- **Modo oscuro/claro** con toggle persistente
- Notificaciones toast con opción de deshacer
- Design system completo con colores semánticos
- Responsive design (mobile-first)
- Accesibilidad (ARIA, keyboard navigation, focus states)
- Persistencia completa en localStorage

## 🏗️ Arquitectura Técnica

### Stack Tecnológico
- **Frontend**: React 18 + TypeScript + Vite
- **Estilos**: Tailwind CSS + CSS Variables para theming
- **Componentes**: shadcn/ui + Radix UI primitives  
- **Iconos**: Lucide React
- **Persistencia**: localStorage (simulación de backend)
- **Validación**: Validación client-side con mensajes de error
- **Routing**: React Router DOM

### Estructura del Proyecto
```
src/
├── components/           # Componentes reutilizables
│   ├── ui/              # shadcn/ui components
│   ├── Header.tsx       # Header principal con logo y usuario
│   ├── ThemeToggle.tsx  # Toggle de modo oscuro
│   ├── SeleccionarTecnico.tsx   # Modal de selección de técnicos
│   ├── CrearTecnico.tsx         # Modal para crear técnicos
│   └── ProtectedRoute.tsx       # Protección de rutas
├── contexts/            # React Context providers
│   ├── AuthContext.tsx  # Gestión de autenticación
│   └── ThemeContext.tsx # Gestión de tema oscuro/claro
├── pages/              # Páginas principales
│   ├── Login.tsx       # Pantalla de login con validaciones
│   ├── AsignacionesManuales.tsx # Pantalla principal de asignaciones
│   └── NotFound.tsx    # Página 404
├── utils/              # Utilidades y helpers
│   ├── mockData.ts     # Datos mock y tipos TypeScript
│   ├── auth.ts         # Lógica de autenticación y bloqueo
│   └── storage.ts      # Funciones de localStorage
├── assets/             # Recursos estáticos
│   └── telconova-logo.png
└── index.css          # Sistema de diseño con CSS variables
```

## 🎨 Sistema de Diseño

### Colores Semánticos (HSL)
- **Primary**: Azul TelcoNova (`214 100% 40%`)
- **Accent**: Cian complementario (`195 100% 50%`)
- **Success**: Verde (`142 76% 36%`)
- **Warning**: Amarillo (`38 92% 50%`)
- **Destructive**: Rojo (`0 84% 60%`)

### Características de Design System
- Tokens CSS personalizados para consistencia
- Gradientes y sombras con colores de marca
- Transiciones suaves entre temas
- Componentes variant-based (no override de clases)
- Scrollbars personalizados
- Estados de focus visible para accesibilidad

## 🚀 Instalación y Desarrollo

### Prerrequisitos
- Node.js 18+ y npm
- Editor de código (recomendado: VS Code)

### Pasos de instalación

1. **Clonar el repositorio**
```bash
git clone <url-del-repositorio>
cd telconova-app
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Ejecutar en desarrollo**
```bash
npm run dev
```
La aplicación estará disponible en `http://localhost:8080`

4. **Build para producción**
```bash
npm run build
```

5. **Preview de producción**
```bash
npm run preview
```

## 🌐 Deploy en Vercel

### Opción 1: Deploy directo desde Vercel Dashboard
1. Ir a [vercel.com](https://vercel.com) y crear cuenta
2. Conectar repositorio de GitHub
3. Configurar proyecto:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`  
   - **Output Directory**: `dist`
4. Deploy automático

### Opción 2: Deploy con Vercel CLI
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy a producción
vercel --prod
```

### Configuración adicional en Vercel
- Las rutas SPA están configuradas para redirigir a `/index.html`
- Variables de entorno no son necesarias (todo usa localStorage)

## 👤 Credenciales de Demo

**Supervisor por defecto:**
- **Email**: `supervisor@example.com`
- **Contraseña**: `Admin123.`

## 📊 Datos Mock Incluidos

### Técnicos (6 técnicos de ejemplo)
- **Carlos Pérez** - Eléctrico, Zona Norte, Carga: 2/5
- **Ana Gómez** - Plomería, Zona Sur, Carga: 4/5  
- **Luis Martínez** - HVAC, Zona Centro, Carga: 5/5 (no disponible)
- **María Ruiz** - Redes, Zona Oeste, Carga: 1/5
- **Jorge López** - Eléctrico, Zona Este, Carga: 0/5
- **Sofia Herrera** - Plomería, Zona Norte, Carga: 3/5

### Órdenes (8 órdenes de ejemplo)
- Mix de órdenes **pendientes** y **asignadas**
- Diferentes zonas y tipos de servicio
- Timestamps realistas para pruebas

### Zonas disponibles
- zona centro, zona sur, zona norte, zona oeste, zona este

### Especialidades
- Eléctrico, Plomería, HVAC, Redes

### Horarios de disponibilidad  
- 00:00-06:00, 06:00-12:00, 12:00-18:00, 18:00-00:00

## 🧪 Pruebas Manuales de QA

### Test de Autenticación
1. **Login exitoso**: Usar credenciales correctas → debe redirigir a dashboard
2. **Login fallido**: Usar credenciales incorrectas → mensaje de error claro
3. **Bloqueo de cuenta**: 3 intentos fallidos → bloqueo por 15 min con timestamp
4. **Persistencia**: Refresh de página → mantener sesión activa

### Test de Órdenes
1. **Búsqueda**: Escribir número de orden → filtrado en tiempo real
2. **Crear orden**: Completar formulario → nueva orden aparece en pendientes
3. **Validación**: Enviar formulario incompleto → mensajes de error apropiados

### Test de Asignaciones
1. **Asignar técnico**: Seleccionar técnico disponible → orden pasa a asignadas
2. **Reasignar**: Cambiar técnico asignado → actualización correcta de cargas
3. **Técnico no disponible**: Carga 5/5 → debe estar deshabilitado
4. **Filtros**: Aplicar filtros → resultados correctos
5. **Deshacer**: Usar botón deshacer en toast → revertir asignación

### Test de UI/UX
1. **Modo oscuro**: Toggle → cambio suave de tema + persistencia
2. **Responsive**: Probar en mobile, tablet, desktop → layout adaptativo
3. **Accesibilidad**: Navegación con TAB → todos los elementos focusables
4. **Performance**: Scroll en listas largas → smooth scrolling con custom scrollbar

## 🔧 Funciones de Desarrollo

### Reset de datos (solo desarrollo)
En la consola del navegador:
```javascript
// Resetear a datos iniciales
localStorage.clear();
location.reload();

// O usar la función específica
import { resetData } from './src/utils/storage';
resetData();
```

### Debug de localStorage
```javascript
// Ver todos los datos guardados
console.log('Técnicos:', JSON.parse(localStorage.getItem('telconova-technicians')));
console.log('Órdenes:', JSON.parse(localStorage.getItem('telconova-orders')));
console.log('Usuario:', JSON.parse(localStorage.getItem('telconova-user')));
```

## 🎯 Funcionalidades "Próximamente"

Las siguientes pestañas muestran mensajes de "Próximamente":
- **Asignación Automática**: Sistema automático de asignación por algoritmos
- **Reporte de Asignaciones**: Dashboard de métricas y reportes

## 🔒 Consideraciones de Seguridad

### Implementadas
- ✅ Validación client-side de formularios  
- ✅ Sanitización de inputs (prevención XSS básica)
- ✅ Bloqueo temporal de cuentas tras intentos fallidos
- ✅ No logging de datos sensibles en consola
- ✅ Escape de caracteres especiales en URLs

### Para producción (no implementado)
- ⚠️ Autenticación server-side con JWT/sessions
- ⚠️ Validación server-side (nunca confiar solo en client)
- ⚠️ Rate limiting en APIs
- ⚠️ Encriptación de datos sensibles
- ⚠️ HTTPS obligatorio
- ⚠️ Content Security Policy (CSP)

## 📱 Soporte de Navegadores

- ✅ Chrome 90+
- ✅ Firefox 88+  
- ✅ Safari 14+
- ✅ Edge 90+

## 🤝 Contribución

Este es un proyecto de demostración. Para mejoras:

1. Fork del repositorio
2. Crear branch para feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit de cambios (`git commit -am 'Add: nueva funcionalidad'`)
4. Push to branch (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

Este proyecto es una demostración para TelcoNova. Código disponible para revisión y mejoras.

---

**¿Necesita ayuda?** Contacte al equipo de desarrollo para soporte técnico o nuevas funcionalidades.