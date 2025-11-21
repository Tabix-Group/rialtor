# 🌟 Generador de Placas VIP - Documentación

## 📋 Descripción General

El modelo **Placa VIP** es una nueva funcionalidad que permite generar placas inmobiliarias utilizando un template personalizado (`templateplaca.jpeg`) como base, sobre el cual se componen tres imágenes específicas (interior, exterior y agente) junto con la información de la propiedad.

## ✨ Características Principales

### Diferencias entre los modelos:

| Característica | Standard | Premium | **VIP** |
|---------------|----------|---------|---------|
| Imágenes requeridas | 1-10 (libres) | 1-10 (libres) | **3 específicas** |
| Template de fondo | ❌ | ❌ | **✅ Personalizado** |
| Imagen del agente | ❌ | ✅ (Zócalo) | **✅ (Circular)** |
| Posicionamiento | Automático | Automático | **Predefinido** |
| Análisis con IA | ✅ | ✅ | **❌ (No necesario)** |

## 🏗️ Arquitectura

### Backend

#### Nuevas Funciones:

1. **`createVIPPlaqueOverlay()`**
   - Ubicación: `/backend/src/controllers/plaqueController.js`
   - Función: Compone las 3 imágenes sobre el template base
   - Parámetros:
     - `templatePath`: Ruta al archivo `templateplaca.jpeg`
     - `propertyInfo`: Datos de la propiedad
     - `interiorImageBuffer`: Buffer de la imagen interior
     - `exteriorImageBuffer`: Buffer de la imagen exterior
     - `agentImageBuffer`: Buffer de la imagen del agente (opcional)

2. **`createVIPTextOverlay()`**
   - Función: Genera el SVG con los textos de la propiedad
   - Retorna: String SVG para componer sobre la imagen

3. **`processVIPPlaque()`**
   - Función: Maneja el flujo completo de procesamiento de una placa VIP
   - Pasos:
     1. Subir imágenes originales a Cloudinary
     2. Generar placa compuesta con template
     3. Subir placa final a Cloudinary
     4. Actualizar registro en BD

#### Configuración de Multer:

```javascript
const uploadFields = upload.fields([
  { name: 'images', maxCount: 10 },        // Standard/Premium
  { name: 'agentImage', maxCount: 1 },     // Premium/VIP
  { name: 'interiorImage', maxCount: 1 },  // VIP
  { name: 'exteriorImage', maxCount: 1 }   // VIP
]);
```

### Frontend

#### Nuevos Estados:

```typescript
const [modelType, setModelType] = useState<'standard' | 'premium' | 'vip'>('standard');
const [interiorImageFile, setInteriorImageFile] = useState<File | null>(null);
const [exteriorImageFile, setExteriorImageFile] = useState<File | null>(null);
```

#### Nuevos Handlers:

- `handleInteriorImageSelect()`
- `handleExteriorImageSelect()`
- `removeInteriorImage()`
- `removeExteriorImage()`

## 🎨 Diseño del Template

### Áreas Definidas (Basado en 1080x1080):

```javascript
// Imagen Interior (Izquierda-Superior)
const interiorArea = {
  x: 54,      // 5% del ancho
  y: 54,      // 5% de la altura
  width: 464, // 43% del ancho
  height: 540 // 50% de la altura
};

// Imagen Exterior (Derecha-Superior)
const exteriorArea = {
  x: 562,     // 52% del ancho
  y: 54,      // 5% de la altura
  width: 464, // 43% del ancho
  height: 540 // 50% de la altura
};

// Imagen del Agente (Izquierda-Inferior, circular)
const agentArea = {
  x: 54,      // 5% del ancho
  y: 648,     // 60% de la altura
  width: 216, // 20% del ancho
  height: 378 // 35% de la altura
};
```

### Área de Texto (Derecha-Inferior):

- **Precio**: Fuente grande y destacada
- **Tipo de propiedad**: Título secundario
- **Características**: Con iconos (ambientes, dormitorios, baños, cocheras, m²)
- **Contacto**: Teléfono y email
- **Corredores**: Información de matrículas

## 📝 Flujo de Uso

### 1. Crear Nueva Placa VIP

```
Usuario selecciona "VIP" en el selector de modelo
  ↓
Se muestran 3 campos de upload específicos
  ↓
Usuario sube:
  - Imagen Interior (obligatoria)
  - Imagen Exterior (obligatoria)
  - Imagen Agente (opcional)
  ↓
Usuario completa datos de la propiedad
  ↓
Click en "Crear Placa"
```

### 2. Procesamiento Backend

```
Backend recibe FormData con modelType='vip'
  ↓
Valida presencia de interiorImage y exteriorImage
  ↓
Crea registro en BD con status='PROCESSING'
  ↓
Procesamiento asíncrono:
  1. Sube imágenes originales a Cloudinary
  2. Carga template base (templateplaca.jpeg)
  3. Redimensiona y compone las 3 imágenes
  4. Genera SVG con textos
  5. Compone todo sobre el template
  6. Sube placa final a Cloudinary
  7. Actualiza registro con status='COMPLETED'
```

### 3. Resultado

El usuario obtiene una placa con:
- ✅ Template profesional de fondo
- ✅ Imágenes de interior y exterior posicionadas
- ✅ Imagen circular del agente (si se proporcionó)
- ✅ Todos los datos de la propiedad formateados
- ✅ Lista para descargar y publicar

## 🔧 Validaciones

### Backend:

```javascript
if (modelType === 'vip') {
  if (!req.files || !req.files.interiorImage || !req.files.exteriorImage) {
    return res.status(400).json({
      error: 'Imágenes incompletas',
      message: 'El modelo VIP requiere imagen interior y exterior'
    });
  }
}
```

### Frontend:

```typescript
if (modelType === 'vip') {
  if (!interiorImageFile || !exteriorImageFile) {
    alert('Para el modelo VIP debes seleccionar imagen interior y exterior');
    return;
  }
}
```

## 📊 Campos de Datos Soportados

### Obligatorios:
- `precio` - Precio de la propiedad
- `corredores` - Nombre y matrícula

### Opcionales:
- `tipo` - Tipo de propiedad (Casa, Departamento, etc.)
- `moneda` - USD, ARS, EUR
- `direccion` - Ubicación
- `ambientes` - Cantidad de ambientes
- `dormitorios` - Cantidad de dormitorios
- `banos` - Cantidad de baños
- `cocheras` - Cantidad de cocheras
- `m2_totales` - Superficie total
- `m2_cubiertos` - Superficie cubierta
- `antiguedad` - Años de antigüedad
- `contacto` - Teléfono de contacto
- `email` - Email de contacto
- `descripcion` - Descripción adicional
- `agentName` - Nombre del agente
- `agency` - Nombre de la agencia
- `agentContact` - Contacto del agente

## 🚀 Ventajas del Modelo VIP

1. **Consistencia de Marca**: Template unificado para todas las propiedades
2. **Mayor Control**: Posicionamiento predefinido de elementos
3. **Profesionalidad**: Diseño más elaborado y elegante
4. **Personalización**: Template puede ser modificado según necesidades
5. **Eficiencia**: No requiere análisis con IA, procesamiento más rápido

## 🛠️ Personalización del Template

Para modificar el diseño del template VIP:

1. Edita el archivo `/frontend/public/images/templateplaca.jpeg`
2. Ajusta las coordenadas en `createVIPPlaqueOverlay()`:
   ```javascript
   const interiorArea = { x: ..., y: ..., width: ..., height: ... };
   const exteriorArea = { x: ..., y: ..., width: ..., height: ... };
   const agentArea = { x: ..., y: ..., width: ..., height: ... };
   ```
3. Modifica el área de texto en `createVIPTextOverlay()`:
   ```javascript
   const textAreaY = Math.floor(height * 0.58);
   const textAreaX = Math.floor(width * 0.28);
   ```

## 📝 Ejemplo de Request

```typescript
const formData = new FormData();
formData.append('title', 'Placa VIP - Propiedad Premium');
formData.append('modelType', 'vip');
formData.append('interiorImage', interiorFile);
formData.append('exteriorImage', exteriorFile);
formData.append('agentImage', agentFile);
formData.append('propertyData', JSON.stringify({
  tipo: 'Casa',
  precio: '250000',
  moneda: 'USD',
  direccion: 'Av. Principal 1234',
  ambientes: '4',
  dormitorios: '3',
  banos: '2',
  cocheras: '2',
  m2_totales: '180',
  m2_cubiertos: '150',
  contacto: '+54 11 1234-5678',
  corredores: 'Juan Pérez - Mat. 12345',
  agentName: 'Juan Pérez',
  agency: 'RE/MAX Premium'
}));
```

## 🐛 Troubleshooting

### Error: "Faltan imágenes requeridas"
- Verificar que se hayan seleccionado imagen interior y exterior
- Comprobar que los archivos sean válidos (JPG, PNG)

### Error: "Template no encontrado"
- Verificar que existe `/frontend/public/images/templateplaca.jpeg`
- Comprobar permisos de lectura del archivo

### Imágenes mal posicionadas
- Revisar las coordenadas de las áreas en `createVIPPlaqueOverlay()`
- Asegurar que el template tiene las dimensiones esperadas (1080x1080)

## 💡 Mejoras Futuras

- [ ] Múltiples templates VIP para elegir
- [ ] Editor visual para ajustar posicionamiento
- [ ] Soporte para diferentes tamaños de template
- [ ] Previsualización en tiempo real
- [ ] Animaciones y efectos especiales
- [ ] Exportación en múltiples formatos

---

**Implementado**: 21 de Noviembre de 2025
**Versión**: 1.0.0
**Autor**: Sistema de Placas Rialtor
