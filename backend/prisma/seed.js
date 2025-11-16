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
    // IPC - últimos 12 meses
    { indicator: 'ipc', value: 1524.5, date: new Date('2024-10-01'), description: 'Índice de Precios al Consumidor - Octubre 2024' },
    { indicator: 'ipc', value: 1489.2, date: new Date('2024-09-01'), description: 'Índice de Precios al Consumidor - Septiembre 2024' },
    { indicator: 'ipc', value: 1456.7, date: new Date('2024-08-01'), description: 'Índice de Precios al Consumidor - Agosto 2024' },
    { indicator: 'ipc', value: 1423.1, date: new Date('2024-07-01'), description: 'Índice de Precios al Consumidor - Julio 2024' },
    { indicator: 'ipc', value: 1390.8, date: new Date('2024-06-01'), description: 'Índice de Precios al Consumidor - Junio 2024' },
    { indicator: 'ipc', value: 1358.4, date: new Date('2024-05-01'), description: 'Índice de Precios al Consumidor - Mayo 2024' },
    { indicator: 'ipc', value: 1326.9, date: new Date('2024-04-01'), description: 'Índice de Precios al Consumidor - Abril 2024' },
    { indicator: 'ipc', value: 1295.3, date: new Date('2024-03-01'), description: 'Índice de Precios al Consumidor - Marzo 2024' },
    { indicator: 'ipc', value: 1264.7, date: new Date('2024-02-01'), description: 'Índice de Precios al Consumidor - Febrero 2024' },
    { indicator: 'ipc', value: 1234.1, date: new Date('2024-01-01'), description: 'Índice de Precios al Consumidor - Enero 2024' },
    { indicator: 'ipc', value: 1204.5, date: new Date('2023-12-01'), description: 'Índice de Precios al Consumidor - Diciembre 2023' },
    { indicator: 'ipc', value: 1175.8, date: new Date('2023-11-01'), description: 'Índice de Precios al Consumidor - Noviembre 2023' },

    // CAC General
    { indicator: 'cacGeneral', value: 1456.7, date: new Date('2024-10-01'), description: 'Costo de la Construcción - Nivel General - Octubre 2024' },
    { indicator: 'cacGeneral', value: 1423.4, date: new Date('2024-09-01'), description: 'Costo de la Construcción - Nivel General - Septiembre 2024' },
    { indicator: 'cacGeneral', value: 1390.1, date: new Date('2024-08-01'), description: 'Costo de la Construcción - Nivel General - Agosto 2024' },
    { indicator: 'cacGeneral', value: 1357.8, date: new Date('2024-07-01'), description: 'Costo de la Construcción - Nivel General - Julio 2024' },
    { indicator: 'cacGeneral', value: 1325.5, date: new Date('2024-06-01'), description: 'Costo de la Construcción - Nivel General - Junio 2024' },
    { indicator: 'cacGeneral', value: 1293.2, date: new Date('2024-05-01'), description: 'Costo de la Construcción - Nivel General - Mayo 2024' },
    { indicator: 'cacGeneral', value: 1261.9, date: new Date('2024-04-01'), description: 'Costo de la Construcción - Nivel General - Abril 2024' },
    { indicator: 'cacGeneral', value: 1230.6, date: new Date('2024-03-01'), description: 'Costo de la Construcción - Nivel General - Marzo 2024' },
    { indicator: 'cacGeneral', value: 1199.3, date: new Date('2024-02-01'), description: 'Costo de la Construcción - Nivel General - Febrero 2024' },
    { indicator: 'cacGeneral', value: 1168.0, date: new Date('2024-01-01'), description: 'Costo de la Construcción - Nivel General - Enero 2024' },
    { indicator: 'cacGeneral', value: 1137.7, date: new Date('2023-12-01'), description: 'Costo de la Construcción - Nivel General - Diciembre 2023' },
    { indicator: 'cacGeneral', value: 1107.4, date: new Date('2023-11-01'), description: 'Costo de la Construcción - Nivel General - Noviembre 2023' },

    // CAC Materiales
    { indicator: 'cacMateriales', value: 1234.2, date: new Date('2024-10-01'), description: 'Costo de la Construcción - Materiales - Octubre 2024' },
    { indicator: 'cacMateriales', value: 1208.5, date: new Date('2024-09-01'), description: 'Costo de la Construcción - Materiales - Septiembre 2024' },
    { indicator: 'cacMateriales', value: 1182.8, date: new Date('2024-08-01'), description: 'Costo de la Construcción - Materiales - Agosto 2024' },
    { indicator: 'cacMateriales', value: 1157.1, date: new Date('2024-07-01'), description: 'Costo de la Construcción - Materiales - Julio 2024' },
    { indicator: 'cacMateriales', value: 1131.4, date: new Date('2024-06-01'), description: 'Costo de la Construcción - Materiales - Junio 2024' },
    { indicator: 'cacMateriales', value: 1105.7, date: new Date('2024-05-01'), description: 'Costo de la Construcción - Materiales - Mayo 2024' },
    { indicator: 'cacMateriales', value: 1080.0, date: new Date('2024-04-01'), description: 'Costo de la Construcción - Materiales - Abril 2024' },
    { indicator: 'cacMateriales', value: 1054.3, date: new Date('2024-03-01'), description: 'Costo de la Construcción - Materiales - Marzo 2024' },
    { indicator: 'cacMateriales', value: 1028.6, date: new Date('2024-02-01'), description: 'Costo de la Construcción - Materiales - Febrero 2024' },
    { indicator: 'cacMateriales', value: 1002.9, date: new Date('2024-01-01'), description: 'Costo de la Construcción - Materiales - Enero 2024' },
    { indicator: 'cacMateriales', value: 977.2, date: new Date('2023-12-01'), description: 'Costo de la Construcción - Materiales - Diciembre 2023' },
    { indicator: 'cacMateriales', value: 951.5, date: new Date('2023-11-01'), description: 'Costo de la Construcción - Materiales - Noviembre 2023' },

    // CAC Mano de Obra
    { indicator: 'cacManoObra', value: 1678.9, date: new Date('2024-10-01'), description: 'Costo de la Construcción - Mano de Obra - Octubre 2024' },
    { indicator: 'cacManoObra', value: 1645.3, date: new Date('2024-09-01'), description: 'Costo de la Construcción - Mano de Obra - Septiembre 2024' },
    { indicator: 'cacManoObra', value: 1611.7, date: new Date('2024-08-01'), description: 'Costo de la Construcción - Mano de Obra - Agosto 2024' },
    { indicator: 'cacManoObra', value: 1578.1, date: new Date('2024-07-01'), description: 'Costo de la Construcción - Mano de Obra - Julio 2024' },
    { indicator: 'cacManoObra', value: 1544.5, date: new Date('2024-06-01'), description: 'Costo de la Construcción - Mano de Obra - Junio 2024' },
    { indicator: 'cacManoObra', value: 1510.9, date: new Date('2024-05-01'), description: 'Costo de la Construcción - Mano de Obra - Mayo 2024' },
    { indicator: 'cacManoObra', value: 1477.3, date: new Date('2024-04-01'), description: 'Costo de la Construcción - Mano de Obra - Abril 2024' },
    { indicator: 'cacManoObra', value: 1443.7, date: new Date('2024-03-01'), description: 'Costo de la Construcción - Mano de Obra - Marzo 2024' },
    { indicator: 'cacManoObra', value: 1410.1, date: new Date('2024-02-01'), description: 'Costo de la Construcción - Mano de Obra - Febrero 2024' },
    { indicator: 'cacManoObra', value: 1376.5, date: new Date('2024-01-01'), description: 'Costo de la Construcción - Mano de Obra - Enero 2024' },
    { indicator: 'cacManoObra', value: 1342.9, date: new Date('2023-12-01'), description: 'Costo de la Construcción - Mano de Obra - Diciembre 2023' },
    { indicator: 'cacManoObra', value: 1309.3, date: new Date('2023-11-01'), description: 'Costo de la Construcción - Mano de Obra - Noviembre 2023' },

    // ICC
    { indicator: 'icc', value: 1345.6, date: new Date('2024-10-01'), description: 'Índice del costo de la construcción - Octubre 2024' },
    { indicator: 'icc', value: 1318.7, date: new Date('2024-09-01'), description: 'Índice del costo de la construcción - Septiembre 2024' },
    { indicator: 'icc', value: 1291.8, date: new Date('2024-08-01'), description: 'Índice del costo de la construcción - Agosto 2024' },
    { indicator: 'icc', value: 1264.9, date: new Date('2024-07-01'), description: 'Índice del costo de la construcción - Julio 2024' },
    { indicator: 'icc', value: 1238.0, date: new Date('2024-06-01'), description: 'Índice del costo de la construcción - Junio 2024' },
    { indicator: 'icc', value: 1211.1, date: new Date('2024-05-01'), description: 'Índice del costo de la construcción - Mayo 2024' },
    { indicator: 'icc', value: 1184.2, date: new Date('2024-04-01'), description: 'Índice del costo de la construcción - Abril 2024' },
    { indicator: 'icc', value: 1157.3, date: new Date('2024-03-01'), description: 'Índice del costo de la construcción - Marzo 2024' },
    { indicator: 'icc', value: 1130.4, date: new Date('2024-02-01'), description: 'Índice del costo de la construcción - Febrero 2024' },
    { indicator: 'icc', value: 1103.5, date: new Date('2024-01-01'), description: 'Índice del costo de la construcción - Enero 2024' },
    { indicator: 'icc', value: 1076.6, date: new Date('2023-12-01'), description: 'Índice del costo de la construcción - Diciembre 2023' },
    { indicator: 'icc', value: 1049.7, date: new Date('2023-11-01'), description: 'Índice del costo de la construcción - Noviembre 2023' },

    // IS
    { indicator: 'is', value: 1890.3, date: new Date('2024-10-01'), description: 'Índice de evolución de los salarios - Octubre 2024' },
    { indicator: 'is', value: 1856.5, date: new Date('2024-09-01'), description: 'Índice de evolución de los salarios - Septiembre 2024' },
    { indicator: 'is', value: 1822.7, date: new Date('2024-08-01'), description: 'Índice de evolución de los salarios - Agosto 2024' },
    { indicator: 'is', value: 1788.9, date: new Date('2024-07-01'), description: 'Índice de evolución de los salarios - Julio 2024' },
    { indicator: 'is', value: 1755.1, date: new Date('2024-06-01'), description: 'Índice de evolución de los salarios - Junio 2024' },
    { indicator: 'is', value: 1721.3, date: new Date('2024-05-01'), description: 'Índice de evolución de los salarios - Mayo 2024' },
    { indicator: 'is', value: 1687.5, date: new Date('2024-04-01'), description: 'Índice de evolución de los salarios - Abril 2024' },
    { indicator: 'is', value: 1653.7, date: new Date('2024-03-01'), description: 'Índice de evolución de los salarios - Marzo 2024' },
    { indicator: 'is', value: 1619.9, date: new Date('2024-02-01'), description: 'Índice de evolución de los salarios - Febrero 2024' },
    { indicator: 'is', value: 1586.1, date: new Date('2024-01-01'), description: 'Índice de evolución de los salarios - Enero 2024' },
    { indicator: 'is', value: 1552.3, date: new Date('2023-12-01'), description: 'Índice de evolución de los salarios - Diciembre 2023' },
    { indicator: 'is', value: 1518.5, date: new Date('2023-11-01'), description: 'Índice de evolución de los salarios - Noviembre 2023' }
  ];

  for (const index of economicIndices) {
    await prisma.economicIndex.create({ data: index });
  }

  console.log('✅ Economic indices created');

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
