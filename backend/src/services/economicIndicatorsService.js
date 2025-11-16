const axios = require('axios');

class EconomicIndicatorsService {
  constructor() {
    // Cache para evitar demasiadas peticiones
    this.cache = {
      dolarData: null,
      realEstateData: null,
      economicIndexesData: null,
      lastUpdate: {
        dolar: null,
        realEstate: null,
        economicIndexes: null
      }
    };
    this.CACHE_DURATION = 5 * 60 * 1000; // 5 minutos
  }

  /**
   * Obtiene datos de cotizaciones del dólar desde API pública argentina
   */
  async getDolarRates() {
    try {
      // Verificar cache
      if (this.cache.dolarData && 
          this.cache.lastUpdate.dolar && 
          Date.now() - this.cache.lastUpdate.dolar < this.CACHE_DURATION) {
        return this.cache.dolarData;
      }

      // API pública de dólar argentina (dolarapi.com)
      const response = await axios.get('https://dolarapi.com/v1/dolares', {
        timeout: 3000,
        headers: {
          'User-Agent': 'RIALTOR/1.0'
        }
      });

      const data = response.data;
      
      // Extraer las cotizaciones que necesitamos
      const oficial = data.find(d => d.casa === 'oficial');
      const blue = data.find(d => d.casa === 'blue');
      const tarjeta = data.find(d => d.casa === 'tarjeta');

      const result = {
        oficial: {
          compra: oficial?.compra || 0,
          venta: oficial?.venta || 0,
          variacion: this.calculateVariation(oficial),
          fechaActualizacion: oficial?.fechaActualizacion || new Date().toISOString()
        },
        blue: {
          compra: blue?.compra || 0,
          venta: blue?.venta || 0,
          variacion: this.calculateVariation(blue),
          fechaActualizacion: blue?.fechaActualizacion || new Date().toISOString()
        },
        tarjeta: {
          compra: tarjeta?.compra || 0,
          venta: tarjeta?.venta || 0,
          variacion: this.calculateVariation(tarjeta),
          fechaActualizacion: tarjeta?.fechaActualizacion || new Date().toISOString()
        },
        lastUpdated: new Date().toISOString()
      };

      // Actualizar cache
      this.cache.dolarData = result;
      this.cache.lastUpdate.dolar = Date.now();

      return result;
    } catch (error) {
      console.error('Error fetching dolar rates:', error.message);
      
      // Si hay data en cache, devolverla aunque esté expirada
      if (this.cache.dolarData) {
        return { ...this.cache.dolarData, fromCache: true };
      }

      // Devolver datos por defecto
      return {
        oficial: { compra: 0, venta: 0, variacion: 0, fechaActualizacion: new Date().toISOString() },
        blue: { compra: 0, venta: 0, variacion: 0, fechaActualizacion: new Date().toISOString() },
        tarjeta: { compra: 0, venta: 0, variacion: 0, fechaActualizacion: new Date().toISOString() },
        lastUpdated: new Date().toISOString(),
        error: 'No se pudieron obtener las cotizaciones'
      };
    }
  }

  /**
   * Calcula la variación porcentual (si está disponible en los datos)
   */
  calculateVariation(dolarData) {
    if (!dolarData) return 0;
    
    // Algunos proveedores incluyen variación
    if (dolarData.variacion !== undefined) {
      return dolarData.variacion;
    }

    // Calcular variación simple entre compra y venta
    if (dolarData.compra && dolarData.venta) {
      const diff = dolarData.venta - dolarData.compra;
      return parseFloat(((diff / dolarData.compra) * 100).toFixed(2));
    }

    return 0;
  }

  /**
   * Obtiene datos del mercado inmobiliario
   * Nota: Estos datos son estimativos. En producción, deberías usar una API real
   * como la del Colegio de Escribanos o fuentes oficiales
   */
  async getRealEstateData() {
    try {
      // Verificar cache
      if (this.cache.realEstateData && 
          this.cache.lastUpdate.realEstate && 
          Date.now() - this.cache.lastUpdate.realEstate < this.CACHE_DURATION) {
        return this.cache.realEstateData;
      }

      // TODO: Integrar con API real del mercado inmobiliario
      // Por ahora, datos simulados basados en promedios del mercado
      // Fuentes: Zonaprop, Properati, Reporte Inmobiliario
      
      const result = {
        precioM2: {
          caba: {
            venta: 3200, // USD por m2
            alquiler: 12.5, // USD por m2
            variacion: 2.3, // % mensual
            zonas: [
              { nombre: 'Palermo', precio: 4200, variacion: 3.1 },
              { nombre: 'Recoleta', precio: 4500, variacion: 2.8 },
              { nombre: 'Belgrano', precio: 3800, variacion: 2.5 },
              { nombre: 'Puerto Madero', precio: 5800, variacion: 1.9 },
              { nombre: 'Caballito', precio: 2800, variacion: 2.7 }
            ]
          },
          buenosAires: {
            venta: 1800, // USD por m2
            alquiler: 8.5, // USD por m2
            variacion: 1.8, // % mensual
            zonas: [
              { nombre: 'Zona Norte', precio: 2200, variacion: 2.1 },
              { nombre: 'Zona Oeste', precio: 1600, variacion: 1.5 },
              { nombre: 'Zona Sur', precio: 1400, variacion: 1.9 }
            ]
          }
        },
        escrituraciones: {
          caba: {
            cantidad: 2847, // último mes
            variacionMensual: -5.2, // %
            variacionAnual: 12.3, // %
            promedioOperacion: 185000 // USD
          },
          buenosAires: {
            cantidad: 1923,
            variacionMensual: -3.8,
            variacionAnual: 15.7,
            promedioOperacion: 120000
          }
        },
        tendencias: {
          demandaAlquiler: 'alta',
          demandaVenta: 'media',
          stockDisponible: 'medio',
          tiempoPromedioVenta: 90 // días
        },
        lastUpdated: new Date().toISOString(),
        source: 'Estimación basada en Zonaprop, Properati y Colegio de Escribanos'
      };

      // Actualizar cache
      this.cache.realEstateData = result;
      this.cache.lastUpdate.realEstate = Date.now();

      return result;
    } catch (error) {
      console.error('Error fetching real estate data:', error.message);
      
      if (this.cache.realEstateData) {
        return { ...this.cache.realEstateData, fromCache: true };
      }

      return {
        precioM2: {
          caba: { venta: 0, alquiler: 0, variacion: 0, zonas: [] },
          buenosAires: { venta: 0, alquiler: 0, variacion: 0, zonas: [] }
        },
        escrituraciones: {
          caba: { cantidad: 0, variacionMensual: 0, variacionAnual: 0, promedioOperacion: 0 },
          buenosAires: { cantidad: 0, variacionMensual: 0, variacionAnual: 0, promedioOperacion: 0 }
        },
        tendencias: {
          demandaAlquiler: 'n/a',
          demandaVenta: 'n/a',
          stockDisponible: 'n/a',
          tiempoPromedioVenta: 0
        },
        lastUpdated: new Date().toISOString(),
        error: 'No se pudieron obtener los datos inmobiliarios'
      };
    }
  }

  /**
   * Obtiene índices económicos de Argentina desde la base de datos
   */
  async getEconomicIndexes() {
    try {
      // Verificar cache
      if (this.cache.economicIndexesData && 
          this.cache.lastUpdate.economicIndexes && 
          Date.now() - this.cache.lastUpdate.economicIndexes < this.CACHE_DURATION) {
        return this.cache.economicIndexesData;
      }

      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      try {
        console.log('[ECONOMIC] Obteniendo índices económicos desde la base de datos...');
        
        // Obtener los últimos valores para cada indicador
        const indicators = ['ipc', 'cacGeneral', 'cacMateriales', 'cacManoObra', 'icc', 'is'];
        const latestIndexes = {};

        for (const indicator of indicators) {
          const latest = await prisma.economicIndex.findFirst({
            where: { indicator },
            orderBy: { date: 'desc' }
          });
          latestIndexes[indicator] = latest;
        }

        // Calcular variaciones comparando con el mes anterior
        const result = {};
        const descriptions = {
          ipc: 'Índice de Precios al Consumidor - Mide la evolución de los precios de consumo en Argentina',
          cacGeneral: 'Costo de la Construcción - Nivel General',
          cacMateriales: 'Costo de la Construcción - Materiales',
          cacManoObra: 'Costo de la Construcción - Mano de Obra',
          icc: 'Índice del costo de la construcción en Argentina',
          is: 'Índice de evolución de los salarios'
        };

        for (const indicator of indicators) {
          const current = latestIndexes[indicator];
          if (current) {
            // Buscar el valor del mes anterior
            const previousMonth = new Date(current.date);
            previousMonth.setMonth(previousMonth.getMonth() - 1);
            
            const previous = await prisma.economicIndex.findFirst({
              where: { 
                indicator,
                date: {
                  lt: current.date,
                  gte: previousMonth
                }
              },
              orderBy: { date: 'desc' }
            });

            let variation = null;
            if (previous && previous.value !== 0) {
              variation = parseFloat((((current.value - previous.value) / previous.value) * 100).toFixed(2));
            }

            result[indicator.replace('cac', 'cac').replace('icc', 'icc').replace('is', 'is')] = {
              nombre: this.getIndicatorName(indicator),
              valor: current.value,
              variacion: variation,
              fecha: current.date.toISOString().split('T')[0],
              descripcion: current.description || descriptions[indicator] || ''
            };
          } else {
            // Si no hay datos, devolver valores por defecto
            result[indicator.replace('cac', 'cac').replace('icc', 'icc').replace('is', 'is')] = {
              nombre: this.getIndicatorName(indicator),
              valor: 0,
              variacion: null,
              fecha: new Date().toISOString().split('T')[0],
              descripcion: descriptions[indicator] || 'Datos no disponibles'
            };
          }
        }

        result.lastUpdated = new Date().toISOString();
        result.dataSource = 'DATABASE';

        console.log('[ECONOMIC] ✅ Datos obtenidos desde la base de datos');

        // Actualizar cache
        this.cache.economicIndexesData = result;
        this.cache.lastUpdate.economicIndexes = Date.now();

        await prisma.$disconnect();
        return result;

      } catch (dbError) {
        console.error('[ECONOMIC] Error al consultar la base de datos:', dbError.message);
        await prisma.$disconnect();
      }

      // Fallback a datos mock si hay error en DB
      console.log('[ECONOMIC] 📊 Usando datos mock como fallback');
      const result = {
        ipc: {
          nombre: 'IPC (Índice de Precios al Consumidor)',
          valor: 1524.5,
          variacion: 2.3,
          fecha: new Date().toISOString().split('T')[0],
          descripcion: 'Mide la evolución de los precios de consumo en Argentina'
        },
        cacGeneral: {
          nombre: 'CAC General',
          valor: 1456.7,
          variacion: 1.8,
          fecha: new Date().toISOString().split('T')[0],
          descripcion: 'Costo de la Construcción - Nivel General'
        },
        cacMateriales: {
          nombre: 'CAC Materiales',
          valor: 1234.2,
          variacion: 2.1,
          fecha: new Date().toISOString().split('T')[0],
          descripcion: 'Costo de la Construcción - Materiales'
        },
        cacManoObra: {
          nombre: 'CAC Mano de Obra',
          valor: 1678.9,
          variacion: 1.5,
          fecha: new Date().toISOString().split('T')[0],
          descripcion: 'Costo de la Construcción - Mano de Obra'
        },
        icc: {
          nombre: 'ICC (Índice de Costos de Construcción)',
          valor: 1345.6,
          variacion: 2.7,
          fecha: new Date().toISOString().split('T')[0],
          descripcion: 'Índice del costo de la construcción en Argentina'
        },
        is: {
          nombre: 'IS (Índice de Salarios)',
          valor: 1890.3,
          variacion: 3.1,
          fecha: new Date().toISOString().split('T')[0],
          descripcion: 'Índice de evolución de los salarios'
        },
        lastUpdated: new Date().toISOString(),
        dataSource: 'MOCK_DATA'
      };

      // Actualizar cache
      this.cache.economicIndexesData = result;
      this.cache.lastUpdate.economicIndexes = Date.now();

      return result;
    } catch (error) {
      console.error('Error fetching economic indexes:', error.message);
      
      if (this.cache.economicIndexesData) {
        return { ...this.cache.economicIndexesData, fromCache: true };
      }

      // Devolver datos por defecto
      return {
        ipc: {
          nombre: 'IPC (Índice de Precios al Consumidor)',
          valor: 0,
          variacion: 0,
          fecha: new Date().toISOString().split('T')[0],
          descripcion: 'Datos no disponibles'
        },
        cacGeneral: {
          nombre: 'CAC General',
          valor: 0,
          variacion: 0,
          fecha: new Date().toISOString().split('T')[0],
          descripcion: 'Datos no disponibles'
        },
        cacMateriales: {
          nombre: 'CAC Materiales',
          valor: 0,
          variacion: 0,
          fecha: new Date().toISOString().split('T')[0],
          descripcion: 'Datos no disponibles'
        },
        cacManoObra: {
          nombre: 'CAC Mano de Obra',
          valor: 0,
          variacion: 0,
          fecha: new Date().toISOString().split('T')[0],
          descripcion: 'Datos no disponibles'
        },
        icc: {
          nombre: 'ICC (Índice de Costos de Construcción)',
          valor: 0,
          variacion: 0,
          fecha: new Date().toISOString().split('T')[0],
          descripcion: 'Datos no disponibles'
        },
        is: {
          nombre: 'IS (Índice de Salarios)',
          valor: 0,
          variacion: 0,
          fecha: new Date().toISOString().split('T')[0],
          descripcion: 'Datos no disponibles'
        },
        lastUpdated: new Date().toISOString(),
        error: 'No se pudieron obtener los índices económicos',
        dataSource: 'ERROR'
      };
    }
  }

  /**
   * Obtiene el nombre completo del indicador
   */
  getIndicatorName(indicator) {
    const names = {
      ipc: 'IPC (Índice de Precios al Consumidor)',
      cacGeneral: 'CAC General',
      cacMateriales: 'CAC Materiales',
      cacManoObra: 'CAC Mano de Obra',
      icc: 'ICC (Índice de Costos de Construcción)',
      is: 'IS (Índice de Salarios)'
    };
    return names[indicator] || indicator;
  }

  /**
   * Extrae el último valor de una serie específica de la respuesta de la API
   */
  extractLatestValue(seriesData, seriesId, nombre, descripcion) {
    try {
      const series = seriesData.find(s => s.series_id === seriesId);
      
      if (!series || !series.data || series.data.length === 0) {
        // Si no hay datos para esta serie, devolver valores por defecto
        return {
          nombre,
          valor: 0,
          variacion: 0,
          fecha: new Date().toISOString().split('T')[0],
          descripcion: `${descripcion} (datos no disponibles)`
        };
      }

      // Obtener el último dato disponible
      const latestData = series.data[series.data.length - 1];
      const previousData = series.data.length > 1 ? series.data[series.data.length - 2] : null;
      
      // Calcular variación si hay datos previos
      let variacion = 0;
      if (previousData && previousData[1] && latestData[1]) {
        const current = parseFloat(latestData[1]);
        const previous = parseFloat(previousData[1]);
        if (previous !== 0) {
          variacion = parseFloat((((current - previous) / previous) * 100).toFixed(2));
        }
      }

      return {
        nombre,
        valor: parseFloat(latestData[1]) || 0,
        variacion,
        fecha: latestData[0] || new Date().toISOString().split('T')[0],
        descripcion
      };
    } catch (error) {
      console.warn(`[ECONOMIC] Error extrayendo datos para ${seriesId}:`, error.message);
      return {
        nombre,
        valor: 0,
        variacion: 0,
        fecha: new Date().toISOString().split('T')[0],
        descripcion: `${descripcion} (error al procesar)`
      };
    }
  }

  /**
   * Obtiene todos los indicadores
   */
  async getAllIndicators() {
    const [dolarData, realEstateData, economicIndexesData] = await Promise.all([
      this.getDolarRates(),
      this.getRealEstateData(),
      this.getEconomicIndexes()
    ]);

    return {
      dolar: dolarData,
      mercadoInmobiliario: realEstateData,
      indicesEconomicos: economicIndexesData,
      timestamp: new Date().toISOString()
    };
  }

    /**
   * Limpia el cache manualmente
   */
  clearCache() {
    this.cache = {
      dolarData: null,
      realEstateData: null,
      economicIndexesData: null,
      lastUpdate: {
        dolar: null,
        realEstate: null,
        economicIndexes: null
      }
    };
  }

  /**
   * Obtiene datos históricos para gráficos de índices económicos
   */
  async getEconomicIndexChart(indicator) {
    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      try {
        console.log(`[ECONOMIC CHART] Obteniendo datos históricos para ${indicator} desde la base de datos...`);
        
        // Obtener los últimos 24 meses de datos
        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 24);

        const historicalData = await prisma.economicIndex.findMany({
          where: {
            indicator,
            date: {
              gte: startDate,
              lte: endDate
            }
          },
          orderBy: { date: 'asc' }
        });

        if (historicalData.length > 0) {
          console.log(`[ECONOMIC CHART] ✅ Encontrados ${historicalData.length} registros históricos para ${indicator}`);
          
          // Convertir al formato esperado
          const chartData = historicalData.map(record => ({
            fecha: record.date.toISOString().split('T')[0],
            valor: record.value
          }));

          await prisma.$disconnect();
          return {
            data: chartData,
            indicador: indicator,
            periodo: `Últimos ${chartData.length} meses`,
            dataSource: 'DATABASE'
          };
        }

        await prisma.$disconnect();
      } catch (dbError) {
        console.error(`[ECONOMIC CHART] Error al consultar la base de datos para ${indicator}:`, dbError.message);
        await prisma.$disconnect();
      }

      // Fallback a datos mock si no hay datos en DB
      console.log(`[ECONOMIC CHART] 📊 Generando datos históricos mock para ${indicator}`);
      
      const mockData = [];
      const baseValue = 1000 + Math.random() * 500; // Valor base aleatorio
      let currentValue = baseValue;
      
      // Generar 24 meses de datos históricos
      for (let i = 23; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        
        // Simular variación mensual entre -2% y +4%
        const variation = (Math.random() - 0.3) * 0.06; // -3% to +3%
        currentValue = currentValue * (1 + variation);
        
        mockData.push({
          fecha: date.toISOString().split('T')[0],
          valor: parseFloat(currentValue.toFixed(2))
        });
      }

      return {
        data: mockData,
        indicador: indicator,
        periodo: 'Últimos 24 meses (datos simulados)',
        dataSource: 'MOCK_DATA'
      };

    } catch (error) {
      console.error(`Error generating chart data for ${indicator}:`, error.message);
      
      // Devolver datos mínimos
      return {
        data: [],
        indicador: indicator,
        periodo: 'Datos no disponibles',
        dataSource: 'ERROR',
        error: `No se pudieron obtener los datos históricos para ${indicator}`
      };
    }
  }
}

module.exports = new EconomicIndicatorsService();
