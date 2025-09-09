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
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No se encontró ningún archivo' });
        }

        const { folder = 'Contenido', subfolder } = req.body;
        const userId = req.user.id;

        // Generar nombre único para el archivo
        const fileExtension = req.file.originalname.split('.').pop();
        const uniqueFilename = `${uuidv4()}.${fileExtension}`;

        // Subir a Cloudinary
        const cloudinaryFolder = subfolder ? `${folder}/${subfolder}` : folder;

        const uploadResult = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                {
                    resource_type: 'auto',
                    public_id: uniqueFilename,
                    folder: cloudinaryFolder,
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            stream.end(req.file.buffer);
        });

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

        res.json({
            success: true,
            message: 'Archivo subido exitosamente',
            data: fileUpload
        });

    } catch (error) {
        console.error('Error al subir archivo:', error);
        next(error);
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
            ra.role.permissions.some(p => p.name === 'manage_system')
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

module.exports = {
    upload,
    uploadFile,
    getFiles,
    getFolders,
    deleteFile,
    getFile
};
