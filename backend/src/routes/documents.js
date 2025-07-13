
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no soportado'));
    }
  }
});

// POST /api/documents - upload a file
router.post('/', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se subió ningún archivo' });
  }
  // Permitir categoría opcional
  const category = req.body.category || 'General';
  const metadata = {
    id: req.file.filename,
    title: req.file.originalname,
    type: req.file.mimetype,
    category,
    uploadDate: new Date(),
    size: (req.file.size / 1024).toFixed(1) + ' KB',
    url: `/uploads/${req.file.filename}`
  };
  // Guardar metadatos en archivo .json
  try {
    fs.writeFileSync(path.join(uploadDir, req.file.filename + '.json'), JSON.stringify(metadata));
  } catch {}
  res.status(201).json({ document: metadata });
});

// DELETE /api/documents/:id - delete a file by route param
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: 'Falta el id del documento' });
  const filePath = path.join(uploadDir, id);
  fs.unlink(filePath, (err) => {
    if (err) return res.status(404).json({ error: 'Archivo no encontrado' });
    res.json({ message: 'Archivo eliminado correctamente' });
  });
});

// GET /api/documents - list uploaded files
router.get('/', (req, res) => {
  fs.readdir(uploadDir, (err, files) => {
    if (err) return res.status(500).json({ error: 'No se pudo leer la carpeta de uploads' });
    // Only list files, not .json metadata
    const documents = files.filter(f => !f.endsWith('.json')).map(filename => {
      const filePath = path.join(uploadDir, filename);
      const stat = fs.statSync(filePath);
      // Leer metadatos si existen
      let category = 'General';
      let type = 'Otro';
      let title = filename;
      const metaPath = path.join(uploadDir, filename + '.json');
      if (fs.existsSync(metaPath)) {
        try {
          const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
          category = meta.category || category;
          type = meta.type || type;
          title = meta.title || title;
        } catch {}
      }
      return {
        id: filename,
        title,
        type,
        category,
        uploadDate: stat.birthtime,
        size: (stat.size / 1024).toFixed(1) + ' KB',
        url: `/uploads/${filename}`
      };
    });
    res.json({ documents });
  });
});

// GET /api/documents/:id - serve file for view or download
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const filePath = path.join(uploadDir, id);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Archivo no encontrado' });
  const download = req.query.download === '1';
  if (download) {
    res.download(filePath);
  } else {
    res.sendFile(filePath);
  }
});
// DELETE /api/documents?id=FILENAME - delete a file
router.delete('/', (req, res) => {
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'Falta el id del documento' });
  const filePath = path.join(uploadDir, id);
  fs.unlink(filePath, (err) => {
    if (err) return res.status(404).json({ error: 'Archivo no encontrado' });
    res.json({ message: 'Archivo eliminado correctamente' });
  });
});
module.exports = router;

