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
      description: 'Administrador del sistema'
    }
  });

  const userRole = await prisma.role.upsert({
    where: { name: 'USUARIO' },
    update: {},
    create: {
      name: 'USUARIO',
      description: 'Usuario estándar'
    }
  });

  const corredorRole = await prisma.role.upsert({
    where: { name: 'CORREDOR' },
    update: {},
    create: {
      name: 'CORREDOR',
      description: 'Corredor inmobiliario'
    }
  });

  console.log('✅ Roles created');

  // Crear permisos base
  const permissions = [
    { name: 'view_admin', description: 'Ver panel de administración' },
    { name: 'manage_users', description: 'Gestionar usuarios' },
    { name: 'manage_content', description: 'Gestionar contenido' },
    { name: 'upload_files', description: 'Subir archivos' },
    { name: 'generate_documents', description: 'Generar documentos' },
    { name: 'use_calculators', description: 'Usar calculadoras' },
    { name: 'access_chat', description: 'Acceder al chat IA' },
    { name: 'use_placas', description: 'Usar generador de placas' }
  ];

  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { name: perm.name },
      update: {},
      create: perm
    });
  }

  // Asignar permisos a roles
  await prisma.role.update({
    where: { name: 'ADMIN' },
    data: {
      permissions: {
        connect: permissions.map(p => ({ name: p.name }))
      }
    }
  });

  await prisma.role.update({
    where: { name: 'USUARIO' },
    data: {
      permissions: {
        connect: [
          { name: 'upload_files' },
          { name: 'generate_documents' },
          { name: 'use_calculators' },
          { name: 'access_chat' }
        ]
      }
    }
  });

  await prisma.role.update({
    where: { name: 'CORREDOR' },
    data: {
      permissions: {
        connect: [
          { name: 'upload_files' },
          { name: 'generate_documents' },
          { name: 'use_calculators' },
          { name: 'access_chat' },
          { name: 'manage_content' },
          { name: 'use_placas' }
        ]
      }
    }
  });

  console.log('✅ Permissions assigned to roles');

  // Crear usuarios de ejemplo
  const hashedAdminPassword = await bcrypt.hash('admin123', 10);
  const hashedUserPassword = await bcrypt.hash('user123', 10);
  const hashedCorredorPassword = await bcrypt.hash('corredor123', 10);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@rialtor.app' },
    update: {},
    create: {
      email: 'admin@rialtor.app',
      password: hashedAdminPassword,
      name: 'Administrador Rialtor',
      phone: '+5491123456789',
      office: 'Oficina Central',
      isActive: true
    }
  });

  const corredorUser = await prisma.user.upsert({
    where: { email: 'corredor@rialtor.app' },
    update: {},
    create: {
      email: 'corredor@rialtor.app',
      password: hashedCorredorPassword,
      name: 'María González',
      phone: '+5491187654321',
      office: 'RE/MAX Premium',
      isActive: true
    }
  });

  const regularUser = await prisma.user.upsert({
    where: { email: 'usuario@rialtor.app' },
    update: {},
    create: {
      email: 'usuario@rialtor.app',
      password: hashedUserPassword,
      name: 'Juan Pérez',
      phone: '+5491198765432',
      office: 'RE/MAX Centro',
      isActive: true
    }
  });

  // Asignar roles a usuarios
  await prisma.roleAssignment.upsert({
    where: { userId_roleId: { userId: adminUser.id, roleId: adminRole.id } },
    update: {},
    create: { userId: adminUser.id, roleId: adminRole.id }
  });

  await prisma.roleAssignment.upsert({
    where: { userId_roleId: { userId: corredorUser.id, roleId: corredorRole.id } },
    update: {},
    create: { userId: corredorUser.id, roleId: corredorRole.id }
  });

  await prisma.roleAssignment.upsert({
    where: { userId_roleId: { userId: regularUser.id, roleId: userRole.id } },
    update: {},
    create: { userId: regularUser.id, roleId: userRole.id }
  });

  console.log('✅ Users created and roles assigned');

  // Crear prospectos de ejemplo para usuarios (demo)
  const prospects = [
    {
      title: 'Proyección: Venta departamento CABA',
      note: 'Cliente interesado, visita agendada',
      estimatedValue: 120000,
      estimatedCommission: 6000,
      clientsProspected: 3,
      probability: 30,
      status: 'TENTATIVE',
      userId: corredorUser.id
    },
    {
      title: 'Prospecto Concretado - PH vendido',
      note: 'Cerrado con comisión realizada',
      closedValue: 95000,
      estimatedCommission: 4750,
      clientsProspected: 1,
      probability: 100,
      status: 'WON',
      closeDate: new Date(),
      userId: corredorUser.id
    },
    {
      title: 'Proyección: Alquiler temporal',
      note: 'Interés por 6 meses',
      estimatedValue: 1200,
      estimatedCommission: 120,
      clientsProspected: 5,
      probability: 20,
      status: 'TENTATIVE',
      userId: regularUser.id
    }
  ];

  for (const p of prospects) {
    await prisma.prospect.create({ data: p });
  }

  console.log('✅ Example prospects created');

  // Crear categorías de conocimiento
  const categories = [
    {
      name: 'Mercado Inmobiliario',
      slug: 'mercado-inmobiliario',
      description: 'Análisis y tendencias del mercado inmobiliario argentino',
      color: '#3B82F6',
      icon: '📊'
    },
    {
      name: 'Legislación',
      slug: 'legislacion',
      description: 'Leyes y normativas del sector inmobiliario',
      color: '#10B981',
      icon: '⚖️'
    },
    {
      name: 'Financiamiento',
      slug: 'financiamiento',
      description: 'Créditos hipotecarios y opciones de financiamiento',
      color: '#F59E0B',
      icon: '💰'
    },
    {
      name: 'Marketing Inmobiliario',
      slug: 'marketing',
      description: 'Estrategias de marketing para propiedades',
      color: '#EF4444',
      icon: '📢'
    },
    {
      name: 'Gestión de Propiedades',
      slug: 'gestion-propiedades',
      description: 'Administración y alquiler de inmuebles',
      color: '#8B5CF6',
      icon: '🏠'
    }
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat
    });
  }

  console.log('✅ Categories created');

  // Crear artículos de ejemplo
  const articles = [
    {
      title: 'Tendencias del Mercado Inmobiliario 2024',
      slug: 'tendencias-mercado-2024',
      content: 'El mercado inmobiliario argentino muestra signos de recuperación...',
      excerpt: 'Análisis completo de las tendencias actuales en el sector inmobiliario.',
      status: 'PUBLISHED',
      views: 150,
      featured: true,
      tags: '["mercado", "tendencias", "2024"]',
      authorId: adminUser.id,
      categoryId: (await prisma.category.findFirst({ where: { slug: 'mercado-inmobiliario' } })).id
    },
    {
      title: 'Guía de Créditos Hipotecarios',
      slug: 'guia-creditos-hipotecarios',
      content: 'Los créditos hipotecarios son una herramienta fundamental...',
      excerpt: 'Todo lo que necesitas saber sobre financiamiento inmobiliario.',
      status: 'PUBLISHED',
      views: 89,
      featured: false,
      tags: '["creditos", "hipotecarios", "financiamiento"]',
      authorId: corredorUser.id,
      categoryId: (await prisma.category.findFirst({ where: { slug: 'financiamiento' } })).id
    },
    {
      title: 'Nueva Ley de Alquileres 2024',
      slug: 'ley-alquileres-2024',
      content: 'La nueva legislación modifica aspectos importantes...',
      excerpt: 'Cambios significativos en la ley de alquileres residenciales.',
      status: 'PUBLISHED',
      views: 203,
      featured: true,
      tags: '["ley", "alquileres", "legislacion"]',
      authorId: adminUser.id,
      categoryId: (await prisma.category.findFirst({ where: { slug: 'legislacion' } })).id
    }
  ];

  for (const article of articles) {
    await prisma.article.upsert({
      where: { slug: article.slug },
      update: {},
      create: article
    });
  }

  console.log('✅ Articles created');

  // Crear comentarios de ejemplo
  const comments = [
    {
      content: 'Excelente artículo, muy informativo.',
      isApproved: true,
      authorId: corredorUser.id,
      articleId: (await prisma.article.findFirst({ where: { slug: 'tendencias-mercado-2024' } })).id
    },
    {
      content: '¿Podrían actualizar con los últimos datos?',
      isApproved: true,
      authorId: regularUser.id,
      articleId: (await prisma.article.findFirst({ where: { slug: 'tendencias-mercado-2024' } })).id
    }
  ];

  for (const comment of comments) {
    await prisma.comment.create({ data: comment });
  }

  console.log('✅ Comments created');

  // Crear sesiones de chat de ejemplo
  const chatSessions = [
    {
      title: 'Consulta sobre créditos hipotecarios',
      isActive: true,
      userId: corredorUser.id
    },
    {
      title: 'Dudas sobre ley de alquileres',
      isActive: false,
      userId: regularUser.id
    }
  ];

  for (const session of chatSessions) {
    const createdSession = await prisma.chatSession.create({ data: session });

    // Agregar mensajes de ejemplo
    await prisma.chatMessage.create({
      data: {
        content: 'Hola, tengo una consulta sobre créditos hipotecarios.',
        role: 'user',
        sessionId: createdSession.id
      }
    });

    await prisma.chatMessage.create({
      data: {
        content: '¡Hola! Claro, ¿en qué puedo ayudarte con los créditos hipotecarios?',
        role: 'assistant',
        sessionId: createdSession.id
      }
    });
  }

  console.log('✅ Chat sessions and messages created');

  // Crear configuraciones de calculadora
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
    await prisma.calculatorConfig.upsert({
      where: { type: config.type },
      update: {},
      create: config
    });
  }

  console.log('✅ Calculator configs created');

  // Crear historial de calculadoras
  const calculatorHistories = [
    {
      type: 'COMMISSION',
      inputs: JSON.stringify({ propertyValue: 100000, location: 'caba' }),
      result: JSON.stringify({ commission: 5000, netAmount: 95000 }),
      userId: corredorUser.id
    },
    {
      type: 'TAXES',
      inputs: JSON.stringify({ propertyValue: 150000 }),
      result: JSON.stringify({ iti: 2250, sellos: 1800, registro: 450, total: 4500 }),
      userId: regularUser.id
    }
  ];

  for (const history of calculatorHistories) {
    await prisma.calculatorHistory.create({ data: history });
  }

  console.log('✅ Calculator histories created');

  // Crear configuraciones del sistema
  const systemConfigs = [
    {
      key: 'site_name',
      value: 'Rialtor - Plataforma de Conocimiento RE/MAX',
      type: 'STRING',
      description: 'Nombre del sitio web'
    },
    {
      key: 'max_upload_size',
      value: '10485760',
      type: 'NUMBER',
      description: 'Tamaño máximo de archivo en bytes (10MB)'
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
    },
    {
      key: 'default_language',
      value: 'es',
      type: 'STRING',
      description: 'Idioma por defecto'
    },
    {
      key: 'maintenance_mode',
      value: 'false',
      type: 'BOOLEAN',
      description: 'Modo mantenimiento'
    }
  ];

  for (const config of systemConfigs) {
    await prisma.systemConfig.upsert({
      where: { key: config.key },
      update: {},
      create: config
    });
  }

  console.log('✅ System configs created');

  // Crear tasas bancarias
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
    await prisma.bankRate.upsert({
      where: { bankName: rate.bankName },
      update: {},
      create: rate
    });
  }

  console.log('✅ Bank rates created');

  // Crear noticias de ejemplo
  const news = [
    {
      title: 'Mercado inmobiliario muestra recuperación en CABA',
      synopsis: 'Según datos del último trimestre, el mercado inmobiliario porteño registra un aumento del 15% en operaciones.',
      source: 'RE/MAX Argentina',
      externalUrl: 'https://remax.com.ar/noticias/mercado-caba',
      isActive: true
    },
    {
      title: 'Nueva normativa de alquileres entra en vigencia',
      synopsis: 'La ley 27.551 introduce cambios significativos en contratos de locación residencial.',
      source: 'Ministerio de Justicia',
      externalUrl: 'https://www.mjusticia.gob.ar/ley-alquileres',
      isActive: true
    },
    {
      title: 'Baja en tasas de interés hipotecarios',
      synopsis: 'Los principales bancos anuncian reducción en tasas de crédito hipotecario para el último trimestre.',
      source: 'Banco Central',
      externalUrl: 'https://www.bcra.gob.ar/tasas-interes',
      isActive: true
    }
  ];

  for (const item of news) {
    await prisma.news.create({ data: item });
  }

  console.log('✅ News created');

  // Crear índices económicos de ejemplo
  const economicIndices = [
    // CAC General - datos históricos desde 2015
    { indicator: 'cacGeneral', value: 102.1, date: new Date('2015-01-01'), description: 'CAC General - enero 2015' },
    { indicator: 'cacGeneral', value: 104.1, date: new Date('2015-02-01'), description: 'CAC General - febrero 2015' },
    { indicator: 'cacGeneral', value: 105.1, date: new Date('2015-03-01'), description: 'CAC General - marzo 2015' },
    { indicator: 'cacGeneral', value: 105.1, date: new Date('2015-04-01'), description: 'CAC General - abril 2015' },
    { indicator: 'cacGeneral', value: 112.8, date: new Date('2015-05-01'), description: 'CAC General - mayo 2015' },
    { indicator: 'cacGeneral', value: 120.2, date: new Date('2015-06-01'), description: 'CAC General - junio 2015' },
    { indicator: 'cacGeneral', value: 114.6, date: new Date('2015-07-01'), description: 'CAC General - julio 2015' },
    { indicator: 'cacGeneral', value: 120.1, date: new Date('2015-08-01'), description: 'CAC General - agosto 2015' },
    { indicator: 'cacGeneral', value: 121.1, date: new Date('2015-09-01'), description: 'CAC General - septiembre 2015' },
    { indicator: 'cacGeneral', value: 122.3, date: new Date('2015-10-01'), description: 'CAC General - octubre 2015' },
    { indicator: 'cacGeneral', value: 124.8, date: new Date('2015-11-01'), description: 'CAC General - noviembre 2015' },
    { indicator: 'cacGeneral', value: 131.2, date: new Date('2015-12-01'), description: 'CAC General - diciembre 2015' },
    { indicator: 'cacGeneral', value: 135.1, date: new Date('2016-01-01'), description: 'CAC General - enero 2016' },
    { indicator: 'cacGeneral', value: 138.8, date: new Date('2016-02-01'), description: 'CAC General - febrero 2016' },
    { indicator: 'cacGeneral', value: 140.2, date: new Date('2016-03-01'), description: 'CAC General - marzo 2016' },
    { indicator: 'cacGeneral', value: 151.6, date: new Date('2016-04-01'), description: 'CAC General - abril 2016' },
    { indicator: 'cacGeneral', value: 153.1, date: new Date('2016-05-01'), description: 'CAC General - mayo 2016' },
    { indicator: 'cacGeneral', value: 154.4, date: new Date('2016-06-01'), description: 'CAC General - junio 2016' },
    { indicator: 'cacGeneral', value: 156.4, date: new Date('2016-07-01'), description: 'CAC General - julio 2016' },
    { indicator: 'cacGeneral', value: 157.0, date: new Date('2016-08-01'), description: 'CAC General - agosto 2016' },
    { indicator: 'cacGeneral', value: 158.2, date: new Date('2016-09-01'), description: 'CAC General - septiembre 2016' },
    { indicator: 'cacGeneral', value: 165.8, date: new Date('2016-10-01'), description: 'CAC General - octubre 2016' },
    { indicator: 'cacGeneral', value: 167.4, date: new Date('2016-11-01'), description: 'CAC General - noviembre 2016' },
    { indicator: 'cacGeneral', value: 171.3, date: new Date('2016-12-01'), description: 'CAC General - diciembre 2016' },
    { indicator: 'cacGeneral', value: 178.3, date: new Date('2017-01-01'), description: 'CAC General - enero 2017' },
    { indicator: 'cacGeneral', value: 179.0, date: new Date('2017-02-01'), description: 'CAC General - febrero 2017' },
    { indicator: 'cacGeneral', value: 180.0, date: new Date('2017-03-01'), description: 'CAC General - marzo 2017' },
    { indicator: 'cacGeneral', value: 187.3, date: new Date('2017-04-01'), description: 'CAC General - abril 2017' },
    { indicator: 'cacGeneral', value: 189.4, date: new Date('2017-05-01'), description: 'CAC General - mayo 2017' },
    { indicator: 'cacGeneral', value: 191.2, date: new Date('2017-06-01'), description: 'CAC General - junio 2017' },
    { indicator: 'cacGeneral', value: 202.2, date: new Date('2017-07-01'), description: 'CAC General - julio 2017' },
    { indicator: 'cacGeneral', value: 204.5, date: new Date('2017-08-01'), description: 'CAC General - agosto 2017' },
    { indicator: 'cacGeneral', value: 206.2, date: new Date('2017-09-01'), description: 'CAC General - septiembre 2017' },
    { indicator: 'cacGeneral', value: 208.0, date: new Date('2017-10-01'), description: 'CAC General - octubre 2017' },
    { indicator: 'cacGeneral', value: 210.1, date: new Date('2017-11-01'), description: 'CAC General - noviembre 2017' },
    { indicator: 'cacGeneral', value: 212.7, date: new Date('2017-12-01'), description: 'CAC General - diciembre 2017' },
    { indicator: 'cacGeneral', value: 220.2, date: new Date('2018-01-01'), description: 'CAC General - enero 2018' },
    { indicator: 'cacGeneral', value: 224.3, date: new Date('2018-02-01'), description: 'CAC General - febrero 2018' },
    { indicator: 'cacGeneral', value: 229.8, date: new Date('2018-03-01'), description: 'CAC General - marzo 2018' },
    { indicator: 'cacGeneral', value: 239.6, date: new Date('2018-04-01'), description: 'CAC General - abril 2018' },
    { indicator: 'cacGeneral', value: 248.5, date: new Date('2018-05-01'), description: 'CAC General - mayo 2018' },
    { indicator: 'cacGeneral', value: 259.4, date: new Date('2018-06-01'), description: 'CAC General - junio 2018' },
    { indicator: 'cacGeneral', value: 264.4, date: new Date('2018-07-01'), description: 'CAC General - julio 2018' },
    { indicator: 'cacGeneral', value: 283.6, date: new Date('2018-08-01'), description: 'CAC General - agosto 2018' },
    { indicator: 'cacGeneral', value: 305.1, date: new Date('2018-09-01'), description: 'CAC General - septiembre 2018' },
    { indicator: 'cacGeneral', value: 311.5, date: new Date('2018-10-01'), description: 'CAC General - octubre 2018' },
    { indicator: 'cacGeneral', value: 323.7, date: new Date('2018-11-01'), description: 'CAC General - noviembre 2018' },
    { indicator: 'cacGeneral', value: 331.5, date: new Date('2018-12-01'), description: 'CAC General - diciembre 2018' },
    { indicator: 'cacGeneral', value: 339.3, date: new Date('2019-01-01'), description: 'CAC General - enero 2019' },
    { indicator: 'cacGeneral', value: 346.1, date: new Date('2019-02-01'), description: 'CAC General - febrero 2019' },
    { indicator: 'cacGeneral', value: 361.0, date: new Date('2019-03-01'), description: 'CAC General - marzo 2019' },
    { indicator: 'cacGeneral', value: 381.5, date: new Date('2019-04-01'), description: 'CAC General - abril 2019' },
    { indicator: 'cacGeneral', value: 395.6, date: new Date('2019-05-01'), description: 'CAC General - mayo 2019' },
    { indicator: 'cacGeneral', value: 400.9, date: new Date('2019-06-01'), description: 'CAC General - junio 2019' },
    { indicator: 'cacGeneral', value: 410.7, date: new Date('2019-07-01'), description: 'CAC General - julio 2019' },
    { indicator: 'cacGeneral', value: 453.4, date: new Date('2019-08-01'), description: 'CAC General - agosto 2019' },
    { indicator: 'cacGeneral', value: 459.0, date: new Date('2019-09-01'), description: 'CAC General - septiembre 2019' },
    { indicator: 'cacGeneral', value: 486.4, date: new Date('2019-10-01'), description: 'CAC General - octubre 2019' },
    { indicator: 'cacGeneral', value: 507.4, date: new Date('2019-11-01'), description: 'CAC General - noviembre 2019' },
    { indicator: 'cacGeneral', value: 513.1, date: new Date('2019-12-01'), description: 'CAC General - diciembre 2019' },
    { indicator: 'cacGeneral', value: 539.6, date: new Date('2020-01-01'), description: 'CAC General - enero 2020' },
    { indicator: 'cacGeneral', value: 560.2, date: new Date('2020-02-01'), description: 'CAC General - febrero 2020' },
    { indicator: 'cacGeneral', value: 565.3, date: new Date('2020-03-01'), description: 'CAC General - marzo 2020' },
    { indicator: 'cacGeneral', value: 573.0, date: new Date('2020-04-01'), description: 'CAC General - abril 2020' },
    { indicator: 'cacGeneral', value: 588.1, date: new Date('2020-05-01'), description: 'CAC General - mayo 2020' },
    { indicator: 'cacGeneral', value: 598.6, date: new Date('2020-06-01'), description: 'CAC General - junio 2020' },
    { indicator: 'cacGeneral', value: 615.2, date: new Date('2020-07-01'), description: 'CAC General - julio 2020' },
    { indicator: 'cacGeneral', value: 631.5, date: new Date('2020-08-01'), description: 'CAC General - agosto 2020' },
    { indicator: 'cacGeneral', value: 655.8, date: new Date('2020-09-01'), description: 'CAC General - septiembre 2020' },
    { indicator: 'cacGeneral', value: 695.1, date: new Date('2020-10-01'), description: 'CAC General - octubre 2020' },
    { indicator: 'cacGeneral', value: 763.4, date: new Date('2020-11-01'), description: 'CAC General - noviembre 2020' },
    { indicator: 'cacGeneral', value: 794.4, date: new Date('2020-12-01'), description: 'CAC General - diciembre 2020' },
    { indicator: 'cacGeneral', value: 824.9, date: new Date('2021-01-01'), description: 'CAC General - enero 2021' },
    { indicator: 'cacGeneral', value: 872.7, date: new Date('2021-02-01'), description: 'CAC General - febrero 2021' },
    { indicator: 'cacGeneral', value: 896.7, date: new Date('2021-03-01'), description: 'CAC General - marzo 2021' },
    { indicator: 'cacGeneral', value: 959.1, date: new Date('2021-04-01'), description: 'CAC General - abril 2021' },
    { indicator: 'cacGeneral', value: 988.4, date: new Date('2021-05-01'), description: 'CAC General - mayo 2021' },
    { indicator: 'cacGeneral', value: 1011.3, date: new Date('2021-06-01'), description: 'CAC General - junio 2021' },
    { indicator: 'cacGeneral', value: 1065.8, date: new Date('2021-07-01'), description: 'CAC General - julio 2021' },
    { indicator: 'cacGeneral', value: 1089.8, date: new Date('2021-08-01'), description: 'CAC General - agosto 2021' },
    { indicator: 'cacGeneral', value: 1131.2, date: new Date('2021-09-01'), description: 'CAC General - septiembre 2021' },
    { indicator: 'cacGeneral', value: 1180.2, date: new Date('2021-10-01'), description: 'CAC General - octubre 2021' },
    { indicator: 'cacGeneral', value: 1210.0, date: new Date('2021-11-01'), description: 'CAC General - noviembre 2021' },
    { indicator: 'cacGeneral', value: 1234.3, date: new Date('2021-12-01'), description: 'CAC General - diciembre 2021' },
    { indicator: 'cacGeneral', value: 1281.5, date: new Date('2022-01-01'), description: 'CAC General - enero 2022' },
    { indicator: 'cacGeneral', value: 1344.5, date: new Date('2022-02-01'), description: 'CAC General - febrero 2022' },
    { indicator: 'cacGeneral', value: 1416.2, date: new Date('2022-03-01'), description: 'CAC General - marzo 2022' },
    { indicator: 'cacGeneral', value: 1467.2, date: new Date('2022-04-01'), description: 'CAC General - abril 2022' },
    { indicator: 'cacGeneral', value: 1563.9, date: new Date('2022-05-01'), description: 'CAC General - mayo 2022' },
    { indicator: 'cacGeneral', value: 1670.2, date: new Date('2022-06-01'), description: 'CAC General - junio 2022' },
    { indicator: 'cacGeneral', value: 1784.0, date: new Date('2022-07-01'), description: 'CAC General - julio 2022' },
    { indicator: 'cacGeneral', value: 1905.9, date: new Date('2022-08-01'), description: 'CAC General - agosto 2022' },
    { indicator: 'cacGeneral', value: 2051.9, date: new Date('2022-09-01'), description: 'CAC General - septiembre 2022' },
    { indicator: 'cacGeneral', value: 2211.9, date: new Date('2022-10-01'), description: 'CAC General - octubre 2022' },
    { indicator: 'cacGeneral', value: 2369.7, date: new Date('2022-11-01'), description: 'CAC General - noviembre 2022' },
    { indicator: 'cacGeneral', value: 2552.3, date: new Date('2022-12-01'), description: 'CAC General - diciembre 2022' },
    { indicator: 'cacGeneral', value: 2713.1, date: new Date('2023-01-01'), description: 'CAC General - enero 2023' },
    { indicator: 'cacGeneral', value: 2865.3, date: new Date('2023-02-01'), description: 'CAC General - febrero 2023' },
    { indicator: 'cacGeneral', value: 2998.7, date: new Date('2023-03-01'), description: 'CAC General - marzo 2023' },
    { indicator: 'cacGeneral', value: 3228.5, date: new Date('2023-04-01'), description: 'CAC General - abril 2023' },
    { indicator: 'cacGeneral', value: 3448.3, date: new Date('2023-05-01'), description: 'CAC General - mayo 2023' },
    { indicator: 'cacGeneral', value: 3662.2, date: new Date('2023-06-01'), description: 'CAC General - junio 2023' },
    { indicator: 'cacGeneral', value: 4001.9, date: new Date('2023-07-01'), description: 'CAC General - julio 2023' },
    { indicator: 'cacGeneral', value: 4789.7, date: new Date('2023-08-01'), description: 'CAC General - agosto 2023' },
    { indicator: 'cacGeneral', value: 5215.9, date: new Date('2023-09-01'), description: 'CAC General - septiembre 2023' },
    { indicator: 'cacGeneral', value: 5790.0, date: new Date('2023-10-01'), description: 'CAC General - octubre 2023' },
    { indicator: 'cacGeneral', value: 6785.2, date: new Date('2023-11-01'), description: 'CAC General - noviembre 2023' },
    { indicator: 'cacGeneral', value: 9049.8, date: new Date('2023-12-01'), description: 'CAC General - diciembre 2023' },
    { indicator: 'cacGeneral', value: 10331.0, date: new Date('2024-01-01'), description: 'CAC General - enero 2024' },
    { indicator: 'cacGeneral', value: 11228.3, date: new Date('2024-02-01'), description: 'CAC General - febrero 2024' },
    { indicator: 'cacGeneral', value: 11669.0, date: new Date('2024-03-01'), description: 'CAC General - marzo 2024' },
    { indicator: 'cacGeneral', value: 12216.2, date: new Date('2024-04-01'), description: 'CAC General - abril 2024' },
    { indicator: 'cacGeneral', value: 12747.4, date: new Date('2024-05-01'), description: 'CAC General - mayo 2024' },
    { indicator: 'cacGeneral', value: 13295.8, date: new Date('2024-06-01'), description: 'CAC General - junio 2024' },
    { indicator: 'cacGeneral', value: 13574.8, date: new Date('2024-07-01'), description: 'CAC General - julio 2024' },
    { indicator: 'cacGeneral', value: 14017.6, date: new Date('2024-08-01'), description: 'CAC General - agosto 2024' },
    { indicator: 'cacGeneral', value: 14366.9, date: new Date('2024-09-01'), description: 'CAC General - septiembre 2024' },
    { indicator: 'cacGeneral', value: 14614.9, date: new Date('2024-10-01'), description: 'CAC General - octubre 2024' },
    { indicator: 'cacGeneral', value: 15043.0, date: new Date('2024-11-01'), description: 'CAC General - noviembre 2024' },
    { indicator: 'cacGeneral', value: 15356.4, date: new Date('2024-12-01'), description: 'CAC General - diciembre 2024' },
    { indicator: 'cacGeneral', value: 15592.5, date: new Date('2025-01-01'), description: 'CAC General - enero 2025' },
    { indicator: 'cacGeneral', value: 15852.4, date: new Date('2025-02-01'), description: 'CAC General - febrero 2025' },
    { indicator: 'cacGeneral', value: 15995.4, date: new Date('2025-03-01'), description: 'CAC General - marzo 2025' },
    { indicator: 'cacGeneral', value: 16253.5, date: new Date('2025-04-01'), description: 'CAC General - abril 2025' },
    { indicator: 'cacGeneral', value: 16521.3, date: new Date('2025-05-01'), description: 'CAC General - mayo 2025' },
    { indicator: 'cacGeneral', value: 16643.4, date: new Date('2025-06-01'), description: 'CAC General - junio 2025' },
    { indicator: 'cacGeneral', value: 16939.5, date: new Date('2025-07-01'), description: 'CAC General - julio 2025' },
    { indicator: 'cacGeneral', value: 17187.6, date: new Date('2025-08-01'), description: 'CAC General - agosto 2025' },
    { indicator: 'cacGeneral', value: 17762.3, date: new Date('2025-09-01'), description: 'CAC General - septiembre 2025' },

    // CAC Materiales - datos históricos desde 2019
    { indicator: 'cacMateriales', value: 339.3, date: new Date('2019-01-01'), description: 'CAC Materiales - enero 2019' },
    { indicator: 'cacMateriales', value: 346.1, date: new Date('2019-02-01'), description: 'CAC Materiales - febrero 2019' },
    { indicator: 'cacMateriales', value: 361.0, date: new Date('2019-03-01'), description: 'CAC Materiales - marzo 2019' },
    { indicator: 'cacMateriales', value: 381.5, date: new Date('2019-04-01'), description: 'CAC Materiales - abril 2019' },
    { indicator: 'cacMateriales', value: 395.6, date: new Date('2019-05-01'), description: 'CAC Materiales - mayo 2019' },
    { indicator: 'cacMateriales', value: 400.9, date: new Date('2019-06-01'), description: 'CAC Materiales - junio 2019' },
    { indicator: 'cacMateriales', value: 410.7, date: new Date('2019-07-01'), description: 'CAC Materiales - julio 2019' },
    { indicator: 'cacMateriales', value: 453.4, date: new Date('2019-08-01'), description: 'CAC Materiales - agosto 2019' },
    { indicator: 'cacMateriales', value: 459.0, date: new Date('2019-09-01'), description: 'CAC Materiales - septiembre 2019' },
    { indicator: 'cacMateriales', value: 486.4, date: new Date('2019-10-01'), description: 'CAC Materiales - octubre 2019' },
    { indicator: 'cacMateriales', value: 507.4, date: new Date('2019-11-01'), description: 'CAC Materiales - noviembre 2019' },
    { indicator: 'cacMateriales', value: 513.1, date: new Date('2019-12-01'), description: 'CAC Materiales - diciembre 2019' },
    { indicator: 'cacMateriales', value: 539.6, date: new Date('2020-01-01'), description: 'CAC Materiales - enero 2020' },
    { indicator: 'cacMateriales', value: 560.2, date: new Date('2020-02-01'), description: 'CAC Materiales - febrero 2020' },
    { indicator: 'cacMateriales', value: 565.3, date: new Date('2020-03-01'), description: 'CAC Materiales - marzo 2020' },
    { indicator: 'cacMateriales', value: 573.0, date: new Date('2020-04-01'), description: 'CAC Materiales - abril 2020' },
    { indicator: 'cacMateriales', value: 588.1, date: new Date('2020-05-01'), description: 'CAC Materiales - mayo 2020' },
    { indicator: 'cacMateriales', value: 598.6, date: new Date('2020-06-01'), description: 'CAC Materiales - junio 2020' },
    { indicator: 'cacMateriales', value: 615.2, date: new Date('2020-07-01'), description: 'CAC Materiales - julio 2020' },
    { indicator: 'cacMateriales', value: 631.5, date: new Date('2020-08-01'), description: 'CAC Materiales - agosto 2020' },
    { indicator: 'cacMateriales', value: 655.8, date: new Date('2020-09-01'), description: 'CAC Materiales - septiembre 2020' },
    { indicator: 'cacMateriales', value: 695.1, date: new Date('2020-10-01'), description: 'CAC Materiales - octubre 2020' },
    { indicator: 'cacMateriales', value: 763.4, date: new Date('2020-11-01'), description: 'CAC Materiales - noviembre 2020' },
    { indicator: 'cacMateriales', value: 794.4, date: new Date('2020-12-01'), description: 'CAC Materiales - diciembre 2020' },
    { indicator: 'cacMateriales', value: 824.9, date: new Date('2021-01-01'), description: 'CAC Materiales - enero 2021' },
    { indicator: 'cacMateriales', value: 872.7, date: new Date('2021-02-01'), description: 'CAC Materiales - febrero 2021' },
    { indicator: 'cacMateriales', value: 896.7, date: new Date('2021-03-01'), description: 'CAC Materiales - marzo 2021' },
    { indicator: 'cacMateriales', value: 959.1, date: new Date('2021-04-01'), description: 'CAC Materiales - abril 2021' },
    { indicator: 'cacMateriales', value: 988.4, date: new Date('2021-05-01'), description: 'CAC Materiales - mayo 2021' },
    { indicator: 'cacMateriales', value: 1122.3, date: new Date('2021-06-01'), description: 'CAC Materiales - junio 2021' },
    { indicator: 'cacMateriales', value: 1065.8, date: new Date('2021-07-01'), description: 'CAC Materiales - julio 2021' },
    { indicator: 'cacMateriales', value: 1089.8, date: new Date('2021-08-01'), description: 'CAC Materiales - agosto 2021' },
    { indicator: 'cacMateriales', value: 1131.2, date: new Date('2021-09-01'), description: 'CAC Materiales - septiembre 2021' },
    { indicator: 'cacMateriales', value: 1180.2, date: new Date('2021-10-01'), description: 'CAC Materiales - octubre 2021' },
    { indicator: 'cacMateriales', value: 1210.0, date: new Date('2021-11-01'), description: 'CAC Materiales - noviembre 2021' },
    { indicator: 'cacMateriales', value: 1234.3, date: new Date('2021-12-01'), description: 'CAC Materiales - diciembre 2021' },
    { indicator: 'cacMateriales', value: 1487.1, date: new Date('2022-01-01'), description: 'CAC Materiales - enero 2022' },
    { indicator: 'cacMateriales', value: 1344.5, date: new Date('2022-02-01'), description: 'CAC Materiales - febrero 2022' },
    { indicator: 'cacMateriales', value: 1416.2, date: new Date('2022-03-01'), description: 'CAC Materiales - marzo 2022' },
    { indicator: 'cacMateriales', value: 1709.9, date: new Date('2022-04-01'), description: 'CAC Materiales - abril 2022' },
    { indicator: 'cacMateriales', value: 1563.9, date: new Date('2022-05-01'), description: 'CAC Materiales - mayo 2022' },
    { indicator: 'cacMateriales', value: 1670.2, date: new Date('2022-06-01'), description: 'CAC Materiales - junio 2022' },
    { indicator: 'cacMateriales', value: 1784.0, date: new Date('2022-07-01'), description: 'CAC Materiales - julio 2022' },
    { indicator: 'cacMateriales', value: 1905.9, date: new Date('2022-08-01'), description: 'CAC Materiales - agosto 2022' },
    { indicator: 'cacMateriales', value: 2051.9, date: new Date('2022-09-01'), description: 'CAC Materiales - septiembre 2022' },
    { indicator: 'cacMateriales', value: 2211.9, date: new Date('2022-10-01'), description: 'CAC Materiales - octubre 2022' },
    { indicator: 'cacMateriales', value: 2369.7, date: new Date('2022-11-01'), description: 'CAC Materiales - noviembre 2022' },
    { indicator: 'cacMateriales', value: 2552.3, date: new Date('2022-12-01'), description: 'CAC Materiales - diciembre 2022' },
    { indicator: 'cacMateriales', value: 2713.1, date: new Date('2023-01-01'), description: 'CAC Materiales - enero 2023' },
    { indicator: 'cacMateriales', value: 2865.3, date: new Date('2023-02-01'), description: 'CAC Materiales - febrero 2023' },
    { indicator: 'cacMateriales', value: 2998.7, date: new Date('2023-03-01'), description: 'CAC Materiales - marzo 2023' },
    { indicator: 'cacMateriales', value: 3740.9, date: new Date('2023-04-01'), description: 'CAC Materiales - abril 2023' },
    { indicator: 'cacMateriales', value: 3985.6, date: new Date('2023-05-01'), description: 'CAC Materiales - mayo 2023' },
    { indicator: 'cacMateriales', value: 4282.6, date: new Date('2023-06-01'), description: 'CAC Materiales - junio 2023' },
    { indicator: 'cacMateriales', value: 4678.3, date: new Date('2023-07-01'), description: 'CAC Materiales - julio 2023' },
    { indicator: 'cacMateriales', value: 5707.8, date: new Date('2023-08-01'), description: 'CAC Materiales - agosto 2023' },
    { indicator: 'cacMateriales', value: 6219.5, date: new Date('2023-09-01'), description: 'CAC Materiales - septiembre 2023' },
    { indicator: 'cacMateriales', value: 6979.6, date: new Date('2023-10-01'), description: 'CAC Materiales - octubre 2023' },
    { indicator: 'cacMateriales', value: 8345.6, date: new Date('2023-11-01'), description: 'CAC Materiales - noviembre 2023' },
    { indicator: 'cacMateriales', value: 11806.7, date: new Date('2023-12-01'), description: 'CAC Materiales - diciembre 2023' },
    { indicator: 'cacMateriales', value: 13277.8, date: new Date('2024-01-01'), description: 'CAC Materiales - enero 2024' },
    { indicator: 'cacMateriales', value: 14214.4, date: new Date('2024-02-01'), description: 'CAC Materiales - febrero 2024' },
    { indicator: 'cacMateriales', value: 14955.8, date: new Date('2024-03-01'), description: 'CAC Materiales - marzo 2024' },
    { indicator: 'cacMateriales', value: 15226.8, date: new Date('2024-04-01'), description: 'CAC Materiales - abril 2024' },
    { indicator: 'cacMateriales', value: 15537.5, date: new Date('2024-05-01'), description: 'CAC Materiales - mayo 2024' },
    { indicator: 'cacMateriales', value: 15811.7, date: new Date('2024-06-01'), description: 'CAC Materiales - junio 2024' },
    { indicator: 'cacMateriales', value: 16281.0, date: new Date('2024-07-01'), description: 'CAC Materiales - julio 2024' },
    { indicator: 'cacMateriales', value: 16700.7, date: new Date('2024-08-01'), description: 'CAC Materiales - agosto 2024' },
    { indicator: 'cacMateriales', value: 17016.6, date: new Date('2024-09-01'), description: 'CAC Materiales - septiembre 2024' },
    { indicator: 'cacMateriales', value: 17149.9, date: new Date('2024-10-01'), description: 'CAC Materiales - octubre 2024' },
    { indicator: 'cacMateriales', value: 17375.7, date: new Date('2024-11-01'), description: 'CAC Materiales - noviembre 2024' },
    { indicator: 'cacMateriales', value: 17585.1, date: new Date('2024-12-01'), description: 'CAC Materiales - diciembre 2024' },
    { indicator: 'cacMateriales', value: 17825.2, date: new Date('2025-01-01'), description: 'CAC Materiales - enero 2025' },
    { indicator: 'cacMateriales', value: 17967.5, date: new Date('2025-02-01'), description: 'CAC Materiales - febrero 2025' },
    { indicator: 'cacMateriales', value: 18122.5, date: new Date('2025-03-01'), description: 'CAC Materiales - marzo 2025' },
    { indicator: 'cacMateriales', value: 18640.1, date: new Date('2025-04-01'), description: 'CAC Materiales - abril 2025' },
    { indicator: 'cacMateriales', value: 18695.2, date: new Date('2025-05-01'), description: 'CAC Materiales - mayo 2025' },
    { indicator: 'cacMateriales', value: 18826.5, date: new Date('2025-06-01'), description: 'CAC Materiales - junio 2025' },
    { indicator: 'cacMateriales', value: 19141.7, date: new Date('2025-07-01'), description: 'CAC Materiales - julio 2025' },
    { indicator: 'cacMateriales', value: 19490.0, date: new Date('2025-08-01'), description: 'CAC Materiales - agosto 2025' },
    { indicator: 'cacMateriales', value: 20187.5, date: new Date('2025-09-01'), description: 'CAC Materiales - septiembre 2025' },

    // CAC Mano de Obra - datos históricos desde 2019
    { indicator: 'cacManoObra', value: 353.6, date: new Date('2019-01-01'), description: 'CAC Mano de Obra - enero 2019' },
    { indicator: 'cacManoObra', value: 364.3, date: new Date('2019-02-01'), description: 'CAC Mano de Obra - febrero 2019' },
    { indicator: 'cacManoObra', value: 382.0, date: new Date('2019-03-01'), description: 'CAC Mano de Obra - marzo 2019' },
    { indicator: 'cacManoObra', value: 394.8, date: new Date('2019-04-01'), description: 'CAC Mano de Obra - abril 2019' },
    { indicator: 'cacManoObra', value: 404.8, date: new Date('2019-05-01'), description: 'CAC Mano de Obra - mayo 2019' },
    { indicator: 'cacManoObra', value: 413.5, date: new Date('2019-06-01'), description: 'CAC Mano de Obra - junio 2019' },
    { indicator: 'cacManoObra', value: 418.7, date: new Date('2019-07-01'), description: 'CAC Mano de Obra - julio 2019' },
    { indicator: 'cacManoObra', value: 480.9, date: new Date('2019-08-01'), description: 'CAC Mano de Obra - agosto 2019' },
    { indicator: 'cacManoObra', value: 490.5, date: new Date('2019-09-01'), description: 'CAC Mano de Obra - septiembre 2019' },
    { indicator: 'cacManoObra', value: 515.1, date: new Date('2019-10-01'), description: 'CAC Mano de Obra - octubre 2019' },
    { indicator: 'cacManoObra', value: 532.8, date: new Date('2019-11-01'), description: 'CAC Mano de Obra - noviembre 2019' },
    { indicator: 'cacManoObra', value: 542.4, date: new Date('2019-12-01'), description: 'CAC Mano de Obra - diciembre 2019' },
    { indicator: 'cacManoObra', value: 552.4, date: new Date('2020-01-01'), description: 'CAC Mano de Obra - enero 2020' },
    { indicator: 'cacManoObra', value: 564.6, date: new Date('2020-02-01'), description: 'CAC Mano de Obra - febrero 2020' },
    { indicator: 'cacManoObra', value: 572.9, date: new Date('2020-03-01'), description: 'CAC Mano de Obra - marzo 2020' },
    { indicator: 'cacManoObra', value: 584.6, date: new Date('2020-04-01'), description: 'CAC Mano de Obra - abril 2020' },
    { indicator: 'cacManoObra', value: 606.9, date: new Date('2020-05-01'), description: 'CAC Mano de Obra - mayo 2020' },
    { indicator: 'cacManoObra', value: 624.0, date: new Date('2020-06-01'), description: 'CAC Mano de Obra - junio 2020' },
    { indicator: 'cacManoObra', value: 651.8, date: new Date('2020-07-01'), description: 'CAC Mano de Obra - julio 2020' },
    { indicator: 'cacManoObra', value: 679.3, date: new Date('2020-08-01'), description: 'CAC Mano de Obra - agosto 2020' },
    { indicator: 'cacManoObra', value: 717.6, date: new Date('2020-09-01'), description: 'CAC Mano de Obra - septiembre 2020' },
    { indicator: 'cacManoObra', value: 780.7, date: new Date('2020-10-01'), description: 'CAC Mano de Obra - octubre 2020' },
    { indicator: 'cacManoObra', value: 833.0, date: new Date('2020-11-01'), description: 'CAC Mano de Obra - noviembre 2020' },
    { indicator: 'cacManoObra', value: 884.8, date: new Date('2020-12-01'), description: 'CAC Mano de Obra - diciembre 2020' },
    { indicator: 'cacManoObra', value: 936.1, date: new Date('2021-01-01'), description: 'CAC Mano de Obra - enero 2021' },
    { indicator: 'cacManoObra', value: 987.4, date: new Date('2021-02-01'), description: 'CAC Mano de Obra - febrero 2021' },
    { indicator: 'cacManoObra', value: 1027.5, date: new Date('2021-03-01'), description: 'CAC Mano de Obra - marzo 2021' },
    { indicator: 'cacManoObra', value: 1074.2, date: new Date('2021-04-01'), description: 'CAC Mano de Obra - abril 2021' },
    { indicator: 'cacManoObra', value: 1122.3, date: new Date('2021-05-01'), description: 'CAC Mano de Obra - mayo 2021' },
    { indicator: 'cacManoObra', value: 792.2, date: new Date('2021-06-01'), description: 'CAC Mano de Obra - junio 2021' },
    { indicator: 'cacManoObra', value: 1205.0, date: new Date('2021-07-01'), description: 'CAC Mano de Obra - julio 2021' },
    { indicator: 'cacManoObra', value: 1245.7, date: new Date('2021-08-01'), description: 'CAC Mano de Obra - agosto 2021' },
    { indicator: 'cacManoObra', value: 1291.8, date: new Date('2021-09-01'), description: 'CAC Mano de Obra - septiembre 2021' },
    { indicator: 'cacManoObra', value: 1341.5, date: new Date('2021-10-01'), description: 'CAC Mano de Obra - octubre 2021' },
    { indicator: 'cacManoObra', value: 1391.6, date: new Date('2021-11-01'), description: 'CAC Mano de Obra - noviembre 2021' },
    { indicator: 'cacManoObra', value: 1431.9, date: new Date('2021-12-01'), description: 'CAC Mano de Obra - diciembre 2021' },
    { indicator: 'cacManoObra', value: 980.2, date: new Date('2022-01-01'), description: 'CAC Mano de Obra - enero 2022' },
    { indicator: 'cacManoObra', value: 1545.8, date: new Date('2022-02-01'), description: 'CAC Mano de Obra - febrero 2022' },
    { indicator: 'cacManoObra', value: 1624.6, date: new Date('2022-03-01'), description: 'CAC Mano de Obra - marzo 2022' },
    { indicator: 'cacManoObra', value: 1111.5, date: new Date('2022-04-01'), description: 'CAC Mano de Obra - abril 2022' },
    { indicator: 'cacManoObra', value: 1215.2, date: new Date('2022-05-01'), description: 'CAC Mano de Obra - mayo 2022' },
    { indicator: 'cacManoObra', value: 1322.6, date: new Date('2022-06-01'), description: 'CAC Mano de Obra - junio 2022' },
    { indicator: 'cacManoObra', value: 1322.6, date: new Date('2022-07-01'), description: 'CAC Mano de Obra - julio 2022' },
    { indicator: 'cacManoObra', value: 1407.6, date: new Date('2022-08-01'), description: 'CAC Mano de Obra - agosto 2022' },
    { indicator: 'cacManoObra', value: 1541.9, date: new Date('2022-09-01'), description: 'CAC Mano de Obra - septiembre 2022' },
    { indicator: 'cacManoObra', value: 1682.6, date: new Date('2022-10-01'), description: 'CAC Mano de Obra - octubre 2022' },
    { indicator: 'cacManoObra', value: 1815.7, date: new Date('2022-11-01'), description: 'CAC Mano de Obra - noviembre 2022' },
    { indicator: 'cacManoObra', value: 1993.4, date: new Date('2022-12-01'), description: 'CAC Mano de Obra - diciembre 2022' },
    { indicator: 'cacManoObra', value: 2125.6, date: new Date('2023-01-01'), description: 'CAC Mano de Obra - enero 2023' },
    { indicator: 'cacManoObra', value: 2262.7, date: new Date('2023-02-01'), description: 'CAC Mano de Obra - febrero 2023' },
    { indicator: 'cacManoObra', value: 2290.2, date: new Date('2023-03-01'), description: 'CAC Mano de Obra - marzo 2023' },
    { indicator: 'cacManoObra', value: 2477.5, date: new Date('2023-04-01'), description: 'CAC Mano de Obra - abril 2023' },
    { indicator: 'cacManoObra', value: 2660.9, date: new Date('2023-05-01'), description: 'CAC Mano de Obra - mayo 2023' },
    { indicator: 'cacManoObra', value: 2752.8, date: new Date('2023-06-01'), description: 'CAC Mano de Obra - junio 2023' },
    { indicator: 'cacManoObra', value: 3010.5, date: new Date('2023-07-01'), description: 'CAC Mano de Obra - julio 2023' },
    { indicator: 'cacManoObra', value: 3444.1, date: new Date('2023-08-01'), description: 'CAC Mano de Obra - agosto 2023' },
    { indicator: 'cacManoObra', value: 3744.9, date: new Date('2023-09-01'), description: 'CAC Mano de Obra - septiembre 2023' },
    { indicator: 'cacManoObra', value: 4046.5, date: new Date('2023-10-01'), description: 'CAC Mano de Obra - octubre 2023' },
    { indicator: 'cacManoObra', value: 4498.0, date: new Date('2023-11-01'), description: 'CAC Mano de Obra - noviembre 2023' },
    { indicator: 'cacManoObra', value: 5009.0, date: new Date('2023-12-01'), description: 'CAC Mano de Obra - diciembre 2023' },
    { indicator: 'cacManoObra', value: 6011.7, date: new Date('2024-01-01'), description: 'CAC Mano de Obra - enero 2024' },
    { indicator: 'cacManoObra', value: 6851.6, date: new Date('2024-02-01'), description: 'CAC Mano de Obra - febrero 2024' },
    { indicator: 'cacManoObra', value: 6851.6, date: new Date('2024-03-01'), description: 'CAC Mano de Obra - marzo 2024' },
    { indicator: 'cacManoObra', value: 7803.5, date: new Date('2024-04-01'), description: 'CAC Mano de Obra - abril 2024' },
    { indicator: 'cacManoObra', value: 8657.9, date: new Date('2024-05-01'), description: 'CAC Mano de Obra - mayo 2024' },
    { indicator: 'cacManoObra', value: 9608.3, date: new Date('2024-06-01'), description: 'CAC Mano de Obra - junio 2024' },
    { indicator: 'cacManoObra', value: 9608.3, date: new Date('2024-07-01'), description: 'CAC Mano de Obra - julio 2024' },
    { indicator: 'cacManoObra', value: 10084.9, date: new Date('2024-08-01'), description: 'CAC Mano de Obra - agosto 2024' },
    { indicator: 'cacManoObra', value: 10483.3, date: new Date('2024-09-01'), description: 'CAC Mano de Obra - septiembre 2024' },
    { indicator: 'cacManoObra', value: 10483.3, date: new Date('2024-10-01'), description: 'CAC Mano de Obra - octubre 2024' },
    { indicator: 'cacManoObra', value: 11624.1, date: new Date('2024-11-01'), description: 'CAC Mano de Obra - noviembre 2024' },
    { indicator: 'cacManoObra', value: 12089.7, date: new Date('2024-12-01'), description: 'CAC Mano de Obra - diciembre 2024' },
    { indicator: 'cacManoObra', value: 12319.9, date: new Date('2025-01-01'), description: 'CAC Mano de Obra - enero 2025' },
    { indicator: 'cacManoObra', value: 12752.3, date: new Date('2025-02-01'), description: 'CAC Mano de Obra - febrero 2025' },
    { indicator: 'cacManoObra', value: 12887.8, date: new Date('2025-03-01'), description: 'CAC Mano de Obra - marzo 2025' },
    { indicator: 'cacManoObra', value: 12755.3, date: new Date('2025-04-01'), description: 'CAC Mano de Obra - abril 2025' },
    { indicator: 'cacManoObra', value: 13334.9, date: new Date('2025-05-01'), description: 'CAC Mano de Obra - mayo 2025' },
    { indicator: 'cacManoObra', value: 13443.5, date: new Date('2025-06-01'), description: 'CAC Mano de Obra - junio 2025' },
    { indicator: 'cacManoObra', value: 13711.8, date: new Date('2025-07-01'), description: 'CAC Mano de Obra - julio 2025' },
    { indicator: 'cacManoObra', value: 13812.6, date: new Date('2025-08-01'), description: 'CAC Mano de Obra - agosto 2025' },
    { indicator: 'cacManoObra', value: 14207.5, date: new Date('2025-09-01'), description: 'CAC Mano de Obra - septiembre 2025' },

    // IPC - datos históricos desde 2020
    { indicator: 'ipc', value: 289.83, date: new Date('2020-01-01'), description: 'IPC - enero 2020' },
    { indicator: 'ipc', value: 295.67, date: new Date('2020-02-01'), description: 'IPC - febrero 2020' },
    { indicator: 'ipc', value: 305.55, date: new Date('2020-03-01'), description: 'IPC - marzo 2020' },
    { indicator: 'ipc', value: 310.12, date: new Date('2020-04-01'), description: 'IPC - abril 2020' },
    { indicator: 'ipc', value: 314.91, date: new Date('2020-05-01'), description: 'IPC - mayo 2020' },
    { indicator: 'ipc', value: 321.97, date: new Date('2020-06-01'), description: 'IPC - junio 2020' },
    { indicator: 'ipc', value: 328.2, date: new Date('2020-07-01'), description: 'IPC - julio 2020' },
    { indicator: 'ipc', value: 337.06, date: new Date('2020-08-01'), description: 'IPC - agosto 2020' },
    { indicator: 'ipc', value: 346.62, date: new Date('2020-09-01'), description: 'IPC - septiembre 2020' },
    { indicator: 'ipc', value: 359.66, date: new Date('2020-10-01'), description: 'IPC - octubre 2020' },
    { indicator: 'ipc', value: 371.02, date: new Date('2020-11-01'), description: 'IPC - noviembre 2020' },
    { indicator: 'ipc', value: 385.88, date: new Date('2020-12-01'), description: 'IPC - diciembre 2020' },
    { indicator: 'ipc', value: 401.51, date: new Date('2021-01-01'), description: 'IPC - enero 2021' },
    { indicator: 'ipc', value: 415.86, date: new Date('2021-02-01'), description: 'IPC - febrero 2021' },
    { indicator: 'ipc', value: 435.87, date: new Date('2021-03-01'), description: 'IPC - marzo 2021' },
    { indicator: 'ipc', value: 453.65, date: new Date('2021-04-01'), description: 'IPC - abril 2021' },
    { indicator: 'ipc', value: 468.73, date: new Date('2021-05-01'), description: 'IPC - mayo 2021' },
    { indicator: 'ipc', value: 483.6, date: new Date('2021-06-01'), description: 'IPC - junio 2021' },
    { indicator: 'ipc', value: 498.1, date: new Date('2021-07-01'), description: 'IPC - julio 2021' },
    { indicator: 'ipc', value: 510.39, date: new Date('2021-08-01'), description: 'IPC - agosto 2021' },
    { indicator: 'ipc', value: 528.5, date: new Date('2021-09-01'), description: 'IPC - septiembre 2021' },
    { indicator: 'ipc', value: 547.08, date: new Date('2021-10-01'), description: 'IPC - octubre 2021' },
    { indicator: 'ipc', value: 560.92, date: new Date('2021-11-01'), description: 'IPC - noviembre 2021' },
    { indicator: 'ipc', value: 582.46, date: new Date('2021-12-01'), description: 'IPC - diciembre 2021' },
    { indicator: 'ipc', value: 605.03, date: new Date('2022-01-01'), description: 'IPC - enero 2022' },
    { indicator: 'ipc', value: 633.43, date: new Date('2022-02-01'), description: 'IPC - febrero 2022' },
    { indicator: 'ipc', value: 676.06, date: new Date('2022-03-01'), description: 'IPC - marzo 2022' },
    { indicator: 'ipc', value: 716.94, date: new Date('2022-04-01'), description: 'IPC - abril 2022' },
    { indicator: 'ipc', value: 753.15, date: new Date('2022-05-01'), description: 'IPC - mayo 2022' },
    { indicator: 'ipc', value: 793.03, date: new Date('2022-06-01'), description: 'IPC - junio 2022' },
    { indicator: 'ipc', value: 851.76, date: new Date('2022-07-01'), description: 'IPC - julio 2022' },
    { indicator: 'ipc', value: 911.13, date: new Date('2022-08-01'), description: 'IPC - agosto 2022' },
    { indicator: 'ipc', value: 967.31, date: new Date('2022-09-01'), description: 'IPC - septiembre 2022' },
    { indicator: 'ipc', value: 1028.71, date: new Date('2022-10-01'), description: 'IPC - octubre 2022' },
    { indicator: 'ipc', value: 1079.28, date: new Date('2022-11-01'), description: 'IPC - noviembre 2022' },
    { indicator: 'ipc', value: 1134.59, date: new Date('2022-12-01'), description: 'IPC - diciembre 2022' },
    { indicator: 'ipc', value: 1202.98, date: new Date('2023-01-01'), description: 'IPC - enero 2023' },
    { indicator: 'ipc', value: 1282.71, date: new Date('2023-02-01'), description: 'IPC - febrero 2023' },
    { indicator: 'ipc', value: 1381.16, date: new Date('2023-03-01'), description: 'IPC - marzo 2023' },
    { indicator: 'ipc', value: 1497.21, date: new Date('2023-04-01'), description: 'IPC - abril 2023' },
    { indicator: 'ipc', value: 1613.59, date: new Date('2023-05-01'), description: 'IPC - mayo 2023' },
    { indicator: 'ipc', value: 1709.61, date: new Date('2023-06-01'), description: 'IPC - junio 2023' },
    { indicator: 'ipc', value: 1818.08, date: new Date('2023-07-01'), description: 'IPC - julio 2023' },
    { indicator: 'ipc', value: 2044.28, date: new Date('2023-08-01'), description: 'IPC - agosto 2023' },
    { indicator: 'ipc', value: 2304.92, date: new Date('2023-09-01'), description: 'IPC - septiembre 2023' },
    { indicator: 'ipc', value: 2496.27, date: new Date('2023-10-01'), description: 'IPC - octubre 2023' },
    { indicator: 'ipc', value: 2816.06, date: new Date('2023-11-01'), description: 'IPC - noviembre 2023' },
    { indicator: 'ipc', value: 3533.19, date: new Date('2023-12-01'), description: 'IPC - diciembre 2023' },
    { indicator: 'ipc', value: 4261.53, date: new Date('2024-01-01'), description: 'IPC - enero 2024' },
    { indicator: 'ipc', value: 4825.79, date: new Date('2024-02-01'), description: 'IPC - febrero 2024' },
    { indicator: 'ipc', value: 5357.09, date: new Date('2024-03-01'), description: 'IPC - marzo 2024' },
    { indicator: 'ipc', value: 5830.23, date: new Date('2024-04-01'), description: 'IPC - abril 2024' },
    { indicator: 'ipc', value: 6073.72, date: new Date('2024-05-01'), description: 'IPC - mayo 2024' },
    { indicator: 'ipc', value: 6351.71, date: new Date('2024-06-01'), description: 'IPC - junio 2024' },
    { indicator: 'ipc', value: 6607.75, date: new Date('2024-07-01'), description: 'IPC - julio 2024' },
    { indicator: 'ipc', value: 6883.44, date: new Date('2024-08-01'), description: 'IPC - agosto 2024' },
    { indicator: 'ipc', value: 7122.24, date: new Date('2024-09-01'), description: 'IPC - septiembre 2024' },
    { indicator: 'ipc', value: 7313.95, date: new Date('2024-10-01'), description: 'IPC - octubre 2024' },
    { indicator: 'ipc', value: 7491.43, date: new Date('2024-11-01'), description: 'IPC - noviembre 2024' },
    { indicator: 'ipc', value: 7694.0, date: new Date('2024-12-01'), description: 'IPC - diciembre 2024' },
    { indicator: 'ipc', value: 7864.1, date: new Date('2025-01-01'), description: 'IPC - enero 2025' },
    { indicator: 'ipc', value: 8053.0, date: new Date('2025-02-01'), description: 'IPC - febrero 2025' },
    { indicator: 'ipc', value: 8353.3, date: new Date('2025-03-01'), description: 'IPC - marzo 2025' },
    { indicator: 'ipc', value: 8585.61, date: new Date('2025-04-01'), description: 'IPC - abril 2025' },
    { indicator: 'ipc', value: 8714.49, date: new Date('2025-05-01'), description: 'IPC - mayo 2025' },
    { indicator: 'ipc', value: 8855.57, date: new Date('2025-06-01'), description: 'IPC - junio 2025' },
    { indicator: 'ipc', value: 9023.97, date: new Date('2025-07-01'), description: 'IPC - julio 2025' },
    { indicator: 'ipc', value: 9193.24, date: new Date('2025-08-01'), description: 'IPC - agosto 2025' },

    // IS - Índice de salarios desde 2017
    { indicator: 'is', value: 106.3, date: new Date('2017-01-01'), description: 'IS - enero 2017' },
    { indicator: 'is', value: 107.7, date: new Date('2017-02-01'), description: 'IS - febrero 2017' },
    { indicator: 'is', value: 109.3, date: new Date('2017-03-01'), description: 'IS - marzo 2017' },
    { indicator: 'is', value: 112.9, date: new Date('2017-04-01'), description: 'IS - abril 2017' },
    { indicator: 'is', value: 115.2, date: new Date('2017-05-01'), description: 'IS - mayo 2017' },
    { indicator: 'is', value: 117.2, date: new Date('2017-06-01'), description: 'IS - junio 2017' },
    { indicator: 'is', value: 122.8, date: new Date('2017-07-01'), description: 'IS - julio 2017' },
    { indicator: 'is', value: 124.6, date: new Date('2017-08-01'), description: 'IS - agosto 2017' },
    { indicator: 'is', value: 126.0, date: new Date('2017-09-01'), description: 'IS - septiembre 2017' },
    { indicator: 'is', value: 128.2, date: new Date('2017-10-01'), description: 'IS - octubre 2017' },
    { indicator: 'is', value: 130.0, date: new Date('2017-11-01'), description: 'IS - noviembre 2017' },
    { indicator: 'is', value: 131.0, date: new Date('2017-12-01'), description: 'IS - diciembre 2017' },
    { indicator: 'is', value: 133.3, date: new Date('2018-01-01'), description: 'IS - enero 2018' },
    { indicator: 'is', value: 134.3, date: new Date('2018-02-01'), description: 'IS - febrero 2018' },
    { indicator: 'is', value: 136.2, date: new Date('2018-03-01'), description: 'IS - marzo 2018' },
    { indicator: 'is', value: 141.0, date: new Date('2018-04-01'), description: 'IS - abril 2018' },
    { indicator: 'is', value: 144.5, date: new Date('2018-05-01'), description: 'IS - mayo 2018' },
    { indicator: 'is', value: 146.5, date: new Date('2018-06-01'), description: 'IS - junio 2018' },
    { indicator: 'is', value: 149.9, date: new Date('2018-07-01'), description: 'IS - julio 2018' },
    { indicator: 'is', value: 154.2, date: new Date('2018-08-01'), description: 'IS - agosto 2018' },
    { indicator: 'is', value: 157.8, date: new Date('2018-09-01'), description: 'IS - septiembre 2018' },
    { indicator: 'is', value: 163.9, date: new Date('2018-10-01'), description: 'IS - octubre 2018' },
    { indicator: 'is', value: 168.1, date: new Date('2018-11-01'), description: 'IS - noviembre 2018' },
    { indicator: 'is', value: 170.9, date: new Date('2018-12-01'), description: 'IS - diciembre 2018' },
    { indicator: 'is', value: 176.9, date: new Date('2019-01-01'), description: 'IS - enero 2019' },
    { indicator: 'is', value: 181.8, date: new Date('2019-02-01'), description: 'IS - febrero 2019' },
    { indicator: 'is', value: 188.3, date: new Date('2019-03-01'), description: 'IS - marzo 2019' },
    { indicator: 'is', value: 193.5, date: new Date('2019-04-01'), description: 'IS - abril 2019' },
    { indicator: 'is', value: 201.7, date: new Date('2019-05-01'), description: 'IS - mayo 2019' },
    { indicator: 'is', value: 207.0, date: new Date('2019-06-01'), description: 'IS - junio 2019' },
    { indicator: 'is', value: 215.9, date: new Date('2019-07-01'), description: 'IS - julio 2019' },
    { indicator: 'is', value: 221.9, date: new Date('2019-08-01'), description: 'IS - agosto 2019' },
    { indicator: 'is', value: 227.7, date: new Date('2019-09-01'), description: 'IS - septiembre 2019' },
    { indicator: 'is', value: 236.3, date: new Date('2019-10-01'), description: 'IS - octubre 2019' },
    { indicator: 'is', value: 242.9, date: new Date('2019-11-01'), description: 'IS - noviembre 2019' },
    { indicator: 'is', value: 246.5, date: new Date('2019-12-01'), description: 'IS - diciembre 2019' },
    { indicator: 'is', value: 267.6, date: new Date('2020-01-01'), description: 'IS - enero 2020' },
    { indicator: 'is', value: 280.0, date: new Date('2020-02-01'), description: 'IS - febrero 2020' },
    { indicator: 'is', value: 286.4, date: new Date('2020-03-01'), description: 'IS - marzo 2020' },
    { indicator: 'is', value: 285.7, date: new Date('2020-04-01'), description: 'IS - abril 2020' },
    { indicator: 'is', value: 285.1, date: new Date('2020-05-01'), description: 'IS - mayo 2020' },
    { indicator: 'is', value: 285.4, date: new Date('2020-06-01'), description: 'IS - junio 2020' },
    { indicator: 'is', value: 289.2, date: new Date('2020-07-01'), description: 'IS - julio 2020' },
    { indicator: 'is', value: 295.1, date: new Date('2020-08-01'), description: 'IS - agosto 2020' },
    { indicator: 'is', value: 301.5, date: new Date('2020-09-01'), description: 'IS - septiembre 2020' },
    { indicator: 'is', value: 317.7, date: new Date('2020-10-01'), description: 'IS - octubre 2020' },
    { indicator: 'is', value: 326.0, date: new Date('2020-11-01'), description: 'IS - noviembre 2020' },
    { indicator: 'is', value: 331.3, date: new Date('2020-12-01'), description: 'IS - diciembre 2020' },
    { indicator: 'is', value: 344.6, date: new Date('2021-01-01'), description: 'IS - enero 2021' },
    { indicator: 'is', value: 362.3, date: new Date('2021-02-01'), description: 'IS - febrero 2021' },
    { indicator: 'is', value: 376.7, date: new Date('2021-03-01'), description: 'IS - marzo 2021' },
    { indicator: 'is', value: 394.5, date: new Date('2021-04-01'), description: 'IS - abril 2021' },
    { indicator: 'is', value: 408.4, date: new Date('2021-05-01'), description: 'IS - mayo 2021' },
    { indicator: 'is', value: 415.6, date: new Date('2021-06-01'), description: 'IS - junio 2021' },
    { indicator: 'is', value: 437.0, date: new Date('2021-07-01'), description: 'IS - julio 2021' },
    { indicator: 'is', value: 451.6, date: new Date('2021-08-01'), description: 'IS - agosto 2021' },
    { indicator: 'is', value: 467.9, date: new Date('2021-09-01'), description: 'IS - septiembre 2021' },
    { indicator: 'is', value: 485.3, date: new Date('2021-10-01'), description: 'IS - octubre 2021' },
    { indicator: 'is', value: 507.0, date: new Date('2021-11-01'), description: 'IS - noviembre 2021' },
    { indicator: 'is', value: 514.3, date: new Date('2021-12-01'), description: 'IS - diciembre 2021' },
    { indicator: 'is', value: 538.2, date: new Date('2022-01-01'), description: 'IS - enero 2022' },
    { indicator: 'is', value: 559.0, date: new Date('2022-02-01'), description: 'IS - febrero 2022' },
    { indicator: 'is', value: 589.3, date: new Date('2022-03-01'), description: 'IS - marzo 2022' },
    { indicator: 'is', value: 622.3, date: new Date('2022-04-01'), description: 'IS - abril 2022' },
    { indicator: 'is', value: 665.7, date: new Date('2022-05-01'), description: 'IS - mayo 2022' },
    { indicator: 'is', value: 699.4, date: new Date('2022-06-01'), description: 'IS - junio 2022' },
    { indicator: 'is', value: 737.0, date: new Date('2022-07-01'), description: 'IS - julio 2022' },
    { indicator: 'is', value: 797.0, date: new Date('2022-08-01'), description: 'IS - agosto 2022' },
    { indicator: 'is', value: 843.4, date: new Date('2022-09-01'), description: 'IS - septiembre 2022' },
    { indicator: 'is', value: 888.1, date: new Date('2022-10-01'), description: 'IS - octubre 2022' },
    { indicator: 'is', value: 953.3, date: new Date('2022-11-01'), description: 'IS - noviembre 2022' },
    { indicator: 'is', value: 996.6, date: new Date('2022-12-01'), description: 'IS - diciembre 2022' },
    { indicator: 'is', value: 1042.4, date: new Date('2023-01-01'), description: 'IS - enero 2023' },
    { indicator: 'is', value: 1114.3, date: new Date('2023-02-01'), description: 'IS - febrero 2023' },
    { indicator: 'is', value: 1202.1, date: new Date('2023-03-01'), description: 'IS - marzo 2023' },
    { indicator: 'is', value: 1284.6, date: new Date('2023-04-01'), description: 'IS - abril 2023' },
    { indicator: 'is', value: 1389.2, date: new Date('2023-05-01'), description: 'IS - mayo 2023' },
    { indicator: 'is', value: 1468.5, date: new Date('2023-06-01'), description: 'IS - junio 2023' },
    { indicator: 'is', value: 1626.8, date: new Date('2023-07-01'), description: 'IS - julio 2023' },
    { indicator: 'is', value: 1762.5, date: new Date('2023-08-01'), description: 'IS - agosto 2023' },
    { indicator: 'is', value: 1995.6, date: new Date('2023-09-01'), description: 'IS - septiembre 2023' },
    { indicator: 'is', value: 2169.8, date: new Date('2023-10-01'), description: 'IS - octubre 2023' },
    { indicator: 'is', value: 2385.6, date: new Date('2023-11-01'), description: 'IS - noviembre 2023' },
    { indicator: 'is', value: 2648.9, date: new Date('2023-12-01'), description: 'IS - diciembre 2023' },
    { indicator: 'is', value: 3178.3, date: new Date('2024-01-01'), description: 'IS - enero 2024' },
    { indicator: 'is', value: 3625.4, date: new Date('2024-02-01'), description: 'IS - febrero 2024' },
    { indicator: 'is', value: 3987.5, date: new Date('2024-03-01'), description: 'IS - marzo 2024' },
    { indicator: 'is', value: 4464.6, date: new Date('2024-04-01'), description: 'IS - abril 2024' },
    { indicator: 'is', value: 4807.3, date: new Date('2024-05-01'), description: 'IS - mayo 2024' },
    { indicator: 'is', value: 5129.0, date: new Date('2024-06-01'), description: 'IS - junio 2024' },
    { indicator: 'is', value: 5450.8, date: new Date('2024-07-01'), description: 'IS - julio 2024' },
    { indicator: 'is', value: 5725.38, date: new Date('2024-08-01'), description: 'IS - agosto 2024' },
    { indicator: 'is', value: 5941.03, date: new Date('2024-09-01'), description: 'IS - septiembre 2024' },
    { indicator: 'is', value: 6175.8, date: new Date('2024-10-01'), description: 'IS - octubre 2024' },
    { indicator: 'is', value: 6378.3, date: new Date('2024-11-01'), description: 'IS - noviembre 2024' },
    { indicator: 'is', value: 6556.5, date: new Date('2024-12-01'), description: 'IS - diciembre 2024' },
    { indicator: 'is', value: 6707.3, date: new Date('2025-01-01'), description: 'IS - enero 2025' },
    { indicator: 'is', value: 6862.1, date: new Date('2025-02-01'), description: 'IS - febrero 2025' },
    { indicator: 'is', value: 7010.5, date: new Date('2025-03-01'), description: 'IS - marzo 2025' },
    { indicator: 'is', value: 7188.0, date: new Date('2025-04-01'), description: 'IS - abril 2025' },
    { indicator: 'is', value: 7330.0, date: new Date('2025-05-01'), description: 'IS - mayo 2025' },
    { indicator: 'is', value: 7457.0, date: new Date('2025-06-01'), description: 'IS - junio 2025' },
    { indicator: 'is', value: 7643.42, date: new Date('2025-07-01'), description: 'IS - julio 2025' },
    { indicator: 'is', value: 7789.9, date: new Date('2025-08-01'), description: 'IS - agosto 2025' }
  ];

  for (const index of economicIndices) {
    await prisma.economicIndex.create({ data: index });
  }

  // Crear placas de propiedades de ejemplo
  const propertyPlaques = [
    {
      title: 'Placa Departamento Palermo',
      description: 'Placa profesional para departamento en Palermo Hollywood',
      propertyData: JSON.stringify({
        address: 'Av. Santa Fe 2500, Palermo, CABA',
        price: 250000,
        type: 'Departamento',
        bedrooms: 2,
        bathrooms: 1,
        area: 65
      }),
      originalImages: JSON.stringify(['https://example.com/image1.jpg']),
      generatedImages: JSON.stringify(['https://example.com/plaque1.jpg']),
      status: 'COMPLETED',
      aiPrompt: 'Generar placa profesional para departamento moderno',
      aiResponse: 'Placa generada exitosamente',
      metadata: JSON.stringify({ template: 'modern', colors: ['blue', 'white'] }),
      userId: corredorUser.id
    },
    {
      title: 'Placa Casa en Tigre',
      description: 'Placa elegante para casa familiar en Tigre',
      propertyData: JSON.stringify({
        address: 'Calle Principal 123, Tigre, Buenos Aires',
        price: 450000,
        type: 'Casa',
        bedrooms: 3,
        bathrooms: 2,
        area: 180
      }),
      originalImages: JSON.stringify(['https://example.com/image2.jpg']),
      generatedImages: JSON.stringify(['https://example.com/plaque2.jpg']),
      status: 'COMPLETED',
      aiPrompt: 'Placa elegante para casa familiar con jardín',
      aiResponse: 'Placa generada con estilo clásico',
      metadata: JSON.stringify({ template: 'classic', colors: ['green', 'brown'] }),
      userId: regularUser.id
    }
  ];

  for (const plaque of propertyPlaques) {
    await prisma.propertyPlaque.create({ data: plaque });
  }

  console.log('✅ Property plaques created');

  // Crear archivos de ejemplo (simulados)
  const fileUploads = [
    {
      filename: 'guia-corredor.pdf',
      originalName: 'Guía del Corredor Inmobiliario.pdf',
      mimeType: 'application/pdf',
      size: 2048576,
      cloudinaryUrl: 'https://res.cloudinary.com/example/guia-corredor.pdf',
      cloudinaryId: 'documents/guia-corredor',
      folder: 'Contenido',
      subfolder: 'Guias',
      uploadedBy: adminUser.id
    },
    {
      filename: 'modelo-contrato.docx',
      originalName: 'Modelo Contrato de Compraventa.docx',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      size: 1536000,
      cloudinaryUrl: 'https://res.cloudinary.com/example/modelo-contrato.docx',
      cloudinaryId: 'documents/modelo-contrato',
      folder: 'Contenido',
      subfolder: 'Modelos',
      uploadedBy: corredorUser.id
    }
  ];

  for (const file of fileUploads) {
    await prisma.fileUpload.create({ data: file });
  }

  console.log('✅ File uploads created');

  console.log('🎉 Seed completed successfully!');
  console.log('');
  console.log('📋 Usuarios de prueba creados:');
  console.log('   Admin: admin@rialtor.app / admin123');
  console.log('   Corredor: corredor@rialtor.app / corredor123');
  console.log('   Usuario: usuario@rialtor.app / user123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
