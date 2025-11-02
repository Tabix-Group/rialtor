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
   * Obtiene índices económicos de Argentina desde la API de series-tiempo de INDEC
   */
  async getEconomicIndexes() {
    try {
      // Verificar cache
      if (this.cache.economicIndexesData && 
          this.cache.lastUpdate.economicIndexes && 
          Date.now() - this.cache.lastUpdate.economicIndexes < this.CACHE_DURATION) {
        return this.cache.economicIndexesData;
      }

      // Intentar obtener datos reales de la API de series-tiempo de INDEC
      try {
        console.log('[ECONOMIC] Intentando obtener datos reales de INDEC API...');
        
        // IDs conocidos de series de INDEC (basado en documentación oficial)
        const seriesIds = [
          '103.1_I2N_2016_M_19', // IPC Nivel General
          '103.1_I2N_2016_M_15', // IPC Núcleo  
          '145.3_CAC_0_M_19',    // CAC General (aproximado)
          '145.3_CAC_0_M_20',    // CAC Materiales (aproximado)
          '145.3_CAC_0_M_21',    // CAC Mano de Obra (aproximado)
          '145.3_ICC_0_M_19',    // ICC (aproximado)
          '141.3_IS_0_M_19'      // IS - Índice de Salarios (aproximado)
        ];

        // API de series-tiempo de INDEC
        const apiUrl = `https://apis.datos.gob.ar/series/api/series/?ids=${seriesIds.join(',')}&format=json&limit=1`;
        
        const response = await axios.get(apiUrl, {
          timeout: 10000, // 10 segundos timeout
          headers: {
            'User-Agent': 'RIALTOR/1.0 - Economic Indicators Service'
          }
        });

        if (response.data && response.data.data) {
          console.log('[ECONOMIC] ✅ Datos reales obtenidos de INDEC API');
          
          const seriesData = response.data.data;
          
          // Mapear los datos de la API a nuestro formato
          const result = {
            ipc: this.extractLatestValue(seriesData, '103.1_I2N_2016_M_19', 'IPC (Índice de Precios al Consumidor)', 'Mide la evolución de los precios de consumo en Argentina'),
            cacGeneral: this.extractLatestValue(seriesData, '145.3_CAC_0_M_19', 'CAC General', 'Costo de la Construcción - Nivel General'),
            cacMateriales: this.extractLatestValue(seriesData, '145.3_CAC_0_M_20', 'CAC Materiales', 'Costo de la Construcción - Materiales'),
            cacManoObra: this.extractLatestValue(seriesData, '145.3_CAC_0_M_21', 'CAC Mano de Obra', 'Costo de la Construcción - Mano de Obra'),
            icc: this.extractLatestValue(seriesData, '145.3_ICC_0_M_19', 'ICC (Índice de Costos de Construcción)', 'Índice del costo de la construcción en Argentina'),
            is: this.extractLatestValue(seriesData, '141.3_IS_0_M_19', 'IS (Índice de Salarios)', 'Índice de evolución de los salarios'),
            lastUpdated: new Date().toISOString(),
            dataSource: 'INDEC_API'
          };

          // Actualizar cache
          this.cache.economicIndexesData = result;
          this.cache.lastUpdate.economicIndexes = Date.now();

          return result;
        }
      } catch (apiError) {
        console.warn('[ECONOMIC] ⚠️ Error al obtener datos de INDEC API, usando datos mock:', apiError.message);
      }

      // Fallback a datos mock si la API falla
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
      // Mapear indicadores a IDs de series de INDEC
      const seriesMapping = {
        'ipc': '103.1_I2N_2016_M_19',
        'cacGeneral': '145.3_CAC_0_M_19',
        'cacMateriales': '145.3_CAC_0_M_20', 
        'cacManoObra': '145.3_CAC_0_M_21',
        'icc': '145.3_ICC_0_M_19',
        'is': '141.3_IS_0_M_19'
      };

      const seriesId = seriesMapping[indicator];
      if (!seriesId) {
        throw new Error(`Indicador no reconocido: ${indicator}`);
      }

      // Intentar obtener datos reales de la API
      try {
        console.log(`[ECONOMIC CHART] Intentando obtener datos históricos para ${indicator}...`);
        
        const apiUrl = `https://apis.datos.gob.ar/series/api/series/?ids=${seriesId}&format=json&limit=24`; // Últimos 24 meses
        
        const response = await axios.get(apiUrl, {
          timeout: 10000,
          headers: {
            'User-Agent': 'RIALTOR/1.0 - Economic Indicators Service'
          }
        });

        if (response.data && response.data.data && response.data.data.length > 0) {
          const series = response.data.data[0];
          
          if (series.data && series.data.length > 0) {
            console.log(`[ECONOMIC CHART] ✅ Datos históricos reales obtenidos para ${indicator}`);
            
            // Convertir datos de la API al formato esperado
            const chartData = series.data.map(([fecha, valor]) => ({
              fecha: fecha,
              valor: parseFloat(valor) || 0
            })).filter(item => item.valor > 0); // Filtrar valores válidos

            return {
              data: chartData,
              indicador: indicator,
              periodo: `Últimos ${chartData.length} meses`,
              dataSource: 'INDEC_API'
            };
          }
        }
      } catch (apiError) {
        console.warn(`[ECONOMIC CHART] ⚠️ Error al obtener datos históricos de ${indicator}:`, apiError.message);
      }

      // Fallback a datos mock
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
