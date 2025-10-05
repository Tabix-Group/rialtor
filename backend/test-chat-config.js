#!/usr/bin/env node
/**
 * Script de prueba para verificar la configuración del Chat RIALTOR
 * 
 * Ejecutar con: node test-chat-config.js
 */

require('dotenv').config();

const checks = {
  openai: false,
  tavily: false,
  model: 'N/A'
};

console.log('\n🔍 Verificando configuración del Chat RIALTOR...\n');
console.log('━'.repeat(60));

// Check 1: OpenAI API Key
console.log('\n1️⃣  OpenAI API Key');
if (process.env.OPENAI_API_KEY) {
  const key = process.env.OPENAI_API_KEY;
  if (key.startsWith('sk-')) {
    checks.openai = true;
    console.log('   ✅ Configurada correctamente');
    console.log(`   📝 Key: ${key.substring(0, 10)}...${key.substring(key.length - 4)}`);
  } else {
    console.log('   ❌ Key inválida (debe empezar con "sk-")');
    console.log(`   📝 Valor actual: ${key.substring(0, 20)}...`);
  }
} else {
  console.log('   ❌ No configurada');
  console.log('   💡 Agregar OPENAI_API_KEY al archivo .env');
}

// Check 2: Modelo OpenAI
console.log('\n2️⃣  Modelo OpenAI');
checks.model = process.env.OPENAI_MODEL || 'gpt-4o (default)';
console.log(`   📝 Modelo configurado: ${checks.model}`);
if (checks.model.includes('gpt-4')) {
  console.log('   ✅ Usando GPT-4 (recomendado para producción)');
} else if (checks.model.includes('gpt-3.5')) {
  console.log('   ⚠️  Usando GPT-3.5 (más económico pero menos capaz)');
}

// Check 3: Tavily API Key (opcional)
console.log('\n3️⃣  Tavily API Key (Búsqueda Web)');
if (process.env.TAVILY_API_KEY) {
  const key = process.env.TAVILY_API_KEY;
  if (key.startsWith('tvly-')) {
    checks.tavily = true;
    console.log('   ✅ Configurada correctamente');
    console.log(`   📝 Key: ${key.substring(0, 10)}...${key.substring(key.length - 4)}`);
    console.log('   🌐 Búsqueda web HABILITADA');
  } else {
    console.log('   ⚠️  Key inválida (debe empezar con "tvly-")');
    console.log(`   📝 Valor actual: ${key.substring(0, 20)}...`);
  }
} else {
  console.log('   ⚠️  No configurada (opcional)');
  console.log('   💡 Para habilitar búsqueda web, obtén una key en https://tavily.com');
  console.log('   📝 El chat funcionará pero sin información en tiempo real');
}

// Check 4: Dependencias
console.log('\n4️⃣  Dependencias Node');
try {
  require('openai');
  console.log('   ✅ openai package instalado');
} catch (e) {
  console.log('   ❌ openai package no instalado');
  console.log('   💡 Ejecutar: npm install openai');
}

try {
  require('axios');
  console.log('   ✅ axios package instalado');
} catch (e) {
  console.log('   ❌ axios package no instalado');
  console.log('   💡 Ejecutar: npm install axios');
}

// Resumen final
console.log('\n' + '━'.repeat(60));
console.log('\n📊 RESUMEN DE CONFIGURACIÓN\n');

const features = [
  {
    name: 'Chat Básico',
    enabled: checks.openai,
    required: true,
    description: 'Conversación con IA'
  },
  {
    name: 'Búsqueda Web',
    enabled: checks.tavily,
    required: false,
    description: 'Información en tiempo real (dólar, noticias, etc.)'
  },
  {
    name: 'Calculadoras',
    enabled: checks.openai,
    required: true,
    description: 'Honorarios y gastos de escrituración'
  },
  {
    name: 'Historial',
    enabled: checks.openai,
    required: true,
    description: 'Contexto de conversación'
  }
];

features.forEach(feature => {
  const status = feature.enabled ? '✅' : (feature.required ? '❌' : '⚠️');
  const reqLabel = feature.required ? '[REQUERIDO]' : '[OPCIONAL]';
  console.log(`${status} ${feature.name.padEnd(20)} ${reqLabel.padEnd(12)} - ${feature.description}`);
});

console.log('\n' + '━'.repeat(60));

// Estado final
if (checks.openai) {
  console.log('\n🎉 ¡Configuración COMPLETA!');
  console.log('   El chat está listo para usar.');
  
  if (checks.tavily) {
    console.log('   🌟 Todas las funcionalidades habilitadas (incluida búsqueda web)');
  } else {
    console.log('   💡 Tip: Configura Tavily para habilitar búsqueda web');
  }
  
  console.log('\n📝 Ejemplos de consultas para probar:');
  console.log('   • "¿Cuál es el precio del dólar blue hoy?"');
  console.log('   • "Calcular honorarios para $100.000 USD, 4% comisión en CABA"');
  console.log('   • "¿Cuáles son los gastos de escrituración en Buenos Aires?"');
  
} else {
  console.log('\n❌ Configuración INCOMPLETA');
  console.log('   Falta configurar OPENAI_API_KEY');
  console.log('\n📖 Pasos:');
  console.log('   1. Ir a: https://platform.openai.com/api-keys');
  console.log('   2. Crear una nueva API key');
  console.log('   3. Copiarla al archivo .env como: OPENAI_API_KEY=sk-...');
  console.log('   4. Reiniciar el servidor');
}

console.log('\n' + '━'.repeat(60));
console.log('\n📚 Documentación completa en: CHAT_SETUP.md');
console.log('🔧 Para más ayuda: CHAT_IMPROVEMENTS.md\n');
