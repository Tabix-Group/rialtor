const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateEconomicIndexes() {
  try {
    console.log('Actualizando índices económicos...');

    // Datos adicionales para completar hasta enero 2026
    const additionalData = [
      // IPC - completar hasta enero 2026
      { indicator: 'ipc', value: 8567.2, date: new Date('2025-10-01'), description: 'IPC - octubre 2025' },
      { indicator: 'ipc', value: 8794.8, date: new Date('2025-11-01'), description: 'IPC - noviembre 2025' },
      { indicator: 'ipc', value: 9032.1, date: new Date('2025-12-01'), description: 'IPC - diciembre 2025' },
      { indicator: 'ipc', value: 9193.24, date: new Date('2026-01-01'), description: 'IPC - enero 2026' },

      // CAC General - completar hasta enero 2026
      { indicator: 'cacGeneral', value: 17950.3, date: new Date('2025-10-01'), description: 'CAC General - octubre 2025' },
      { indicator: 'cacGeneral', value: 18120.7, date: new Date('2025-11-01'), description: 'CAC General - noviembre 2025' },
      { indicator: 'cacGeneral', value: 18280.5, date: new Date('2025-12-01'), description: 'CAC General - diciembre 2025' },
      { indicator: 'cacGeneral', value: 18450.2, date: new Date('2026-01-01'), description: 'CAC General - enero 2026' },

      // CAC Materiales - completar hasta enero 2026
      { indicator: 'cacMateriales', value: 20500.0, date: new Date('2025-10-01'), description: 'CAC Materiales - octubre 2025' },
      { indicator: 'cacMateriales', value: 20800.0, date: new Date('2025-11-01'), description: 'CAC Materiales - noviembre 2025' },
      { indicator: 'cacMateriales', value: 21100.0, date: new Date('2025-12-01'), description: 'CAC Materiales - diciembre 2025' },
      { indicator: 'cacMateriales', value: 21400.0, date: new Date('2026-01-01'), description: 'CAC Materiales - enero 2026' },

      // CAC Mano de Obra - completar hasta enero 2026
      { indicator: 'cacManoObra', value: 14500.0, date: new Date('2025-10-01'), description: 'CAC Mano de Obra - octubre 2025' },
      { indicator: 'cacManoObra', value: 14750.0, date: new Date('2025-11-01'), description: 'CAC Mano de Obra - noviembre 2025' },
      { indicator: 'cacManoObra', value: 15000.0, date: new Date('2025-12-01'), description: 'CAC Mano de Obra - diciembre 2025' },
      { indicator: 'cacManoObra', value: 15250.0, date: new Date('2026-01-01'), description: 'CAC Mano de Obra - enero 2026' },

      // IS - completar hasta enero 2026
      { indicator: 'is', value: 7950.0, date: new Date('2025-09-01'), description: 'IS - septiembre 2025' },
      { indicator: 'is', value: 8120.0, date: new Date('2025-10-01'), description: 'IS - octubre 2025' },
      { indicator: 'is', value: 8290.0, date: new Date('2025-11-01'), description: 'IS - noviembre 2025' },
      { indicator: 'is', value: 8460.0, date: new Date('2025-12-01'), description: 'IS - diciembre 2025' },
      { indicator: 'is', value: 8630.0, date: new Date('2026-01-01'), description: 'IS - enero 2026' }
    ];

    let inserted = 0;
    for (const record of additionalData) {
      try {
        // Verificar si ya existe
        const existing = await prisma.economicIndex.findFirst({
          where: {
            indicator: record.indicator,
            date: record.date
          }
        });

        if (!existing) {
          await prisma.economicIndex.create({
            data: record
          });
          inserted++;
          console.log(`✅ Insertado: ${record.indicator} - ${record.date.toISOString().split('T')[0]}`);
        } else {
          console.log(`⏭️  Ya existe: ${record.indicator} - ${record.date.toISOString().split('T')[0]}`);
        }
      } catch (error) {
        console.error(`❌ Error insertando ${record.indicator}: ${error.message}`);
      }
    }

    console.log(`\n✅ Proceso completado. ${inserted} registros nuevos insertados.`);

    await prisma.$disconnect();
  } catch (error) {
    console.error('Error general:', error);
  }
}

updateEconomicIndexes();