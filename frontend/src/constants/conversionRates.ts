/**
 * Matriz de Tasas de Cierre por Origen y Nivel de Agente
 * 
 * Origen: 'referidos' (hot) | 'bases_frias' (cold)
 * Nivel: 'inicial' | 'intermedio' | 'experto'
 * 
 * Ejemplos del cliente:
 * - Referidos/Experto: 29%
 * - Referidos/Inicial: 11%
 */

export type AgentLevel = 'inicial' | 'intermedio' | 'experto'
export type ProspectOrigin = 'referidos' | 'bases_frias'

interface ConversionRates {
  tasaciones: number
  captaciones: number
  reservas: number
  cierres: number
}

interface ConversionRatesByType {
  hot: ConversionRates // Referidos
  cold: ConversionRates // Bases Frías
}

export const CONVERSION_RATES_BY_LEVEL: Record<AgentLevel, ConversionRatesByType> = {
  inicial: {
    hot: {
      tasaciones: 59,
      captaciones: 60,
      reservas: 45,
      cierres: 65 // Referidos/Inicial
    },
    cold: {
      tasaciones: 14,
      captaciones: 29,
      reservas: 43,
      cierres: 63 // Bases Frías/Inicial
    }
  },
  intermedio: {
    hot: {
      tasaciones: 65,
      captaciones: 70,
      reservas: 50,
      cierres: 80 // Referidos/Intermedio
    },
    cold: {
      tasaciones: 17,
      captaciones: 35,
      reservas: 40,
      cierres: 80 // Bases Frías/Intermedio
    }
  },
  experto: {
    hot: {
      tasaciones: 70,
      captaciones: 70,
      reservas: 65,
      cierres: 90 // Referidos/Experto
    },
    cold: {
      tasaciones: 0,
      captaciones: 0,
      reservas: 0,
      cierres: 0 // Bases Frías/Experto (no trabaja con bases frías)
    }
  }
}

/**
 * Obtiene la tasa de cierre según origen y nivel de agente
 */
export function getClosingRate(origin: ProspectOrigin, level: AgentLevel): number {
  if (level === 'experto' && origin === 'bases_frias') {
    return 0 // Los expertos no trabajan con bases frías
  }

  const rates = CONVERSION_RATES_BY_LEVEL[level]
  const rateType = origin === 'referidos' ? rates.hot : rates.cold
  return rateType.cierres
}

/**
 * Calcula el promedio ponderado de tasa de cierre según distribución de prospectos
 */
export function getWeightedClosingRate(
  referidosCount: number,
  basesFriasCount: number,
  level: AgentLevel
): number {
  const total = referidosCount + basesFriasCount
  if (total === 0) return 0

  const referidosRate = getClosingRate('referidos', level)
  const basesFriasRate = getClosingRate('bases_frias', level)

  return Math.round(
    (referidosCount * referidosRate + basesFriasCount * basesFriasRate) / total
  )
}
