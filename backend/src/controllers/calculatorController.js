// Calculadora de honorarios de escribano
const calculateEscribano = async (req, res) => {
  try {
    const { saleAmount, escrituraAmount, buyerRate = 2, sellerRate = 0 } = req.body;
    // saleAmount: monto de venta, escrituraAmount: monto de escritura (puede ser igual o menor)
    // buyerRate y sellerRate: % sugerido para cada parte
    if (!saleAmount || saleAmount <= 0) {
      return res.status(400).json({ success: false, message: 'El monto de venta debe ser mayor a 0' });
    }
    const venta = parseFloat(saleAmount);
    const escritura = escrituraAmount ? parseFloat(escrituraAmount) : venta;
    const comprador = (escritura * (parseFloat(buyerRate) / 100));
    const vendedor = (escritura * (parseFloat(sellerRate) / 100));
    res.json({
      success: true,
      data: {
        escrituraAmount: escritura,
        buyerRate: parseFloat(buyerRate),
        sellerRate: parseFloat(sellerRate),
        comprador,
        vendedor,
        total: comprador + vendedor
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al calcular honorarios escribano', error: error.message });
  }
};

// Calculadora de otros gastos
const calculateOtrosGastos = async (req, res) => {
  try {
    const { escrituraAmount, buyerRate = 0.6, sellerRate = 0.8 } = req.body;
    if (!escrituraAmount || escrituraAmount <= 0) {
      return res.status(400).json({ success: false, message: 'El monto de escritura debe ser mayor a 0' });
    }
    const escritura = parseFloat(escrituraAmount);
    const comprador = escritura * (parseFloat(buyerRate) / 100);
    const vendedor = escritura * (parseFloat(sellerRate) / 100);
    res.json({
      success: true,
      data: {
        escrituraAmount: escritura,
        buyerRate: parseFloat(buyerRate),
        sellerRate: parseFloat(sellerRate),
        comprador,
        vendedor,
        total: comprador + vendedor
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al calcular otros gastos', error: error.message });
  }
};

// Calculadora de impuesto a la ganancia inmobiliaria (cédula)
const calculateGananciaInmobiliaria = async (req, res) => {
  try {
    const { saleAmount, purchaseAmount, mejoras = 0, gastos = 0 } = req.body;
    // saleAmount: precio de venta, purchaseAmount: precio de compra, mejoras: mejoras declaradas, gastos: gastos deducibles
    if (!saleAmount || saleAmount <= 0 || !purchaseAmount || purchaseAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Debe ingresar precio de venta y compra válidos' });
    }
    const venta = parseFloat(saleAmount);
    const compra = parseFloat(purchaseAmount);
    const mejorasVal = parseFloat(mejoras) || 0;
    const gastosVal = parseFloat(gastos) || 0;
    const base = venta - (compra + mejorasVal + gastosVal);
    const impuesto = base > 0 ? base * 0.15 : 0;
    res.json({
      success: true,
      data: {
        saleAmount: venta,
        purchaseAmount: compra,
        mejoras: mejorasVal,
        gastos: gastosVal,
        baseImponible: base,
        impuestoGanancia: impuesto
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al calcular impuesto a la ganancia inmobiliaria', error: error.message });
  }
};
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
      otherRate,
      isOnlyHome,
      cotizacionUsdOficial
    } = req.body;

    // Validaciones
    const {
      dealType,
      buyerType,
      sellerType
    } = req.body;
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

    const amount = parseFloat(saleAmount);
    const rate = parseFloat(commissionRate);
    let stampsRate = parseFloat(stampRate) || 0;

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
    let stamps = 0;
    let exencionCabaPesos = 226100000; // Tope de exención en pesos
    let exencionCabaUsd = null;
    if (province === 'caba') {
      if (buyerType === 'juridica' || sellerType === 'juridica') {
        stampsRate = 3.5;
      } else {
        stampsRate = 1.5;
        // Exención por única vivienda en CABA
        if (isOnlyHome && cotizacionUsdOficial && !isNaN(Number(cotizacionUsdOficial))) {
          exencionCabaUsd = exencionCabaPesos / Number(cotizacionUsdOficial);
        }
      }
    } else if (province === 'buenos_aires') {
      if (buyerType === 'juridica' || sellerType === 'juridica') {
        stampsRate = 2;
      } else {
        stampsRate = 1.2;
      }
    }
    // Si el usuario ingresó manualmente una tasa diferente, se respeta
    if (!isNaN(parseFloat(stampRate)) && parseFloat(stampRate) !== stampsRate) {
      stampsRate = parseFloat(stampRate);
    }
    if (stampsRate > 0) {
      // Exención por única vivienda en CABA
      if (province === 'caba' && buyerType === 'fisica' && sellerType === 'fisica' && isOnlyHome && exencionCabaUsd) {
        if (amount <= exencionCabaUsd) {
          stamps = 0;
        } else {
          stamps = ((amount - exencionCabaUsd) * stampsRate) / 100;
        }
      } else {
        stamps = (baseForTaxes * stampsRate) / 100;
      }
    }

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
    if (req.user) {
      await prisma.calculatorHistory.create({
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

// Calculadora de créditos hipotecarios
const calculateMortgage = async (req, res) => {
  try {
    const { loanAmount, interestRate, termYears, bankName } = req.body;

    if (!loanAmount || loanAmount <= 0) {
      return res.status(400).json({ success: false, message: 'El monto del préstamo debe ser mayor a 0' });
    }

    if (!interestRate || interestRate <= 0) {
      return res.status(400).json({ success: false, message: 'La tasa de interés debe ser mayor a 0' });
    }

    if (!termYears || termYears <= 0) {
      return res.status(400).json({ success: false, message: 'El plazo debe ser mayor a 0' });
    }

    const principal = parseFloat(loanAmount);
    const annualRate = parseFloat(interestRate);
    const monthlyRate = annualRate / 100 / 12; // Convertir a tasa mensual
    const termMonths = parseInt(termYears) * 12;

    // Fórmula de amortización francesa
    const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / (Math.pow(1 + monthlyRate, termMonths) - 1);

    // Calcular total a pagar
    const totalPayment = monthlyPayment * termMonths;
    const totalInterest = totalPayment - principal;

    // Generar tabla de amortización (primeros 12 meses y último mes)
    const amortizationTable = [];
    let remainingBalance = principal;

    for (let month = 1; month <= Math.min(termMonths, 12); month++) {
      const interestPayment = remainingBalance * monthlyRate;
      const principalPayment = monthlyPayment - interestPayment;
      remainingBalance -= principalPayment;

      amortizationTable.push({
        month,
        payment: monthlyPayment,
        principal: principalPayment,
        interest: interestPayment,
        balance: Math.max(0, remainingBalance)
      });
    }

    // Si el plazo es mayor a 12 meses, agregar el último mes
    if (termMonths > 12) {
      let balance = principal;
      for (let month = 1; month < termMonths; month++) {
        const interestPayment = balance * monthlyRate;
        const principalPayment = monthlyPayment - interestPayment;
        balance -= principalPayment;
      }

      const lastMonthInterest = balance * monthlyRate;
      const lastMonthPrincipal = monthlyPayment - lastMonthInterest;

      amortizationTable.push({
        month: termMonths,
        payment: monthlyPayment,
        principal: lastMonthPrincipal,
        interest: lastMonthInterest,
        balance: 0
      });
    }

    const result = {
      loanAmount: principal,
      interestRate: annualRate,
      termYears: parseInt(termYears),
      termMonths,
      monthlyPayment,
      totalPayment,
      totalInterest,
      bankName: bankName || 'Sin especificar',
      amortizationTable
    };

    // Guardar en historial si hay usuario logueado
    if (req.user) {
      await prisma.calculatorHistory.create({
        data: {
          type: 'MORTGAGE',
          inputs: JSON.stringify({
            loanAmount: principal,
            interestRate: annualRate,
            termYears: parseInt(termYears),
            bankName
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
    console.error('Error calculating mortgage:', error);
    res.status(500).json({
      success: false,
      message: 'Error al calcular crédito hipotecario',
      error: error.message
    });
  }
};

// Calculadora de días hábiles
const calculateDays = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;

    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'Debe proporcionar fecha de inicio y fin' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ success: false, message: 'Fechas inválidas' });
    }

    if (start > end) {
      return res.status(400).json({ success: false, message: 'La fecha de inicio debe ser anterior a la fecha de fin' });
    }

    // Calcular días de corrido (incluyendo inicio y fin)
    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    // Calcular días hábiles y detalles
    const Holidays = require('date-holidays');
    const hd = new Holidays('AR'); // Argentina

    let businessDays = 0;
    const holidays = [];
    let weekendCount = 0;

    const currentDate = new Date(start);

    while (currentDate <= end) {
      const dayOfWeek = currentDate.getDay(); // 0 = Domingo, 6 = Sábado
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const holidayInfo = hd.isHoliday(currentDate);

      if (isWeekend) {
        weekendCount++;
      } else if (holidayInfo) {
        holidays.push({
          date: currentDate.toISOString().split('T')[0],
          day: currentDate.toLocaleDateString('es-AR', { weekday: 'long' }),
          reason: holidayInfo.name || 'Feriado',
          type: holidayInfo.type || 'public'
        });
      } else {
        businessDays++;
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    const result = {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
      totalDays,
      businessDays,
      nonBusinessDays: {
        total: weekendCount + holidays.length,
        weekends: weekendCount,
        holidays: holidays.length,
        details: holidays // Solo feriados en la lista detallada
      },
      holidays: holidays,
      weekends: weekendCount
    };

    // Guardar en historial si hay usuario logueado
    if (req.user) {
      await prisma.calculatorHistory.create({
        data: {
          type: 'DAYS',
          inputs: JSON.stringify({
            startDate: start.toISOString().split('T')[0],
            endDate: end.toISOString().split('T')[0]
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
    console.error('Error calculating days:', error);
    res.status(500).json({
      success: false,
      message: 'Error al calcular días',
      error: error.message
    });
  }
};

// Calcular fecha de vencimiento dado fecha inicial y cantidad de días hábiles
const calculateDueDate = async (req, res) => {
  try {
    const { startDate, businessDaysCount } = req.body;

    if (!startDate) {
      return res.status(400).json({ success: false, message: 'Debe proporcionar una fecha de inicio' });
    }

    if (!businessDaysCount || businessDaysCount <= 0) {
      return res.status(400).json({ success: false, message: 'Debe proporcionar una cantidad válida de días hábiles (mayor a 0)' });
    }

    if (businessDaysCount > 365) {
      return res.status(400).json({ success: false, message: 'La cantidad máxima de días hábiles es 365' });
    }

    const start = new Date(startDate);

    if (isNaN(start.getTime())) {
      return res.status(400).json({ success: false, message: 'Fecha de inicio inválida' });
    }

    // Calcular fecha de vencimiento
    const Holidays = require('date-holidays');
    const hd = new Holidays('AR'); // Argentina

    let businessDaysAdded = 0;
    const holidays = [];
    let weekendCount = 0;
    let totalCalendarDays = 0;

    const currentDate = new Date(start);
    currentDate.setDate(currentDate.getDate() + 1); // Empezamos desde el día siguiente

    while (businessDaysAdded < businessDaysCount) {
      totalCalendarDays++;
      const dayOfWeek = currentDate.getDay(); // 0 = Domingo, 6 = Sábado
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const holidayInfo = hd.isHoliday(currentDate);

      if (isWeekend) {
        weekendCount++;
      } else if (holidayInfo) {
        holidays.push({
          date: currentDate.toISOString().split('T')[0],
          day: currentDate.toLocaleDateString('es-AR', { weekday: 'long' }),
          reason: Array.isArray(holidayInfo) ? holidayInfo[0].name : (holidayInfo.name || 'Feriado'),
          type: Array.isArray(holidayInfo) ? holidayInfo[0].type : (holidayInfo.type || 'public')
        });
      } else {
        businessDaysAdded++;
      }

      if (businessDaysAdded < businessDaysCount) {
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    const endDate = currentDate;

    const result = {
      startDate: start.toISOString().split('T')[0],
      dueDate: endDate.toISOString().split('T')[0],
      businessDaysRequested: parseInt(businessDaysCount),
      totalCalendarDays,
      nonBusinessDays: {
        total: weekendCount + holidays.length,
        weekends: weekendCount,
        holidays: holidays.length,
        details: holidays
      },
      holidays: holidays,
      weekends: weekendCount
    };

    // Guardar en historial si hay usuario logueado
    if (req.user) {
      await prisma.calculatorHistory.create({
        data: {
          type: 'DUE_DATE',
          inputs: JSON.stringify({
            startDate: start.toISOString().split('T')[0],
            businessDaysCount: parseInt(businessDaysCount)
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
    console.error('Error calculating due date:', error);
    res.status(500).json({
      success: false,
      message: 'Error al calcular fecha de vencimiento',
      error: error.message
    });
  }
};

// Calculadora de alquileres usando API externa de ARquiler
const calculateRent = async (req, res) => {
  try {
    const { amount, date, months, rate = 'ipc' } = req.body;

    // Validaciones
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'El monto debe ser mayor a 0'
      });
    }

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Debe proporcionar una fecha de inicio'
      });
    }

    if (!months || months <= 0) {
      return res.status(400).json({
        success: false,
        message: 'La cantidad de meses debe ser mayor a 0'
      });
    }

    // Validar formato de fecha
    const startDate = new Date(date);
    if (isNaN(startDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Formato de fecha inválido. Use YYYY-MM-DD'
      });
    }

    // Validar tasa permitida
    const allowedRates = ['icl', 'ipc', 'is', 'ipim', 'casa_propia', 'cac', 'cer', 'uva'];
    if (!allowedRates.includes(rate.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: `Tasa no válida. Las tasas permitidas son: ${allowedRates.join(', ')}`
      });
    }

    // Preparar datos para la API externa
    const requestData = {
      amount: parseFloat(amount),
      date: startDate.toISOString().split('T')[0], // Formato YYYY-MM-DD
      months: parseInt(months),
      rate: rate.toLowerCase()
    };

    // Llamar a la API externa de ARquiler
    const response = await fetch('https://arquilerapi1.p.rapidapi.com/calculate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY || 'TU_API_KEY_AQUI',
        'X-RapidAPI-Host': process.env.RAPIDAPI_HOST || 'arquilerapi1.p.rapidapi.com'
      },
      body: JSON.stringify(requestData)
    });

    if (!response.ok) {
      throw new Error(`Error en la API externa: ${response.status} ${response.statusText}`);
    }

    const apiResult = await response.json();

    if (!apiResult.success) {
      throw new Error('La API externa no pudo procesar la solicitud');
    }

    // Procesar y formatear la respuesta
    const result = {
      inputs: {
        amount: requestData.amount,
        date: requestData.date,
        months: requestData.months,
        rate: requestData.rate
      },
      projections: apiResult.data.map(item => ({
        date: item.date,
        value: item.value,
        estimated: item.estimated,
        difference: item.dif,
        amount: item.amount,
        details: item.details || []
      }))
    };

    // Guardar en historial si hay usuario logueado
    if (req.user) {
      await prisma.calculatorHistory.create({
        data: {
          type: 'RENT',
          inputs: JSON.stringify(requestData),
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
    console.error('Error calculating rent:', error);
    res.status(500).json({
      success: false,
      message: 'Error al calcular alquileres',
      error: error.message
    });
  }
};

const calculateCAC = async (req, res) => {
  try {
    const { amount, date, months } = req.body;

    // Validaciones
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'El monto debe ser mayor a 0'
      });
    }

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Debe proporcionar una fecha de inicio'
      });
    }

    if (!months || months <= 0) {
      return res.status(400).json({
        success: false,
        message: 'La cantidad de meses debe ser mayor a 0'
      });
    }

    // Validar formato de fecha
    const startDate = new Date(date);
    if (isNaN(startDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Formato de fecha inválido. Use YYYY-MM-DD'
      });
    }

    // Preparar datos para la API externa (siempre con rate='cac')
    const requestData = {
      amount: parseFloat(amount),
      date: startDate.toISOString().split('T')[0], // Formato YYYY-MM-DD
      months: parseInt(months),
      rate: 'cac'
    };

    // Llamar a la API externa de ARquiler
    const response = await fetch('https://arquilerapi1.p.rapidapi.com/calculate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY || 'TU_API_KEY_AQUI',
        'X-RapidAPI-Host': process.env.RAPIDAPI_HOST || 'arquilerapi1.p.rapidapi.com'
      },
      body: JSON.stringify(requestData)
    });

    if (!response.ok) {
      throw new Error(`Error en la API externa: ${response.status} ${response.statusText}`);
    }

    const apiResult = await response.json();

    if (!apiResult.success) {
      throw new Error('La API externa no pudo procesar la solicitud');
    }

    // Procesar y formatear la respuesta
    const result = {
      inputs: {
        amount: requestData.amount,
        date: requestData.date,
        months: requestData.months,
        rate: requestData.rate
      },
      projections: apiResult.data.map(item => ({
        date: item.date,
        value: item.value,
        estimated: item.estimated,
        difference: item.dif,
        amount: item.amount,
        details: item.details || []
      }))
    };

    // Guardar en historial si hay usuario logueado
    if (req.user) {
      await prisma.calculatorHistory.create({
        data: {
          type: 'CAC',
          inputs: JSON.stringify(requestData),
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
    console.error('Error calculating CAC:', error);
    res.status(500).json({
      success: false,
      message: 'Error al calcular CAC',
      error: error.message
    });
  }
};

module.exports = {
  getCalculatorConfigs,
  getProvincias,
  calculateCommission,
  calculateTaxes,
  getCalculatorHistory,
  calculateEscribano,
  calculateOtrosGastos,
  calculateGananciaInmobiliaria,
  calculateMortgage,
  calculateDays,
  calculateDueDate,
  calculateRent,
  calculateCAC
};
