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

// Aplicar autenticación a todas las rutas
router.use(authenticateToken);

// GET /api/forms/folders - Obtener carpetas de docgen (alquiler, boletos, reservas)
router.get('/folders', getDocgenFolders);

// GET /api/forms/stats - Obtener estadísticas de formularios
router.get('/stats', getFormStats);

// GET /api/forms/:folder/documents - Obtener documentos de una carpeta específica
router.get('/:folder/documents', getDocumentsByFolder);

// GET /api/forms/document/:documentId/content - Obtener contenido HTML de un documento para edición
// El documentId debe estar codificado (encodeURIComponent) ya que puede contener /
router.get('/document/:documentId(*)/content', getDocumentContent);

// GET /api/forms/document/:documentId/download - Descargar documento original
router.get('/document/:documentId(*)/download', downloadOriginalDocument);

// POST /api/forms/generate - Generar documento completado
// Body: { documentId, htmlContent, filename }
router.post('/generate', generateCompletedDocument);

module.exports = router;
