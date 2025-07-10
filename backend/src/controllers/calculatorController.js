const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Configuración de provincias argentinas y sus alícuotas de sellos por defecto
const PROVINCIAS_ARGENTINA = {
  'buenos_aires': { name: 'Buenos Aires', defaultStampRate: 1.2 },
  'caba': { name: 'Ciudad Autónoma de Buenos Aires', defaultStampRate: 1.5 },
  'catamarca': { name: 'Catamarca', defaultStampRate: 1.0 },
  'chaco': { name: 'Chaco', defaultStampRate: 1.0 },
  'chubut': { name: 'Chubut', defaultStampRate: 1.0 },
  'cordoba': { name: 'Córdoba', defaultStampRate: 1.2 },
  'corrientes': { name: 'Corrientes', defaultStampRate: 1.0 },
  'entre_rios': { name: 'Entre Ríos', defaultStampRate: 1.0 },
  'formosa': { name: 'Formosa', defaultStampRate: 1.0 },
  'jujuy': { name: 'Jujuy', defaultStampRate: 1.0 },
  'la_pampa': { name: 'La Pampa', defaultStampRate: 1.0 },
  'la_rioja': { name: 'La Rioja', defaultStampRate: 1.0 },
  'mendoza': { name: 'Mendoza', defaultStampRate: 1.5 },
  'misiones': { name: 'Misiones', defaultStampRate: 1.0 },
  'neuquen': { name: 'Neuquén', defaultStampRate: 1.0 },
  'rio_negro': { name: 'Río Negro', defaultStampRate: 1.0 },
  'salta': { name: 'Salta', defaultStampRate: 1.0 },
  'san_juan': { name: 'San Juan', defaultStampRate: 1.0 },
  'san_luis': { name: 'San Luis', defaultStampRate: 1.0 },
  'santa_cruz': { name: 'Santa Cruz', defaultStampRate: 1.0 },
  'santa_fe': { name: 'Santa Fe', defaultStampRate: 1.2 },
  'santiago_del_estero': { name: 'Santiago del Estero', defaultStampRate: 1.0 },
  'tierra_del_fuego': { name: 'Tierra del Fuego', defaultStampRate: 1.0 },
  'tucuman': { name: 'Tucumán', defaultStampRate: 1.0 }
};

// Obtener configuraciones de calculadora
const getCalculatorConfigs = async (req, res) => {
  try {
    const configs = await prisma.calculatorConfig.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });

    res.json({
      success: true,
      data: configs
    });
  } catch (error) {
    console.error('Error getting calculator configs:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener configuraciones de calculadora',
      error: error.message
    });
  }
};

// Obtener provincias argentinas
const getProvincias = async (req, res) => {
  try {
    const provincias = Object.entries(PROVINCIAS_ARGENTINA).map(([key, value]) => ({
      key,
      name: value.name,
      defaultStampRate: value.defaultStampRate
    }));

    res.json({
      success: true,
      data: provincias
    });
  } catch (error) {
    console.error('Error getting provinces:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener provincias',
      error: error.message
    });
  }
};

// Calculadora de comisiones
const calculateCommission = async (req, res) => {
  try {
    const { 
      saleAmount, 
      commissionRate, 
      zone, 
      isIndependent,
      province,
      stampRate,
      ivaRate,
      incomeTaxRate,
      iibbRate,
      otherRate
    } = req.body;

    // Validaciones
    if (!saleAmount || saleAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'El monto de venta debe ser mayor a 0'
      });
    }

    if (!commissionRate || commissionRate <= 0 || commissionRate > 100) {
      return res.status(400).json({
        success: false,
        message: 'La comisión debe estar entre 0 y 100%'
      });
    }

    const amount = Math.round(parseFloat(saleAmount));
    const rate = parseFloat(commissionRate);
    const stampsRate = parseFloat(stampRate) || 0;
    
    console.log('Received saleAmount:', saleAmount, 'Parsed amount:', amount);
    
    // Validar que los porcentajes sean números válidos, usar 0 si no lo son
    const ivaPercentage = isNaN(parseFloat(ivaRate)) ? 0 : parseFloat(ivaRate);
    const incomeTaxPercentage = isNaN(parseFloat(incomeTaxRate)) ? 0 : parseFloat(incomeTaxRate);
    const iibbPercentage = isNaN(parseFloat(iibbRate)) ? 0 : parseFloat(iibbRate);
    const otherPercentage = isNaN(parseFloat(otherRate)) ? 0 : parseFloat(otherRate);

    // Cálculo de comisión bruta
    const grossCommission = (amount * rate) / 100;

    // Cálculos de impuestos - Solo calcular si la alícuota es mayor a 0
    const baseForTaxes = amount; // Base para impuestos es el VALOR DE LA OPERACIÓN
    
    // IVA sobre el valor de la operación (solo si factura Y la alícuota es > 0)
    const iva = ivaPercentage > 0 ? (baseForTaxes * (ivaPercentage / 100)) : 0;
    
    // Ganancias sobre el valor de la operación (solo si es independiente Y configura el porcentaje > 0)
    const incomeTax = (isIndependent && incomeTaxPercentage > 0) ? (baseForTaxes * (incomeTaxPercentage / 100)) : 0;
    
    // IIBB sobre el valor de la operación (solo si la alícuota es > 0)
    const iibb = iibbPercentage > 0 ? (baseForTaxes * (iibbPercentage / 100)) : 0;
    
    // Sellos sobre el valor de la operación (solo si la alícuota es > 0)
    const stamps = stampsRate > 0 ? (baseForTaxes * stampsRate) / 100 : 0;
    
    // Otros gastos sobre el valor de la operación (solo si la alícuota es > 0)
    const other = otherPercentage > 0 ? (baseForTaxes * (otherPercentage / 100)) : 0;

    // Total de impuestos y gastos
    const totalTaxes = iva + incomeTax + iibb + stamps + other;

    // Crear objeto de detalles solo con los impuestos que tienen valor > 0
    const taxDetails = {};
    if (iva > 0) taxDetails.iva = iva;
    if (incomeTax > 0) taxDetails.incomeTax = incomeTax;
    if (iibb > 0) taxDetails.iibb = iibb;
    if (stamps > 0) taxDetails.stamps = stamps;
    if (other > 0) taxDetails.other = other;

    console.log('Tax calculations:', {
      ivaPercentage,
      iibbPercentage,
      incomeTaxPercentage,
      iva,
      iibb,
      incomeTax,
      stamps,
      other
    });

    const result = {
      saleAmount: amount,
      commissionRate: rate,
      zone,
      province,
      stampRate: stampsRate,
      ivaRate: ivaPercentage,
      incomeTaxRate: incomeTaxPercentage,
      iibbRate: iibbPercentage,
      otherRate: otherPercentage,
      isIndependent,
      grossCommission,
      taxes: {
        iva,
        incomeTax,
        iibb,
        stamps,
        other,
        total: totalTaxes
      },
      details: {
        grossCommission,
        ...taxDetails,
        totalTaxes
      }
    };

    // Guardar en historial si hay usuario logueado
    if (req.user) {        await prisma.calculatorHistory.create({
          data: {
            type: 'COMMISSION',
            inputs: JSON.stringify({
              saleAmount: amount,
              commissionRate: rate,
              zone,
              province,
              stampRate: stampsRate,
              ivaRate: ivaPercentage,
              incomeTaxRate: incomeTaxPercentage,
              iibbRate: iibbPercentage,
              otherRate: otherPercentage,
              isIndependent
            }),
            result: JSON.stringify(result),
            userId: req.user.id
          }
        });
    }

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error calculating commission:', error);
    res.status(500).json({
      success: false,
      message: 'Error al calcular comisión',
      error: error.message
    });
  }
};

// Calculadora de impuestos
const calculateTaxes = async (req, res) => {
  try {
    const { 
      amount, 
      taxType, 
      province,
      stampRate
    } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'El monto debe ser mayor a 0'
      });
    }

    const value = parseFloat(amount);
    const stampsRate = parseFloat(stampRate) || 0;

    let result = {};

    switch (taxType) {
      case 'STAMPS':
        result = {
          amount: value,
          province,
          stampRate: stampsRate,
          stamps: (value * stampsRate) / 100,
          total: value + (value * stampsRate) / 100
        };
        break;
      
      case 'ITI':
        const itiRate = 1.5; // 1.5% ITI
        result = {
          amount: value,
          itiRate,
          iti: (value * itiRate) / 100,
          total: value + (value * itiRate) / 100
        };
        break;
      
      case 'REGISTRATION':
        const registrationRate = 0.3; // 0.3% Registro
        result = {
          amount: value,
          registrationRate,
          registration: (value * registrationRate) / 100,
          total: value + (value * registrationRate) / 100
        };
        break;
      
      default:
        return res.status(400).json({
          success: false,
          message: 'Tipo de impuesto no válido'
        });
    }

    // Guardar en historial si hay usuario logueado
    if (req.user) {
      await prisma.calculatorHistory.create({
        data: {
          type: taxType,
          inputs: JSON.stringify({
            amount: value,
            taxType,
            province,
            stampRate: stampsRate
          }),
          result: JSON.stringify(result),
          userId: req.user.id
        }
      });
    }

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error calculating taxes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al calcular impuestos',
      error: error.message
    });
  }
};

// Obtener historial de cálculos
const getCalculatorHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10, type } = req.query;
    const skip = (page - 1) * limit;

    const where = {
      userId: req.user.id,
      ...(type && { type })
    };

    const [history, total] = await Promise.all([
      prisma.calculatorHistory.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: parseInt(skip),
        take: parseInt(limit)
      }),
      prisma.calculatorHistory.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        history,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error getting calculator history:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener historial',
      error: error.message
    });
  }
};

module.exports = {
  getCalculatorConfigs,
  getProvincias,
  calculateCommission,
  calculateTaxes,
  getCalculatorHistory
};
