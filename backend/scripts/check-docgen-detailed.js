#!/usr/bin/env node

/**
 * Script para verificar archivos en las carpetas docgen de Cloudinary
 * con detalles de cada resource_type
 */

require('dotenv').config();
const cloudinary = require('cloudinary').v2;

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Verificar configuración
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.error('❌ Configuración de Cloudinary incompleta');
  process.exit(1);
}

async function checkDocgenFolders() {
  console.log('🔍 Verificando carpetas docgen en Cloudinary...\n');

  const folders = ['alquiler', 'boletos', 'reservas'];
  const resourceTypes = ['image', 'video', 'raw', 'auto'];

  for (const folder of folders) {
    console.log(`\n📁 Carpeta: docgen/${folder}`);
    console.log('='.repeat(50));
    
    let foundFiles = false;

    for (const resourceType of resourceTypes) {
      try {
        const result = await cloudinary.api.resources({
          type: 'upload',
          resource_type: resourceType,
          prefix: `docgen/${folder}`,
          max_results: 100
        });

        if (result.resources && result.resources.length > 0) {
          console.log(`\n  📦 Resource Type: ${resourceType.toUpperCase()}`);
          console.log(`  Total archivos: ${result.resources.length}\n`);
          
          result.resources.forEach((resource, index) => {
            const filename = resource.public_id.split('/').pop();
            console.log(`  ${index + 1}. ${filename}`);
            console.log(`     - Public ID: ${resource.public_id}`);
            console.log(`     - Format: ${resource.format}`);
            console.log(`     - Size: ${resource.bytes} bytes`);
            console.log(`     - URL: ${resource.secure_url}`);
            console.log(`     - Created: ${resource.created_at}`);
            console.log('');
          });
          
          foundFiles = true;
        }
      } catch (error) {
        // Ignorar errores de carpetas vacías
        if (error.error && error.error.http_code !== 404) {
          console.log(`  ⚠️  Error con resource_type '${resourceType}': ${error.message}`);
        }
      }
    }

    if (!foundFiles) {
      console.log('  ⚠️  No se encontraron archivos en esta carpeta\n');
    }
  }

  console.log('\n✅ Verificación completada\n');
}

checkDocgenFolders().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
