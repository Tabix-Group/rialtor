#!/usr/bin/env node

/**
 * Script para listar TODAS las carpetas y archivos en Cloudinary
 */

require('dotenv').config();
const cloudinary = require('cloudinary').v2;

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function listAllFolders() {
  console.log('🔍 Listando TODAS las carpetas en Cloudinary...\n');

  try {
    // Listar carpetas raíz
    const rootFolders = await cloudinary.api.root_folders();
    console.log('📁 Carpetas en la raíz:');
    rootFolders.folders.forEach(folder => {
      console.log(`  - ${folder.name} (${folder.path})`);
    });

    console.log('\n🔍 Verificando carpeta docgen...\n');
    
    try {
      const docgenSubfolders = await cloudinary.api.sub_folders('docgen');
      console.log('📁 Subcarpetas dentro de docgen:');
      docgenSubfolders.folders.forEach(folder => {
        console.log(`  - ${folder.name} (${folder.path})`);
      });
    } catch (error) {
      console.log('⚠️  Error al listar subcarpetas de docgen:', error.message);
    }

    // Intentar listar recursos en docgen directamente
    console.log('\n🔍 Buscando archivos con diferentes prefijos...\n');
    
    const prefixes = [
      'docgen',
      'docgen/',
      'docgen/reservas',
      'docgen/reservas/',
      'docgen/alquiler',
      'docgen/alquiler/',
      'docgen/boletos',
      'docgen/boletos/'
    ];

    for (const prefix of prefixes) {
      try {
        const result = await cloudinary.api.resources({
          type: 'upload',
          resource_type: 'raw',
          prefix: prefix,
          max_results: 100
        });

        if (result.resources.length > 0) {
          console.log(`✅ Prefix "${prefix}": ${result.resources.length} archivos encontrados`);
          result.resources.forEach(r => {
            console.log(`   - ${r.public_id} (${r.format}, ${r.bytes} bytes)`);
          });
        } else {
          console.log(`⚪ Prefix "${prefix}": 0 archivos`);
        }
      } catch (error) {
        console.log(`❌ Prefix "${prefix}": Error - ${error.message}`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

listAllFolders().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
