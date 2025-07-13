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

  // Create categories
  const categories = [
    {
      name: 'Regulaciones AFIP',
      description: 'Normativas y regulaciones fiscales para operaciones inmobiliarias',
      slug: 'regulaciones-afip',
      color: '#3B82F6',
      icon: '📋'
    },
    {
      name: 'Comisiones y Honorarios',
      description: 'Información sobre cálculo de comisiones y honorarios profesionales',
      slug: 'comisiones-honorarios',
      color: '#10B981',
      icon: '💰'
    },
    {
      name: 'Documentación Legal',
      description: 'Documentos, contratos y formularios legales',
      slug: 'documentacion-legal',
      color: '#8B5CF6',
      icon: '📄'
    },
    {
      name: 'Procesos de Escrituración',
      description: 'Guías y procedimientos para escrituración de propiedades',
      slug: 'procesos-escrituracion',
      color: '#F59E0B',
      icon: '✍️'
    },
    {
      name: 'Impuestos y Tasas',
      description: 'Información sobre impuestos provinciales y tasas municipales',
      slug: 'impuestos-tasas',
      color: '#EF4444',
      icon: '🧾'
    }
  ];

  for (const categoryData of categories) {
    const category = await prisma.category.upsert({
      where: { slug: categoryData.slug },
      update: {},
      create: categoryData
    });
    console.log('✅ Category created:', category.name);
  }

  // Create sample articles
  const regulacionesCategory = await prisma.category.findUnique({
    where: { slug: 'regulaciones-afip' }
  });

  const comisionesCategory = await prisma.category.findUnique({
    where: { slug: 'comisiones-honorarios' }
  });

  const articles = [
    {
      title: 'Nuevas regulaciones AFIP para operaciones inmobiliarias 2024',
      slug: 'nuevas-regulaciones-afip-2024',
      content: `
# Nuevas Regulaciones AFIP 2024

## Introducción

Las nuevas regulaciones de la AFIP para operaciones inmobiliarias en 2024 introducen cambios significativos que afectan a todos los agentes inmobiliarios.

## Principales Cambios

### 1. Régimen de Retenciones

- Nuevos porcentajes de retención
- Modificaciones en los montos mínimos
- Excepciones para primeras viviendas

### 2. Declaraciones Juradas

- Nuevos formularios obligatorios
- Plazos modificados
- Información adicional requerida

### 3. Operaciones en Moneda Extranjera

- Nuevas restricciones
- Tipo de cambio oficial
- Documentación requerida

## Impacto en Agentes Inmobiliarios

Los agentes inmobiliarios deben adaptarse rápidamente a estos cambios para evitar sanciones y mantener el cumplimiento normativo.

## Recomendaciones

1. Actualizar sistemas de gestión
2. Capacitar al equipo
3. Revisar contratos existentes
4. Consultar con contadores especializados

## Conclusión

Es fundamental mantenerse actualizado con estas regulaciones para operar de manera legal y eficiente en el mercado inmobiliario argentino.
      `,
      excerpt: 'Guía completa sobre los cambios en la normativa fiscal que afectan a los agentes inmobiliarios en Argentina durante 2024.',
      status: 'PUBLISHED',
      featured: true,
      tags: JSON.stringify(['AFIP', 'Regulaciones', 'Impuestos', '2024']),
      views: 1250,
      authorId: admin.id,
      categoryId: regulacionesCategory.id
    },
    {
      title: 'Cálculo de comisiones en ventas de propiedades',
      slug: 'calculo-comisiones-ventas',
      content: `
# Cálculo de Comisiones en Ventas de Propiedades

## Fórmulas Básicas

### Comisión Estándar
La comisión estándar en Argentina suele ser del 3% al 6% del valor de la propiedad.

### Cálculo por Zona
- **CABA**: 4-6%
- **GBA**: 3-5%  
- **Interior**: 3-4%

### Factores que Afectan la Comisión

1. **Valor de la propiedad**
2. **Ubicación**
3. **Tipo de propiedad**
4. **Complejidad de la operación**
5. **Servicios adicionales**

## Ejemplos Prácticos

### Ejemplo 1: Departamento en CABA
- Valor: USD 150,000
- Comisión: 5%
- Total: USD 7,500

### Ejemplo 2: Casa en GBA
- Valor: USD 100,000
- Comisión: 4%
- Total: USD 4,000

## Consideraciones Legales

- Comisión debe estar acordada por escrito
- Debe especificarse quién paga la comisión
- IVA aplicable según corresponda

## Herramientas de Cálculo

Utiliza nuestra calculadora integrada para obtener cálculos precisos y actualizados.
      `,
      excerpt: 'Métodos y fórmulas para el cálculo correcto de comisiones inmobiliarias según la zona y tipo de propiedad.',
      status: 'PUBLISHED',
      featured: true,
      tags: JSON.stringify(['Comisiones', 'Cálculo', 'Ventas', 'Honorarios']),
      views: 980,
      authorId: admin.id,
      categoryId: comisionesCategory.id
    }
  ];

  for (const articleData of articles) {
    const article = await prisma.article.upsert({
      where: { slug: articleData.slug },
      update: {},
      create: articleData
    });
    console.log('✅ Article created:', article.title);
  }

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
