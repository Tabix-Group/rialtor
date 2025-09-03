const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Permisos base por sección
  const permissions = [
    { name: 'view_admin', description: 'Acceso a panel de administración' },
    { name: 'view_broker', description: 'Acceso a panel de broker' },
    { name: 'view_agent', description: 'Acceso a panel de agente' },
    { name: 'view_user', description: 'Acceso a panel de usuario' },
    { name: 'manage_articles', description: 'Gestionar artículos' },
    { name: 'manage_categories', description: 'Gestionar categorías' },
    { name: 'manage_users', description: 'Gestionar usuarios' },
    { name: 'manage_documents', description: 'Gestionar documentos' },
    { name: 'manage_system', description: 'Gestionar configuración del sistema' },
    { name: 'use_calculator', description: 'Usar calculadora' },
    { name: 'use_chat', description: 'Usar chat' },
    { name: 'use_placas', description: 'Usar generador de placas' },
    // Agrega más según tus vistas/secciones
  ];

  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { name: perm.name },
      update: {},
      create: perm,
    });
  }

  // Roles base
  const roles = [
    {
      name: 'ADMIN',
      description: 'Administrador',
      permissions: [
        'view_admin', 'view_broker', 'view_agent', 'view_user',
        'manage_articles', 'manage_categories', 'manage_users', 'manage_documents', 'manage_system', 'use_calculator', 'use_chat', 'use_placas',
      ],
    },
    {
      name: 'BROKER',
      description: 'Broker',
      permissions: [
        'view_broker', 'view_agent', 'view_user',
        'manage_articles', 'manage_categories', 'manage_documents', 'use_calculator', 'use_chat', 'use_placas',
      ],
    },
    {
      name: 'AGENTE',
      description: 'Agente',
      permissions: [
        'view_agent', 'view_user', 'manage_documents', 'use_calculator', 'use_chat', 'use_placas',
      ],
    },
    {
      name: 'USUARIO',
      description: 'Usuario',
      permissions: [
        'view_user', 'use_calculator', 'use_chat',
      ],
    },
  ];

  for (const role of roles) {
    const createdRole = await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: { name: role.name, description: role.description },
    });
    // Asignar permisos
    const perms = await prisma.permission.findMany({ where: { name: { in: role.permissions } } });
    await prisma.role.update({
      where: { id: createdRole.id },
      data: { permissions: { set: perms.map(p => ({ id: p.id })) } },
    });
  }
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
