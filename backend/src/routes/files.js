const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const {
    upload,
    uploadFile,
    getFiles,
    getFolders,
    deleteFile,
    getFile
} = require('../controllers/fileController');

const { authenticateToken } = require('../middleware/auth');
const { checkPermission } = require('../middleware/permissions');

// Rutas públicas para descargas (sin requerir permisos específicos)
router.get('/public/folders', getFolders);
router.get('/public/files', getFiles);
router.get('/public/:id', getFile);

// Middleware de autenticación para todas las rutas siguientes
router.use(authenticateToken);

// Subir archivo (requiere permisos de admin o usuario autenticado)
router.post('/upload',
    checkPermission('view_admin'),
    upload.single('file'),
    uploadFile
);

// Obtener archivos con paginación
router.get('/',
    checkPermission('view_admin'),
    getFiles
);

// Obtener estructura de carpetas
router.get('/folders',
    checkPermission('view_admin'),
    getFolders
);

// Obtener archivo específico
router.get('/:id',
    checkPermission('view_admin'),
    getFile
);

// Eliminar archivo
router.delete('/:id',
    checkPermission('manage_system'),
    deleteFile
);

module.exports = router;
