const express = require('express')
const { PrismaClient } = require('@prisma/client')
const { authenticateToken } = require('../middleware/auth')
const { recalculateStages } = require('../services/funnelService')

const router = express.Router()
const prisma = new PrismaClient()

// GET user's projection metrics
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id

    const metrics = await prisma.projectionMetrics.findUnique({
      where: { userId },
    })

    if (!metrics) {
      return res.status(404).json({ error: 'No projection metrics found' })
    }

    res.json({
      id: metrics.id,
      prospectadosReferidos: metrics.prospectadosReferidos,
      prospectadosFrios: metrics.prospectadosFrios,
      ticketPromedio: metrics.ticketPromedio,
      comisionPorcentaje: metrics.comisionPorcentaje,
      agentLevel: metrics.agentLevel,
      startDate: metrics.startDate,
      endDate: metrics.endDate,
      createdAt: metrics.createdAt,
      updatedAt: metrics.updatedAt,
    })
  } catch (error) {
    console.error('Error fetching projection metrics:', error)
    res.status(500).json({ error: 'Failed to fetch projection metrics' })
  }
})

// POST/PUT user's projection metrics
router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id
    const {
      prospectadosReferidos,
      prospectadosFrios,
      ticketPromedio,
      comisionPorcentaje,
      agentLevel,
      startDate,
      endDate,
    } = req.body

    if (
      prospectadosReferidos === undefined ||
      prospectadosFrios === undefined ||
      ticketPromedio === undefined ||
      comisionPorcentaje === undefined
    ) {
      return res.status(400).json({
        error: 'Invalid data format. Required: prospectadosReferidos, prospectadosFrios, ticketPromedio, comisionPorcentaje',
      })
    }

    // Upsert: actualizar si existe, crear si no
    const metrics = await prisma.projectionMetrics.upsert({
      where: { userId },
      update: {
        prospectadosReferidos: parseInt(prospectadosReferidos),
        prospectadosFrios: parseInt(prospectadosFrios),
        ticketPromedio: parseFloat(ticketPromedio),
        comisionPorcentaje: parseFloat(comisionPorcentaje),
        agentLevel: agentLevel || 'inicial',
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        updatedAt: new Date(),
      },
      create: {
        userId,
        prospectadosReferidos: parseInt(prospectadosReferidos),
        prospectadosFrios: parseInt(prospectadosFrios),
        ticketPromedio: parseFloat(ticketPromedio),
        comisionPorcentaje: parseFloat(comisionPorcentaje),
        agentLevel: agentLevel || 'inicial',
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
    })

    // Sincronizar automáticamente con el Sales Funnel
    try {
      const pReferidos = parseInt(prospectadosReferidos)
      const pFrios = parseInt(prospectadosFrios)
      const aLevel = agentLevel || 'inicial'
      
      const newStages = recalculateStages(pReferidos, pFrios, aLevel)
      
      await prisma.salesFunnel.upsert({
        where: { userId },
        update: {
          data: JSON.stringify({
            stages: newStages,
            agentLevel: aLevel
          }),
          updatedAt: new Date(),
        },
        create: {
          userId,
          data: JSON.stringify({
            stages: newStages,
            agentLevel: aLevel
          }),
        },
      })
      console.log(`[Metrics] Funnel synced for user ${userId}`)
    } catch (funnelError) {
      console.error('Error syncing sales funnel from metrics:', funnelError)
      // No bloqueamos la respuesta principal si falla la sincronización del funnel
    }

    res.json({
      success: true,
      id: metrics.id,
      prospectadosReferidos: metrics.prospectadosReferidos,
      prospectadosFrios: metrics.prospectadosFrios,
      ticketPromedio: metrics.ticketPromedio,
      comisionPorcentaje: metrics.comisionPorcentaje,
      agentLevel: metrics.agentLevel,
      startDate: metrics.startDate,
      endDate: metrics.endDate,
      updatedAt: metrics.updatedAt,
    })
  } catch (error) {
    console.error('Error saving projection metrics:', error)
    res.status(500).json({ error: 'Failed to save projection metrics' })
  }
})

module.exports = router
