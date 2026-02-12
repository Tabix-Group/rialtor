"use client"

import React, { useEffect, useState, useCallback, useRef } from 'react'
import ProspectSummary from '../../components/prospects/ProspectSummary'
import SalesFunnel from '@/components/SalesFunnel'
import { useAuth } from '../auth/authContext'

export default function ProspectosPage() {
  const { user } = useAuth()
  const [funnelStages, setFunnelStages] = useState<any[]>([])
  const [agentLevel, setAgentLevel] = useState<string>('inicial')
  const [loading, setLoading] = useState(true)
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [prospectStats, setProspectStats] = useState<any>(null)

  // Inicializar fechas en el cliente para evitar errores de hidratación
  useEffect(() => {
    const start = new Date()
    start.setMonth(start.getMonth() - 1)
    setStartDate(start.toISOString().split('T')[0])
    setEndDate(new Date().toISOString().split('T')[0])
  }, [])

  const [projectionMetrics, setProjectionMetrics] = useState<any>(null)
  const [funnelKey, setFunnelKey] = useState(0)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      const r = await fetch('https://remax-be-production.up.railway.app/api/sales-funnel', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      })
      
      if (r.status === 401) {
        console.warn('Unauthorized - token may be expired')
        return
      }

      if (!r.ok) {
        console.error(`HTTP ${r.status}: Failed to fetch sales funnel`)
        return
      }

      const data = await r.json()
      if (data.data) {
        // Manejar tanto el formato antiguo (array) como el nuevo (objeto con stages)
        if (Array.isArray(data.data)) {
          setFunnelStages(data.data)
        } else if (data.data.stages) {
          setFunnelStages(data.data.stages)
          if (data.data.agentLevel) {
            setAgentLevel(data.data.agentLevel)
          }
        }
      }
    } catch (e) {
      console.error('Error fetching funnel data', e)
    }
    setLoading(false)
  }, [user])

  const loadStats = useCallback(async () => {
    if (!user) return
    try {
      const params = new URLSearchParams()
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)
      
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      const r = await fetch(`https://remax-be-production.up.railway.app/api/prospects/stats?${params}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      })
      
      if (r.status === 401) {
        console.warn('Unauthorized - token may be expired')
        return
      }

      if (!r.ok) {
        console.error(`HTTP ${r.status}: Failed to fetch stats`)
        return
      }

      const data = await r.json()
      setProspectStats(data.stats)
    } catch (e) {
      console.error('Error fetching prospect stats', e)
    }
  }, [user, startDate, endDate])

  const loadMetrics = useCallback(async () => {
    if (!user) return
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      const r = await fetch('https://remax-be-production.up.railway.app/api/projection-metrics', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      })
      
      if (r.status === 404) {
        // No metrics found yet, which is OK
        setProjectionMetrics(null)
        return
      }

      if (r.status === 401) {
        console.warn('Unauthorized - token may be expired')
        return
      }

      if (!r.ok) {
        console.error(`HTTP ${r.status}: Failed to fetch metrics`)
        return
      }

      const data = await r.json()
      setProjectionMetrics(data)
    } catch (e) {
      console.error('Error fetching projection metrics', e)
    }
  }, [user])

  useEffect(()=>{ if (user) load() },[user, load])
  useEffect(()=>{ if (user) loadStats() },[user, loadStats])
  useEffect(()=>{ if (user) loadMetrics() },[user, loadMetrics])

  const handleStatsSaved = () => {
    // Recargar métricas, estadísticas y el funnel (backend ya lo sincronizó)
    load()
    loadStats()
    loadMetrics()
    // Forzar recarga del componente SalesFunnel
    setFunnelKey(prev => prev + 1)
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      
      {/* 1. ENCABEZADO UNIFICADO CON 5 KPIs ACTUALIZADOS */}
      <ProspectSummary 
        stats={prospectStats}
        funnelStages={funnelStages}
        agentLevel={agentLevel}
        startDate={startDate}
        endDate={endDate}
        projectionMetrics={projectionMetrics}
        onDateChange={(newStart, newEnd) => {
          setStartDate(newStart)
          setEndDate(newEnd)
        }}
        onStatsSaved={handleStatsSaved}
      />

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        
        <div className="space-y-16">
          
          {/* 2. SECCIÓN DEL FUNNEL (Nuevas Proyecciones) */}
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-10 w-1 bg-blue-600 rounded-full"></div>
              <h2 className="text-3xl font-bold text-slate-800">Funnel de Proyecciones</h2>
            </div>
            
            <SalesFunnel 
              key={funnelKey}
              showHeader={false} 
            />
          </section>
        </div>
      </div>
    </div>
  )
}