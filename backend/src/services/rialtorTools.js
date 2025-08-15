const fs = require('fs');

/**
 * Minimal implementations for internal tools. These are synchronous/simple
 * and should be replaced by real services or DB lookups when available.
 */

const kb_lookup = async ({ query, jurisdiccion } = {}) => {
  if (!query) throw new Error('kb_lookup: query required');
  // Placeholder: in our system the existing chatController already queries Prisma for articles and documents.
  // Here we return a stub indicating no high-confidence answer so caller falls back to existing DB searches.
  return {
    confidence: 0.0,
    answer: null,
    sourceId: null
  };
};

const tasador_express = async ({ barrio, comuna, tipo_propiedad, superficie_m2, estado, antiguedad } = {}) => {
  if (!barrio || !tipo_propiedad || !superficie_m2) throw new Error('tasador_express: barrio, tipo_propiedad y superficie_m2 son requeridos');

  // Seeded approximate valores por m2 (USD) para demo; replace with real KB lookup.
  const baseValores = {
    'Caballito': 1200,
    'Palermo': 2200,
    'Belgrano': 2000,
    'Recoleta': 2100
  };
  const defaultValor = 1000;
  const valor_m2 = baseValores[barrio] || defaultValor;

  // Ajustes simples
  let ajusteEstado = 1.0;
  if (estado && estado.toLowerCase().includes('nuevo')) ajusteEstado = 1.1;
  if (estado && estado.toLowerCase().includes('a refaccionar')) ajusteEstado = 0.8;

  const valorUnit = Number((valor_m2 * ajusteEstado).toFixed(2));
  const total = Number((valorUnit * superficie_m2).toFixed(2));

  const rangoUSD = [Number((valorUnit * 0.9).toFixed(2)), Number((valorUnit * 1.1).toFixed(2))];

  const comparables = [
    { dir: `${barrio} 1`, m2: superficie_m2, precio_usd: Number((valorUnit * superficie_m2 * 0.98).toFixed(2)) },
    { dir: `${barrio} 2`, m2: superficie_m2, precio_usd: Number((valorUnit * superficie_m2 * 1.02).toFixed(2)) },
    { dir: `${barrio} 3`, m2: superficie_m2, precio_usd: Number((valorUnit * superficie_m2 * 1.00).toFixed(2)) }
  ];

  return {
    valor_m2: valorUnit,
    total_estimado: total,
    rango_USD: rangoUSD,
    comparables,
    fundamento: `Valor base tomado de KB local para ${barrio} ajustado por estado=${estado||'estimado'}`
  };
};

const calc_gastos_escritura = async ({ jurisdiccion, precio_operacion, primera_vivienda = false, tiene_otra_propiedad = false } = {}) => {
  if (!jurisdiccion || !precio_operacion) throw new Error('calc_gastos_escritura: jurisdiccion y precio_operacion requeridos');

  // Reglas simplificadas y solo demo.
  const porcentaje_sellos = jurisdiccion === 'CABA' ? 0.007 : 0.008; // Ejemplo
  const impuestos = Number((precio_operacion * porcentaje_sellos).toFixed(2));

  // Aranceles estimados
  const aranceles = primera_vivienda ? 50000 : 80000;

  const total = Number((impuestos + aranceles).toFixed(2));

  return {
    jurisdiccion,
    precio_operacion,
    desglose: {
      impuestos_sellos: impuestos,
      aranceles_notariales: aranceles
    },
    total_comprador_ars: total,
    formula: `total = precio_operacion * ${porcentaje_sellos} + aranceles`,
    observaciones: jurisdiccion === 'PBA' ? 'Verificar tabla de sellos provincial actualizada.' : 'Verificar tasas y exenciones CABA.'
  };
};

const calc_honorarios = async ({ jurisdiccion, tipo_operacion, precio_operacion } = {}) => {
  if (!jurisdiccion || !tipo_operacion || !precio_operacion) throw new Error('calc_honorarios: faltan parametros');

  // Regla demo
  let porcentaje = 0.04; // 4% default
  if (tipo_operacion === 'alquiler_residencial') porcentaje = 0.05; // ejemplo
  if (tipo_operacion === 'alquiler_comercial') porcentaje = 0.06;

  const total = Number((precio_operacion * porcentaje).toFixed(2));

  // Quién paga: convención AMBA (demo): comprador y vendedor comparten segun convenio local
  let quien_paga = 'Vendedor';
  if (tipo_operacion === 'alquiler_residencial') quien_paga = 'Inquilino y propietario según acuerdo local';

  return {
    jurisdiccion,
    tipo_operacion,
    porcentaje,
    total,
    quien_paga,
    formula: `total = precio_operacion * ${porcentaje}`
  };
};

module.exports = {
  kb_lookup,
  tasador_express,
  calc_gastos_escritura,
  calc_honorarios
};
