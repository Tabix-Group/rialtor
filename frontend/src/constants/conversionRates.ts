/**
 * Matriz de Tasas de Cierre por Origen y Nivel de Agente
 * 
 * Origen: 'referidos' (hot) | 'bases_frias' (cold)
 * Nivel: 'inicial' | 'intermedio' | 'experto'
 * 
 * Tasas de Cierre Finales (en %):
 * - Referidos/Inicial: 10%
 * - Referidos/Intermedio: 18%
 * - Referidos/Experto: 29%
 * - Bases Frías/Inicial: 1%
 * - Bases Frías/Intermedio: 2%
 * - Bases Frías/Experto: N/A (no trabaja con bases frías)
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
      cierres: 10 // Referidos/Inicial: 10%
    },
    cold: {
      tasaciones: 14,
      captaciones: 29,
      reservas: 43,
      cierres: 1 // Bases Frías/Inicial: 1%
    }
  },
  intermedio: {
    hot: {
      tasaciones: 65,
      captaciones: 70,
      reservas: 50,
      cierres: 18 // Referidos/Intermedio: 18%
    },
    cold: {
      tasaciones: 17,
      captaciones: 35,
      reservas: 40,
      cierres: 2 // Bases Frías/Intermedio: 2%
    }
  },
  experto: {
    hot: {
      tasaciones: 70,
      captaciones: 70,
      reservas: 65,
      cierres: 29 // Referidos/Experto: 29%
    },
    cold: {
      tasaciones: 0,
      captaciones: 0,
      reservas: 0,
      cierres: 0 // Bases Frías/Experto: no trabaja con bases frías
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
