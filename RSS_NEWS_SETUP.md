# Sistema de Sincronización RSS para Noticias

## Descripción

Sistema automatizado para importar noticias de **múltiples fuentes RSS** del sector inmobiliario argentino e internacional, mostrándolas en la página de noticias de Rialtor con una interfaz tipo periódico profesional.

## 🌟 Características

- ✅ **8 fuentes RSS integradas**:
  - World Property Journal (Internacional)
  - Reporte Inmobiliario (Mercado Nacional)
  - ArgenProp (Tendencias)
  - Grupo Construya (Construcción)
  - Tokko Broker Blog (Tecnología Inmobiliaria)
  - Mercado Inmobiliario CABA (CABA)
  - Punto a Punto (Desarrollo Córdoba)
  - Revista Construcción (Índices y Costos)
- ✅ Sincronización automática diaria a las 8 AM (hora Argentina)
- ✅ Sincronización manual desde el panel (todas las fuentes o individual)
- ✅ Evita duplicados mediante URL única
- ✅ Actualiza noticias existentes si hay cambios
- ✅ Limpieza automática de noticias antiguas (>90 días)
- ✅ Categorización automática por fuente
- ✅ Estadísticas detalladas por fuente
- ✅ UI/UX profesional estilo periódico

## 📰 Fuentes RSS Configuradas

### 1. World Property Journal
- **URL**: https://www.worldpropertyjournal.com/feed.xml
- **Categoría**: Internacional (Verde #10B981)
- **Descripción**: Noticias del mercado inmobiliario internacional

### 2. Reporte Inmobiliario
- **URL**: http://www.reporteinmobiliario.com/nuke/rss.xml
- **Categoría**: Mercado Nacional (Azul #3B82F6)
- **Descripción**: Análisis y reportes del mercado inmobiliario argentino

### 3. ArgenProp
- **URL**: https://argenprop4.rssing.com/index.php
- **Categoría**: Tendencias (Amarillo #F59E0B)
- **Descripción**: Tendencias y novedades del sector inmobiliario

### 4. Grupo Construya
- **URL**: https://www.grupoconstruya.com.ar/rss/construya.xml
- **Categoría**: Construcción (Púrpura #8B5CF6)
- **Descripción**: Noticias sobre construcción y desarrollo inmobiliario

### 5. Tokko Broker Blog
- **URL**: https://blog.tokkobroker.com/rss.xml
- **Categoría**: Tecnología Inmobiliaria (Rosa #EC4899)
- **Descripción**: Innovación y tecnología en el sector inmobiliario

### 6. Mercado Inmobiliario CABA
- **URL**: https://mercadoinmobiliariocaba.com/feed/
- **Categoría**: CABA (Verde Azulado #14B8A6)
- **Descripción**: Noticias del mercado inmobiliario en Buenos Aires

### 7. Punto a Punto
- **URL**: https://puntoapunto.com.ar/feed/
- **Categoría**: Desarrollo Córdoba (Rojo #EF4444)
- **Descripción**: Desarrollismo inmobiliario y urbanizaciones en Córdoba

### 8. Revista Construcción
- **URL**: https://www.revistaconstruccion.com.ar/feed/
- **Categoría**: Índices y Costos (Índigo #6366F1)
- **Descripción**: Índices de costos de construcción y análisis técnico del sector

## 🚀 Instalación

El sistema ya está instalado y configurado. La librería `rss-parser` fue agregada al backend:

```bash
cd backend
npm install rss-parser
```

## 📁 Estructura de Archivos

```
backend/
├── src/
│   ├── services/
│   │   ├── rssService.js       # Servicio principal de RSS
│   │   └── cronJobs.js          # Tareas programadas
│   ├── controllers/
│   │   └── newsController.js    # Endpoints de noticias (extendido)
│   └── routes/
│       └── news.js              # Rutas de API (extendido)
└── test-rss-sync.js             # Script de prueba

frontend/
└── src/
    ├── components/
    │   └── NewsManagement.tsx   # Panel admin con botón de sincronización
    └── app/
        └── news/
            └── page.tsx         # Página pública de noticias
```

## 🔧 Endpoints API

### Sincronizar Todas las Fuentes (Admin)
```http
POST /api/news/sync
Authorization: Bearer <token>
Content-Type: application/json

{
  "limit": 30  // Número de noticias por fuente (default: 20)
}
```

**Respuesta:**
```json
{
  "message": "Sincronización exitosa: 45 importadas, 10 actualizadas de 4/4 fuentes",
  "stats": {
    "totalSources": 4,
    "successfulSources": 4,
    "failedSources": 0,
    "totalImported": 45,
    "totalUpdated": 10,
    "totalSkipped": 35,
    "totalErrors": 0,
    "bySource": [...]
  }
}
```

### Sincronizar Fuente Específica (Admin)
```http
POST /api/news/sync/:source
Authorization: Bearer <token>
Content-Type: application/json

{
  "limit": 20
}
```

**Fuentes disponibles:**
- `WORLD_PROPERTY` - World Property Journal
- `REPORTE_INMOBILIARIO` - Reporte Inmobiliario
- `ARGENPROP` - ArgenProp
- `CONSTRUYA` - Grupo Construya
- `TOKKO_BROKER` - Tokko Broker Blog
- `MERCADO_CABA` - Mercado Inmobiliario CABA
- `PUNTO_A_PUNTO` - Punto a Punto
- `REVISTA_CONSTRUCCION` - Revista Construcción

**Respuesta:**
```json
{
  "message": "Reporte Inmobiliario: 15 importadas, 3 actualizadas, 12 omitidas",
  "stats": {
    "source": "Reporte Inmobiliario",
    "total": 30,
    "imported": 15,
    "updated": 3,
    "skipped": 12,
    "errors": []
  }
}
```

### Listar Fuentes RSS (Admin)
```http
GET /api/news/sources
Authorization: Bearer <token>
```

**Respuesta:**
```json
{
  "sources": [
    {
      "key": "WORLD_PROPERTY",
      "name": "World Property Journal",
      "url": "https://www.worldpropertyjournal.com/feed.xml",
      "category": "Internacional"
    },
    ...
  ]
}
```

### Obtener Estadísticas (Admin)
```http
GET /api/news/stats
Authorization: Bearer <token>
```

**Respuesta:**
```json
{
  "stats": {
    "total": 150,
    "active": 145,
    "bySource": [
      { "source": "World Property Journal", "count": 120 },
      { "source": "Manual", "count": 30 }
    ]
  }
}
```

### Limpiar Noticias Antiguas (Admin)
```http
POST /api/news/clean-old
Authorization: Bearer <token>
Content-Type: application/json

{
  "daysOld": 90  // Días de antigüedad (default: 90)
}
```

## ⏰ Tareas Programadas (Cron)

El sistema ejecuta automáticamente:

1. **Sincronización RSS de todas las fuentes**: Diariamente a las 8:00 AM (hora Argentina)
   - Importa hasta 30 noticias de cada fuente
   - Actualiza noticias existentes si hay cambios
   - Evita duplicados
   - Zona horaria: America/Argentina/Buenos_Aires

2. **Limpieza de noticias antiguas**: Diariamente a las 03:00 AM (hora Argentina)
   - Elimina noticias mayores a 90 días
   - Afecta a todas las fuentes RSS
   - Zona horaria: America/Argentina/Buenos_Aires

3. **Sincronización inicial**: 10 segundos después del inicio del servidor
   - Carga 20 noticias de cada fuente al arrancar

## 🧪 Pruebas

Para probar manualmente la sincronización de todas las fuentes:

```bash
cd backend
node test-rss-sync.js
```

Este script:
- Lista todas las fuentes RSS disponibles
- Importa 10 noticias de cada fuente
- Muestra estadísticas detalladas por fuente
- Muestra estadísticas consolidadas
- Verifica la conexión a todos los feeds
- Reporta errores específicos por fuente

## 📊 Panel de Administración

Los administradores pueden sincronizar noticias desde el panel:

1. Ir a **Admin Panel** → **Noticias**
2. Click en **"Sincronizar RSS"** (botón verde con dropdown)
3. Opciones disponibles:
   - **Sincronizar todas las fuentes**: Importa de las 4 fuentes
   - **Fuentes individuales**: Selecciona una fuente específica
4. Ver estadísticas actualizadas

El botón muestra:
- 🔄 Estado de carga (animación de spin)
- ✅ Mensaje de éxito con estadísticas detalladas
- ❌ Mensajes de error si falla
- 📋 Dropdown con todas las fuentes disponibles

## 🎨 Vista Pública

Las noticias importadas se muestran en `/news` con:
- 📰 Diseño profesional estilo periódico
- 🏷️ Categorización automática por fuente:
  - **Internacional** (verde) - World Property Journal
  - **Mercado Nacional** (azul) - Reporte Inmobiliario
  - **Tendencias** (amarillo) - ArgenProp
  - **Construcción** (púrpura) - Grupo Construya
  - **Tecnología Inmobiliaria** (rosa) - Tokko Broker Blog
  - **CABA** (verde azulado) - Mercado Inmobiliario CABA
  - **Desarrollo Córdoba** (rojo) - Punto a Punto
  - **Índices y Costos** (índigo) - Revista Construcción
- 🔗 Enlaces directos a artículos completos
- 📅 Fechas de publicación
- ✍️ Synopsis del contenido (max 500 caracteres)
- 🎨 Coherencia con el diseño existente
- 🔍 Filtrado por categoría/fuente

## 🔄 Flujo de Sincronización

```
Multiple RSS Feeds
    ↓
rssService.js (parsea y limpia cada fuente)
    ↓
Verifica duplicados (por URL)
    ↓
Crea/Actualiza en DB
    ↓
Asigna categoría según fuente
    ↓
Muestra en /news con diseño periódico
```

### Proceso por Fuente

1. **Fetch RSS**: Descarga el feed de la fuente específica
2. **Parse**: Extrae título, descripción, URL y fecha
3. **Sanitize**: Limpia HTML y limita caracteres (500)
4. **Check duplicates**: Verifica si la URL ya existe en la BD
5. **Update or Create**: 
   - Si existe y hay cambios → actualiza
   - Si existe sin cambios → omite (skip)
   - Si no existe → crea nueva
6. **Categorize**: Asigna categoría predefinida para la fuente
7. **Return stats**: Reporta resultados individuales

8. **Consolidate**: Al final, consolida estadísticas de todas las fuentes

## 🔐 Seguridad

- Todos los endpoints de sincronización requieren autenticación
- Solo usuarios con rol `ADMIN` pueden sincronizar
- Validación de datos antes de importar
- Sanitización de contenido HTML
- Rate limiting en endpoints de API
- Validación de URLs antes de crear noticias

## 📝 Modelo de Datos

Cada noticia importada incluye:
```typescript
{
  id: string              // UUID
  title: string           // Título de la noticia
  synopsis: string        // Resumen (max 500 caracteres)
  source: string          // Fuente: "World Property Journal", "Reporte Inmobiliario", etc.
  externalUrl: string     // URL al artículo original (única)
  publishedAt: DateTime   // Fecha de publicación
  categoryId: string      // ID de categoría según fuente
  isActive: boolean       // true
}
```

### Mapeo de Categorías por Fuente

| Fuente | Categoría | Color | Slug |
|--------|-----------|-------|------|
| World Property Journal | Internacional | #10B981 (Verde) | internacional |
| Reporte Inmobiliario | Mercado Nacional | #3B82F6 (Azul) | mercado-nacional |
| ArgenProp | Tendencias | #F59E0B (Amarillo) | tendencias |
| Grupo Construya | Construcción | #8B5CF6 (Púrpura) | construccion |
| Tokko Broker Blog | Tecnología Inmobiliaria | #EC4899 (Rosa) | tecnologia-inmobiliaria |
| Mercado Inmobiliario CABA | CABA | #14B8A6 (Verde Azulado) | caba |
| Punto a Punto | Desarrollo Córdoba | #EF4444 (Rojo) | desarrollo-cordoba |
| Revista Construcción | Índices y Costos | #6366F1 (Índigo) | indices-costos |

## 🔄 Flujo de Sincronización

1. **Fetch RSS**: Descarga el feed de World Property Journal
2. **Parse**: Extrae título, descripción, URL y fecha
3. **Sanitize**: Limpia HTML y limita caracteres
4. **Check duplicates**: Verifica si la URL ya existe
5. **Update or Create**: Actualiza si existe, crea si es nueva
6. **Categorize**: Asigna a categoría "Internacional"
7. **Return stats**: Reporta resultados

## 🐛 Troubleshooting

### No se importan noticias
- Verificar conexión a internet
- Confirmar que los feeds RSS están activos:
  - https://www.worldpropertyjournal.com/feed.xml
  - http://www.reporteinmobiliario.com/nuke/rss.xml
  - https://argenprop4.rssing.com/index.php
  - https://www.grupoconstruya.com.ar/rss/construya.xml
- Revisar logs del servidor (buscar `[RSS Sync]`)
- Ejecutar `node test-rss-sync.js` para diagnóstico

### Errores de duplicados
- Normal si las noticias ya existen
- Se contarán como "skipped" en las estadísticas
- Las noticias se identifican por URL única

### Una fuente falla pero otras funcionan
- El sistema es resiliente: si una fuente falla, continúa con las demás
- Revisar logs para ver qué fuente específica falló
- Verificar la URL del feed problemático
- Intentar sincronizar solo esa fuente: `POST /api/news/sync/:source`

### Categorías no aparecen
- Las categorías se crean automáticamente en la primera sincronización
- Si faltan, verificar que el servicio tenga permisos de escritura en la BD
- Revisar tabla `categories` en la base de datos

### Noticias aparecen sin synopsis
- Algunos feeds no incluyen descripción
- El sistema intenta usar: `contentSnippet`, `description` o `content`
- Si ninguno está disponible, el campo queda vacío

## 📈 Mejoras Futuras

- [ ] Importar imágenes de las noticias
- [ ] Sistema de tags automáticos con IA
- [ ] Notificaciones push de nuevas noticias importantes
- [ ] Traducción automática al español (para fuentes en inglés)
- [ ] Cache de feeds para mejor rendimiento
- [ ] Detección de noticias duplicadas por similitud de contenido (no solo URL)
- [ ] Agregar más fuentes RSS configurables desde el panel
- [ ] Programación personalizada de sincronización por fuente
- [ ] Análisis de sentimiento de noticias
- [ ] Resúmenes automáticos con IA

## 🛠️ Configuración

Variables de entorno (ya configuradas):
```env
DATABASE_URL=<tu-database-url>
NODE_ENV=production
PORT=3003
```

### Agregar Nueva Fuente RSS

Para agregar una nueva fuente RSS, editar `backend/src/services/rssService.js`:

```javascript
const RSS_SOURCES = {
    // ... fuentes existentes ...
    
    NUEVA_FUENTE: {
        url: 'https://ejemplo.com/rss.xml',
        name: 'Nombre de la Fuente',
        categoryName: 'Categoría',
        categorySlug: 'categoria',
        categoryColor: '#HEXCOLOR',
        categoryDescription: 'Descripción de la categoría'
    }
};
```

## 📊 Estadísticas y Monitoreo

### Ver estadísticas en tiempo real

```bash
# Desde el backend
node test-rss-sync.js
```

O mediante API:
```http
GET /api/news/stats
Authorization: Bearer <admin-token>
```

### Logs del Sistema

Los logs de sincronización incluyen el prefijo `[RSS Sync]`:
- `[RSS Sync] Iniciando sincronización...`
- `[RSS Sync] Feed parseado: ...`
- `[RSS Sync] Importada: ...`
- `[RSS Sync] Actualizada: ...`
- `[RSS Sync] Sincronización completada`

### Métricas Clave

- **Total de fuentes**: 8
- **Noticias por sincronización**: Hasta 30 por fuente (240 total)
- **Frecuencia**: Diaria a las 8:00 AM (Argentina)
- **Retención**: 90 días
- **Tasa de éxito esperada**: >95%

## 📞 Soporte

Para problemas o consultas, revisar:
- Logs del servidor: `console.log` con prefijo `[RSS Sync]`
- Estadísticas: `GET /api/news/stats`
- Script de prueba: `node test-rss-sync.js`
- Documentación de cada fuente RSS

### Contacto por Fuente

- **World Property Journal**: https://www.worldpropertyjournal.com
- **Reporte Inmobiliario**: http://www.reporteinmobiliario.com
- **ArgenProp**: https://www.argenprop.com
- **Grupo Construya**: https://www.grupoconstruya.com.ar
- **Tokko Broker**: https://www.tokkobroker.com
- **Mercado Inmobiliario CABA**: https://mercadoinmobiliariocaba.com
- **Punto a Punto**: https://puntoapunto.com.ar
- **Revista Construcción**: https://www.revistaconstruccion.com.ar

## ✨ Créditos

Sistema desarrollado para **Rialtor** integrando contenido de:
- **World Property Journal** - Noticias inmobiliarias internacionales
- **Reporte Inmobiliario** - Análisis del mercado argentino
- **ArgenProp** - Portal inmobiliario líder en Argentina
- **Grupo Construya** - Noticias de construcción y desarrollo
- **Tokko Broker** - Blog sobre tecnología e innovación inmobiliaria
- **Mercado Inmobiliario CABA** - Noticias del mercado porteño
- **Punto a Punto** - Desarrollismo y urbanizaciones en Córdoba
- **Revista Construcción** - Índices de costos y análisis técnico del sector

Tecnologías utilizadas:
- **rss-parser** - Parseo de feeds RSS
- **node-cron** - Tareas programadas
- **Prisma ORM** - Base de datos
- **Next.js + React** - Frontend
- **Express.js** - Backend API

---

**Última actualización**: Octubre 2025  
**Versión**: 3.0 (8 fuentes RSS verificadas)  
**Mantenido por**: Equipo Rialtor
