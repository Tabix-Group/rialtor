#!/usr/bin/env node

/**
 * Script para subir documentos a Cloudinary
 * Uso: node upload-forms.js [carpeta] [archivo o directorio]
 * 
 * Ejemplos:
 * node upload-forms.js alquiler ./docs/contrato-alquiler.docx
 * node upload-forms.js boletos ./docs/boletos/
 */

require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Verificar configuración
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.error('❌ Error: Configuración de Cloudinary incompleta');
  console.error('Asegúrate de tener las siguientes variables en tu archivo .env:');
  console.error('- CLOUDINARY_CLOUD_NAME');
  console.error('- CLOUDINARY_API_KEY');
  console.error('- CLOUDINARY_API_SECRET');
  process.exit(1);
}

// Carpetas válidas
const VALID_FOLDERS = ['alquiler', 'boletos', 'reservas'];

// Obtener argumentos
const [,, folder, sourcePath] = process.argv;

// Validar argumentos
if (!folder || !sourcePath) {
  console.log('');
  console.log('📋 Subir Formularios a Cloudinary');
  console.log('');
  console.log('Uso:');
  console.log('  node upload-forms.js [carpeta] [archivo o directorio]');
  console.log('');
  console.log('Carpetas válidas:');
  console.log('  - alquiler');
  console.log('  - boletos');
  console.log('  - reservas');
  console.log('');
  console.log('Ejemplos:');
  console.log('  node upload-forms.js alquiler ./docs/contrato-alquiler.docx');
  console.log('  node upload-forms.js boletos ./docs/boletos/');
  console.log('');
  process.exit(1);
}

// Validar carpeta
if (!VALID_FOLDERS.includes(folder)) {
  console.error(`❌ Error: Carpeta inválida "${folder}"`);
  console.error(`Carpetas válidas: ${VALID_FOLDERS.join(', ')}`);
  process.exit(1);
}

// Verificar que el path exista
if (!fs.existsSync(sourcePath)) {
  console.error(`❌ Error: No se encontró "${sourcePath}"`);
  process.exit(1);
}

/**
 * Subir un archivo a Cloudinary
 */
async function uploadFile(filePath, targetFolder) {
  const filename = path.basename(filePath);
  const ext = path.extname(filePath).toLowerCase();
  
  // Validar que sea un archivo .docx
  if (ext !== '.docx') {
    console.warn(`⚠️  Ignorando ${filename} (solo se aceptan archivos .docx)`);
    return null;
  }
  
  console.log(`📤 Subiendo: ${filename}...`);
  
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: 'raw',
      folder: `docgen/${targetFolder}`,
      public_id: filename.replace('.docx', ''),
      use_filename: true,
      unique_filename: false,
      overwrite: true
    });
    
    console.log(`✅ ${filename} subido exitosamente`);
    console.log(`   URL: ${result.secure_url}`);
    return result;
  } catch (error) {
    console.error(`❌ Error al subir ${filename}:`, error.message);
    return null;
  }
}

/**
 * Subir todos los archivos de un directorio
 */
async function uploadDirectory(dirPath, targetFolder) {
  const files = fs.readdirSync(dirPath);
  const docxFiles = files.filter(f => f.endsWith('.docx'));
  
  if (docxFiles.length === 0) {
    console.warn(`⚠️  No se encontraron archivos .docx en ${dirPath}`);
    return;
  }
  
  console.log(`📁 Encontrados ${docxFiles.length} archivos .docx`);
  console.log('');
  
  const results = [];
  for (const file of docxFiles) {
    const filePath = path.join(dirPath, file);
    const result = await uploadFile(filePath, targetFolder);
    if (result) results.push(result);
  }
  
  console.log('');
  console.log('📊 Resumen:');
  console.log(`   Total de archivos: ${docxFiles.length}`);
  console.log(`   Subidos exitosamente: ${results.length}`);
  console.log(`   Fallidos: ${docxFiles.length - results.length}`);
}

/**
 * Main
 */
async function main() {
  console.log('');
  console.log('🚀 Iniciando carga de documentos...');
  console.log(`   Carpeta destino: docgen/${folder}`);
  console.log(`   Origen: ${sourcePath}`);
  console.log('');
  
  const stats = fs.statSync(sourcePath);
  
  if (stats.isFile()) {
    // Subir un solo archivo
    await uploadFile(sourcePath, folder);
  } else if (stats.isDirectory()) {
    // Subir todos los archivos del directorio
    await uploadDirectory(sourcePath, folder);
  } else {
    console.error('❌ Error: El path debe ser un archivo o directorio');
    process.exit(1);
  }
  
  console.log('');
  console.log('✅ Proceso completado');
  console.log('');
  console.log('💡 Los documentos ya están disponibles en:');
  console.log(`   https://rialtor.app/formularios/${folder}`);
  console.log('');
}

// Ejecutar
main().catch(error => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});
