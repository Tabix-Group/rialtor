const { PrismaClient } = require('@prisma/client');
const cloudinary = require('../cloudinary');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

// Configuración de multer para memoria (para subir a Cloudinary)
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB límite
    },
    fileFilter: (req, file, cb) => {
        // Tipos de archivo permitidos
        const allowedTypes = [
            'image/jpeg', 'image/png', 'image/gif', 'image/webp',
            'video/mp4', 'video/avi', 'video/mov', 'video/wmv',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/plain',
            'application/zip',
            'application/x-zip-compressed'
        ];

        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Tipo de archivo no permitido'), false);
        }
    }
});

// Subir archivo
const uploadFile = async (req, res, next) => {
    try {
        console.log('📁 Upload request received:', {
            file: req.file ? {
                originalname: req.file.originalname,
                mimetype: req.file.mimetype,
                size: req.file.size
            } : 'No file',
            body: req.body,
            user: req.user ? req.user.id : 'No user'
        });

        // Verificar configuración de Cloudinary
        if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
            console.error('❌ Cloudinary configuration missing');
            return res.status(500).json({
                success: false,
                message: 'Configuración de Cloudinary incompleta',
                error: 'CLOUDINARY_CONFIG_MISSING'
            });
        }

        if (!req.file) {
            console.log('❌ No file found in request');
            return res.status(400).json({
                success: false,
                message: 'No se encontró ningún archivo',
                error: 'MISSING_FILE'
            });
        }

        if (!req.user || !req.user.id) {
            console.log('❌ No user found in request');
            return res.status(401).json({
                success: false,
                message: 'Usuario no autenticado',
                error: 'UNAUTHENTICATED'
            });
        }

        const { folder = 'Contenido', subfolder } = req.body;
        const userId = req.user.id;

        console.log('📁 Processing upload:', { folder, subfolder, userId });

        // Generar nombre único para el archivo
        const fileExtension = req.file.originalname.split('.').pop();
        const uniqueFilename = `${uuidv4()}.${fileExtension}`;

        console.log('📁 Generated filename:', uniqueFilename);

        // Subir a Cloudinary
        const cloudinaryFolder = subfolder ? `${folder}/${subfolder}` : folder;

        console.log('☁️ Uploading to Cloudinary:', {
            folder: cloudinaryFolder,
            filename: uniqueFilename,
            size: req.file.size
        });

        const uploadResult = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                {
                    resource_type: 'auto',
                    public_id: uniqueFilename,
                    folder: cloudinaryFolder,
                },
                (error, result) => {
                    if (error) {
                        console.error('❌ Cloudinary upload error:', error);
                        reject(error);
                    } else {
                        console.log('✅ Cloudinary upload success:', result.secure_url);
                        resolve(result);
                    }
                }
            );
            stream.end(req.file.buffer);
        });

        console.log('💾 Saving to database...');

        // Guardar en base de datos
        const fileUpload = await prisma.fileUpload.create({
            data: {
                filename: uniqueFilename,
                originalName: req.file.originalname,
                mimeType: req.file.mimetype,
                size: req.file.size,
                cloudinaryUrl: uploadResult.secure_url,
                cloudinaryId: uploadResult.public_id,
                folder: folder,
                subfolder: subfolder || null,
                uploadedBy: userId,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    }
                }
            }
        });

        console.log('✅ File upload completed successfully');

        res.json({
            success: true,
            message: 'Archivo subido exitosamente',
            data: fileUpload
        });

    } catch (error) {
        console.error('❌ Error al subir archivo:', {
            message: error.message,
            stack: error.stack,
            name: error.name,
            code: error.code
        });

        // Manejar errores específicos de Cloudinary
        if (error.http_code) {
            return res.status(error.http_code).json({
                success: false,
                message: 'Error en el servicio de almacenamiento',
                error: error.message,
                code: 'CLOUDINARY_ERROR'
            });
        }

        // Manejar errores de validación de multer
        if (error.message === 'Tipo de archivo no permitido') {
            return res.status(400).json({
                success: false,
                message: 'Tipo de archivo no permitido',
                error: 'INVALID_FILE_TYPE'
            });
        }

        // Devolver respuesta JSON directamente en lugar de usar next()
        res.status(500).json({
            success: false,
            message: 'Error al subir el archivo',
            error: error.message,
            code: error.code || 'UPLOAD_ERROR'
        });
    }
};

// Obtener archivos con paginación
const getFiles = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 10,
            folder,
            subfolder,
            search
        } = req.query;

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Construir filtros
        const where = {};
        if (folder) where.folder = folder;
        if (subfolder) where.subfolder = subfolder;
        if (search) {
            where.OR = [
                { originalName: { contains: search, mode: 'insensitive' } },
                { filename: { contains: search, mode: 'insensitive' } }
            ];
        }

        // Obtener archivos
        const [files, total] = await Promise.all([
            prisma.fileUpload.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limitNum,
            }),
            prisma.fileUpload.count({ where })
        ]);

        res.json({
            success: true,
            data: files,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum)
            }
        });

    } catch (error) {
        console.error('Error al obtener archivos:', error);
        next(error);
    }
};

// Obtener estructura de carpetas
const getFolders = async (req, res, next) => {
    try {
        const folders = await prisma.fileUpload.findMany({
            select: {
                folder: true,
                subfolder: true,
            },
            distinct: ['folder', 'subfolder'],
            orderBy: [
                { folder: 'asc' },
                { subfolder: 'asc' }
            ]
        });

        // Organizar en estructura jerárquica
        const folderStructure = {};
        folders.forEach(item => {
            if (!folderStructure[item.folder]) {
                folderStructure[item.folder] = {
                    name: item.folder,
                    subfolders: []
                };
            }
            if (item.subfolder && !folderStructure[item.folder].subfolders.includes(item.subfolder)) {
                folderStructure[item.folder].subfolders.push(item.subfolder);
            }
        });

        res.json({
            success: true,
            data: Object.values(folderStructure)
        });

    } catch (error) {
        console.error('Error al obtener carpetas:', error);
        next(error);
    }
};

// Eliminar archivo
const deleteFile = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Buscar el archivo
        const file = await prisma.fileUpload.findUnique({
            where: { id }
        });

        if (!file) {
            return res.status(404).json({ success: false, message: 'Archivo no encontrado' });
        }

        // Verificar permisos (solo el que subió o admin puede eliminar)
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                roleAssignments: {
                    include: {
                        role: {
                            include: {
                                permissions: true
                            }
                        }
                    }
                }
            }
        });

        const isOwner = file.uploadedBy === userId;
        const isAdmin = user.roleAssignments.some(ra =>
            ra.role.permissions.some(p => p.name === 'view_admin')
        );

        if (!isOwner && !isAdmin) {
            return res.status(403).json({ success: false, message: 'No tienes permisos para eliminar este archivo' });
        }

        // Eliminar de Cloudinary
        try {
            await cloudinary.uploader.destroy(file.cloudinaryId);
        } catch (cloudinaryError) {
            console.warn('Error al eliminar de Cloudinary:', cloudinaryError);
            // Continuar con la eliminación de la BD aunque falle Cloudinary
        }

        // Eliminar de base de datos
        await prisma.fileUpload.delete({
            where: { id }
        });

        res.json({
            success: true,
            message: 'Archivo eliminado exitosamente'
        });

    } catch (error) {
        console.error('Error al eliminar archivo:', error);
        next(error);
    }
};

// Obtener archivo por ID
const getFile = async (req, res, next) => {
    try {
        const { id } = req.params;

        const file = await prisma.fileUpload.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    }
                }
            }
        });

        if (!file) {
            return res.status(404).json({ success: false, message: 'Archivo no encontrado' });
        }

        res.json({
            success: true,
            data: file
        });

    } catch (error) {
        console.error('Error al obtener archivo:', error);
        next(error);
    }
};

// Crear carpeta o subcarpeta
const createFolder = async (req, res, next) => {
    try {
        const { folder, subfolder, parentFolder } = req.body;
        const userId = req.user.id;

        console.log('📁 Create folder request:', { folder, subfolder, parentFolder, userId });

        if (!folder && !subfolder) {
            return res.status(400).json({
                success: false,
                message: 'Debe especificar al menos un nombre de carpeta o subcarpeta',
                error: 'MISSING_FOLDER_NAME'
            });
        }

        if (!req.user || !req.user.id) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no autenticado',
                error: 'UNAUTHENTICATED'
            });
        }

        // Determinar el nombre de la carpeta y subcarpeta
        let finalFolder = folder;
        let finalSubfolder = subfolder;

        if (parentFolder && !subfolder) {
            // Si hay parentFolder pero no subfolder, estamos creando una nueva carpeta raíz
            finalFolder = folder;
            finalSubfolder = null;
        } else if (parentFolder && subfolder) {
            // Si hay parentFolder y subfolder, estamos creando una subcarpeta
            finalFolder = parentFolder;
            finalSubfolder = subfolder;
        } else if (!parentFolder && subfolder) {
            // Si no hay parentFolder pero sí subfolder, usar la carpeta por defecto
            finalFolder = folder || 'Contenido';
            finalSubfolder = subfolder;
        }

        // Verificar si la carpeta/subcarpeta ya existe
        const existingFolder = await prisma.fileUpload.findFirst({
            where: {
                folder: finalFolder,
                subfolder: finalSubfolder,
            }
        });

        if (existingFolder) {
            return res.status(409).json({
                success: false,
                message: 'La carpeta o subcarpeta ya existe',
                error: 'FOLDER_EXISTS'
            });
        }

        // Crear una entrada dummy en la base de datos para representar la carpeta
        // Esto permitirá que aparezca en la estructura de carpetas
        const folderEntry = await prisma.fileUpload.create({
            data: {
                filename: '.folder_placeholder',
                originalName: '.folder_placeholder',
                mimeType: 'application/x-folder',
                size: 0,
                cloudinaryUrl: '',
                cloudinaryId: '',
                folder: finalFolder,
                subfolder: finalSubfolder,
                uploadedBy: userId,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    }
                }
            }
        });

        console.log('✅ Folder created successfully');

        res.json({
            success: true,
            message: 'Carpeta creada exitosamente',
            data: {
                folder: finalFolder,
                subfolder: finalSubfolder,
                createdBy: folderEntry.user
            }
        });

    } catch (error) {
        console.error('❌ Error creating folder:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });

        res.status(500).json({
            success: false,
            message: 'Error al crear la carpeta',
            error: error.message,
            code: error.code || 'CREATE_FOLDER_ERROR'
        });
    }
};

// Descargar archivo (proxy para evitar problemas de CORS)
const downloadFile = async (req, res, next) => {
    try {
        const { id } = req.params;

        const file = await prisma.fileUpload.findUnique({
            where: { id }
        });

        if (!file) {
            return res.status(404).json({ success: false, message: 'Archivo no encontrado' });
        }

        // Fetch del archivo desde Cloudinary
        const axios = require('axios');
        const response = await axios.get(file.cloudinaryUrl, {
            responseType: 'stream'
        });

        // Configurar headers para descarga
        res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
        res.setHeader('Content-Type', file.mimeType);
        res.setHeader('Content-Length', file.size);

        // Pipe el stream del archivo
        response.data.pipe(res);

    } catch (error) {
        console.error('Error al descargar archivo:', error);
        res.status(500).json({
            success: false,
            message: 'Error al descargar el archivo',
            error: error.message
        });
    }
};

module.exports = {
    upload,
    uploadFile,
    getFiles,
    getFolders,
    deleteFile,
    getFile,
    downloadFile,
    createFolder
};
