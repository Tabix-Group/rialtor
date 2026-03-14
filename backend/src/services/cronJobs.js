const cron = require('node-cron');
const { syncAllRSSSources, cleanOldNews } = require('./rssService');
const economicIndicatorsService = require('./economicIndicatorsService');

let prismaForCron = null;
let cloudinaryForCron = null;
try {
  const { PrismaClient } = require('@prisma/client');
  prismaForCron = new PrismaClient();
  cloudinaryForCron = require('../cloudinary');
} catch (e) {
  console.error('[Cron] No se pudo inicializar Prisma/Cloudinary para limpieza de Amuebla IA:', e.message);
}

/**
 * Configura y arranca todas las tareas programadas
 */
const startCronJobs = () => {
    console.log('[Cron] Iniciando tareas programadas...');

    // Actualizar cotizaciones del dólar una vez al día a las 12:00 PM (mediodía) Argentina
    cron.schedule('0 12 * * *', async () => {
        console.log('[Cron] Ejecutando actualización diaria de cotizaciones del dólar (12:00 PM)...');
        try {
            await economicIndicatorsService.updateDollarRatesFromAPI();
            console.log('[Cron] Actualización de cotizaciones completada exitosamente');
        } catch (error) {
            console.error('[Cron] Error en actualización automática de cotizaciones:', error);
        }
    }, {
        timezone: "America/Argentina/Buenos_Aires"
    });

    // Sincronizar noticias de todas las fuentes una vez al día a las 8:00 AM (hora Argentina UTC-3)
    // Nota: Node-cron usa la zona horaria del servidor. Si el servidor está en UTC, esto será 11:00 UTC = 8:00 AM Argentina
    cron.schedule('0 8 * * *', async () => {
        console.log('[Cron] Ejecutando sincronización diaria de todas las fuentes RSS (8:00 AM Argentina)...');
        try {
            const result = await syncAllRSSSources(30);
            console.log('[Cron] Sincronización completada:', result.message);
            console.log('[Cron] Estadísticas:', JSON.stringify(result.stats, null, 2));
        } catch (error) {
            console.error('[Cron] Error en sincronización automática:', error);
        }
    }, {
        timezone: "America/Argentina/Buenos_Aires"
    });

    // Limpiar noticias antiguas una vez al día a las 03:00 AM (hora Argentina)
    cron.schedule('0 3 * * *', async () => {
        console.log('[Cron] Ejecutando limpieza de noticias antiguas...');
        try {
            const result = await cleanOldNews(90); // 90 días, todas las fuentes
            console.log('[Cron] Limpieza completada:', result.message);
        } catch (error) {
            console.error('[Cron] Error en limpieza automática:', error);
        }
    }, {
        timezone: "America/Argentina/Buenos_Aires"
    });

    // Limpiar imágenes de Amuebla IA expiradas (15 días) todos los días a las 04:00 AM
    cron.schedule('0 4 * * *', async () => {
        console.log('[Cron] Ejecutando limpieza de decoraciones expiradas...');
        if (!prismaForCron || !cloudinaryForCron) {
            console.warn('[Cron] Amuebla IA cleanup omitido: Prisma o Cloudinary no disponibles');
            return;
        }
        try {
            const expired = await prismaForCron.decorationRequest.findMany({
                where: { expiresAt: { lt: new Date() } },
                select: { id: true, originalId: true, generatedId: true },
            });

            let deleted = 0;
            for (const req of expired) {
                try {
                    if (req.originalId) await cloudinaryForCron.uploader.destroy(req.originalId);
                    if (req.generatedId) await cloudinaryForCron.uploader.destroy(req.generatedId);
                    await prismaForCron.decorationRequest.delete({ where: { id: req.id } });
                    deleted++;
                } catch (itemErr) {
                    console.error(`[Cron] Error eliminando decoración ${req.id}:`, itemErr.message);
                }
            }
            console.log(`[Cron] Amuebla IA: ${deleted} decoraciones expiradas eliminadas`);
        } catch (error) {
            console.error('[Cron] Error en limpieza de Amuebla IA:', error);
        }
    }, {
        timezone: "America/Argentina/Buenos_Aires"
    });

    // Nota: Se elimina la sincronización inicial al arrancar para evitar ejecuciones
    // inmediatas. Las noticias se sincronizan únicamente mediante el cron diario
    // configurado más arriba (08:00 AM Argentina).

    // Ejecutar actualización inicial de cotizaciones del dólar
    setTimeout(async () => {
        console.log('[Cron] Ejecutando actualización inicial de cotizaciones del dólar...');
        try {
            await economicIndicatorsService.updateDollarRatesFromAPI();
            console.log('[Cron] Actualización inicial de cotizaciones completada');
        } catch (error) {
            console.error('[Cron] Error en actualización inicial de cotizaciones:', error);
        }
    }, 5000); // Esperar 5 segundos después del inicio

    console.log('[Cron] Tareas programadas configuradas exitosamente');
    console.log('[Cron] - Actualización de cotizaciones del dólar: 12:00 PM (mediodía) Argentina - 1 registro diario');
    console.log('[Cron] - Sincronización RSS (todas las fuentes): Diariamente a las 8:00 AM (Argentina)');
    console.log('[Cron] - Limpieza de noticias: Diariamente a las 03:00 AM (Argentina)');
    console.log('[Cron] - Limpieza de Amuebla IA (imágenes expiradas): Diariamente a las 04:00 AM (Argentina)');
};

module.exports = { startCronJobs };
