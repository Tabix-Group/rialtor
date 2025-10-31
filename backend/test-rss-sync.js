/**
 * Script de prueba para verificar la sincronización de noticias RSS
 * Ejecutar con: node test-rss-sync.js
 */

require('dotenv').config();
const { syncAllRSSSources, syncRSSSource, getImportStats, getRSSSources, RSS_SOURCES } = require('./src/services/rssService');

async function testRSSSync() {
    console.log('='.repeat(60));
    console.log('TEST: Sincronización de noticias RSS - Múltiples Fuentes');
    console.log('='.repeat(60));
    console.log('');

    try {
        // Listar fuentes disponibles
        const sources = getRSSSources();
        console.log('📡 Fuentes RSS disponibles:');
        sources.forEach((source, idx) => {
            console.log(`  ${idx + 1}. ${source.name}`);
            console.log(`     URL: ${source.url}`);
            console.log(`     Categoría: ${source.category}`);
        });
        console.log('');

        // Probar sincronización de todas las fuentes
        console.log('='.repeat(60));
        console.log('Sincronización de TODAS las fuentes (límite: 10 noticias c/u)...');
        console.log('='.repeat(60));
        console.log('');

        const result = await syncAllRSSSources(10);

        console.log('');
        console.log('Resultado General:');
        console.log('  ✓ Éxito:', result.success);
        console.log('  📊 Mensaje:', result.message);
        
        if (result.stats) {
            console.log('');
            console.log('Estadísticas Consolidadas:');
            console.log('  - Total de fuentes:', result.stats.totalSources);
            console.log('  - Fuentes exitosas:', result.stats.successfulSources);
            console.log('  - Fuentes fallidas:', result.stats.failedSources);
            console.log('  - Total importadas:', result.stats.totalImported);
            console.log('  - Total actualizadas:', result.stats.totalUpdated);
            console.log('  - Total omitidas:', result.stats.totalSkipped);
            
            if (result.stats.totalErrors > 0) {
                console.log('  - Total errores:', result.stats.totalErrors);
            }

            console.log('');
            console.log('Detalles por fuente:');
            result.stats.bySource.forEach((sourceResult, idx) => {
                console.log('');
                console.log(`  ${idx + 1}. ${sourceResult.stats.source}:`);
                console.log(`     ✓ Éxito: ${sourceResult.success}`);
                console.log(`     - Procesadas: ${sourceResult.stats.total}`);
                console.log(`     - Importadas: ${sourceResult.stats.imported}`);
                console.log(`     - Actualizadas: ${sourceResult.stats.updated}`);
                console.log(`     - Omitidas: ${sourceResult.stats.skipped}`);
                
                if (sourceResult.stats.errors && sourceResult.stats.errors.length > 0) {
                    console.log(`     ⚠️  Errores: ${sourceResult.stats.errors.length}`);
                    sourceResult.stats.errors.forEach((err, errIdx) => {
                        console.log(`        ${errIdx + 1}. ${err.title}: ${err.error}`);
                    });
                }
            });
        }

        // Obtener estadísticas generales
        console.log('');
        console.log('='.repeat(60));
        console.log('Estadísticas generales de noticias:');
        console.log('='.repeat(60));
        
        const statsResult = await getImportStats();
        if (statsResult.success) {
            console.log('');
            console.log('  Total de noticias:', statsResult.stats.total);
            console.log('  Noticias activas:', statsResult.stats.active);
            console.log('');
            console.log('  Por fuente:');
            statsResult.stats.bySource.forEach(source => {
                console.log(`    - ${source.source}: ${source.count} noticias`);
            });
        }

        console.log('');
        console.log('='.repeat(60));
        console.log('✅ Test completado exitosamente');
        console.log('='.repeat(60));

        process.exit(0);

    } catch (error) {
        console.error('');
        console.error('❌ Error en el test:', error);
        console.error('');
        process.exit(1);
    }
}

// Ejecutar test
testRSSSync();
