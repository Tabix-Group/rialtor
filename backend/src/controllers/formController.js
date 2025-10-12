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
 * Obtener documentos mock para desarrollo/pruebas
 */
const getMockDocuments = (folder) => {
    const mockData = {
        alquiler: [
            {
                id: `docgen/${folder}/contrato-alquiler-estandar`,
                filename: 'contrato-alquiler-estandar.docx',
                originalName: 'contrato-alquiler-estandar.docx',
                url: '#',
                format: 'docx',
                size: 245760,
                createdAt: new Date().toISOString(),
                folder: folder
            },
            {
                id: `docgen/${folder}/contrato-alquiler-comercial`,
                filename: 'contrato-alquiler-comercial.docx',
                originalName: 'contrato-alquiler-comercial.docx',
                url: '#',
                format: 'docx',
                size: 312480,
                createdAt: new Date().toISOString(),
                folder: folder
            }
        ],
        boletos: [
            {
                id: `docgen/${folder}/boleto-compra-venta-inmueble`,
                filename: 'boleto-compra-venta-inmueble.docx',
                originalName: 'boleto-compra-venta-inmueble.docx',
                url: '#',
                format: 'docx',
                size: 198656,
                createdAt: new Date().toISOString(),
                folder: folder
            }
        ],
        reservas: [
            {
                id: `docgen/${folder}/modelo-reserva-oferta-compra`,
                filename: 'modelo-reserva-oferta-compra.docx',
                originalName: 'modelo-reserva-oferta-compra.docx',
                url: '#',
                format: 'docx',
                size: 167936,
                createdAt: new Date().toISOString(),
                folder: folder
            }
        ]
    };

    return mockData[folder] || [];
};

const getDocumentsByFolder = async (req, res, next) => {
    const { folder } = req.params;
    console.log(`📄 Obteniendo documentos de la carpeta: ${folder}`);

    // Verificar si Cloudinary está configurado
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
        console.log('⚠️ Cloudinary no configurado, devolviendo datos de ejemplo');
        return res.json({
            success: true,
            data: getMockDocuments(folder)
        });
    }

    try {
        // Buscar archivos en múltiples resource_types porque pueden estar en cualquiera
        const resourceTypes = ['raw', 'image', 'video', 'auto'];
        const prefixes = [`docgen/${folder}/`, `docgen/${folder}`];
        
        let allDocuments = [];

        console.log(`🔍 Buscando en múltiples resource_types y prefixes...`);

        for (const resourceType of resourceTypes) {
            for (const prefix of prefixes) {
                try {
                    console.log(`   Intentando: resource_type='${resourceType}', prefix='${prefix}'`);
                    
                    const result = await cloudinary.api.resources({
                        type: 'upload',
                        resource_type: resourceType,
                        prefix: prefix,
                        max_results: 100
                    });

                    if (result.resources && result.resources.length > 0) {
                        console.log(`   ✅ Encontrados ${result.resources.length} recursos con ${resourceType}`);
                        
                        // Filtrar archivos de Word (.docx únicamente para edición)
                        // Solo aceptamos .docx ya que .doc no se puede editar con mammoth
                        const docxFiles = result.resources.filter(resource => {
                            const filename = resource.public_id.split('/').pop();
                            const hasDocxExtension = filename.toLowerCase().endsWith('.docx');
                            const isDocxFormat = resource.format === 'docx';
                            
                            // Si es resource_type 'raw' y está en una carpeta docgen, verificar extensión
                            const isInDocgenFolder = resource.public_id.startsWith('docgen/');
                            const isRawType = resourceType === 'raw';
                            
                            // Solo aceptar archivos que claramente sean .docx
                            const isValidDocx = hasDocxExtension || (isRawType && isInDocgenFolder && isDocxFormat);
                            
                            if (isValidDocx) {
                                console.log(`      📄 ${filename} (format: ${resource.format}, ${resource.bytes} bytes) - EDITABLE`);
                            } else if (filename.toLowerCase().includes('.doc') && !hasDocxExtension) {
                                console.log(`      📄 ${filename} (format: ${resource.format}, ${resource.bytes} bytes) - NO EDITABLE (.doc)`);
                            }
                            return isValidDocx;
                        });

                        // Agregar a la lista evitando duplicados
                        docxFiles.forEach(file => {
                            const exists = allDocuments.find(doc => doc.id === file.public_id);
                            if (!exists) {
                                const baseFilename = file.public_id.split('/').pop();
                                // Si el filename no tiene extensión pero el formato sí, agregar la extensión
                                let displayFilename = baseFilename;
                                if (!baseFilename.match(/\.(doc|docx)$/i) && (file.format === 'doc' || file.format === 'docx')) {
                                    displayFilename = `${baseFilename}.${file.format}`;
                                }
                                
                                allDocuments.push({
                                    id: file.public_id,
                                    filename: displayFilename,
                                    originalName: displayFilename,
                                    url: file.secure_url,
                                    format: file.format,
                                    size: file.bytes,
                                    createdAt: file.created_at,
                                    folder: folder,
                                    resourceType: resourceType
                                });
                            }
                        });
                    }
                } catch (err) {
                    // Ignorar errores de carpetas vacías o no encontradas
                    if (err.error && err.error.http_code !== 404) {
                        console.log(`   ⚠️  Error: ${err.message}`);
                    }
                }
            }
        }

        console.log(`✅ Total de documentos DOCX editables encontrados: ${allDocuments.length}`);

        res.json({
            success: true,
            data: allDocuments
        });

    } catch (error) {
        console.error('❌ Error al obtener documentos:', error);
        // Devolver array vacío en caso de error para que la UI muestre el mensaje apropiado
        return res.json({
            success: true,
            data: []
        });
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
            resource_type: 'raw' // Usar raw para archivos .docx
        });

        console.log(`📥 Descargando documento desde: ${resource.secure_url}`);

        // Verificar si es un archivo .doc (formato antiguo) o .docx
        const filename = resource.public_id.split('/').pop();
        const isDocFile = filename.toLowerCase().endsWith('.doc') && !filename.toLowerCase().endsWith('.docx');
        const isDocxFile = filename.toLowerCase().endsWith('.docx') || resource.format === 'docx';

        if (isDocFile) {
            return res.status(400).json({
                success: false,
                message: 'Los archivos .doc (formato antiguo de Word) no son compatibles con la edición en línea. Por favor, convierta el archivo a formato .docx antes de subirlo.',
                error: 'UNSUPPORTED_FORMAT',
                filename: filename
            });
        }

        if (!isDocxFile) {
            return res.status(400).json({
                success: false,
                message: 'Solo se admiten archivos de Word (.docx) para edición en línea.',
                error: 'INVALID_FORMAT',
                filename: filename,
                format: resource.format
            });
        }

        // Descargar el documento
        const response = await fetch(resource.secure_url);
        if (!response.ok) {
            throw new Error(`Error al descargar documento: ${response.statusText}`);
        }

        const buffer = Buffer.from(await response.arrayBuffer());

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

        // Si es un error de mammoth sobre formato inválido, dar mensaje más específico
        if (error.message && error.message.includes('Could not find the body element')) {
            return res.status(400).json({
                success: false,
                message: 'El archivo no parece ser un documento Word válido (.docx). Verifique que el archivo no esté corrupto.',
                error: 'INVALID_DOCX_FORMAT'
            });
        }

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
            resource_type: 'raw' // Usar raw para archivos .docx
        });

        // Descargar el archivo
        const response = await fetch(resource.secure_url);
        if (!response.ok) {
            throw new Error(`Error al descargar: ${response.statusText}`);
        }

        const buffer = Buffer.from(await response.arrayBuffer());
        const filename = resource.public_id.split('/').pop();

        // Determinar el content-type basado en la extensión
        let contentType = 'application/octet-stream'; // fallback
        if (filename.toLowerCase().endsWith('.docx')) {
            contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        } else if (filename.toLowerCase().endsWith('.doc')) {
            contentType = 'application/msword';
        }

        // Configurar headers para descarga
        res.setHeader('Content-Type', contentType);
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

        // Verificar si Cloudinary está configurado
        if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
            console.log('⚠️ Cloudinary no configurado, devolviendo estadísticas mock');
            return res.json({
                success: true,
                data: {
                    alquiler: 2,
                    boletos: 1,
                    reservas: 1
                }
            });
        }

        // Obtener total de documentos por carpeta
        const folders = ['alquiler', 'boletos', 'reservas'];
        const stats = {};

        for (const folder of folders) {
            try {
                const result = await cloudinary.api.resources({
                    type: 'upload',
                    resource_type: 'raw',
                    prefix: `docgen/${folder}/`,
                    max_results: 100
                });
                
                // Contar archivos de Word (.docx únicamente para edición)
                // Solo contamos .docx ya que .doc no se puede editar
                const docxCount = result.resources.filter(resource => {
                    const filename = resource.public_id.split('/').pop();
                    const hasDocxExtension = filename.toLowerCase().endsWith('.docx');
                    const isDocxFormat = resource.format === 'docx';
                    const isInDocgenFolder = resource.public_id.startsWith('docgen/');
                    return hasDocxExtension || (isInDocgenFolder && isDocxFormat);
                }).length;
                
                stats[folder] = docxCount;
                console.log(`📊 ${folder}: ${docxCount} documentos DOCX editables`);
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
        // Devolver estadísticas mock en caso de error
        res.json({
            success: true,
            data: {
                alquiler: 2,
                boletos: 1,
                reservas: 1
            }
        });
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
