const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Permisos base por sección
  const permissions = [
    { name: 'view_admin', description: 'Acceso a panel de administración' },
    { name: 'manage_users', description: 'Gestionar usuarios' },
    { name: 'manage_content', description: 'Gestionar contenido' },
    { name: 'upload_files', description: 'Subir archivos' },
    { name: 'generate_documents', description: 'Generar documentos' },
    { name: 'use_calculators', description: 'Usar calculadoras' },
    { name: 'access_chat', description: 'Acceder al chat' },
    { name: 'use_placas', description: 'Usar generador de placas' },
    // Agrega más según tus vistas/secciones
  ];

  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { name: perm.name },
      update: { description: perm.description },
      create: perm,
    });
  }

  // Roles base
  const roles = [
    {
      name: 'ADMIN',
      description: 'Administrador',
      permissions: [
        'view_admin', 'manage_users', 'manage_content', 'upload_files', 'generate_documents', 'use_calculators', 'access_chat', 'use_placas',
      ],
    },
    {
      name: 'CORREDOR',
      description: 'Corredor',
      permissions: [
        'manage_content', 'upload_files', 'generate_documents', 'use_calculators', 'access_chat', 'use_placas',
      ],
    },
    {
      name: 'USUARIO',
      description: 'Usuario',
      permissions: [
        'upload_files', 'generate_documents', 'use_calculators', 'access_chat', 'use_placas',
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
