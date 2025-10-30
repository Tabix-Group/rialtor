# Indicadores Económicos e Inmobiliarios

## Descripción

Sistema de indicadores económicos e inmobiliarios en tiempo real para el mercado argentino. Muestra datos actualizados automáticamente sobre:

- **Cotizaciones del Dólar**: Oficial, Blue y Tarjeta
- **Precio por m² en CABA y Buenos Aires**: Valores de venta y alquiler
- **Escrituraciones**: Cantidad mensual en CABA y Buenos Aires
- **Tendencias del Mercado**: Demanda, stock y tiempos de venta

## Características

✨ **Actualización Automática**: Los datos se refrescan cada 5 minutos
📊 **Datos en Tiempo Real**: Integración con APIs públicas argentinas
🎨 **Diseño Profesional**: UI/UX de clase mundial acorde al resto de la plataforma
💾 **Sistema de Caché**: Reduce la carga en las APIs externas
🔄 **Actualizaciones Dinámicas**: Polling automático sin recargar la página

## Componentes

### Backend

#### Servicio (`backend/src/services/economicIndicatorsService.js`)
- Obtiene cotizaciones del dólar desde `dolarapi.com`
- Proporciona datos estimados del mercado inmobiliario
- Implementa sistema de caché con 5 minutos de duración
- Manejo robusto de errores con fallback a datos en caché

#### Controlador (`backend/src/controllers/indicatorsController.js`)
- `getDolarRates()`: Obtiene cotizaciones del dólar
- `getRealEstateData()`: Obtiene datos del mercado inmobiliario
- `getAllIndicators()`: Obtiene todos los indicadores combinados
- `clearCache()`: Limpia el caché (solo admin)

#### Rutas (`backend/src/routes/indicators.js`)
- `GET /api/indicators/dolar` - Cotizaciones del dólar (público)
- `GET /api/indicators/real-estate` - Datos inmobiliarios (público)
- `GET /api/indicators/all` - Todos los indicadores (público)
- `POST /api/indicators/clear-cache` - Limpiar caché (admin)

### Frontend

#### Página Completa (`frontend/src/app/indicadores/page.tsx`)
Vista completa con todos los indicadores detallados:
- Grid de cotizaciones del dólar
- Comparativa de precios por m² con desglose por zonas
- Estadísticas de escrituraciones
- Tendencias del mercado

#### Componente Sidebar (`frontend/src/components/EconomicIndicators.tsx`)
Widget compacto para la sidebar de usuarios logueados:
- Resumen de cotizaciones principales
- Precios por m² resumidos
- Escrituraciones del mes
- Botón de actualización manual

#### Card Landing (`frontend/src/components/EconomicIndicatorsCard.tsx`)
Card para la landing page que muestra:
- Preview de 3 indicadores principales
- Enlace a la vista completa
- Diseño acorde al resto de la landing

## Integración

### En la Sidebar (Navigation)
```tsx
import EconomicIndicators from "./EconomicIndicators"

// Se muestra automáticamente para usuarios logueados
// cuando la sidebar está expandida
```

### En la Landing Page
```tsx
import EconomicIndicatorsCard from "../components/EconomicIndicatorsCard"

// Se renderiza como una feature especial en el grid
```

## Fuentes de Datos

### Cotizaciones del Dólar
- **API**: [dolarapi.com](https://dolarapi.com)
- **Endpoint**: `GET https://dolarapi.com/v1/dolares`
- **Frecuencia**: Actualización en tiempo real
- **Tipos**: Oficial, Blue, Tarjeta

### Datos Inmobiliarios
⚠️ **Nota**: Los datos actuales son estimados. En producción, se debe integrar con:
- Colegio de Escribanos de la Ciudad de Buenos Aires
- Zonaprop API
- Properati API
- Reporte Inmobiliario

## Configuración

No requiere variables de entorno adicionales. El servicio utiliza APIs públicas.

Para producción, se recomienda:
1. Suscribirse a APIs de datos inmobiliarios profesionales
2. Configurar rate limiting específico para estos endpoints
3. Implementar monitoreo de disponibilidad de las APIs

## Actualización Automática

Los componentes del frontend implementan polling automático:

```typescript
useEffect(() => {
  fetchIndicators()
  
  // Actualizar cada 5 minutos
  const interval = setInterval(() => {
    fetchIndicators()
  }, 5 * 60 * 1000)

  return () => clearInterval(interval)
}, [])
```

## Manejo de Errores

El sistema implementa múltiples capas de fallback:

1. **API no disponible**: Devuelve datos en caché si existen
2. **Cache expirado**: Intenta nueva petición
3. **Datos no disponibles**: Muestra mensaje de error con botón de reintentar
4. **Loading states**: Skeleton loaders mientras carga

## Personalización

### Modificar Duración del Caché

En `backend/src/services/economicIndicatorsService.js`:

```javascript
this.CACHE_DURATION = 5 * 60 * 1000; // 5 minutos (modificar según necesidad)
```

### Modificar Frecuencia de Polling

En los componentes de frontend:

```typescript
const interval = setInterval(() => {
  fetchIndicators()
}, 5 * 60 * 1000) // Modificar según necesidad
```

### Agregar Nuevas Fuentes de Datos

1. Agregar método en `economicIndicatorsService.js`
2. Crear nuevo endpoint en `indicatorsController.js`
3. Registrar ruta en `indicators.js`
4. Actualizar componentes frontend con nuevos datos

## Próximas Mejoras

- [ ] Integración con APIs oficiales del mercado inmobiliario
- [ ] Gráficos de evolución histórica
- [ ] Notificaciones cuando hay cambios significativos
- [ ] Exportar datos a Excel/PDF
- [ ] Comparativas entre períodos
- [ ] WebSockets para actualizaciones en tiempo real
- [ ] Favoritos de zonas específicas
- [ ] Alertas personalizadas por umbral

## Soporte

Para reportar problemas o sugerir mejoras, contactar al equipo de desarrollo.

---

**Última actualización**: Octubre 2025
