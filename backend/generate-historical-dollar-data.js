const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function generateHistoricalDollarData() {
  try {
    console.log('Generando datos históricos de dólar...');

    const indicators = [
      'dolarOficialCompra', 'dolarOficialVenta',
      'dolarBlueCompra', 'dolarBlueVenta',
      'dolarTarjetaCompra', 'dolarTarjetaVenta'
    ];

    // Valores base aproximados
    const baseValues = {
      'dolarOficialCompra': 1375,
      'dolarOficialVenta': 1425,
      'dolarBlueCompra': 1410,
      'dolarBlueVenta': 1430,
      'dolarTarjetaCompra': 1787.5,
      'dolarTarjetaVenta': 1850 // aproximado
    };

    const now = new Date();
    let totalCreated = 0;

    // Generar datos para los últimos 30 días, una vez por día
    for (let day = 29; day >= 0; day--) {
      const date = new Date(now);
      date.setDate(date.getDate() - day);
      const dateStr = date.toISOString().split('T')[0];

      for (const indicator of indicators) {
        // Verificar si ya existe
        const existing = await prisma.economicIndex.findFirst({
          where: {
            indicator: indicator,
            date: {
              gte: new Date(dateStr),
              lt: new Date(dateStr + 'T23:59:59')
            }
          }
        });

        if (!existing) {
          // Generar variación aleatoria pequeña (±2%)
          const baseValue = baseValues[indicator];
          const variation = (Math.random() - 0.5) * 0.04; // -2% to +2%
          const value = baseValue * (1 + variation);

          await prisma.economicIndex.create({
            data: {
              indicator: indicator,
              value: parseFloat(value.toFixed(2)),
              date: date,
              description: `${indicator.replace(/dolar([A-Z])/g, 'Dólar $1').replace(/Compra|Venta/g, '$&')} (${dateStr})`
            }
          });

          totalCreated++;
        }
      }
    }

    console.log(`✅ Generados ${totalCreated} registros históricos de dólar`);

  } catch (error) {
    console.error('Error generando datos históricos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

generateHistoricalDollarData();