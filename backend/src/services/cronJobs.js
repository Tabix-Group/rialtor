const cron = require('node-cron');
const { syncAllRSSSources, cleanOldNews } = require('./rssService');
const economicIndicatorsService = require('./economicIndicatorsService');

/**
 * Configura y arranca todas las tareas programadas
 */
const startCronJobs = () => {
    console.log('[Cron] Iniciando tareas programadas...');

    // Actualizar cotizaciones del dólar a las 10:30 AM Argentina
    cron.schedule('30 10 * * *', async () => {
        console.log('[Cron] Ejecutando actualización de cotizaciones del dólar (10:30 AM)...');
        try {
            await economicIndicatorsService.updateDollarRatesFromAPI();
            console.log('[Cron] Actualización de cotizaciones completada exitosamente');
        } catch (error) {
            console.error('[Cron] Error en actualización automática de cotizaciones:', error);
        }
    }, {
        timezone: "America/Argentina/Buenos_Aires"
    });

    // Actualizar cotizaciones del dólar a las 18:00 (6:00 PM) Argentina
    cron.schedule('0 18 * * *', async () => {
        console.log('[Cron] Ejecutando actualización de cotizaciones del dólar (6:00 PM)...');
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
    console.log('[Cron] - Actualización de cotizaciones del dólar: 10:30 AM y 6:00 PM (Argentina)');
    console.log('[Cron] - Sincronización RSS (todas las fuentes): Diariamente a las 8:00 AM (Argentina)');
    console.log('[Cron] - Limpieza de noticias: Diariamente a las 03:00 AM (Argentina)');
};

module.exports = { startCronJobs };
