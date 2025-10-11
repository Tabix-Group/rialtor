const cloudinary = require('../cloudinary');
const mammoth = require('mammoth');
const { Document, Packer, Paragraph, TextRun } = require('docx');
// Node 18+ tiene fetch nativo, no necesitamos importar node-fetch

/**
 * Obtener lista de carpetas disponibles en docgen
 */
const getDocgenFolders = async (req, res, next) => {
    try {
        console.log('📁 Obteniendo carpetas de docgen...');

        // Listar recursos de la carpeta docgen en Cloudinary
        const result = await cloudinary.api.sub_folders('docgen');
        
        const folders = result.folders.map(folder => ({
            name: folder.name,
            path: folder.path,
        }));

        console.log('✅ Carpetas encontradas:', folders);

        res.json({
            success: true,
            data: folders
        });

    } catch (error) {
        console.error('❌ Error al obtener carpetas:', error);
        
        // Si la carpeta docgen no existe, retornar carpetas predefinidas
        if (error.error && error.error.http_code === 404) {
            return res.json({
                success: true,
                data: [
                    { name: 'alquiler', path: 'docgen/alquiler' },
                    { name: 'boletos', path: 'docgen/boletos' },
                    { name: 'reservas', path: 'docgen/reservas' }
                ]
            });
        }
        
        next(error);
    }
};

/**
 * Obtener documentos de una carpeta específica
 */
const getDocumentsByFolder = async (req, res, next) => {
    try {
        const { folder } = req.params;
        console.log(`📄 Obteniendo documentos de la carpeta: ${folder}`);

        // Listar recursos de la carpeta en Cloudinary
        // Usar 'auto' para encontrar todos los tipos de archivo, luego filtrar .docx
        const result = await cloudinary.api.resources({
            type: 'upload',
            prefix: `docgen/${folder}/`,
            resource_type: 'auto', // Buscar todos los tipos
            max_results: 100
        });

        console.log(`🔍 Recursos encontrados en Cloudinary: ${result.resources.length}`);
        
        // Filtrar solo archivos .docx
        const docxFiles = result.resources.filter(resource => {
            const filename = resource.public_id.split('/').pop();
            const isDocx = filename.toLowerCase().endsWith('.docx');
            console.log(`📄 Archivo: ${filename}, Es DOCX: ${isDocx}, Tipo: ${resource.resource_type}, Formato: ${resource.format}`);
            return isDocx;
        });

        const documents = docxFiles.map(resource => ({
            id: resource.public_id,
            filename: resource.public_id.split('/').pop(),
            originalName: resource.public_id.split('/').pop(),
            url: resource.secure_url,
            format: resource.format,
            size: resource.bytes,
            createdAt: resource.created_at,
            folder: folder
        }));

        console.log(`✅ Documentos DOCX encontrados: ${documents.length}`);

        res.json({
            success: true,
            data: documents
        });

    } catch (error) {
        console.error('❌ Error al obtener documentos:', error);
        
        // Si hay error, intentar buscar de otra manera
        try {
            console.log('🔄 Intentando búsqueda alternativa...');
            const altResult = await cloudinary.api.resources({
                type: 'upload',
                prefix: `docgen/${folder}`,
                max_results: 100
            });
            
            console.log(`🔍 Búsqueda alternativa encontró: ${altResult.resources.length} recursos`);
            
            const altDocxFiles = altResult.resources.filter(resource => {
                const filename = resource.public_id.split('/').pop();
                return filename.toLowerCase().endsWith('.docx');
            });
            
            console.log(`✅ Documentos DOCX alternativos: ${altDocxFiles.length}`);
            
            const altDocuments = altDocxFiles.map(resource => ({
                id: resource.public_id,
                filename: resource.public_id.split('/').pop(),
                originalName: resource.public_id.split('/').pop(),
                url: resource.secure_url,
                format: resource.format,
                size: resource.bytes,
                createdAt: resource.created_at,
                folder: folder
            }));
            
            return res.json({
                success: true,
                data: altDocuments
            });
            
        } catch (altError) {
            console.error('❌ Error en búsqueda alternativa:', altError);
            next(error);
        }
    }
};

/**
 * Obtener contenido de un documento .docx como HTML para edición
 */
const getDocumentContent = async (req, res, next) => {
    try {
        const { documentId } = req.params;
        console.log(`📖 Obteniendo contenido del documento: ${documentId}`);

        // Obtener la URL del documento desde Cloudinary
        const resource = await cloudinary.api.resource(documentId, {
            resource_type: 'auto' // Usar auto para detectar automáticamente
        });

        console.log(`📥 Descargando documento desde: ${resource.secure_url}`);

        // Descargar el documento
        const response = await fetch(resource.secure_url);
        if (!response.ok) {
            throw new Error(`Error al descargar documento: ${response.statusText}`);
        }

        const buffer = await response.buffer();

        // Convertir .docx a HTML usando mammoth
        const result = await mammoth.convertToHtml({ buffer });

        console.log('✅ Documento convertido a HTML');

        res.json({
            success: true,
            data: {
                html: result.value,
                messages: result.messages, // Advertencias de conversión
                metadata: {
                    id: documentId,
                    filename: resource.public_id.split('/').pop(),
                    url: resource.secure_url,
                    format: resource.format,
                    size: resource.bytes
                }
            }
        });

    } catch (error) {
        console.error('❌ Error al obtener contenido del documento:', error);
        next(error);
    }
};

/**
 * Generar documento completado con los cambios del usuario
 */
const generateCompletedDocument = async (req, res, next) => {
    try {
        const { documentId, htmlContent, filename } = req.body;

        if (!documentId || !htmlContent || !filename) {
            return res.status(400).json({
                success: false,
                message: 'Faltan parámetros requeridos: documentId, htmlContent, filename'
            });
        }

        console.log(`📝 Generando documento completado: ${filename}`);

        // Convertir HTML a texto simple y crear un documento básico
        // Nota: Esta es una implementación simple. Para mejor formato,
        // se puede usar html-docx-js o una librería más avanzada
        
        const textContent = htmlContent
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<\/p>/gi, '\n')
            .replace(/<[^>]*>/g, '')
            .replace(/&nbsp;/g, ' ')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&');

        // Dividir el texto en párrafos
        const paragraphs = textContent.split('\n').filter(line => line.trim());

        // Crear documento usando docx
        const doc = new Document({
            sections: [{
                properties: {},
                children: paragraphs.map(text => 
                    new Paragraph({
                        children: [new TextRun(text)]
                    })
                )
            }]
        });

        // Generar buffer del documento
        const buffer = await Packer.toBuffer(doc);

        console.log('✅ Documento generado exitosamente');

        // Configurar headers para descarga
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', buffer.length);

        res.send(buffer);

    } catch (error) {
        console.error('❌ Error al generar documento:', error);
        next(error);
    }
};

/**
 * Descargar documento original sin modificar
 */
const downloadOriginalDocument = async (req, res, next) => {
    try {
        const { documentId } = req.params;
        console.log(`📥 Descargando documento original: ${documentId}`);

        // Obtener información del documento
        const resource = await cloudinary.api.resource(documentId, {
            resource_type: 'auto' // Usar auto para detectar automáticamente
        });

        // Descargar el archivo
        const response = await fetch(resource.secure_url);
        if (!response.ok) {
            throw new Error(`Error al descargar: ${response.statusText}`);
        }

        const buffer = await response.buffer();
        const filename = resource.public_id.split('/').pop();

        // Configurar headers para descarga
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', buffer.length);

        res.send(buffer);

    } catch (error) {
        console.error('❌ Error al descargar documento:', error);
        next(error);
    }
};

/**
 * Obtener estadísticas de uso de formularios
 */
const getFormStats = async (req, res, next) => {
    try {
        console.log('📊 Obteniendo estadísticas de formularios...');

        // Obtener total de documentos por carpeta
        const folders = ['alquiler', 'boletos', 'reservas'];
        const stats = {};

        for (const folder of folders) {
            try {
                const result = await cloudinary.api.resources({
                    type: 'upload',
                    prefix: `docgen/${folder}/`,
                    resource_type: 'auto', // Buscar todos los tipos
                    max_results: 100
                });
                
                // Contar solo archivos .docx
                const docxCount = result.resources.filter(resource => {
                    const filename = resource.public_id.split('/').pop();
                    return filename.toLowerCase().endsWith('.docx');
                }).length;
                
                stats[folder] = docxCount;
                console.log(`📊 ${folder}: ${docxCount} documentos DOCX`);
            } catch (error) {
                console.log(`⚠️ Error obteniendo stats para ${folder}:`, error.message);
                stats[folder] = 0;
            }
        }

        res.json({
            success: true,
            data: stats
        });

    } catch (error) {
        console.error('❌ Error al obtener estadísticas:', error);
        next(error);
    }
};

module.exports = {
    getDocgenFolders,
    getDocumentsByFolder,
    getDocumentContent,
    generateCompletedDocument,
    downloadOriginalDocument,
    getFormStats
};
