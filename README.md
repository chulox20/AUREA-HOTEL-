# 🏨 AUREA HOTEL — Sistema de Gestión y Reservas de Lujo

> *"Una estancia diseñada para recordar."*

**AUREA HOTEL** es una plataforma web integral para hoteles boutique y de lujo. Desarrollada con **React 19**, **Vite** y un **Sistema de Diseño en Vanilla CSS** de alta estética, completamente integrada con **Supabase (PostgreSQL, Autenticación y RLS)** y **PayPal** para procesamiento seguro de pagos.

---

## 📸 Características Principales

### 🌐 1. Portal Público
- **Hero & Experiencia:** Diseño premium con paleta de colores curada (*Obsidian, Ivory, Warm Gray, Gold*), animaciones fluidas con Framer Motion y tipografía editorial.
- **Catálogo de Habitaciones en Tiempo Real:** Filtros interactivos por tipo de suite, capacidad, rango de precio y amenidades.
- **Ficha Detallada de Habitación:** Galería interactiva, desglose de tarifas por noche + impuestos y **comprobación de disponibilidad física en PostgreSQL** previa al checkout.
- **Testimonios Verificados:** Reseñas reales asociadas a estancias completadas (`checked_out`).

---

### 💳 2. Proceso de Reserva & Pasarela PayPal
- **Flujo en 4 Pasos:** Resumen de estancia ➔ Datos del huésped ➔ Pasarela de pago ➔ Confirmación inmediata.
- **Integración PayPal Sandbox:** Procesamiento de pagos con `@paypal/react-paypal-js`. Al aprobar el pago, la orden se captura y la reserva se crea de forma atómica en Supabase.
- **Códigos de Reserva Atómicos:** Generación de códigos secuenciales mediante la secuencia PostgreSQL `reservation_code_seq` (`AUR-1000`, `AUR-1001`, ...), evitando colisiones concurrentes.
- **Prevención de Overbooking:** Restricciones de exclusión GiST (`stay_range`) a nivel de base de datos.

---

### 👤 3. Área Privada del Huésped (`/account`)
- **Panel de Control:** Próximas reservas activas y reservas históricas.
- **Gestión de Reservas:** Detalle completo de estancia, desglose de pagos, estado de la orden y opción de cancelación directa.
- **Sistema de Reseñas Verificadas:** Formulario de calificación y reseña habilitado exclusivamente para huéspedes con estancias finalizadas.
- **Perfil de Usuario:** Actualización de datos personales, teléfono y país sincronizados con la tabla `profiles`.

---

### 🛡️ 4. Panel de Administración Completo (`/admin`)
- **Dashboard de Métricas (KPIs):** Tasa de ocupación actual en tiempo real, ingresos del mes, reservas de hoy, check-ins y check-outs del día.
- **Gestión de Habitaciones Físicas:** Control de inventario físico, alta de nuevas habitaciones y alternador rápido de estado (*Disponible / Mantenimiento*).
- **Tarifas y Tipos de Habitación:** Modificación en vivo de precios base por noche, capacidad, tamaño y amenidades.
- **Control Operativo de Reservas:** Filtros de búsqueda y botones de acción rápida para realizar **Check-in**, **Check-out** o cancelaciones.
- **Calendario Gantt de Ocupación:** Visualización interactiva por habitación y mes del estado de ocupación y reservas.
- **Directorio de Clientes:** Métricas de valor del cliente (reservas totales acumuladas, gasto total histórico y última estancia).
- **Moderación de Reseñas:** Aprobación y visibilidad pública de opiniones de huéspedes.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
| :--- | :--- |
| **Frontend** | React 19, Vite, React Router 7, Framer Motion |
| **Estilos** | Vanilla CSS modular, Design Tokens, Glassmorphism, Microanimaciones |
| **Base de Datos** | PostgreSQL alojado en Supabase |
| **Autenticación** | Supabase Auth (Email/Password & OAuth) + Row Level Security (RLS) |
| **Pasarela de Pago** | PayPal SDK Sandbox (`@paypal/react-paypal-js`) |
| **Formularios & Validación** | React Hook Form + Zod |
| **Iconografía & Utilidades** | Lucide React, Date-fns, React Hot Toast |

---

## 🏗️ Arquitectura de la Aplicación

```
AUREA-HOTEL/
├── src/
│   ├── components/
│   │   ├── auth/           # ProtectedRoute.jsx, AdminRoute.jsx
│   │   ├── layout/         # Header.jsx, Footer.jsx, AccountLayout.jsx, AdminLayout.jsx
│   │   └── ui/             # Componentes visuales reutilizables
│   ├── contexts/
│   │   ├── AuthContext.jsx    # Estado global de usuario, perfil y roles
│   │   └── BookingContext.jsx # Estado reactivo del proceso de reserva
│   ├── services/           # Capa modular de servicios Supabase
│   │   ├── roomService.js     # Catálogo, disponibilidad física y CRUD admin
│   │   ├── bookingService.js  # Creación de reservas, pagos y estados
│   │   ├── adminService.js    # KPIs, directorio y matriz del Gantt
│   │   └── reviewService.js   # Reseñas verificadas y moderación
│   ├── pages/
│   │   ├── public/         # Home.jsx, Rooms.jsx, RoomDetail.jsx
│   │   ├── auth/           # Login.jsx, Register.jsx
│   │   ├── booking/        # BookingPage.jsx (Checkout + PayPal)
│   │   ├── account/        # Dashboard.jsx, Bookings.jsx, BookingDetail.jsx, Profile.jsx
│   │   └── admin/          # Dashboard.jsx, Rooms.jsx, RoomTypes.jsx, AdminBookings.jsx,
│   │                       # AdminCalendar.jsx, AdminCustomers.jsx, AdminReviews.jsx
│   ├── styles/             # Variables, animaciones y estilos de layout
│   └── lib/
│       ├── supabase.js     # Cliente Supabase inicializado
│       └── utils.js        # Formateadores de moneda, fechas y helpers
├── schema.sql              # Esquema DDL de PostgreSQL con RLS, triggers y secuencias
└── package.json
```

---

## ⚙️ Instalación y Puesta en Marcha

### 1. Clonar el repositorio
```bash
git clone https://github.com/chulox20/AUREA-HOTEL-.git
cd AUREA-HOTEL-
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Crea un archivo `.env` en la raíz del proyecto con tus credenciales:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
VITE_PAYPAL_CLIENT_ID=tu_paypal_client_id_sandbox
```

### 4. Ejecutar el servidor de desarrollo
```bash
npm run dev
```
La aplicación estará disponible en [http://localhost:5173](http://localhost:5173).

### 5. Compilación para producción
```bash
npm run build
```

---

## 🗄️ Estructura de la Base de Datos (PostgreSQL)

- **`profiles`**: Perfiles de usuarios vinculados a `auth.users` con roles (`customer`, `admin`).
- **`room_types`**: Categorías de habitación (Standard, Deluxe, Suite, Ocean View, Presidential) con tarifas y amenidades.
- **`rooms`**: Habitaciones físicas numeradas con piso y estado (`available`, `maintenance`, `occupied`).
- **`reservations`**: Registro principal de estancias con código secuencial atómico (`AUR-XXXX`), fechas y montos.
- **`reservation_guests`**: Datos de contacto del huésped titular.
- **`payments`**: Transacciones vinculadas a PayPal con identificador de orden, estado y moneda.
- **`reviews`**: Opiniones de huéspedes protegidas por verificación de estancia completada.

---

## 📄 Licencia
Este proyecto ha sido desarrollado bajo licencia privada para **Aurea Hotel**.
