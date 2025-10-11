#!/usr/bin/env node

/**
 * Script para verificar archivos en Cloudinary
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

async function checkCloudinaryFiles() {
  console.log('🔍 Verificando archivos en Cloudinary...\n');

  try {
    // Buscar todos los archivos raw (documentos)
    const result = await cloudinary.api.resources({
      type: 'upload',
      resource_type: 'raw',
      max_results: 100
    });

    console.log(`📊 Total de archivos raw encontrados: ${result.resources.length}\n`);

    // Agrupar por carpetas
    const folders = {};
    result.resources.forEach(resource => {
      const pathParts = resource.public_id.split('/');
      const folder = pathParts.length > 1 ? pathParts[0] : 'root';

      if (!folders[folder]) {
        folders[folder] = [];
      }
      folders[folder].push({
        public_id: resource.public_id,
        filename: pathParts[pathParts.length - 1],
        format: resource.format,
        size: resource.bytes,
        url: resource.secure_url
      });
    });

    // Mostrar resultados
    Object.keys(folders).forEach(folder => {
      console.log(`📁 ${folder}: ${folders[folder].length} archivos`);
      folders[folder].forEach(file => {
        console.log(`   📄 ${file.filename} (${file.format}, ${file.size} bytes)`);
      });
      console.log('');
    });

    // Verificar específicamente las carpetas docgen
    console.log('🔍 Verificando carpetas docgen específicamente...\n');

    const docgenFolders = ['alquiler', 'boletos', 'reservas'];
    for (const folder of docgenFolders) {
      try {
        const folderResult = await cloudinary.api.resources({
          type: 'upload',
          resource_type: 'raw',
          prefix: `docgen/${folder}`,
          max_results: 100
        });

        console.log(`📁 docgen/${folder}: ${folderResult.resources.length} archivos`);
        folderResult.resources.forEach(resource => {
          const filename = resource.public_id.split('/').pop();
          console.log(`   📄 ${filename} (${resource.format}, ${resource.bytes} bytes)`);
        });
      } catch (error) {
        console.log(`📁 docgen/${folder}: Error - ${error.message}`);
      }
      console.log('');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkCloudinaryFiles();