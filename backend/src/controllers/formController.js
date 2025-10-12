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
                        
                        // Filtrar archivos de Word (.doc/.docx)
                        // Como el script upload-forms.js elimina la extensión del public_id,
                        // necesitamos ser más permisivos:
                        // 1. Aceptar si tiene extensión .doc/.docx en el nombre
                        // 2. Aceptar si el formato es doc/docx
                        // 3. Aceptar TODOS los archivos raw en carpetas docgen/* (asumimos que son docs)
                        const docxFiles = result.resources.filter(resource => {
                            const filename = resource.public_id.split('/').pop();
                            const hasDocExtension = filename.toLowerCase().match(/\.(doc|docx)$/);
                            const isDocFormat = resource.format === 'doc' || resource.format === 'docx';
                            
                            // Si es resource_type 'raw' y está en una carpeta docgen, es válido
                            const isInDocgenFolder = resource.public_id.startsWith('docgen/');
                            const isRawType = resourceType === 'raw';
                            
                            const isValidDoc = hasDocExtension || isDocFormat || (isRawType && isInDocgenFolder);
                            
                            if (isValidDoc) {
                                console.log(`      📄 ${filename} (format: ${resource.format}, ${resource.bytes} bytes)`);
                            }
                            return isValidDoc;
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

        console.log(`✅ Total de documentos DOCX encontrados: ${allDocuments.length}`);

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
                
                // Contar archivos de Word (.doc y .docx)
                // Como el script elimina la extensión, aceptamos:
                // 1. Archivos con extensión .doc/.docx en el nombre
                // 2. Archivos con formato doc/docx
                // 3. Todos los archivos raw en docgen/* (asumimos que son documentos Word)
                const docxCount = result.resources.filter(resource => {
                    const filename = resource.public_id.split('/').pop();
                    const hasDocExtension = filename.toLowerCase().match(/\.(doc|docx)$/);
                    const isDocFormat = resource.format === 'doc' || resource.format === 'docx';
                    const isInDocgenFolder = resource.public_id.startsWith('docgen/');
                    return hasDocExtension || isDocFormat || isInDocgenFolder;
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
