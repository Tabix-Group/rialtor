const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Agregar un documento a favoritos
 */
const addFavorite = async (req, res, next) => {
    try {
        const { documentId, documentName, folder } = req.body;
        const userId = req.user.id;

        if (!documentId || !documentName || !folder) {
            return res.status(400).json({
                success: false,
                message: 'Faltan parámetros requeridos: documentId, documentName, folder'
            });
        }

        console.log(`⭐ Agregando favorito: ${documentName} para usuario ${userId}`);

        // Verificar si ya existe
        const existing = await prisma.documentFavorite.findUnique({
            where: {
                userId_documentId: {
                    userId: userId,
                    documentId: documentId
                }
            }
        });

        if (existing) {
            return res.status(409).json({
                success: false,
                message: 'El documento ya está en favoritos'
            });
        }

        // Crear favorito
        const favorite = await prisma.documentFavorite.create({
            data: {
                userId: userId,
                documentId: documentId,
                documentName: documentName,
                folder: folder
            }
        });

        console.log('✅ Favorito agregado exitosamente');

        res.json({
            success: true,
            data: favorite
        });

    } catch (error) {
        console.error('❌ Error al agregar favorito:', error);
        next(error);
    }
};

/**
 * Remover un documento de favoritos
 */
const removeFavorite = async (req, res, next) => {
    try {
        const { documentId } = req.params;
        const userId = req.user.id;

        console.log(`🗑️ Removiendo favorito: ${documentId} para usuario ${userId}`);

        const deleted = await prisma.documentFavorite.deleteMany({
            where: {
                userId: userId,
                documentId: documentId
            }
        });

        if (deleted.count === 0) {
            return res.status(404).json({
                success: false,
                message: 'Favorito no encontrado'
            });
        }

        console.log('✅ Favorito removido exitosamente');

        res.json({
            success: true,
            message: 'Favorito removido exitosamente'
        });

    } catch (error) {
        console.error('❌ Error al remover favorito:', error);
        next(error);
    }
};

/**
 * Obtener todos los favoritos del usuario
 */
const getFavorites = async (req, res, next) => {
    try {
        const userId = req.user.id;

        console.log(`📋 Obteniendo favoritos para usuario ${userId}`);

        const favorites = await prisma.documentFavorite.findMany({
            where: {
                userId: userId
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        console.log(`✅ Encontrados ${favorites.length} favoritos`);

        res.json({
            success: true,
            data: favorites
        });

    } catch (error) {
        console.error('❌ Error al obtener favoritos:', error);
        next(error);
    }
};

/**
 * Verificar si un documento está en favoritos
 */
const checkFavorite = async (req, res, next) => {
    try {
        const { documentId } = req.params;
        const userId = req.user.id;

        const favorite = await prisma.documentFavorite.findUnique({
            where: {
                userId_documentId: {
                    userId: userId,
                    documentId: documentId
                }
            }
        });

        res.json({
            success: true,
            data: {
                isFavorite: !!favorite
            }
        });

    } catch (error) {
        console.error('❌ Error al verificar favorito:', error);
        next(error);
    }
};

module.exports = {
    addFavorite,
    removeFavorite,
    getFavorites,
    checkFavorite
};