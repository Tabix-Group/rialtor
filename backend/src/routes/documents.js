
const express = require('express');
console.log('BACKEND ARRANCÓ: Documentos API cargada');
const router = express.Router();
// Log global para depuración de cualquier petición al router
router.use((req, res, next) => {
  console.log(`[DOCUMENTS ROUTER] ${req.method} ${req.originalUrl}`);
  next();
});
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinary = require('../cloudinary');

// Multer en memoria
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/png',
      'image/jpeg'
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no soportado'));
    }
  }
});

// POST /api/documents - upload a file a Cloudinary
router.post('/', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se subió ningún archivo' });
  }
  const category = req.body.category || 'General';
  try {
    // Subir a Cloudinary con el nombre original
    // Usar el nombre original completo (con extensión) como public_id
    const originalName = req.file.originalname;
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'auto',
        folder: 'documents',
        public_id: originalName,
        use_filename: true,
        unique_filename: false,
        overwrite: true
      },
      (error, result) => {
        if (error) {
          return res.status(500).json({ error: 'Error al subir a Cloudinary', details: error });
        }
        const metadata = {
          id: result.public_id,
          title: originalName,
          type: req.file.mimetype,
          category,
          uploadDate: new Date(),
          size: (req.file.size / 1024).toFixed(1) + ' KB',
          url: result.secure_url
        };
        return res.status(201).json({ document: metadata });
      }
    );
    stream.end(req.file.buffer);
  } catch (err) {
    return res.status(500).json({ error: 'Error inesperado', details: err });
  }
});

// DELETE /api/documents/:id - delete a file by route param
// DELETE /api/documents/:id - delete a file from Cloudinary by route param
router.delete('/*', async (req, res) => {
  let id = req.params[0];
  if (!id) return res.status(400).json({ error: 'Falta el id del documento' });
  id = decodeURIComponent(id);
  if (!id.startsWith('documents/')) {
    id = 'documents/' + id;
  }
  // Detectar tipo por extensión
  const ext = id.split('.').pop()?.toLowerCase();
  let resourceType = 'raw';
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext)) resourceType = 'image';
  else if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm'].includes(ext)) resourceType = 'video';
  // Otros tipos (pdf, docx, xlsx, etc) usan raw
  console.log(`Intentando eliminar en Cloudinary: ${id} (resource_type: ${resourceType})`);
  try {
    const result = await cloudinary.uploader.destroy(id, { resource_type: resourceType });
    console.log('Resultado de Cloudinary:', result);
    if (result.result === 'ok' || result.result === 'not_found') {
      return res.json({ message: `Archivo eliminado correctamente (${id})` });
    } else {
      return res.status(500).json({ error: 'No se pudo eliminar el archivo', details: result });
    }
  } catch (err) {
    console.error('Error al eliminar en Cloudinary:', id, err);
    return res.status(500).json({ error: 'Error al eliminar en Cloudinary', details: err.message || err });
  }
});

// GET /api/documents - list uploaded files from Cloudinary
router.get('/', async (req, res) => {
  try {
    // Buscar archivos en la carpeta 'documents' de Cloudinary
    const result = await cloudinary.search
      .expression('folder:documents')
      .sort_by('created_at','desc')
      .max_results(100)
      .execute();
    const documents = result.resources.map(file => ({
      id: file.public_id,
      title: file.filename || file.public_id.split('/').pop(),
      type: file.format,
      category: 'General', // Puedes guardar la categoría en metadata si lo deseas
      uploadDate: file.created_at,
      size: (file.bytes / 1024).toFixed(1) + ' KB',
      url: file.secure_url
    }));
    if (req.query.countOnly === '1') {
      return res.json({ count: documents.length });
    }
    res.json({ documents });
  } catch (err) {
    res.status(500).json({ error: 'No se pudo obtener la lista de documentos', details: err });
  }
});

// GET /api/documents/:id - redirect to Cloudinary URL
router.get('/:id', async (req, res) => {
  let { id } = req.params;
  id = decodeURIComponent(id);
  try {
    const resource = await cloudinary.api.resource(id, { resource_type: 'auto' });
    if (!resource || !resource.secure_url) return res.status(404).json({ error: 'Archivo no encontrado' });
    if (req.query.download === '1') {
      const filename = id.split('/').pop();
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      return res.redirect(resource.secure_url + '?fl_attachment');
    }
    return res.redirect(resource.secure_url);
  } catch (err) {
    return res.status(404).json({ error: 'Archivo no encontrado', details: err });
  }
});
// (Eliminada la ruta DELETE por query para mantener solo la RESTful y evitar ambigüedades)
module.exports = router;

