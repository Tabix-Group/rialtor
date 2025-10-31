const cron = require('node-cron');
const { syncWorldPropertyJournal, cleanOldNews } = require('./rssService');

/**
 * Configura y arranca todas las tareas programadas
 */
const startCronJobs = () => {
    console.log('[Cron] Iniciando tareas programadas...');

    // Sincronizar noticias cada 6 horas (a las 00:00, 06:00, 12:00, 18:00)
    cron.schedule('0 */6 * * *', async () => {
        console.log('[Cron] Ejecutando sincronización de noticias RSS...');
        try {
            const result = await syncWorldPropertyJournal(30);
            console.log('[Cron] Sincronización completada:', result.message);
        } catch (error) {
            console.error('[Cron] Error en sincronización automática:', error);
        }
    });

    // Limpiar noticias antiguas una vez al día a las 03:00 AM
    cron.schedule('0 3 * * *', async () => {
        console.log('[Cron] Ejecutando limpieza de noticias antiguas...');
        try {
            const result = await cleanOldNews(90); // 90 días
            console.log('[Cron] Limpieza completada:', result.message);
        } catch (error) {
            console.error('[Cron] Error en limpieza automática:', error);
        }
    });

    // Ejecutar sincronización inicial al iniciar el servidor
    setTimeout(async () => {
        console.log('[Cron] Ejecutando sincronización inicial...');
        try {
            const result = await syncWorldPropertyJournal(20);
            console.log('[Cron] Sincronización inicial completada:', result.message);
        } catch (error) {
            console.error('[Cron] Error en sincronización inicial:', error);
        }
    }, 10000); // Esperar 10 segundos después del inicio

    console.log('[Cron] Tareas programadas configuradas exitosamente');
    console.log('[Cron] - Sincronización RSS: Cada 6 horas');
    console.log('[Cron] - Limpieza de noticias: Diariamente a las 03:00 AM');
};

module.exports = { startCronJobs };
