// Prisma seed file
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');


  // Create admin user (contraseña cumple validación: Admin1234)
  const adminPassword = 'Admin1234';
  const hashedPassword = await bcrypt.hash(adminPassword, 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@remax.com' },
    update: {},
    create: {
      email: 'admin@remax.com',
      password: hashedPassword,
      name: 'Administrador',
      role: 'ADMIN',
      isActive: true
    }
  });

  console.log('✅ Admin user created:', admin.email);

  // Create demo user (contraseña cumple validación: Demo1234)
  const demoPasswordPlain = 'Demo1234';
  const demoPassword = await bcrypt.hash(demoPasswordPlain, 12);
  const demo = await prisma.user.upsert({
    where: { email: 'demo@remax.com' },
    update: {},
    create: {
      email: 'demo@remax.com',
      password: demoPassword,
      name: 'Usuario Demo',
      role: 'USER',
      isActive: true
    }
  });

  console.log('✅ Demo user created:', demo.email);


  // Create calculator configs
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

  console.log('🎉 Seed completed successfully!');
  console.log('');
  console.log('📧 Admin credentials:');
  console.log('   Email: admin@remax.com');
  console.log('   Password:', adminPassword);
  console.log('');
  console.log('📧 Demo credentials:');
  console.log('   Email: demo@remax.com');
  console.log('   Password:', demoPasswordPlain);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
