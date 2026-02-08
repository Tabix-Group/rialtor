const CONVERSION_RATES_BY_LEVEL = {
  inicial: {
    hot: {
      tasaciones: 59,
      captaciones: 60,
      reservas: 45,
      cierres: 10
    },
    cold: {
      tasaciones: 14,
      captaciones: 29,
      reservas: 43,
      cierres: 1
    }
  },
  intermedio: {
    hot: {
      tasaciones: 65,
      captaciones: 70,
      reservas: 50,
      cierres: 18
    },
    cold: {
      tasaciones: 17,
      captaciones: 35,
      reservas: 40,
      cierres: 2
    }
  },
  experto: {
    hot: {
      tasaciones: 70,
      captaciones: 70,
      reservas: 65,
      cierres: 29
    },
    cold: {
      tasaciones: 0,
      captaciones: 0,
      reservas: 0,
      cierres: 0
    }
  }
};

/**
 * Recalculates all funnel stages based on initial prospects and agent level
 */
function recalculateStages(prospectsHot, prospectsCold, level) {
  const ratesHot = CONVERSION_RATES_BY_LEVEL[level].hot;
  const ratesCold = CONVERSION_RATES_BY_LEVEL[level].cold;
  const actualFriasCount = level === 'experto' ? 0 : prospectsCold;

  // Tasaciones, Captaciones y Reservas son tasas sobre la ETAPA ANTERIOR
  const tasacionesHot = Math.round((prospectsHot * ratesHot.tasaciones) / 100);
  const captacionesHot = Math.round((tasacionesHot * ratesHot.captaciones) / 100);
  const reservasHot = Math.round((captacionesHot * ratesHot.reservas) / 100);

  const tasacionesCold = Math.round((actualFriasCount * ratesCold.tasaciones) / 100);
  const captacionesCold = Math.round((tasacionesCold * ratesCold.captaciones) / 100);
  const reservasCold = Math.round((captacionesCold * ratesCold.reservas) / 100);

  // La tasa de CIERRES es una tasa FINAL (Prospectos -> Cierres) para ser consistente
  // con la sección de Métricas (ProspectSummary) y el cálculo de comisiones proyectadas.
  const cierresHot = Math.round((prospectsHot * ratesHot.cierres) / 100);
  const cierresCold = Math.round((actualFriasCount * ratesCold.cierres) / 100);

  return [
    { 
      id: 1, 
      label: 'Prospectos', 
      clientsHot: prospectsHot, 
      clientsCold: actualFriasCount,
      color: 'teal', 
      gradientClasses: 'bg-gradient-to-r from-teal-400 to-teal-600', 
      shadowColor: 'shadow-teal-500/20',
      width: 'w-full'
    },
    { 
      id: 2, 
      label: 'Tasaciones', 
      clientsHot: tasacionesHot, 
      clientsCold: tasacionesCold,
      color: 'indigo', 
      gradientClasses: 'bg-gradient-to-r from-indigo-500 to-indigo-700', 
      shadowColor: 'shadow-indigo-500/20',
      width: 'w-11/12'
    },
    { 
      id: 3, 
      label: 'Captaciones', 
      clientsHot: captacionesHot, 
      clientsCold: captacionesCold,
      color: 'rose', 
      gradientClasses: 'bg-gradient-to-r from-rose-500 to-rose-700', 
      shadowColor: 'shadow-rose-500/20',
      width: 'w-10/12'
    },
    { 
      id: 4, 
      label: 'Reservas', 
      clientsHot: reservasHot, 
      clientsCold: reservasCold,
      color: 'emerald', 
      gradientClasses: 'bg-gradient-to-r from-emerald-500 to-emerald-700', 
      shadowColor: 'shadow-emerald-500/20',
      width: 'w-9/12'
    },
    { 
      id: 5, 
      label: 'Cierres', 
      clientsHot: cierresHot, 
      clientsCold: cierresCold,
      color: 'amber', 
      gradientClasses: 'bg-gradient-to-r from-amber-400 to-amber-600', 
      shadowColor: 'shadow-amber-500/20',
      width: 'w-8/12'
    },
  ];
}

module.exports = {
  recalculateStages,
  CONVERSION_RATES_BY_LEVEL
};
