/**
 * Script de prueba para verificar la sincronización de noticias RSS
 * Ejecutar con: node test-rss-sync.js
 */

require('dotenv').config();
const { syncWorldPropertyJournal, getImportStats } = require('./src/services/rssService');

async function testRSSSync() {
    console.log('='.repeat(60));
    console.log('TEST: Sincronización de noticias RSS');
    console.log('='.repeat(60));
    console.log('');

    try {
        // Probar sincronización
        console.log('📡 Iniciando sincronización de prueba (límite: 10 noticias)...');
        const result = await syncWorldPropertyJournal(10);

        console.log('');
        console.log('Resultado:');
        console.log('  ✓ Éxito:', result.success);
        console.log('  📊 Mensaje:', result.message);
        
        if (result.stats) {
            console.log('');
            console.log('Estadísticas:');
            console.log('  - Total procesadas:', result.stats.total);
            console.log('  - Importadas:', result.stats.imported);
            console.log('  - Actualizadas:', result.stats.updated);
            console.log('  - Omitidas:', result.stats.skipped);
            
            if (result.stats.errors.length > 0) {
                console.log('  - Errores:', result.stats.errors.length);
                console.log('');
                console.log('Errores:');
                result.stats.errors.forEach((err, idx) => {
                    console.log(`  ${idx + 1}. ${err.title}: ${err.error}`);
                });
            }
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
