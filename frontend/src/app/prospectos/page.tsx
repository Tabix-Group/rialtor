"use client"

import React, { useEffect, useState, useCallback, useRef } from 'react'
import ProspectSummary from '../../components/prospects/ProspectSummary'
import SalesFunnel from '@/components/SalesFunnel'
import { useAuth } from '../auth/authContext'
import { authenticatedFetch } from '@/utils/api'

export default function ProspectosPage() {
  const { user } = useAuth()
  const [funnelStages, setFunnelStages] = useState<any[]>([])
  const [agentLevel, setAgentLevel] = useState<string>('inicial')
  const [loading, setLoading] = useState(true)
  const [startDate, setStartDate] = useState<string>(() => {
    const date = new Date()
    date.setMonth(date.getMonth() - 1) // Último mes por defecto
    return date.toISOString().split('T')[0]
  })
  const [endDate, setEndDate] = useState<string>(() => new Date().toISOString().split('T')[0])
  const [prospectStats, setProspectStats] = useState<any>(null)
  
  // Referencia para la función de guardado del funnel
  const saveFunnelFn = useRef<(() => Promise<void>) | null>(null)
  const [isSavingFunnel, setIsSavingFunnel] = useState(false)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const r = await authenticatedFetch('/api/sales-funnel')
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
      const r = await authenticatedFetch(`/api/prospects/stats?${params}`)
      const data = await r.json()
      setProspectStats(data.stats)
    } catch (e) {
      console.error('Error fetching prospect stats', e)
    }
  }, [user, startDate, endDate])

  useEffect(()=>{ if (user) load() },[user, load])
  useEffect(()=>{ if (user) loadStats() },[user, loadStats])

  const handleSaveFunnel = async () => {
    if (saveFunnelFn.current) {
      setIsSavingFunnel(true)
      await saveFunnelFn.current()
      setIsSavingFunnel(false)
      // Recargar para actualizar los KPIs en la cabecera después de guardar el funnel
      load()
    }
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
        onDateChange={(newStart, newEnd) => {
          setStartDate(newStart)
          setEndDate(newEnd)
        }}
        onSaveFunnel={handleSaveFunnel}
        isSavingFunnel={isSavingFunnel}
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
              showHeader={false} 
              externalHandleSave={(fn) => { saveFunnelFn.current = fn }} 
            />
          </section>
        </div>
      </div>
    </div>
  )
}