const economicIndicatorsService = require('../services/economicIndicatorsService');

/**
 * Obtiene las cotizaciones del dólar
 */
exports.getDolarRates = async (req, res, next) => {
  try {
    const data = await economicIndicatorsService.getDolarRates();
    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error in getDolarRates controller:', error.message);
    // No pasar el error al middleware, devolver una respuesta con error
    res.status(200).json({
      success: false,
      error: 'No se pudieron obtener las cotizaciones del dólar',
      data: {
        oficial: { compra: 0, venta: 0, variacion: 0, fechaActualizacion: new Date().toISOString() },
        blue: { compra: 0, venta: 0, variacion: 0, fechaActualizacion: new Date().toISOString() },
        tarjeta: { compra: 0, venta: 0, variacion: 0, fechaActualizacion: new Date().toISOString() },
        lastUpdated: new Date().toISOString()
      }
    });
  }
};

/**
 * Obtiene datos del mercado inmobiliario
 */
exports.getRealEstateData = async (req, res, next) => {
  try {
    const data = await economicIndicatorsService.getRealEstateData();
    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error in getRealEstateData controller:', error.message);
    res.status(200).json({
      success: false,
      error: 'No se pudieron obtener los datos inmobiliarios',
      data: {
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
        lastUpdated: new Date().toISOString()
      }
    });
  }
};

/**
 * Obtiene todos los indicadores económicos e inmobiliarios
 */
exports.getAllIndicators = async (req, res, next) => {
  try {
    const data = await economicIndicatorsService.getAllIndicators();
    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error in getAllIndicators controller:', error.message);
    res.status(200).json({
      success: false,
      error: 'No se pudieron obtener los indicadores',
      data: {
        dolar: {
          oficial: { compra: 0, venta: 0, variacion: 0, fechaActualizacion: new Date().toISOString() },
          blue: { compra: 0, venta: 0, variacion: 0, fechaActualizacion: new Date().toISOString() },
          tarjeta: { compra: 0, venta: 0, variacion: 0, fechaActualizacion: new Date().toISOString() },
          lastUpdated: new Date().toISOString()
        },
        mercadoInmobiliario: {
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
          lastUpdated: new Date().toISOString()
        },
        indicesEconomicos: {
          ipc: null,
          cac: {
            general: null,
            materiales: null,
            manoObra: null
          },
          icc: null,
          is: null,
          lastUpdated: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      }
    });
  }
};

/**
 * Limpia el cache de indicadores (solo admin)
 */
exports.clearCache = async (req, res, next) => {
  try {
    economicIndicatorsService.clearCache();
    res.json({
      success: true,
      message: 'Cache cleared successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtiene índices económicos de Argentina
 */
exports.getEconomicIndexes = async (req, res, next) => {
  try {
    const data = await economicIndicatorsService.getEconomicIndexes();
    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error in getEconomicIndexes controller:', error.message);
    res.status(200).json({
      success: false,
      error: 'No se pudieron obtener los índices económicos',
      data: {
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
        lastUpdated: new Date().toISOString()
      }
    });
  }
};

/**
 * Obtiene datos de gráfico para un índice económico específico
 */
exports.getEconomicIndexChart = async (req, res, next) => {
  try {
    const { indicator } = req.params;
    const data = await economicIndicatorsService.getEconomicIndexChart(indicator);

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error in getEconomicIndexChart controller:', error.message);
    res.status(200).json({
      success: false,
      error: 'No se pudieron obtener los datos del gráfico',
      data: {
        data: [],
        indicador: req.params.indicator,
        periodo: 'Error al cargar datos',
        dataSource: 'ERROR'
      }
    });
  }
};
