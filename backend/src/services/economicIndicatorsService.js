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
   * Obtiene datos de cotizaciones del dólar desde la base de datos (más sustentable)
   */
  async getDolarRates() {
    try {
      // Verificar cache
      if (this.cache.dolarData && 
          this.cache.lastUpdate.dolar && 
          Date.now() - this.cache.lastUpdate.dolar < this.CACHE_DURATION) {
        return this.cache.dolarData;
      }

      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      try {
        console.log('[DOLAR] Obteniendo cotizaciones desde base de datos...');

        // Obtener los últimos valores para cada tipo de dólar
        const dollarTypes = ['oficial', 'blue', 'tarjeta'];
        const latestRates = {};

        for (const type of dollarTypes) {
          const compraIndicator = `dolar${type.charAt(0).toUpperCase() + type.slice(1)}Compra`;
          const ventaIndicator = `dolar${type.charAt(0).toUpperCase() + type.slice(1)}Venta`;

          const latestCompra = await prisma.economicIndex.findFirst({
            where: { indicator: compraIndicator },
            orderBy: { date: 'desc' }
          });

          const latestVenta = await prisma.economicIndex.findFirst({
            where: { indicator: ventaIndicator },
            orderBy: { date: 'desc' }
          });

          latestRates[type] = {
            compra: latestCompra?.value || 0,
            venta: latestVenta?.value || 0,
            fechaActualizacion: latestCompra?.date?.toISOString() || new Date().toISOString()
          };

          // Calcular variación comparando con el día anterior
          if (latestCompra && latestVenta) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);

            const previousCompra = await prisma.economicIndex.findFirst({
              where: { 
                indicator: compraIndicator,
                date: { lt: latestCompra.date, gte: yesterday }
              },
              orderBy: { date: 'desc' }
            });

            const previousVenta = await prisma.economicIndex.findFirst({
              where: { 
                indicator: ventaIndicator,
                date: { lt: latestVenta.date, gte: yesterday }
              },
              orderBy: { date: 'desc' }
            });

            let variacion = 0;
            if (previousVenta && previousVenta.value !== 0) {
              variacion = parseFloat((((latestVenta.value - previousVenta.value) / previousVenta.value) * 100).toFixed(2));
            }

            latestRates[type].variacion = variacion;
          } else {
            latestRates[type].variacion = 0;
          }
        }

        const result = {
          oficial: latestRates.oficial,
          blue: latestRates.blue,
          tarjeta: latestRates.tarjeta,
          lastUpdated: new Date().toISOString(),
          dataSource: 'DATABASE'
        };

        console.log('[DOLAR] ✅ Datos obtenidos desde base de datos');

        // Actualizar cache
        this.cache.dolarData = result;
        this.cache.lastUpdate.dolar = Date.now();

        await prisma.$disconnect();
        return result;

      } catch (dbError) {
        console.error('[DOLAR] Error consultando base de datos:', dbError.message);
        await prisma.$disconnect();
      }

      // Fallback: llamar a la API directamente si falla la DB
      console.log('[DOLAR] 📡 Usando API como fallback');
      return this.getDolarRatesFromAPI();

    } catch (error) {
      console.error('Error fetching dolar rates:', error.message);
      
      if (this.cache.dolarData) {
        return { ...this.cache.dolarData, fromCache: true };
      }

      return {
        oficial: { compra: 0, venta: 0, variacion: 0, fechaActualizacion: new Date().toISOString() },
        blue: { compra: 0, venta: 0, variacion: 0, fechaActualizacion: new Date().toISOString() },
        tarjeta: { compra: 0, venta: 0, variacion: 0, fechaActualizacion: new Date().toISOString() },
        lastUpdated: new Date().toISOString(),
        error: 'No se pudieron obtener las cotizaciones',
        dataSource: 'ERROR'
      };
    }
  }

  /**
   * Método auxiliar para obtener datos directamente de la API (fallback)
   */
  async getDolarRatesFromAPI() {
    try {
      const response = await axios.get('https://dolarapi.com/v1/dolares', {
        timeout: 3000,
        headers: {
          'User-Agent': 'RIALTOR/1.0'
        }
      });

      const data = response.data;
      
      const oficial = data.find(d => d.casa === 'oficial');
      const blue = data.find(d => d.casa === 'blue');
      const tarjeta = data.find(d => d.casa === 'tarjeta');

      return {
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
        lastUpdated: new Date().toISOString(),
        dataSource: 'API'
      };
    } catch (error) {
      throw error;
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
   * Obtiene el índice de Inflación histórica desde la API de argentinadatos.com
   * Filtra datos desde 2010 en adelante
   */
  async getInflacionIndex() {
    try {
      console.log('[INFLACION] Obteniendo índice de Inflación desde API...');
      
      const response = await axios.get('https://api.argentinadatos.com/v1/finanzas/indices/inflacion/', {
        timeout: 5000,
        headers: {
          'User-Agent': 'RIALTOR/1.0'
        }
      });

      const data = response.data;
      
      if (!data || data.length === 0) {
        throw new Error('No hay datos de inflación disponibles');
      }

      // Filtrar datos desde 2010 en adelante
      const dataFrom2010 = data.filter(item => item.fecha >= '2010-01-01');
      
      if (dataFrom2010.length === 0) {
        throw new Error('No hay datos de inflación desde 2010');
      }

      // Obtener el último valor y el anterior para calcular variación
      const latestData = dataFrom2010[dataFrom2010.length - 1];
      const previousData = dataFrom2010.length > 1 ? dataFrom2010[dataFrom2010.length - 2] : null;
      
      // La variación es simplemente la diferencia entre el mes actual y el anterior
      let variacion = null;
      if (previousData) {
        variacion = parseFloat((latestData.valor - previousData.valor).toFixed(2));
      }

      console.log(`[INFLACION] ✅ Datos obtenidos. Valor actual: ${latestData.valor}% (${latestData.fecha})`);

      return {
        nombre: 'Inflación Mensual',
        valor: parseFloat(latestData.valor) || 0,
        variacion: variacion,
        fecha: latestData.fecha,
        descripcion: 'Inflación mensual histórica de Argentina desde 2010. Mide la variación porcentual de precios mes a mes.'
      };
    } catch (error) {
      console.error('[INFLACION] Error obteniendo datos:', error.message);
      
      // Devolver valores por defecto en caso de error
      return {
        nombre: 'Inflación Mensual',
        valor: 0,
        variacion: null,
        fecha: new Date().toISOString().split('T')[0],
        descripcion: 'Datos no disponibles temporalmente'
      };
    }
  }

  /**
   * Obtiene el índice UVA desde la API de argentinadatos.com
   */
  async getUVAIndex() {
    try {
      console.log('[UVA] Obteniendo índice UVA desde API...');
      
      const response = await axios.get('https://api.argentinadatos.com/v1/finanzas/indices/uva/', {
        timeout: 5000,
        headers: {
          'User-Agent': 'RIALTOR/1.0'
        }
      });

      const data = response.data;
      
      if (!data || data.length === 0) {
        throw new Error('No hay datos de UVA disponibles');
      }

      // Obtener el último valor y el anterior para calcular variación
      const latestData = data[data.length - 1];
      const previousData = data.length > 1 ? data[data.length - 2] : null;
      
      let variacion = null;
      if (previousData && previousData.valor !== 0) {
        variacion = parseFloat((((latestData.valor - previousData.valor) / previousData.valor) * 100).toFixed(4));
      }

      console.log(`[UVA] ✅ Datos obtenidos. Valor actual: ${latestData.valor}`);

      return {
        nombre: 'UVA (Unidad de Valor Adquisitivo)',
        valor: parseFloat(latestData.valor) || 0,
        variacion: variacion,
        fecha: latestData.fecha,
        descripcion: 'Unidad de medida que refleja la inflación. Se utiliza principalmente en créditos hipotecarios.'
      };
    } catch (error) {
      console.error('[UVA] Error obteniendo datos:', error.message);
      
      // Devolver valores por defecto en caso de error
      return {
        nombre: 'UVA (Unidad de Valor Adquisitivo)',
        valor: 0,
        variacion: null,
        fecha: new Date().toISOString().split('T')[0],
        descripcion: 'Datos no disponibles temporalmente'
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

        // Obtener UVA e Inflación desde la API (ya que no están en la BD)
        const [uvaData, inflacionData] = await Promise.all([
          this.getUVAIndex(),
          this.getInflacionIndex()
        ]);
        result.uva = uvaData;
        result.inflacion = inflacionData;

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
      
      // Obtener UVA e Inflación desde la API (son independientes de la BD)
      const [uvaData, inflacionData] = await Promise.all([
        this.getUVAIndex(),
        this.getInflacionIndex()
      ]);

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
        uva: uvaData,
        inflacion: inflacionData,
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
        uva: {
          nombre: 'UVA (Unidad de Valor Adquisitivo)',
          valor: 0,
          variacion: 0,
          fecha: new Date().toISOString().split('T')[0],
          descripcion: 'Datos no disponibles'
        },
        inflacion: {
          nombre: 'Inflación Mensual',
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
   * Actualiza cotizaciones del dólar desde DolarAPI y guarda en base de datos
   * Se ejecuta periódicamente para mantener datos históricos
   */
  async updateDollarRatesFromAPI() {
    try {
      console.log('[DOLAR] Actualizando cotizaciones desde DolarAPI...');

      const response = await axios.get('https://dolarapi.com/v1/dolares', {
        timeout: 5000,
        headers: {
          'User-Agent': 'RIALTOR/1.0'
        }
      });

      const data = response.data;
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      try {
        const now = new Date();
        const today = now.toISOString().split('T')[0]; // YYYY-MM-DD

        // Procesar cada tipo de dólar
        const dollarTypes = ['oficial', 'blue', 'tarjeta'];
        let updatedCount = 0;

        for (const type of dollarTypes) {
          const dollarData = data.find(d => d.casa === type);
          if (dollarData && dollarData.compra && dollarData.venta) {
            // Verificar si ya existe un registro para el día actual (sin importar la hora)
            // Solo permitir UN registro por día
            const existingCompra = await prisma.economicIndex.findFirst({
              where: {
                indicator: `dolar${type.charAt(0).toUpperCase() + type.slice(1)}Compra`,
                date: {
                  gte: new Date(today + 'T00:00:00'),
                  lt: new Date(today + 'T23:59:59')
                }
              }
            });

            const existingVenta = await prisma.economicIndex.findFirst({
              where: {
                indicator: `dolar${type.charAt(0).toUpperCase() + type.slice(1)}Venta`,
                date: {
                  gte: new Date(today + 'T00:00:00'),
                  lt: new Date(today + 'T23:59:59')
                }
              }
            });

            // Solo guardar si no existe registro para el día de hoy
            if (!existingCompra) {
              await prisma.economicIndex.create({
                data: {
                  indicator: `dolar${type.charAt(0).toUpperCase() + type.slice(1)}Compra`,
                  value: parseFloat(dollarData.compra),
                  date: now,
                  description: `Dólar ${type} - Compra (${today})`
                }
              });
              updatedCount++;
            }

            if (!existingVenta) {
              await prisma.economicIndex.create({
                data: {
                  indicator: `dolar${type.charAt(0).toUpperCase() + type.slice(1)}Venta`,
                  value: parseFloat(dollarData.venta),
                  date: now,
                  description: `Dólar ${type} - Venta (${today})`
                }
              });
              updatedCount++;
            }
          }
        }

        console.log(`[DOLAR] ✅ Actualización completada. ${updatedCount} registros nuevos guardados.`);
        await prisma.$disconnect();

      } catch (dbError) {
        console.error('[DOLAR] Error guardando en base de datos:', dbError.message);
        await prisma.$disconnect();
      }

    } catch (error) {
      console.error('[DOLAR] Error obteniendo datos de DolarAPI:', error.message);
    }
  }

  /**
   * Obtiene datos históricos para gráficos de cotizaciones del dólar
   */
  async getDollarChart(dollarType, period = '30d') {
    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      try {
        console.log(`[DOLAR CHART] Obteniendo datos históricos para ${dollarType} desde la base de datos...`);

        // Calcular fechas según el período
        const endDate = new Date();
        const startDate = new Date();

        switch (period) {
          case '7d':
            startDate.setDate(startDate.getDate() - 7);
            break;
          case '30d':
            startDate.setDate(startDate.getDate() - 30);
            break;
          case '90d':
            startDate.setDate(startDate.getDate() - 90);
            break;
          case '1y':
            startDate.setFullYear(startDate.getFullYear() - 1);
            break;
          default:
            startDate.setDate(startDate.getDate() - 30);
        }

        // Obtener datos de compra y venta
        const compraIndicator = `dolar${dollarType.charAt(0).toUpperCase() + dollarType.slice(1)}Compra`;
        const ventaIndicator = `dolar${dollarType.charAt(0).toUpperCase() + dollarType.slice(1)}Venta`;

        const [compraData, ventaData] = await Promise.all([
          prisma.economicIndex.findMany({
            where: {
              indicator: compraIndicator,
              date: {
                gte: startDate,
                lte: endDate
              }
            },
            orderBy: { date: 'asc' }
          }),
          prisma.economicIndex.findMany({
            where: {
              indicator: ventaIndicator,
              date: {
                gte: startDate,
                lte: endDate
              }
            },
            orderBy: { date: 'asc' }
          })
        ]);

        if (compraData.length > 0 || ventaData.length > 0) {
          console.log(`[DOLAR CHART] ✅ Encontrados ${compraData.length} registros de compra y ${ventaData.length} de venta para ${dollarType}`);

          // Crear un mapa de fechas para combinar compra y venta
          const dataMap = new Map();

          // Agregar datos de compra
          compraData.forEach(record => {
            const dateKey = record.date.toISOString().split('T')[0];
            if (!dataMap.has(dateKey)) {
              dataMap.set(dateKey, { fecha: dateKey, compra: null, venta: null });
            }
            dataMap.get(dateKey).compra = record.value;
          });

          // Agregar datos de venta
          ventaData.forEach(record => {
            const dateKey = record.date.toISOString().split('T')[0];
            if (!dataMap.has(dateKey)) {
              dataMap.set(dateKey, { fecha: dateKey, compra: null, venta: null });
            }
            dataMap.get(dateKey).venta = record.value;
          });

          // Convertir el mapa a array ordenado por fecha
          const chartData = Array.from(dataMap.values()).sort((a, b) => a.fecha.localeCompare(b.fecha));

          await prisma.$disconnect();
          return {
            data: chartData,
            indicador: `Dólar ${dollarType}`,
            periodo: this.getPeriodDescription(period),
            dataSource: 'DATABASE'
          };
        }

        await prisma.$disconnect();
      } catch (dbError) {
        console.error(`[DOLAR CHART] Error al consultar la base de datos para ${dollarType}:`, dbError.message);
        await prisma.$disconnect();
      }

      // Fallback: intentar obtener datos de la API si no hay en DB
      console.log(`[DOLAR CHART] 📡 Intentando obtener datos de API para ${dollarType}`);
      try {
        const response = await axios.get(`https://dolarapi.com/v1/dolares/${dollarType}`, {
          timeout: 3000,
          headers: {
            'User-Agent': 'RIALTOR/1.0'
          }
        });

        if (response.data) {
          // DolarAPI no proporciona históricos directos, así que devolver solo el valor actual
          const chartData = [{
            fecha: new Date().toISOString().split('T')[0],
            compra: response.data.compra || 0,
            venta: response.data.venta || 0
          }];

          return {
            data: chartData,
            indicador: `Dólar ${dollarType}`,
            periodo: 'Valor actual (API)',
            dataSource: 'API'
          };
        }
      } catch (apiError) {
        console.error(`[DOLAR CHART] Error obteniendo datos de API para ${dollarType}:`, apiError.message);
      }

      // Último fallback: datos mock
      console.log(`[DOLAR CHART] 📊 Generando datos mock para ${dollarType}`);
      const mockData = [];
      const baseCompra = dollarType === 'oficial' ? 340 : dollarType === 'blue' ? 680 : 430;
      const baseVenta = dollarType === 'oficial' ? 350 : dollarType === 'blue' ? 700 : 450;
      let currentCompra = baseCompra;
      let currentVenta = baseVenta;

      const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;

      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);

        // Simular variación diaria pequeña
        const variation = (Math.random() - 0.5) * 0.02; // -1% to +1%
        currentCompra = currentCompra * (1 + variation);
        currentVenta = currentVenta * (1 + variation);

        mockData.push({
          fecha: date.toISOString().split('T')[0],
          compra: parseFloat(currentCompra.toFixed(2)),
          venta: parseFloat(currentVenta.toFixed(2))
        });
      }

      return {
        data: mockData,
        indicador: `Dólar ${dollarType}`,
        periodo: `${this.getPeriodDescription(period)} (datos simulados)`,
        dataSource: 'MOCK_DATA'
      };

    } catch (error) {
      console.error(`Error generating chart data for ${dollarType}:`, error.message);

      return {
        data: [],
        indicador: `Dólar ${dollarType}`,
        periodo: 'Datos no disponibles',
        dataSource: 'ERROR',
        error: `No se pudieron obtener los datos históricos para ${dollarType}`
      };
    }
  }

  /**
   * Obtiene datos de gráfico para índices económicos
   */
  async getEconomicIndexChart(indicator, period = '30d') {
    try {
      // Casos especiales: UVA e Inflación vienen de API externa, no de BD
      if (indicator === 'uva') {
        return await this.getUVAChartData(period);
      }
      if (indicator === 'inflacion') {
        return await this.getInflacionChartData(period);
      }

      console.log(`[ECONOMIC INDEX CHART] Obteniendo datos históricos para ${indicator} desde la base de datos...`);

      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      try {
        // Calcular fecha límite basada en el período
        const now = new Date();
        let startDate;

        switch (period) {
          case '7d':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case '30d':
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
          case '90d':
            startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            break;
          case '1y':
            startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
            break;
          default:
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        }

        // Obtener datos históricos del indicador
        const historicalData = await prisma.economicIndex.findMany({
          where: {
            indicator: indicator,
            date: {
              gte: startDate
            }
          },
          orderBy: {
            date: 'asc'
          },
          select: {
            date: true,
            value: true
          }
        });

        console.log(`[ECONOMIC INDEX CHART] ✅ Encontrados ${historicalData.length} registros para ${indicator}`);

        if (historicalData.length > 0) {
          // Formatear datos para el gráfico
          const chartData = historicalData.map(item => ({
            fecha: item.date.toISOString().split('T')[0],
            valor: parseFloat(item.value) || 0
          }));

          return {
            data: chartData,
            indicador: this.getIndicatorName(indicator),
            periodo: this.getPeriodDescription(period),
            dataSource: 'DATABASE'
          };
        }

        // Si no hay datos en el período solicitado, buscar los datos más recientes disponibles
        console.log(`[ECONOMIC INDEX CHART] No hay datos en el período ${period}, buscando datos históricos disponibles...`);
        const allHistoricalData = await prisma.economicIndex.findMany({
          where: {
            indicator: indicator
          },
          orderBy: {
            date: 'desc'
          },
          take: 90, // Últimos 90 registros más recientes
          select: {
            date: true,
            value: true
          }
        });

        if (allHistoricalData.length > 0) {
          console.log(`[ECONOMIC INDEX CHART] ✅ Encontrados ${allHistoricalData.length} registros históricos para ${indicator}`);

          // Formatear datos para el gráfico (ordenar por fecha ascendente)
          const chartData = allHistoricalData.reverse().map(item => ({
            fecha: item.date.toISOString().split('T')[0],
            valor: parseFloat(item.value) || 0
          }));

          return {
            data: chartData,
            indicador: this.getIndicatorName(indicator),
            periodo: `Datos históricos disponibles (${allHistoricalData.length} registros)`,
            dataSource: 'DATABASE_HISTORICAL'
          };
        }

      } catch (dbError) {
        console.error(`[ECONOMIC INDEX CHART] Error al consultar la base de datos para ${indicator}:`, dbError.message);
      } finally {
        await prisma.$disconnect();
      }

      // Si no hay datos en BD, devolver datos mock
      console.log(`[ECONOMIC INDEX CHART] 📊 Generando datos mock para ${indicator}`);

      const mockData = this.generateMockEconomicIndexData(indicator, period);

      return {
        data: mockData,
        indicador: this.getIndicatorName(indicator),
        periodo: this.getPeriodDescription(period),
        dataSource: 'MOCK'
      };

    } catch (error) {
      console.error(`Error generating chart data for ${indicator}:`, error.message);

      return {
        data: [],
        indicador: this.getIndicatorName(indicator),
        periodo: 'Datos no disponibles',
        dataSource: 'ERROR',
        error: `No se pudieron obtener los datos históricos para ${indicator}`
      };
    }
  }

  /**
   * Obtiene datos de gráfico para el índice de Inflación
   */
  async getInflacionChartData(period = '30d') {
    try {
      console.log(`[INFLACION CHART] Obteniendo datos históricos de Inflación...`);
      
      const response = await axios.get('https://api.argentinadatos.com/v1/finanzas/indices/inflacion/', {
        timeout: 10000,
        headers: {
          'User-Agent': 'RIALTOR/1.0'
        }
      });

      const allData = response.data;
      
      if (!allData || allData.length === 0) {
        throw new Error('No hay datos de inflación disponibles');
      }

      // Filtrar datos desde 2010 en adelante
      const dataFrom2010 = allData.filter(item => item.fecha >= '2010-01-01');

      // Filtrar datos según el período solicitado
      const now = new Date();
      let startDate;

      switch (period) {
        case '7d':
          // Para inflación (datos mensuales), 7 días no tiene sentido, usar 3 meses
          startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
          break;
        case '30d':
          // Mostrar últimos 12 meses
          startDate = new Date(now.getFullYear(), now.getMonth() - 12, 1);
          break;
        case '90d':
          // Mostrar últimos 24 meses
          startDate = new Date(now.getFullYear(), now.getMonth() - 24, 1);
          break;
        case '1y':
          // Mostrar últimos 5 años
          startDate = new Date(now.getFullYear() - 5, now.getMonth(), 1);
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth() - 12, 1);
      }

      // Filtrar y formatear datos
      const filteredData = dataFrom2010
        .filter(item => new Date(item.fecha) >= startDate)
        .map(item => ({
          fecha: item.fecha,
          valor: parseFloat(item.valor) || 0
        }));

      console.log(`[INFLACION CHART] ✅ Encontrados ${filteredData.length} registros para el período ${period}`);

      return {
        data: filteredData,
        indicador: 'Inflación Mensual',
        periodo: this.getPeriodDescription(period),
        dataSource: 'API_ARGENTINADATOS'
      };
    } catch (error) {
      console.error('[INFLACION CHART] Error obteniendo datos:', error.message);
      
      // Fallback a datos mock si falla la API
      console.log('[INFLACION CHART] 📊 Generando datos mock');
      const mockData = this.generateMockInflacionData(period);
      
      return {
        data: mockData,
        indicador: 'Inflación Mensual',
        periodo: `${this.getPeriodDescription(period)} (datos simulados)`,
        dataSource: 'MOCK'
      };
    }
  }

  /**
   * Genera datos mock para Inflación
   */
  generateMockInflacionData(period) {
    const now = new Date();
    const data = [];
    let months;

    switch (period) {
      case '7d': months = 3; break;
      case '30d': months = 12; break;
      case '90d': months = 24; break;
      case '1y': months = 60; break; // 5 años
      default: months = 12;
    }

    // Generar datos mensuales hacia atrás
    for (let i = months; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      // Simular inflación mensual entre 1% y 8%
      const baseInflation = 3.5;
      const variation = (Math.random() - 0.5) * 4; // ±2%
      const value = baseInflation + variation;

      data.push({
        fecha: date.toISOString().split('T')[0],
        valor: Math.round(value * 10) / 10
      });
    }

    return data;
  }

  /**
   * Obtiene datos de gráfico para el índice UVA
   */
  async getUVAChartData(period = '30d') {
    try {
      console.log(`[UVA CHART] Obteniendo datos históricos de UVA...`);
      
      const response = await axios.get('https://api.argentinadatos.com/v1/finanzas/indices/uva/', {
        timeout: 10000,
        headers: {
          'User-Agent': 'RIALTOR/1.0'
        }
      });

      const allData = response.data;
      
      if (!allData || allData.length === 0) {
        throw new Error('No hay datos de UVA disponibles');
      }

      // Filtrar datos según el período solicitado
      const now = new Date();
      let startDate;

      switch (period) {
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case '1y':
          startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
          break;
        default:
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      // Filtrar y formatear datos
      const filteredData = allData
        .filter(item => new Date(item.fecha) >= startDate)
        .map(item => ({
          fecha: item.fecha,
          valor: parseFloat(item.valor) || 0
        }));

      console.log(`[UVA CHART] ✅ Encontrados ${filteredData.length} registros para el período ${period}`);

      return {
        data: filteredData,
        indicador: 'UVA (Unidad de Valor Adquisitivo)',
        periodo: this.getPeriodDescription(period),
        dataSource: 'API_ARGENTINADATOS'
      };
    } catch (error) {
      console.error('[UVA CHART] Error obteniendo datos:', error.message);
      
      // Fallback a datos mock si falla la API
      console.log('[UVA CHART] 📊 Generando datos mock');
      const mockData = this.generateMockUVAData(period);
      
      return {
        data: mockData,
        indicador: 'UVA (Unidad de Valor Adquisitivo)',
        periodo: `${this.getPeriodDescription(period)} (datos simulados)`,
        dataSource: 'MOCK'
      };
    }
  }

  /**
   * Genera datos mock para UVA
   */
  generateMockUVAData(period) {
    const now = new Date();
    const data = [];
    let days;

    switch (period) {
      case '7d': days = 7; break;
      case '30d': days = 30; break;
      case '90d': days = 90; break;
      case '1y': days = 365; break;
      default: days = 30;
    }

    const baseValue = 1050.5; // Valor aproximado actual del UVA

    for (let i = days; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      // Simular crecimiento gradual con pequeña variación
      const dailyGrowth = 0.0015; // ~0.15% diario promedio
      const variation = (Math.random() - 0.5) * 0.002; // ±0.1% aleatorio
      const value = baseValue * Math.pow(1 + dailyGrowth + variation, days - i);

      data.push({
        fecha: date.toISOString().split('T')[0],
        valor: Math.round(value * 100) / 100
      });
    }

    return data;
  }

  /**
   * Obtiene el nombre descriptivo del indicador
   */
  getIndicatorName(indicator) {
    const names = {
      'ipc': 'IPC (Índice de Precios al Consumidor)',
      'inflacion': 'Inflación Mensual',
      'cacGeneral': 'CAC General',
      'cacMateriales': 'CAC Materiales',
      'cacManoObra': 'CAC Mano de Obra',
      'icc': 'ICC (Índice de Costos de Construcción)',
      'is': 'IS (Índice de Salarios)',
      'uva': 'UVA (Unidad de Valor Adquisitivo)',
      'dolarOficialCompra': 'Dólar Oficial Compra',
      'dolarOficialVenta': 'Dólar Oficial Venta',
      'dolarBlueCompra': 'Dólar Blue Compra',
      'dolarBlueVenta': 'Dólar Blue Venta',
      'dolarTarjetaCompra': 'Dólar Tarjeta Compra',
      'dolarTarjetaVenta': 'Dólar Tarjeta Venta'
    };
    return names[indicator] || indicator;
  }

  /**
   * Genera datos mock para índices económicos
   */
  generateMockEconomicIndexData(indicator, period) {
    const now = new Date();
    const data = [];
    let days;

    switch (period) {
      case '7d': days = 7; break;
      case '30d': days = 30; break;
      case '90d': days = 90; break;
      case '1y': days = 365; break;
      default: days = 30;
    }

    // Valores base para diferentes indicadores
    const baseValues = {
      'ipc': 1500,
      'inflacion': 3.5,
      'cacGeneral': 1200,
      'cacMateriales': 1100,
      'cacManoObra': 1300,
      'icc': 1400,
      'is': 1600,
      'uva': 1050
    };

    const baseValue = baseValues[indicator] || 1000;

    for (let i = days; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      // Generar variación aleatoria pequeña
      const variation = (Math.random() - 0.5) * 0.02; // ±1%
      const value = baseValue * (1 + variation);

      data.push({
        fecha: date.toISOString().split('T')[0],
        valor: Math.round(value * 100) / 100
      });
    }

    return data;
  }

  /**
   * Obtiene descripción del período
   */
  getPeriodDescription(period) {
    const descriptions = {
      '7d': 'Últimos 7 días',
      '30d': 'Últimos 30 días',
      '90d': 'Últimos 90 días',
      '1y': 'Último año'
    };
    return descriptions[period] || 'Período personalizado';
  }
}

module.exports = new EconomicIndicatorsService();
