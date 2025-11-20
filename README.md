
# RIALTOR - Plataforma Inmobiliaria IA

Plataforma integral para RE/MAX Argentina: gestión de conocimiento, bot IA, calculadoras, sistema de documentos en la nube (Cloudinary) y panel administrativo avanzado.

## 🚀 Funcionalidades Actuales

- **Base de Conocimiento**: Wiki inmobiliaria con editor Markdown, categorías, control de estado (borrador, publicado, archivado), historial de versiones y búsqueda avanzada.
- **Bot con IA**: Asistente OpenAI que responde consultas sobre documentos y artículos, con sesiones de chat, contexto relevante y respuestas sobre regulaciones argentinas.
- **Gestión de Documentos en Cloudinary**: Subida, descarga y eliminación de archivos en la nube, categorización, búsqueda avanzada, conteo en dashboard y soporte para múltiples formatos (PDF, Word, Excel, imágenes).
- **Generación de Documentos**: Templates de contratos, formularios personalizables, generación automática con datos del usuario y exportación a Word/PDF.
- **Calculadora Argentina**: Cálculo de comisiones, impuestos, sellos y tasas por provincia, ITI, historial y configuraciones personalizadas.
- **Panel de Administración**: Dashboard con estadísticas en tiempo real (usuarios, artículos, consultas, documentos en Cloudinary), gestión de usuarios (CRUD), control de roles y permisos, administración de contenido y configuración del sistema.
- **Autenticación y Seguridad**: Registro, login, refresco de token, cambio de contraseña, roles y permisos granulares (ADMIN, USER, AGENTE), protección de rutas, validación y sanitización de datos.
- **Dockerización**: Despliegue de frontend y backend en Railway y otros entornos, con docker-compose y soporte para variables de entorno.

## 🌐 Enlace de producción

- [Frontend en Railway](https://remax-fe-production.up.railway.app/)

## 🛠️ Stack Tecnológico

**Backend:**
- Node.js + Express.js
- Prisma ORM (SQLite en desarrollo, PostgreSQL en producción)
- JWT para autenticación y roles
- OpenAI API para el bot inteligente
- Multer para manejo de archivos
- Cloudinary para almacenamiento de documentos
- Docker y docker-compose para despliegue

**Frontend:**
- Next.js 14 + React 18 + TypeScript
- Tailwind CSS y Headless UI
- Axios para llamadas API
- Zustand para estado global
- React Hook Form para formularios
- Quill y react-markdown para edición y visualización de artículos

**Herramientas y Calidad:**
- Docker para contenedores
- ESLint y Prettier para calidad de código
- Husky para git hooks

## 📦 Estructura del Proyecto

- **backend/**: API REST, controladores, rutas, middleware, Prisma, Dockerfile
- **frontend/**: Next.js app, páginas protegidas, componentes, editor, gestión de usuarios, Dockerfile
- **uploads/**: Archivos subidos (legacy, ahora todo en Cloudinary)
- **docker-compose.yml**: Orquestación de servicios

## 🆕 Cambios y Mejoras Recientes

- Migración completa a Next.js 14 y React 18 con TypeScript
- Proxy API en frontend para comunicación segura con backend
- Autenticación robusta y protección de rutas (AuthProvider, useAuth)
- Panel de administración con dashboard y estadísticas en tiempo real (usuarios, artículos, consultas, documentos en Cloudinary)
- Calculadora de comisiones, sellos e ITI con historial y configuraciones por provincia
- Bot IA con sesiones, contexto relevante y OpenAI
- Gestión avanzada de documentos en Cloudinary (subida, descarga, eliminación, categorías, conteo en dashboard)
- Editor de artículos con soporte Markdown y vista previa
- Sistema de roles y permisos (ADMIN, USER, AGENTE) y control granular
- Dockerización de frontend y backend para despliegue en Railway
- Refactor de endpoints y controladores para estadísticas y conteo real de documentos en Cloudinary



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


## 📝 Funcionalidades Detalladas

### Base de Conocimiento
- Crear, editar y archivar artículos tipo wiki
- Editor Markdown con vista previa
- Categorización y búsqueda avanzada
- Historial de versiones

### Bot Inteligente
- Respuestas basadas en artículos y documentos
- Integración con OpenAI
- Sesiones de chat y contexto persistente

### Gestión y Generación de Documentos
- Subida, descarga y eliminación de archivos en Cloudinary
- Conteo de documentos en dashboard (en tiempo real)
- Templates de contratos y formularios personalizables
- Exportación a Word/PDF

### Calculadora Argentina
- Comisiones inmobiliarias
- Impuestos a las ganancias
- Sellos y tasas provinciales
- ITI (Impuesto a la Transferencia de Inmuebles)
- Historial y configuraciones por provincia

### Panel de Administración
- Dashboard con estadísticas en tiempo real (usuarios, artículos, consultas, documentos en Cloudinary)
- Gestión de usuarios y roles (CRUD)
- Administración de contenido y configuración del sistema

### Seguridad
- Autenticación JWT
- Roles y permisos granulares
- Validación y sanitización de datos
- Rate limiting


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

- [x] Estructura base del proyecto
- [x] Sistema de autenticación y roles
- [x] Base de conocimiento y editor avanzado
- [x] Bot con IA y contexto
- [x] Calculadora argentina y reportes
- [x] Sistema de documentos en Cloudinary
- [x] Panel de administración y dashboard en tiempo real
- [x] Despliegue en producción con Docker


## 🤝 Contribución

1. Fork el proyecto
2. Crear feature branch
3. Commit los cambios
4. Push al branch
5. Crear Pull Request

## 📄 Licencia

Este proyecto es privado y propietario de RE/MAX Argentina.
