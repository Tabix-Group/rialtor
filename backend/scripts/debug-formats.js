#!/usr/bin/env node

require('dotenv').config();
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function debugFormats() {
  const folders = ['alquiler', 'boletos', 'reservas'];
  
  for (const folder of folders) {
    console.log(`\n📁 Carpeta: docgen/${folder}`);
    console.log('='.repeat(60));
    
    const result = await cloudinary.api.resources({
      type: 'upload',
      resource_type: 'raw',
      prefix: `docgen/${folder}/`,
      max_results: 100
    });
    
    result.resources.forEach((resource, index) => {
      const filename = resource.public_id.split('/').pop();
      console.log(`\n${index + 1}. Archivo: ${filename}`);
      console.log(`   - public_id: ${resource.public_id}`);
      console.log(`   - format: ${resource.format}`);
      console.log(`   - resource_type: ${resource.resource_type}`);
      console.log(`   - bytes: ${resource.bytes}`);
      console.log(`   - url: ${resource.secure_url}`);
    });
  }
}

debugFormats().catch(console.error);
