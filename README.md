# RE/MAX Knowledge Platform

Una plataforma completa de gestión de conocimiento para RE/MAX Argentina con bot inteligente, calculadoras de comisiones y sistema de documentos.

## 🚀 Características

- **Base de Conocimiento**: Sistema tipo wiki para documentación del sector inmobiliario
- **Bot con IA**: Asistente inteligente alimentado por OpenAI que responde consultas sobre documentos
- **Generación de Documentos**: Templates de contratos, formularios y documentos legales
- **Calculadora Argentina**: Comisiones, impuestos, sellos y tasas locales
- **Panel de Administración**: Gestión de usuarios, contenido y configuraciones
- **Autenticación**: Sistema de roles y permisos

## 🛠️ Stack Tecnológico

### Backend
- **Node.js** con **Express.js**
- **SQLite** (desarrollo) → **PostgreSQL** (producción)
- **Prisma ORM** para manejo de base de datos
- **JWT** para autenticación
- **OpenAI API** para el bot inteligente
- **Multer** para manejo de archivos

### Frontend
- **Next.js 14** con **React 18**
- **TypeScript** para mayor robustez
- **Tailwind CSS** para estilos
- **Headless UI** para componentes
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
