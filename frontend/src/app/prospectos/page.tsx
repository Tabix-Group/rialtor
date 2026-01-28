"use client"

import React, { useEffect, useState, useCallback, useRef } from 'react'
import ProspectSummary from '../../components/prospects/ProspectSummary'
import ProspectCard from '../../components/prospects/ProspectCard'
import ProspectForm from '../../components/prospects/ProspectForm'
import SalesFunnel from '@/components/SalesFunnel'
import { useAuth } from '../auth/authContext'
import { authenticatedFetch } from '@/utils/api'

import type { Prospect, ProspectFormData, ProspectStats } from '../../types/prospect'

type Stats = ProspectStats & { totalPipeline?: number }

export default function ProspectosPage() {
  const { user } = useAuth()
  const [prospects, setProspects] = useState<Prospect[]>([])
  const [stats, setStats] = useState<Stats>({})
  const [funnelStages, setFunnelStages] = useState<any[]>([])
  const [agentLevel, setAgentLevel] = useState<string>('inicial')
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editing, setEditing] = useState<Prospect | null>(null)
  
  // Referencia para la función de guardado del funnel
  const saveFunnelFn = useRef<(() => Promise<void>) | null>(null)
  const [isSavingFunnel, setIsSavingFunnel] = useState(false)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const r1 = await authenticatedFetch('/api/prospects')
      const data1 = await r1.json()
      setProspects(data1.prospects || [])
    } catch (e) {
      console.error('Error fetching prospects', e)
    }
    try {
      const r2 = await authenticatedFetch('/api/prospects/stats')
      const data2 = await r2.json()
      setStats(data2.stats || {})
    } catch (e) {
      console.error('Error fetching prospect stats', e)
    }
    try {
      const r3 = await authenticatedFetch('/api/sales-funnel')
      const data3 = await r3.json()
      if (data3.data) {
        // Manejar tanto el formato antiguo (array) como el nuevo (objeto con stages)
        if (Array.isArray(data3.data)) {
          setFunnelStages(data3.data)
        } else if (data3.data.stages) {
          setFunnelStages(data3.data.stages)
          if (data3.data.agentLevel) {
            setAgentLevel(data3.data.agentLevel)
          }
        }
      }
    } catch (e) {
      console.error('Error fetching funnel data', e)
    }
    setLoading(false)
  }, [user])

  useEffect(()=>{ if (user) load() },[user, load])

  const handleCreate = () => { setEditing(null); setIsFormOpen(true) }
  const handleEdit = (p: Prospect) => { setEditing(p); setIsFormOpen(true) }
  
  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que querés eliminar este prospecto?')) return
    try {
      const r = await authenticatedFetch(`/api/prospects/${id}`, { method: 'DELETE' })
      if (r.ok) load()
    } catch (e) { console.error(e) }
  }

  const handleSave = async (form: ProspectFormData) => {
    try {
      if (editing) {
        const r = await authenticatedFetch(`/api/prospects/${editing.id}`, { method: 'PUT', body: JSON.stringify(form) })
        if (r.ok) {
          setIsFormOpen(false); setEditing(null); load()
        }
      } else {
        const r = await authenticatedFetch('/api/prospects', { method: 'POST', body: JSON.stringify(form) })
        if (r.ok) {
          setIsFormOpen(false); load()
        }
      }
    } catch (e) { console.error('Error saving prospect', e) }
  }

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
        stats={stats} 
        funnelStages={funnelStages}
        agentLevel={agentLevel}
        onCreateClick={handleCreate}
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

          {/* 3. SECCIÓN DE PROSPECTOS (Lista) */}
          <section className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="h-10 w-1 bg-cyan-500 rounded-full"></div>
                <h2 className="text-3xl font-bold text-slate-800">Nuevos Prospectos</h2>
              </div>
            </div>

            {/* El Formulario se muestra aquí si está abierto */}
            {isFormOpen && (
              <div className="mb-10 animate-in fade-in zoom-in-95 duration-300">
                 <ProspectForm 
                   initial={editing || undefined} 
                   onCancel={() => { setIsFormOpen(false); setEditing(null) }} 
                   onSave={handleSave} 
                 />
              </div>
            )}

            {/* Grilla de Tarjetas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {loading ? (
                <div className="col-span-full py-20 text-center text-slate-500">
                  Cargando prospectos...
                </div>
              ) : prospects.length === 0 ? (
                <div className="col-span-full py-20 text-center bg-white rounded-2xl border border-dashed border-slate-300">
                  <p className="text-slate-500 mb-4">No tienes prospectos cargados aún.</p>
                  <button onClick={handleCreate} className="text-blue-600 font-semibold hover:underline">
                    Crea tu primer prospecto
                  </button>
                </div>
              ) : (
                prospects.map((p) => (
                  <ProspectCard 
                    key={p.id} 
                    prospect={p} 
                    onEdit={handleEdit} 
                    onDelete={handleDelete} 
                  />
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}