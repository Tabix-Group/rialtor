const axios = require('axios');

class EconomicIndicatorsService {
  constructor() {
    // Cache para evitar demasiadas peticiones
    this.cache = {
      dolarData: null,
      realEstateData: null,
      lastUpdate: {
        dolar: null,
        realEstate: null
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
        timeout: 5000
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
   * Obtiene todos los indicadores
   */
  async getAllIndicators() {
    const [dolarData, realEstateData] = await Promise.all([
      this.getDolarRates(),
      this.getRealEstateData()
    ]);

    return {
      dolar: dolarData,
      mercadoInmobiliario: realEstateData,
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
      lastUpdate: {
        dolar: null,
        realEstate: null
      }
    };
  }
}

module.exports = new EconomicIndicatorsService();
