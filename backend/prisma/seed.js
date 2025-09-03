// Prisma seed file
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');




  // Crear roles base si no existen
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: {
      name: 'ADMIN',
      description: 'Administrador'
    }
  });
  const userRole = await prisma.role.upsert({
    where: { name: 'USUARIO' },
    update: {},
    create: {
      name: 'USUARIO',
      description: 'Usuario'
    }
  });
  // Puedes agregar más roles base aquí si lo deseas



  // Crear usuario admin
  const hashedPassword = await bcrypt.hash('abcd123', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'rialtor@rialtor.app' },
    update: {},
    create: {
      email: 'rialtor@rialtor.app',
      password: hashedPassword,
      name: 'Admin Rialtor',
      isActive: true
    }
  });

  // Asignar rol admin al usuario
  await prisma.roleAssignment.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: adminRole.id
      }
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: adminRole.id
    }
  });

  console.log('✅ Admin user created:', adminUser.email);
  const calculatorConfigs = [
    {
      type: 'COMMISSION',
      name: 'Calculadora de Comisiones',
      rates: JSON.stringify({
        caba: { min: 4, max: 6, default: 5 },
        gba: { min: 3, max: 5, default: 4 },
        interior: { min: 3, max: 4, default: 3.5 }
      })
    },
    {
      type: 'TAXES',
      name: 'Calculadora de Impuestos',
      rates: JSON.stringify({
        iti: 1.5,
        sellos: 1.2,
        registro: 0.3
      })
    },
    {
      type: 'STAMPS',
      name: 'Calculadora de Sellos',
      rates: JSON.stringify({
        buenos_aires: 1.2,
        caba: 1.5,
        catamarca: 1.0,
        chaco: 1.0,
        chubut: 1.0,
        cordoba: 1.2,
        corrientes: 1.0,
        entre_rios: 1.0,
        formosa: 1.0,
        jujuy: 1.0,
        la_pampa: 1.0,
        la_rioja: 1.0,
        mendoza: 1.5,
        misiones: 1.0,
        neuquen: 1.0,
        rio_negro: 1.0,
        salta: 1.0,
        san_juan: 1.0,
        san_luis: 1.0,
        santa_cruz: 1.0,
        santa_fe: 1.2,
        santiago_del_estero: 1.0,
        tierra_del_fuego: 1.0,
        tucuman: 1.0
      })
    }
  ];

  for (const config of calculatorConfigs) {
    const calculatorConfig = await prisma.calculatorConfig.upsert({
      where: {
        type: config.type
      },
      update: {},
      create: config
    });
    console.log('✅ Calculator config created:', calculatorConfig.name);
  }

  // Create system config
  const systemConfigs = [
    {
      key: 'site_name',
      value: 'RE/MAX Knowledge Platform',
      type: 'STRING',
      description: 'Nombre del sitio web'
    },
    {
      key: 'max_upload_size',
      value: '10485760',
      type: 'NUMBER',
      description: 'Tamaño máximo de archivo en bytes'
    },
    {
      key: 'enable_chat',
      value: 'true',
      type: 'BOOLEAN',
      description: 'Habilitar chat con IA'
    },
    {
      key: 'openai_model',
      value: 'gpt-4',
      type: 'STRING',
      description: 'Modelo de OpenAI a utilizar'
    }
  ];

  for (const config of systemConfigs) {
    const systemConfig = await prisma.systemConfig.upsert({
      where: { key: config.key },
      update: {},
      create: config
    });
    console.log('✅ System config created:', systemConfig.key);
  }

  // Create bank rates
  const bankRates = [
    { bankName: 'Banco Nación', interestRate: 8.5 },
    { bankName: 'Banco Provincia', interestRate: 9.2 },
    { bankName: 'Banco Ciudad', interestRate: 8.8 },
    { bankName: 'Banco Santander', interestRate: 10.5 },
    { bankName: 'Banco Galicia', interestRate: 9.8 },
    { bankName: 'Banco Macro', interestRate: 9.5 },
    { bankName: 'Banco BBVA', interestRate: 10.2 },
    { bankName: 'Banco HSBC', interestRate: 9.9 },
    { bankName: 'Banco ICBC', interestRate: 8.7 },
    { bankName: 'Banco Itaú', interestRate: 9.3 },
    { bankName: 'Banco Supervielle', interestRate: 9.7 },
    { bankName: 'Banco Patagonia', interestRate: 9.1 },
    { bankName: 'Banco Comafi', interestRate: 10.0 },
    { bankName: 'Banco Credicoop', interestRate: 8.9 },
    { bankName: 'Banco Hipotecario', interestRate: 9.4 },
    { bankName: 'Banco de Córdoba', interestRate: 9.6 },
    { bankName: 'Banco de San Juan', interestRate: 9.8 },
    { bankName: 'Banco de Tucumán', interestRate: 9.5 },
    { bankName: 'Nuevo Banco del Chaco', interestRate: 9.2 },
    { bankName: 'Banco de Corrientes', interestRate: 9.3 },
    { bankName: 'Banco de Formosa', interestRate: 9.4 },
    { bankName: 'Banco de Jujuy', interestRate: 9.1 },
    { bankName: 'Banco de La Pampa', interestRate: 9.6 },
    { bankName: 'Banco de La Rioja', interestRate: 9.7 },
    { bankName: 'Banco de Mendoza', interestRate: 9.8 },
    { bankName: 'Banco de Neuquén', interestRate: 9.2 },
    { bankName: 'Banco de Río Negro', interestRate: 9.3 },
    { bankName: 'Banco de Salta', interestRate: 9.4 },
    { bankName: 'Banco de Santa Cruz', interestRate: 9.5 },
    { bankName: 'Banco de Santa Fe', interestRate: 9.6 },
    { bankName: 'Banco de Santiago del Estero', interestRate: 9.7 },
    { bankName: 'Banco de Tierra del Fuego', interestRate: 9.8 }
  ];

  for (const rate of bankRates) {
    const bankRate = await prisma.bankRate.upsert({
      where: { bankName: rate.bankName },
      update: {},
      create: rate
    });
    console.log('✅ Bank rate created:', bankRate.bankName);
  }

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
