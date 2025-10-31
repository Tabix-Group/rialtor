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

// Configuración de fuentes RSS
const RSS_SOURCES = {
    WORLD_PROPERTY: {
        url: 'https://www.worldpropertyjournal.com/feed.xml',
        name: 'World Property Journal',
        categoryName: 'Internacional',
        categorySlug: 'internacional',
        categoryColor: '#10B981',
        categoryDescription: 'Noticias del mercado inmobiliario internacional'
    },
    REPORTE_INMOBILIARIO: {
        url: 'http://www.reporteinmobiliario.com/nuke/rss.xml',
        name: 'Reporte Inmobiliario',
        categoryName: 'Mercado Nacional',
        categorySlug: 'mercado-nacional',
        categoryColor: '#3B82F6',
        categoryDescription: 'Análisis y reportes del mercado inmobiliario argentino'
    },
    ARGENPROP: {
        url: 'https://argenprop4.rssing.com/index.php',
        name: 'ArgenProp',
        categoryName: 'Tendencias',
        categorySlug: 'tendencias',
        categoryColor: '#F59E0B',
        categoryDescription: 'Tendencias y novedades del sector inmobiliario'
    },
    CONSTRUYA: {
        url: 'https://www.grupoconstruya.com.ar/rss/construya.xml',
        name: 'Grupo Construya',
        categoryName: 'Construcción',
        categorySlug: 'construccion',
        categoryColor: '#8B5CF6',
        categoryDescription: 'Noticias sobre construcción y desarrollo inmobiliario'
    },
    TOKKO_BROKER: {
        url: 'https://blog.tokkobroker.com/rss.xml',
        name: 'Tokko Broker Blog',
        categoryName: 'Tecnología Inmobiliaria',
        categorySlug: 'tecnologia-inmobiliaria',
        categoryColor: '#EC4899',
        categoryDescription: 'Innovación y tecnología en el sector inmobiliario'
    },
    MERCADO_CABA: {
        url: 'https://mercadoinmobiliariocaba.com/feed/',
        name: 'Mercado Inmobiliario CABA',
        categoryName: 'CABA',
        categorySlug: 'caba',
        categoryColor: '#14B8A6',
        categoryDescription: 'Noticias del mercado inmobiliario en Buenos Aires'
    },
    PUNTO_A_PUNTO: {
        url: 'https://puntoapunto.com.ar/feed/',
        name: 'Punto a Punto',
        categoryName: 'Desarrollo Córdoba',
        categorySlug: 'desarrollo-cordoba',
        categoryColor: '#EF4444',
        categoryDescription: 'Desarrollismo inmobiliario y urbanizaciones en Córdoba'
    },
    REVISTA_CONSTRUCCION: {
        url: 'https://www.revistaconstruccion.com.ar/feed/',
        name: 'Revista Construcción',
        categoryName: 'Índices y Costos',
        categorySlug: 'indices-costos',
        categoryColor: '#6366F1',
        categoryDescription: 'Índices de costos de construcción y análisis técnico del sector'
    }
};

/**
 * Busca o crea una categoría
 * @param {Object} categoryConfig - Configuración de la categoría
 * @returns {Object} Categoría encontrada o creada
 */
const ensureCategory = async (categoryConfig) => {
    let category = await prisma.category.findFirst({
        where: { slug: categoryConfig.categorySlug }
    });

    if (!category) {
        category = await prisma.category.create({
            data: {
                name: categoryConfig.categoryName,
                slug: categoryConfig.categorySlug,
                description: categoryConfig.categoryDescription,
                color: categoryConfig.categoryColor,
                isActive: true
            }
        });
        console.log(`[RSS Sync] Categoría "${categoryConfig.categoryName}" creada`);
    }

    return category;
};

/**
 * Sincroniza noticias desde una fuente RSS específica
 * @param {Object} sourceConfig - Configuración de la fuente RSS
 * @param {number} limit - Número máximo de noticias a importar
 * @returns {Object} Estadísticas de la sincronización
 */
const syncRSSSource = async (sourceConfig, limit = 20) => {
    const stats = {
        source: sourceConfig.name,
        total: 0,
        imported: 0,
        updated: 0,
        skipped: 0,
        errors: []
    };

    try {
        console.log(`[RSS Sync] Iniciando sincronización desde ${sourceConfig.name}...`);
        console.log(`[RSS Sync] URL: ${sourceConfig.url}`);
        
        // Parsear el feed RSS
        const feed = await parser.parseURL(sourceConfig.url);
        
        console.log(`[RSS Sync] Feed parseado: ${feed.title || sourceConfig.name}`);
        console.log(`[RSS Sync] Total de items en el feed: ${feed.items.length}`);

        // Buscar o crear categoría
        const category = await ensureCategory(sourceConfig);

        // Procesar items del feed (limitado)
        const itemsToProcess = feed.items.slice(0, limit);
        stats.total = itemsToProcess.length;

        for (const item of itemsToProcess) {
            try {
                // Extraer información del item
                const title = item.title || 'Sin título';
                const synopsis = item.contentSnippet || item.description || item.content || '';
                const externalUrl = item.link || item.guid || '';
                const publishedAt = item.pubDate || item.isoDate ? new Date(item.pubDate || item.isoDate) : new Date();

                // Validar que tengamos al menos título y URL
                if (!title || !externalUrl) {
                    console.log(`[RSS Sync] Item omitido: falta título o URL`);
                    stats.skipped++;
                    continue;
                }

                // Limpiar el synopsis (remover HTML si existe)
                const cleanSynopsis = synopsis
                    .replace(/<[^>]*>/g, '')
                    .replace(/\n/g, ' ')
                    .replace(/\s+/g, ' ')
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
                            source: sourceConfig.name,
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

        console.log(`[RSS Sync] ${sourceConfig.name} completado: ${stats.imported} importadas, ${stats.updated} actualizadas, ${stats.skipped} omitidas`);

        return {
            success: true,
            stats
        };

    } catch (error) {
        console.error(`[RSS Sync] Error en sincronización de ${sourceConfig.name}:`, error);
        return {
            success: false,
            stats,
            error: error.message
        };
    }
};

/**
 * Sincroniza noticias desde todas las fuentes RSS
 * @param {number} limit - Número máximo de noticias por fuente
 * @param {Array<string>} sources - Array de nombres de fuentes a sincronizar (opcional, sincroniza todas si no se especifica)
 * @returns {Object} Estadísticas consolidadas
 */
const syncAllRSSSources = async (limit = 20, sources = null) => {
    const consolidatedStats = {
        totalSources: 0,
        successfulSources: 0,
        failedSources: 0,
        totalImported: 0,
        totalUpdated: 0,
        totalSkipped: 0,
        totalErrors: 0,
        bySource: []
    };

    try {
        // Determinar qué fuentes sincronizar
        const sourcesToSync = sources 
            ? Object.entries(RSS_SOURCES).filter(([key]) => sources.includes(key))
            : Object.entries(RSS_SOURCES);

        consolidatedStats.totalSources = sourcesToSync.length;

        console.log(`[RSS Sync] Iniciando sincronización de ${consolidatedStats.totalSources} fuentes...`);

        for (const [key, sourceConfig] of sourcesToSync) {
            const result = await syncRSSSource(sourceConfig, limit);
            
            if (result.success) {
                consolidatedStats.successfulSources++;
                consolidatedStats.totalImported += result.stats.imported;
                consolidatedStats.totalUpdated += result.stats.updated;
                consolidatedStats.totalSkipped += result.stats.skipped;
                consolidatedStats.totalErrors += result.stats.errors.length;
            } else {
                consolidatedStats.failedSources++;
            }

            consolidatedStats.bySource.push(result);
        }

        console.log('[RSS Sync] Sincronización completa de todas las fuentes');
        console.log(`[RSS Sync] Total: ${consolidatedStats.totalImported} importadas, ${consolidatedStats.totalUpdated} actualizadas, ${consolidatedStats.totalSkipped} omitidas`);

        return {
            success: true,
            stats: consolidatedStats,
            message: `Sincronización exitosa: ${consolidatedStats.totalImported} importadas, ${consolidatedStats.totalUpdated} actualizadas de ${consolidatedStats.successfulSources}/${consolidatedStats.totalSources} fuentes`
        };

    } catch (error) {
        console.error('[RSS Sync] Error en sincronización global:', error);
        return {
            success: false,
            stats: consolidatedStats,
            message: `Error en sincronización: ${error.message}`,
            error: error.message
        };
    }
};

/**
 * Sincroniza noticias desde World Property Journal (mantener por compatibilidad)
 * @param {number} limit - Número máximo de noticias a importar
 * @returns {Object} Estadísticas de la sincronización
 */
const syncWorldPropertyJournal = async (limit = 20) => {
    const result = await syncRSSSource(RSS_SOURCES.WORLD_PROPERTY, limit);
    return {
        success: result.success,
        stats: result.stats,
        message: result.success 
            ? `Sincronización exitosa: ${result.stats.imported} importadas, ${result.stats.updated} actualizadas, ${result.stats.skipped} omitidas`
            : `Error en sincronización: ${result.error}`
    };
};

/**
 * Limpia noticias antiguas (más de X días)
 * @param {number} daysOld - Días de antigüedad para considerar una noticia como antigua
 * @param {string} source - Fuente específica a limpiar (opcional, limpia todas si no se especifica)
 * @returns {Object} Resultado de la limpieza
 */
const cleanOldNews = async (daysOld = 90, source = null) => {
    try {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);

        const whereClause = {
            publishedAt: {
                lt: cutoffDate
            }
        };

        // Si se especifica una fuente, solo limpiar esa fuente
        if (source) {
            whereClause.source = source;
        }

        const result = await prisma.news.deleteMany({
            where: whereClause
        });

        const sourceMsg = source ? ` de ${source}` : '';
        console.log(`[RSS Sync] Limpiadas ${result.count} noticias antiguas${sourceMsg} (más de ${daysOld} días)`);

        return {
            success: true,
            deletedCount: result.count,
            message: `${result.count} noticias antiguas eliminadas${sourceMsg}`
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

/**
 * Obtiene la lista de fuentes RSS configuradas
 * @returns {Array} Lista de fuentes con su configuración
 */
const getRSSSources = () => {
    return Object.entries(RSS_SOURCES).map(([key, config]) => ({
        key,
        name: config.name,
        url: config.url,
        category: config.categoryName
    }));
};

module.exports = {
    syncWorldPropertyJournal,
    syncRSSSource,
    syncAllRSSSources,
    cleanOldNews,
    getImportStats,
    getRSSSources,
    RSS_SOURCES
};
