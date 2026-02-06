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
    getFile,
    downloadFile,
    createFolder
} = require('../controllers/fileController');

const { authenticateToken } = require('../middleware/auth');
const { checkPermission } = require('../middleware/permissions');

// Health check para el servicio de archivos
router.get('/health', async (req, res) => {
    try {
        const healthData = {
            status: 'OK',
            service: 'files',
            timestamp: new Date().toISOString(),
            cloudinary: {
                configured: !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET),
                cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? 'configured' : 'missing'
            },
            database: 'unknown'
        };

        // Verificar conexión a base de datos
        try {
            await prisma.fileUpload.count();
            healthData.database = 'connected';
        } catch (error) {
            healthData.database = 'disconnected';
            healthData.dbError = error.message;
            healthData.status = 'DEGRADED';
        }

        // Verificar configuración de Cloudinary
        if (!healthData.cloudinary.configured) {
            healthData.status = 'DEGRADED';
            healthData.cloudinary.error = 'Cloudinary configuration incomplete';
        }

        res.status(healthData.status === 'OK' ? 200 : 503).json(healthData);
    } catch (error) {
        res.status(503).json({
            status: 'ERROR',
            service: 'files',
            error: error.message
        });
    }
});

// Rutas públicas para descargas (sin requerir permisos específicos)
router.get('/public/folders', getFolders);
router.get('/public/files', getFiles);
router.get('/public/:id', getFile);
router.get('/public/download/:id', downloadFile);  // Nueva ruta para descarga

// Middleware de autenticación para todas las rutas siguientes
router.use(authenticateToken);

// Subir archivo (requiere permisos de admin o usuario autenticado)
router.post('/upload',
    checkPermission('view_admin'),
    upload.single('file'),
    uploadFile
);

// Crear carpeta (requiere permisos de admin)
router.post('/create-folder',
    checkPermission('view_admin'),
    createFolder
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
    checkPermission('view_admin'),
    deleteFile
);

module.exports = router;
