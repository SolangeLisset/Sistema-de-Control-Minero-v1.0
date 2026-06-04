# ⛏️ Mining Control — Sistema de Control de Equipos y Mantención Minera

> Sistema web fullstack para la gestión de equipos industriales y órdenes de mantención en entornos mineros. Desarrollado como proyecto de portafolio profesional.

![Dashboard Preview](https://img.shields.io/badge/Status-Demo%20Funcional-brightgreen)
![Stack](https://img.shields.io/badge/Stack-React%20%2B%20Node.js%20%2B%20SQLite-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

## 🎯 ¿Qué es este proyecto?

Simula un sistema real de gestión utilizado en operaciones mineras del norte de Chile. Permite registrar, monitorear y gestionar:

- **Equipos mineros** (camiones, perforadoras, excavadoras, etc.)
- **Órdenes de mantención** (preventiva, correctiva, predictiva)
- **Técnicos** de mantención y sus asignaciones
- **Dashboard** con métricas operacionales en tiempo real

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + Vite |
| Backend | Node.js + Express |
| Base de datos | SQLite (via sql.js) |
| Estilos | CSS Vanilla (design system propio) |
| Routing | React Router DOM v6 |
| HTTP Client | Axios |

---

## 🚀 Instalación y uso local

### 1. Clonar el repositorio

```bash
git clone https://github.com/TU_USUARIO/mining-control.git
cd mining-control
```

### 2. Instalar y ejecutar el Backend

```bash
cd backend
npm install
npm run seed      # Carga datos de ejemplo
npm start         # Inicia en http://localhost:3001
```

### 3. Instalar y ejecutar el Frontend (nueva terminal)

```bash
cd frontend
npm install
npm run dev       # Inicia en http://localhost:5173
```

### 4. Abrir en el navegador

```
http://localhost:5173
```

---

## 📋 Funcionalidades

### 📊 Dashboard
- Total de equipos por estado (operativo, falla, mantención, inactivo)
- Mantenciones pendientes y en proceso
- Total de técnicos activos
- Últimas órdenes de trabajo con estado y prioridad

### 🚛 Gestión de Equipos
- CRUD completo (Crear, Leer, Actualizar, Eliminar)
- Código único por equipo (ej: CAM-001, PER-002)
- Tipos: camión, perforadora, excavadora, cargador, bulldozer, grúa
- Estados: operativo / mantención / falla / inactivo
- Registro de ubicación en pit o sector de mina
- Búsqueda y filtro por estado

### 🔧 Órdenes de Mantención
- Crear órdenes asignadas a un equipo y técnico
- Tipos: preventiva, correctiva, predictiva, inspección, etc.
- Niveles de prioridad: alta / normal / baja
- Control de estado: pendiente → en proceso → terminado
- Fechas de inicio y término
- Filtros por estado y prioridad

### 👷 Gestión de Técnicos
- CRUD completo de técnicos
- Especialidades: mecánica, electricidad, hidráulica, soldadura, etc.
- Teléfono de contacto
- Estado activo/inactivo

---

## 🗂️ Estructura del Proyecto

```
mining-control/
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   └── database.js       # Configuración SQLite
│   │   ├── controllers/
│   │   │   ├── equiposController.js
│   │   │   ├── tecnicosController.js
│   │   │   └── mantencionesController.js
│   │   └── routes/
│   │       ├── equipos.js
│   │       ├── tecnicos.js
│   │       └── mantenciones.js
│   ├── server.js                 # Entry point del servidor
│   ├── seed.js                   # Script de datos de ejemplo
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Sidebar.jsx
    │   │   └── Toast.jsx
    │   ├── pages/
    │   │   ├── Dashboard.jsx
    │   │   ├── Equipos.jsx
    │   │   ├── Tecnicos.jsx
    │   │   └── Mantenciones.jsx
    │   ├── services/
    │   │   └── api.js            # Capa de comunicación con backend
    │   ├── App.jsx
    │   └── index.css             # Design system completo
    └── package.json
```

---

## 🔌 API Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/equipos` | Listar todos los equipos |
| POST | `/api/equipos` | Crear equipo |
| PUT | `/api/equipos/:id` | Actualizar equipo |
| DELETE | `/api/equipos/:id` | Eliminar equipo |
| GET | `/api/tecnicos` | Listar técnicos |
| POST | `/api/tecnicos` | Crear técnico |
| PUT | `/api/tecnicos/:id` | Actualizar técnico |
| DELETE | `/api/tecnicos/:id` | Eliminar técnico |
| GET | `/api/mantenciones` | Listar mantenciones |
| POST | `/api/mantenciones` | Crear orden |
| PUT | `/api/mantenciones/:id` | Actualizar orden |
| DELETE | `/api/mantenciones/:id` | Eliminar orden |
| GET | `/api/mantenciones/dashboard` | Datos del dashboard |

---

## 👩‍💻 Desarrollado por

**SolangeLisset** — Fullstack Developer  
📍 Iquique, Chile  
🎯 Orientado a sistemas industriales y minería del norte de Chile

---

## 📄 Licencia

MIT — Libre para uso y modificación.
