# 📋 Sistema de Formularios Editables - Documentación

## 🎯 Descripción

Sistema completo para gestionar, visualizar y editar formularios del sector inmobiliario directamente en el navegador.

## 🏗️ Arquitectura

### **Backend**
- **Controlador**: `/backend/src/controllers/formController.js`
- **Rutas**: `/backend/src/routes/forms.js`
- **API Base**: `/api/forms`

### **Frontend**
- **Página principal**: `/app/formularios/page.tsx`
- **Lista de documentos**: `/app/formularios/[folder]/page.tsx`
- **Editor**: `/app/formularios/[folder]/[document]/page.tsx`
- **Proxy API**: `/pages/api/forms/[...path].ts`

## 📂 Estructura de Cloudinary

Los documentos deben estar organizados en Cloudinary con la siguiente estructura:

```
docgen/
├── alquiler/
│   ├── contrato-alquiler.docx
│   ├── inventario-propiedades.docx
│   └── ...
├── boletos/
│   ├── boleto-compraventa.docx
│   ├── oferta-compra.docx
│   └── ...
└── reservas/
    ├── reserva-propiedad.docx
    ├── oferta-reserva.docx
    └── ...
```

## 📤 Cómo Subir Documentos a Cloudinary

### **Opción 1: Interfaz Web de Cloudinary**

1. Inicia sesión en [Cloudinary](https://cloudinary.com)
2. Ve a **Media Library**
3. Crea las carpetas necesarias:
   - Click en "New Folder"
   - Nombre: `docgen`
   - Dentro de `docgen`, crea subcarpetas:
     - `alquiler`
     - `boletos`
     - `reservas`
4. Sube los archivos .docx a cada carpeta correspondiente
5. Los archivos estarán disponibles inmediatamente en la aplicación

### **Opción 2: Cloudinary CLI**

```bash
# Instalar CLI
npm install -g cloudinary-cli

# Configurar credenciales
cloudinary config

# Subir archivos
cloudinary upload_dir ./documentos/alquiler -f docgen/alquiler
cloudinary upload_dir ./documentos/boletos -f docgen/boletos
cloudinary upload_dir ./documentos/reservas -f docgen/reservas
```

### **Opción 3: API de Cloudinary (Programático)**

```javascript
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Subir un documento
async function uploadDocument(filePath, folder) {
  const result = await cloudinary.uploader.upload(filePath, {
    resource_type: 'raw',
    folder: `docgen/${folder}`,
    use_filename: true,
    unique_filename: false
  });
  
  console.log('Documento subido:', result.secure_url);
  return result;
}

// Ejemplo de uso
uploadDocument('./contratos/alquiler.docx', 'alquiler');
```

## 🔗 Endpoints API

### **GET /api/forms/folders**
Obtiene la lista de carpetas disponibles (alquiler, boletos, reservas)

**Response:**
```json
{
  "success": true,
  "data": [
    { "name": "alquiler", "path": "docgen/alquiler" },
    { "name": "boletos", "path": "docgen/boletos" },
    { "name": "reservas", "path": "docgen/reservas" }
  ]
}
```

### **GET /api/forms/:folder/documents**
Lista todos los documentos de una carpeta específica

**Parámetros:**
- `folder`: nombre de la carpeta (alquiler, boletos, reservas)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "docgen/alquiler/contrato-alquiler.docx",
      "filename": "contrato-alquiler.docx",
      "originalName": "contrato-alquiler.docx",
      "url": "https://res.cloudinary.com/...",
      "format": "docx",
      "size": 45678,
      "createdAt": "2025-01-15T10:30:00.000Z",
      "folder": "alquiler"
    }
  ]
}
```

### **GET /api/forms/document/:documentId/content**
Obtiene el contenido de un documento como HTML editable

**Parámetros:**
- `documentId`: ID del documento (debe estar URL-encoded)

**Response:**
```json
{
  "success": true,
  "data": {
    "html": "<p>Contenido del documento...</p>",
    "messages": [],
    "metadata": {
      "id": "docgen/alquiler/contrato.docx",
      "filename": "contrato.docx",
      "url": "https://...",
      "format": "docx",
      "size": 45678
    }
  }
}
```

### **GET /api/forms/document/:documentId/download**
Descarga el documento original sin modificar

**Parámetros:**
- `documentId`: ID del documento (debe estar URL-encoded)

**Response:** Archivo .docx descargable

### **POST /api/forms/generate**
Genera un documento completado con las ediciones del usuario

**Body:**
```json
{
  "documentId": "docgen/alquiler/contrato.docx",
  "htmlContent": "<p>Contenido editado...</p>",
  "filename": "contrato_completado_2025-01-15.docx"
}
```

**Response:** Archivo .docx descargable

### **GET /api/forms/stats**
Obtiene estadísticas de uso de formularios

**Response:**
```json
{
  "success": true,
  "data": {
    "alquiler": 5,
    "boletos": 8,
    "reservas": 12
  }
}
```

## 🎨 Flujo de Usuario

1. **Acceso**: Usuario navega a `/formularios`
2. **Selección de categoría**: Ve carpetas (Alquiler, Boletos, Reservas)
3. **Lista de documentos**: Click en carpeta → Lista de documentos disponibles
4. **Dos opciones por documento**:
   - **📥 Descargar Original**: Descarga directa del .docx original
   - **✏️ Abrir y Editar**: Abre el editor WYSIWYG
5. **Edición**: 
   - Documento se convierte a HTML editable
   - Editor visual tipo Word con toolbar
   - Usuario completa campos en blanco
6. **Descarga completada**: 
   - Click en "Descargar Documento Completado"
   - Se genera nuevo .docx con las ediciones
   - Descarga automática

## 🛠️ Editor de Documentos

### **Características del Editor**

- ✅ Editor WYSIWYG (What You See Is What You Get)
- ✅ Toolbar con opciones de formato:
  - Negrita, Cursiva, Tachado
  - Encabezados (H1, H2, H3)
  - Listas con viñetas y numeradas
- ✅ Botón de restablecer cambios
- ✅ Vista previa en tiempo real
- ✅ Generación y descarga de documento completado

### **Tecnologías Utilizadas**

**Frontend:**
- TipTap: Editor de texto enriquecido
- Mammoth.js: Conversión de .docx a HTML
- React: Framework UI

**Backend:**
- Mammoth: Parsear documentos Word
- docx: Generar documentos Word
- Cloudinary SDK: Gestión de archivos

## 🔒 Seguridad

- ✅ Autenticación requerida para acceder a formularios
- ✅ Token JWT en todas las peticiones
- ✅ Validación de permisos
- ✅ Sanitización de contenido HTML

## 📊 Limitaciones Actuales

1. **Formato del Documento**:
   - La conversión HTML → .docx puede perder algunos formatos complejos
   - Tablas y estilos avanzados pueden no conservarse perfectamente

2. **Tamaño de Archivos**:
   - Límite de 10MB por documento
   - Configurado en el proxy API

3. **Tipos de Archivo**:
   - Solo soporta .docx (no .doc)
   - No soporta macros de Excel

## 💡 Mejoras Futuras Sugeridas

### **Alta Prioridad**
1. **Mejor conversión HTML → DOCX**: 
   - Usar `html-docx-js` o similar para preservar formato
   - Mantener estilos, tablas y formato original

2. **Guardar borradores**:
   - Permitir guardar progreso sin descargar
   - Historial de documentos completados

3. **Vista previa antes de descargar**:
   - Mostrar preview del documento final
   - Validar que el formato sea correcto

### **Media Prioridad**
4. **Plantillas con campos dinámicos**:
   - Identificar campos para rellenar automáticamente
   - Autocompletado con datos del usuario/propiedad

5. **Colaboración en tiempo real**:
   - Múltiples usuarios editando simultáneamente
   - Sistema de comentarios

6. **Versiones de documentos**:
   - Guardar múltiples versiones
   - Comparar cambios entre versiones

### **Baja Prioridad**
7. **Firma digital**:
   - Integración con servicios de firma electrónica
   - DocuSign, HelloSign, etc.

8. **Exportar a PDF**:
   - Opción de descargar como PDF
   - Mejor para documentos finales

## 🐛 Troubleshooting

### **Los documentos no aparecen**
- Verifica que estén subidos en Cloudinary en `docgen/[carpeta]/`
- Revisa que sean archivos .docx (no .doc)
- Verifica configuración de Cloudinary en `.env`

### **Error al abrir editor**
- Verifica que el documento sea .docx válido
- Revisa logs del backend para errores de conversión
- Intenta re-subir el documento a Cloudinary

### **Formato perdido al descargar**
- Esto es una limitación actual de la conversión HTML → DOCX
- Considera usar el documento original y completarlo manualmente
- O espera mejora futura con mejor librería de conversión

### **Error de autenticación**
- Verifica que el token JWT esté presente
- Refresca la sesión del usuario
- Revisa middleware de autenticación

## 📝 Logs Importantes

El sistema genera logs detallados para debugging:

```javascript
// Backend logs
'📁 Obteniendo carpetas de docgen...'
'📄 Obteniendo documentos de la carpeta: [folder]'
'📖 Obteniendo contenido del documento: [documentId]'
'📝 Generando documento completado: [filename]'

// Frontend logs (consola del navegador)
'📥 Descargando documento original: [name]'
'✅ Descarga iniciada'
'✅ Documento generado y descargado'
```

## 🎓 Capacitación de Usuarios

### **Para Agentes Inmobiliarios:**

1. **Video Tutorial**: Crear video mostrando flujo completo
2. **Documentación simple**: Guía paso a paso con screenshots
3. **FAQs**: Preguntas frecuentes y soluciones

### **Para Administradores:**

1. **Cómo subir documentos**: Tutorial de Cloudinary
2. **Gestión de carpetas**: Organización de formularios
3. **Monitoreo**: Revisar logs y estadísticas de uso

## 📞 Soporte

Si encuentras problemas:
1. Revisa esta documentación
2. Verifica los logs del backend
3. Revisa la consola del navegador
4. Contacta al equipo de desarrollo

---

**Última actualización**: 11 de Octubre de 2025
**Versión**: 1.0.0
**Desarrollado para**: Rialtor Platform
