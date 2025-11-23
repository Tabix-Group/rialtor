# 📱 Código QR en Placas VIP

## 🎯 Descripción

Se ha implementado la funcionalidad de código QR único para cada placa VIP generada. El QR se genera automáticamente y redirige a la URL personalizada que se carga en el formulario del generador de placas VIP.

## ✨ Características

### Diseño Estético
- **Posición**: Superior derecha, debajo de la imagen circular interior
- **Tamaño**: 140x140px (óptimo para escaneo)
- **Marco decorativo**: Borde con gradiente suave y sombra sutil
- **Colores**: Azul (#2c5282) que combina con el diseño de la placa
- **Espaciado**: 30px debajo de la imagen circular para balance visual

### Funcionalidad
- Genera un QR único para cada placa VIP
- Utiliza la URL personalizada del campo `url` en el formulario
- URL por defecto: `www.rialtor.app` (si no se especifica otra)
- Nivel de corrección de errores: Medium (M)
- Margen interno: 1 (para mantener tamaño compacto)

## 🔧 Implementación Técnica

### Backend

**Dependencia agregada:**
```json
"qrcode": "^1.5.3"
```

**Archivo modificado:**
- `/backend/src/controllers/plaqueController.js`

**Función principal:**
- `createVIPPlaqueOverlayFromBufferActual()`

**Proceso:**
1. Extrae la URL de `propertyInfo.url`
2. Genera el código QR usando la librería `qrcode`
3. Crea un marco decorativo con SVG (sombra y borde con gradiente)
4. Compone el QR con su marco usando Sharp
5. Agrega el QR como capa en la composición final de la placa

### Frontend

**Formulario:**
- Ya incluye el campo "URL personalizada" en `/frontend/src/app/placas/page.tsx`
- Campo por defecto: `www.rialtor.app`
- Tooltip explicativo: "Esta URL aparecerá en el footer de la placa"

## 📐 Posicionamiento

```
Placa VIP (1080x1080px)
├─ Imagen Exterior (superior, 670px altura)
│  └─ Imagen Interior circular (esquina sup. derecha, 200px)
│     └─ 📱 CÓDIGO QR (30px debajo, 140x140px) ← NUEVO
├─ Área blanca (con información de propiedad)
│  └─ Foto del agente (izquierda, opcional)
└─ Barra azul inferior (información y contacto)
```

## 🎨 Detalles Visuales

### Marco del QR
- **Fondo**: Blanco con bordes redondeados (8px radius)
- **Borde**: Gradiente suave gris azulado (2px)
- **Sombra**: Sutil con blur de 3px y opacidad 20%
- **Padding**: 8px alrededor del QR

### Colores
- **QR Dark**: `#2c5282` (azul que combina con el diseño)
- **QR Light**: `#ffffff` (blanco)
- **Borde inicio**: `#e0e7ef`
- **Borde fin**: `#cbd5e0`

## 🚀 Uso

### Crear Placa VIP con QR Personalizado:

1. Ir a la sección "Placas"
2. Crear nueva placa
3. Seleccionar modelo "VIP"
4. Cargar las imágenes requeridas (interior, exterior, agente opcional)
5. **Completar el campo "URL personalizada"** con la URL deseada
6. Completar el resto de información de la propiedad
7. Generar placa

**Ejemplo de URL:**
```
https://www.rialtor.app/propiedades/12345
www.inmobiliaria.com/venta/casa-123
https://example.com/contacto
```

### Resultado:
- Placa VIP con código QR en la esquina superior derecha
- QR escaneable que redirige a la URL especificada
- Diseño elegante y balanceado con el resto del contenido

## ⚡ Manejo de Errores

Si ocurre un error al generar el QR:
- La placa se genera sin el código QR
- Se registra el error en los logs del backend
- El proceso continúa normalmente sin interrumpir la creación de la placa

```javascript
console.error('[PLACAS VIP] Error generando código QR:', qrError);
// Continuar sin el QR si hay error
```

## 🧪 Testing

Para probar la funcionalidad:

1. **Reiniciar el backend** para cargar la nueva dependencia:
   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. **Crear una placa VIP de prueba:**
   - Usar una URL válida en el campo correspondiente
   - Generar la placa
   - Verificar que el QR aparece en la posición correcta
   - Escanear el QR con un teléfono para verificar que funciona

3. **Verificar casos extremos:**
   - URL muy larga
   - URL sin protocolo (http/https)
   - Campo URL vacío (debe usar default)

## 📝 Notas Adicionales

- El QR se genera únicamente para el modelo VIP
- Los modelos Standard y Premium no incluyen QR
- El tamaño del QR (140px) es óptimo para escaneo con smartphones
- La corrección de errores nivel M permite hasta ~15% de daño y sigue siendo legible
- El diseño del QR está pensado para integrarse armónicamente con el estilo premium de la placa

## 🔍 Logs

Durante la generación, se registran los siguientes logs:

```
[PLACAS VIP] Código QR generado para URL: https://ejemplo.com
[PLACAS VIP] Placa VIP premium creada exitosamente
```

En caso de error:
```
[PLACAS VIP] Error generando código QR: [detalles del error]
```
