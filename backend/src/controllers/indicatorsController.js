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
    next(error);
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
    next(error);
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
    next(error);
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
