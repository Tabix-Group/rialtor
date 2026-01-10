const express = require('express')
const { PrismaClient } = require('@prisma/client')
const { authenticateToken } = require('../middleware/auth')

const router = express.Router()
const prisma = new PrismaClient()

// GET sales funnel data for current user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id

    const salesFunnel = await prisma.salesFunnel.findUnique({
      where: { userId },
    })

    if (!salesFunnel) {
      return res.status(404).json({ error: 'No sales funnel data found' })
    }

    // Parse the JSON data
    const data = JSON.parse(salesFunnel.data)

    res.json({
      id: salesFunnel.id,
      data,
      createdAt: salesFunnel.createdAt,
      updatedAt: salesFunnel.updatedAt,
    })
  } catch (error) {
    console.error('Error fetching sales funnel:', error)
    res.status(500).json({ error: 'Failed to fetch sales funnel data' })
  }
})

// POST/PUT sales funnel data for current user (one record per user)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id
    const { data } = req.body

    if (!data || !Array.isArray(data)) {
      return res.status(400).json({ error: 'Invalid data format' })
    }

    // Upsert: update if exists, create if not
    const salesFunnel = await prisma.salesFunnel.upsert({
      where: { userId },
      update: {
        data: JSON.stringify(data),
        updatedAt: new Date(),
      },
      create: {
        userId,
        data: JSON.stringify(data),
      },
    })

    // Parse the JSON data for response
    const parsedData = JSON.parse(salesFunnel.data)

    res.json({
      id: salesFunnel.id,
      data: parsedData,
      createdAt: salesFunnel.createdAt,
      updatedAt: salesFunnel.updatedAt,
      message: 'Sales funnel data saved successfully',
    })
  } catch (error) {
    console.error('Error saving sales funnel:', error)
    res.status(500).json({ error: 'Failed to save sales funnel data' })
  }
})

// DELETE sales funnel data for current user
router.delete('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id

    const salesFunnel = await prisma.salesFunnel.delete({
      where: { userId },
    })

    res.json({
      message: 'Sales funnel data deleted successfully',
      id: salesFunnel.id,
    })
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Sales funnel data not found' })
    }
    console.error('Error deleting sales funnel:', error)
    res.status(500).json({ error: 'Failed to delete sales funnel data' })
  }
})

module.exports = router
