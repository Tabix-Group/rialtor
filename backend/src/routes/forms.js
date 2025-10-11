const express = require('express');
const router = express.Router();

const {
    getDocgenFolders,
    getDocumentsByFolder,
    getDocumentContent,
    generateCompletedDocument,
    downloadOriginalDocument,
    getFormStats
} = require('../controllers/formController');

const { authenticateToken } = require('../middleware/auth');

// Health check para el servicio de formularios
router.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        service: 'forms',
        timestamp: new Date().toISOString(),
        cloudinary: {
            configured: !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET)
        }
    });
});

// Rutas públicas (no requieren autenticación)
router.get('/folders', getDocgenFolders);
router.get('/stats', getFormStats);
router.get('/:folder/documents', getDocumentsByFolder);
router.get('/document/:documentId(*)/content', getDocumentContent);
router.get('/document/:documentId(*)/download', downloadOriginalDocument);

// Aplicar autenticación solo a rutas que requieren usuario logueado
router.use(authenticateToken);

// Rutas que requieren autenticación (generar documentos completados)
router.post('/generate', generateCompletedDocument);

module.exports = router;
