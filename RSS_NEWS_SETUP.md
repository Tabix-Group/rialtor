# Sistema de Sincronización RSS para Noticias

## Descripción

Sistema automatizado para importar noticias del **World Property Journal** a través de su feed RSS y mostrarlas en la página de noticias de Rialtor con una interfaz tipo periódico profesional.

## 🌟 Características

- ✅ Sincronización automática cada 6 horas
- ✅ Sincronización manual desde el panel de administración
- ✅ Evita duplicados mediante URL única
- ✅ Actualiza noticias existentes si hay cambios
- ✅ Limpieza automática de noticias antiguas (>90 días)
- ✅ Categorización automática como "Internacional"
- ✅ Estadísticas de importación
- ✅ UI/UX profesional estilo periódico

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

### Sincronizar Noticias (Admin)
```http
POST /api/news/sync
Authorization: Bearer <token>
Content-Type: application/json

{
  "limit": 30  // Número de noticias a importar (default: 20)
}
```

**Respuesta:**
```json
{
  "message": "Sincronización exitosa: 15 importadas, 3 actualizadas, 12 omitidas",
  "stats": {
    "total": 30,
    "imported": 15,
    "updated": 3,
    "skipped": 12,
    "errors": []
  }
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

1. **Sincronización RSS**: Cada 6 horas (00:00, 06:00, 12:00, 18:00)
   - Importa hasta 30 noticias del feed
   - Actualiza noticias existentes si hay cambios
   - Evita duplicados

2. **Limpieza de noticias antiguas**: Diariamente a las 03:00 AM
   - Elimina noticias mayores a 90 días
   - Solo afecta a noticias de World Property Journal

3. **Sincronización inicial**: 10 segundos después del inicio del servidor
   - Carga 20 noticias al arrancar

## 🧪 Pruebas

Para probar manualmente la sincronización:

```bash
cd backend
node test-rss-sync.js
```

Este script:
- Importa 10 noticias de prueba
- Muestra estadísticas detalladas
- Verifica la conexión al feed RSS
- Reporta errores si los hay

## 📊 Panel de Administración

Los administradores pueden sincronizar noticias manualmente desde el panel:

1. Ir a **Admin Panel** → **Noticias**
2. Click en **"Sincronizar RSS"**
3. Esperar confirmación
4. Ver estadísticas actualizadas

El botón muestra:
- 🔄 Estado de carga (animación de spin)
- ✅ Mensaje de éxito con estadísticas
- ❌ Mensajes de error si falla

## 🎨 Vista Pública

Las noticias importadas se muestran en `/news` con:
- Diseño estilo periódico profesional
- Categorización por sección
- Fuente claramente identificada (World Property Journal)
- Enlaces a artículos completos
- Fecha de publicación
- Synopsis del contenido

## 🔐 Seguridad

- Todos los endpoints de sincronización requieren autenticación
- Solo usuarios con rol `ADMIN` pueden sincronizar
- Validación de datos antes de importar
- Sanitización de contenido HTML

## 📝 Modelo de Datos

Cada noticia importada incluye:
```typescript
{
  id: string              // UUID
  title: string           // Título de la noticia
  synopsis: string        // Resumen (max 500 caracteres)
  source: "World Property Journal"
  externalUrl: string     // URL al artículo original
  publishedAt: DateTime   // Fecha de publicación
  categoryId: string      // ID de categoría "Internacional"
  isActive: boolean       // true
}
```

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
- Confirmar que el feed RSS está activo: https://www.worldpropertyjournal.com/feed.xml
- Revisar logs del servidor

### Errores de duplicados
- Normal si las noticias ya existen
- Se contarán como "skipped" en las estadísticas

### Categoría "Internacional" no existe
- El sistema la crea automáticamente en la primera sincronización
- Color: Verde (#10B981)

## 📈 Mejoras Futuras

- [ ] Importar imágenes de las noticias
- [ ] Agregar más fuentes RSS configurables
- [ ] Sistema de tags automáticos con IA
- [ ] Notificaciones push de nuevas noticias
- [ ] Traducción automática al español
- [ ] Cache de feeds para mejor rendimiento

## 🛠️ Configuración

Variables de entorno (ya configuradas):
```env
DATABASE_URL=<tu-database-url>
NODE_ENV=production
```

## 📞 Soporte

Para problemas o consultas, revisar:
- Logs del servidor: `console.log` con prefijo `[RSS Sync]`
- Estadísticas: `GET /api/news/stats`
- Script de prueba: `node test-rss-sync.js`

## ✨ Créditos

Sistema desarrollado para **Rialtor** integrando contenido de:
- **World Property Journal** - https://www.worldpropertyjournal.com
- Diseño UX/UI profesional estilo periódico
- Sincronización automatizada con node-cron
