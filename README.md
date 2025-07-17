# RE/MAX Knowledge Platform

Plataforma integral para RE/MAX Argentina: gestión de conocimiento, bot IA, calculadoras, sistema de documentos y panel administrativo.

## 🚀 Características principales

- **Base de Conocimiento**: Wiki inmobiliaria con editor Markdown, categorías y artículos con control de estado (borrador, publicado, archivado).
- **Bot con IA**: Asistente OpenAI que responde consultas sobre documentos y artículos, con sesiones de chat y contexto relevante.
- **Gestión de Documentos**: Subida, descarga y eliminación de archivos, categorización y búsqueda avanzada.
- **Calculadora Argentina**: Cálculo de comisiones, impuestos, sellos y tasas por provincia, con historial y configuraciones personalizadas.
- **Panel de Administración**: Dashboard con estadísticas, gestión de usuarios (CRUD), control de roles y permisos, y administración de contenido.
- **Autenticación**: Registro, login, refresco de token, cambio de contraseña, roles (ADMIN, USER, AGENTE), y protección de rutas.

## 🌐 Enlace de producción

- [Frontend en Railway](https://remax-fe-production.up.railway.app/)

## 🛠️ Stack Tecnológico

### Backend
- **Node.js** + **Express.js**
- **Prisma ORM** (SQLite en desarrollo, PostgreSQL en producción)
- **JWT** para autenticación y roles
- **OpenAI API** para el bot inteligente
- **Multer** para manejo de archivos
- **Docker** y **docker-compose** para despliegue

### Frontend
- **Next.js 14** + **React 18** + **TypeScript**
- **Tailwind CSS** y **Headless UI**
- **Axios** para llamadas API
- **Zustand** para estado global
- **Quill** y **react-markdown** para edición y visualización de artículos

## 📦 Estructura actual

- **backend/**: API REST, controladores, rutas, middleware, Prisma, Dockerfile
- **frontend/**: Next.js app, páginas protegidas, componentes, editor, gestión de usuarios, Dockerfile
- **uploads/**: Archivos subidos
- **docker-compose.yml**: Orquestación de servicios

## 🆕 Cambios recientes

- Migración completa a Next.js 14 y React 18 con TypeScript
- Implementación de proxy API en frontend para comunicación segura con backend
- Mejoras en autenticación y protección de rutas (AuthProvider, useAuth)
- Panel de administración con dashboard, estadísticas y gestión de usuarios
- Calculadora de comisiones y sellos con historial y configuraciones por provincia
- Bot IA con sesiones, contexto relevante y OpenAI
- Gestión avanzada de documentos (subida, descarga, eliminación, categorías)
- Editor de artículos con soporte Markdown y vista previa
- Sistema de roles y permisos (ADMIN, USER, AGENTE)
- Dockerización de frontend y backend para despliegue en Railway

## 📄 Instalación y desarrollo

1. Clonar el repositorio
2. Configurar variables de entorno en ambos proyectos (`.env`)
3. Instalar dependencias en `backend/` y `frontend/`
4. Ejecutar `docker-compose up` para desarrollo local
5. Acceder a la app en `http://localhost:3000` (frontend) y `http://localhost:3001/api` (backend)

## ✨ Contribuciones y contacto

Para sugerencias, mejoras o reportes, abrir un issue o contactar a Tabix Group.
- **React Hook Form** para formularios
- **Zustand** para estado global

### Herramientas
- **Docker** para contenedores
- **ESLint** y **Prettier** para calidad de código
- **Husky** para git hooks

## 📁 Estructura del Proyecto

```
remax-platform/
├── backend/                 # API REST con Express
│   ├── src/
│   │   ├── controllers/     # Controladores de rutas
│   │   ├── models/          # Modelos de datos
│   │   ├── routes/          # Definición de rutas
│   │   ├── middleware/      # Middleware personalizado
│   │   ├── services/        # Lógica de negocio
│   │   └── utils/           # Utilidades
│   ├── prisma/              # Esquemas de base de datos
│   └── uploads/             # Archivos subidos
├── frontend/                # Aplicación Next.js
│   ├── src/
│   │   ├── components/      # Componentes reutilizables
│   │   ├── pages/           # Páginas de la aplicación
│   │   ├── styles/          # Estilos CSS
│   │   ├── hooks/           # Hooks personalizados
│   │   └── utils/           # Utilidades del frontend
│   └── public/              # Archivos estáticos
└── shared/                  # Tipos y utilidades compartidas
    └── types/               # Definiciones TypeScript
```

## 🚀 Instalación y Uso

### Requisitos Previos
- Node.js 18+
- npm o yarn
- Git

### Instalación

1. Clonar el repositorio:
```bash
git clone <repo-url>
cd remax-platform
```

2. Instalar dependencias del backend:
```bash
cd backend
npm install
```

3. Instalar dependencias del frontend:
```bash
cd ../frontend
npm install
```

4. Configurar variables de entorno:
```bash
# En backend/
cp .env.example .env
# Configurar las variables necesarias
```

5. Ejecutar migraciones:
```bash
cd backend
npx prisma migrate dev
```

6. Iniciar en desarrollo:
```bash
# Backend (puerto 3001)
cd backend
npm run dev

# Frontend (puerto 3000)
cd frontend
npm run dev
```

## 🎨 Diseño RE/MAX

El diseño sigue la identidad visual de RE/MAX:
- **Colores primarios**: Azul (#003f7f) y Rojo (#e31837)
- **Tipografía**: Fuentes profesionales y legibles
- **UI/UX**: Diseño limpio, intuitivo y responsive

## 📝 Funcionalidades Principales

### 1. Base de Conocimiento
- Crear y editar artículos tipo wiki
- Categorización por temas
- Búsqueda avanzada
- Historial de versiones

### 2. Bot Inteligente
- Respuestas basadas en documentos cargados
- Integración con OpenAI
- Contexto persistente
- Respuestas precisas sobre regulaciones argentinas

### 3. Generación de Documentos
- Templates de contratos
- Formularios personalizables
- Generación automática con datos del usuario
- Exportación a Word/PDF

### 4. Calculadora Argentina
- Comisiones inmobiliarias
- Impuestos a las ganancias
- Sellos y tasas provinciales
- ITI (Impuesto a la Transferencia de Inmuebles)

### 5. Panel de Administración
- Gestión de usuarios y roles
- Configuración de calculadoras
- Administración de contenido
- Métricas y reportes

## 🔐 Seguridad

- Autenticación JWT
- Roles y permisos granulares
- Validación de entrada
- Sanitización de datos
- Rate limiting

## 🚀 Despliegue

### Desarrollo
- SQLite local
- Servidor de desarrollo integrado

### Producción
- PostgreSQL o MySQL
- Docker containers
- Nginx como reverse proxy
- SSL/TLS certificates

## 📊 Roadmap

- [ ] ✅ Estructura base del proyecto
- [ ] 🔄 Sistema de autenticación
- [ ] 🔄 Base de conocimiento
- [ ] 🔄 Bot con IA
- [ ] 🔄 Calculadora argentina
- [ ] 🔄 Sistema de documentos
- [ ] 🔄 Panel de administración
- [ ] 🔄 Despliegue en producción

## 🤝 Contribución

1. Fork el proyecto
2. Crear feature branch
3. Commit los cambios
4. Push al branch
5. Crear Pull Request

## 📄 Licencia

Este proyecto es privado y propietario de RE/MAX Argentina.
