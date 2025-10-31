const cron = require('node-cron');
const { syncAllRSSSources, cleanOldNews } = require('./rssService');

/**
 * Configura y arranca todas las tareas programadas
 */
const startCronJobs = () => {
    console.log('[Cron] Iniciando tareas programadas...');

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

    // Ejecutar sincronización inicial al iniciar el servidor (todas las fuentes)
    setTimeout(async () => {
        console.log('[Cron] Ejecutando sincronización inicial de todas las fuentes...');
        try {
            const result = await syncAllRSSSources(20);
            console.log('[Cron] Sincronización inicial completada:', result.message);
            console.log('[Cron] Fuentes sincronizadas:', `${result.stats.successfulSources}/${result.stats.totalSources}`);
        } catch (error) {
            console.error('[Cron] Error en sincronización inicial:', error);
        }
    }, 10000); // Esperar 10 segundos después del inicio

    console.log('[Cron] Tareas programadas configuradas exitosamente');
    console.log('[Cron] - Sincronización RSS (todas las fuentes): Diariamente a las 8:00 AM (Argentina)');
    console.log('[Cron] - Limpieza de noticias: Diariamente a las 03:00 AM (Argentina)');
};

module.exports = { startCronJobs };
