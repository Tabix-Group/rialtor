const Parser = require('rss-parser');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const parser = new Parser({
    customFields: {
        item: [
            ['media:content', 'media'],
            ['content:encoded', 'contentEncoded'],
            ['dc:creator', 'creator']
        ]
    }
});

/**
 * Sincroniza noticias desde el feed RSS de World Property Journal
 * @param {number} limit - Número máximo de noticias a importar (default: 20)
 * @returns {Object} Estadísticas de la sincronización
 */
const syncWorldPropertyJournal = async (limit = 20) => {
    const RSS_URL = 'https://www.worldpropertyjournal.com/feed.xml';
    const SOURCE = 'World Property Journal';
    
    const stats = {
        total: 0,
        imported: 0,
        updated: 0,
        skipped: 0,
        errors: []
    };

    try {
        console.log(`[RSS Sync] Iniciando sincronización desde ${RSS_URL}...`);
        
        // Parsear el feed RSS
        const feed = await parser.parseURL(RSS_URL);
        
        console.log(`[RSS Sync] Feed parseado: ${feed.title}`);
        console.log(`[RSS Sync] Total de items en el feed: ${feed.items.length}`);

        // Buscar o crear categoría para noticias internacionales
        let category = await prisma.category.findFirst({
            where: { name: 'Internacional' }
        });

        if (!category) {
            category = await prisma.category.create({
                data: {
                    name: 'Internacional',
                    slug: 'internacional',
                    description: 'Noticias del mercado inmobiliario internacional',
                    color: '#10B981',
                    isActive: true
                }
            });
            console.log('[RSS Sync] Categoría "Internacional" creada');
        }

        // Procesar items del feed (limitado)
        const itemsToProcess = feed.items.slice(0, limit);
        stats.total = itemsToProcess.length;

        for (const item of itemsToProcess) {
            try {
                // Extraer información del item
                const title = item.title || 'Sin título';
                const synopsis = item.contentSnippet || item.description || '';
                const externalUrl = item.link || item.guid || '';
                const publishedAt = item.pubDate ? new Date(item.pubDate) : new Date();

                // Limpiar el synopsis (remover HTML si existe)
                const cleanSynopsis = synopsis
                    .replace(/<[^>]*>/g, '')
                    .replace(/\n/g, ' ')
                    .trim()
                    .substring(0, 500); // Limitar a 500 caracteres

                // Verificar si la noticia ya existe (por URL)
                const existingNews = await prisma.news.findFirst({
                    where: { externalUrl }
                });

                if (existingNews) {
                    // Actualizar si hay cambios
                    const hasChanges = 
                        existingNews.title !== title ||
                        existingNews.synopsis !== cleanSynopsis;

                    if (hasChanges) {
                        await prisma.news.update({
                            where: { id: existingNews.id },
                            data: {
                                title,
                                synopsis: cleanSynopsis,
                                publishedAt
                            }
                        });
                        stats.updated++;
                        console.log(`[RSS Sync] Actualizada: ${title}`);
                    } else {
                        stats.skipped++;
                    }
                } else {
                    // Crear nueva noticia
                    await prisma.news.create({
                        data: {
                            title,
                            synopsis: cleanSynopsis,
                            source: SOURCE,
                            externalUrl,
                            publishedAt,
                            categoryId: category.id,
                            isActive: true
                        }
                    });
                    stats.imported++;
                    console.log(`[RSS Sync] Importada: ${title}`);
                }

            } catch (itemError) {
                console.error(`[RSS Sync] Error procesando item:`, itemError);
                stats.errors.push({
                    title: item.title || 'Unknown',
                    error: itemError.message
                });
            }
        }

        console.log('[RSS Sync] Sincronización completada');
        console.log(`[RSS Sync] Total: ${stats.total}, Importadas: ${stats.imported}, Actualizadas: ${stats.updated}, Omitidas: ${stats.skipped}`);

        return {
            success: true,
            stats,
            message: `Sincronización exitosa: ${stats.imported} importadas, ${stats.updated} actualizadas, ${stats.skipped} omitidas`
        };

    } catch (error) {
        console.error('[RSS Sync] Error en sincronización:', error);
        return {
            success: false,
            stats,
            message: `Error en sincronización: ${error.message}`,
            error: error.message
        };
    }
};

/**
 * Limpia noticias antiguas (más de X días)
 * @param {number} daysOld - Días de antigüedad para considerar una noticia como antigua
 * @returns {Object} Resultado de la limpieza
 */
const cleanOldNews = async (daysOld = 90) => {
    try {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);

        const result = await prisma.news.deleteMany({
            where: {
                publishedAt: {
                    lt: cutoffDate
                },
                source: 'World Property Journal'
            }
        });

        console.log(`[RSS Sync] Limpiadas ${result.count} noticias antiguas (más de ${daysOld} días)`);

        return {
            success: true,
            deletedCount: result.count,
            message: `${result.count} noticias antiguas eliminadas`
        };
    } catch (error) {
        console.error('[RSS Sync] Error limpiando noticias antiguas:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Obtiene estadísticas de las noticias importadas
 * @returns {Object} Estadísticas
 */
const getImportStats = async () => {
    try {
        const [total, active, bySource] = await Promise.all([
            prisma.news.count(),
            prisma.news.count({ where: { isActive: true } }),
            prisma.news.groupBy({
                by: ['source'],
                _count: true
            })
        ]);

        return {
            success: true,
            stats: {
                total,
                active,
                bySource: bySource.map(s => ({
                    source: s.source,
                    count: s._count
                }))
            }
        };
    } catch (error) {
        console.error('[RSS Sync] Error obteniendo estadísticas:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

module.exports = {
    syncWorldPropertyJournal,
    cleanOldNews,
    getImportStats
};
