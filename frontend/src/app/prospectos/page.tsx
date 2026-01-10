"use client"

import React, { useEffect, useState, useCallback } from 'react'
import ProspectSummary from '../../components/prospects/ProspectSummary'
import ProspectCard from '../../components/prospects/ProspectCard'
import ProspectForm from '../../components/prospects/ProspectForm'
import { useAuth } from '../auth/authContext'
import { authenticatedFetch } from '@/utils/api'

import type { Prospect, ProspectFormData, ProspectStats } from '../../types/prospect'

type Stats = ProspectStats

export default function ProspectosPage() {
  const { user } = useAuth()
  const [prospects, setProspects] = useState<Prospect[]>([])
  const [stats, setStats] = useState<Stats>({})
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editing, setEditing] = useState<Prospect | null>(null)

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
    setLoading(false)
  }, [user])

  useEffect(()=>{ if (user) load() },[user, load])

  // Esta función ahora se pasa al Header nuevo para que el botón funcione
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
        const data = await r.json()
        if (r.ok) {
          setIsFormOpen(false); setEditing(null); load()
        } else {
          console.error('Error updating prospect', data)
        }
      } else {
        const r = await authenticatedFetch('/api/prospects', { method: 'POST', body: JSON.stringify(form) })
        const data = await r.json()
        if (r.ok) {
          setIsFormOpen(false); load()
        } else {
          console.error('Error creating prospect', data)
        }
      }
    } catch (e) { console.error('Error saving prospect', e) }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      
      {/* 1. EL ENCABEZADO AZUL NUEVO:
        Lo colocamos aquí, FUERA del contenedor con padding. 
        Así ocupa todo el ancho de la pantalla (full width).
      */}
      <ProspectSummary stats={stats} onCreateClick={handleCreate} />

      {/* 2. CONTENIDO PRINCIPAL (Formularios y Tarjetas):
        Este sí lleva padding y max-width para que quede centrado y prolijo.
      */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="space-y-6">
          {/* El Formulario se muestra aquí si está abierto */}
          {isFormOpen && (
            <div className="animate-in fade-in slide-in-from-top duration-300">
               <ProspectForm 
                 initial={editing || undefined} 
                 onCancel={() => { setIsFormOpen(false); setEditing(null) }} 
                 onSave={handleSave} 
               />
            </div>
          )}

          {/* Grilla de Tarjetas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        </div>
      </div>
    </div>
  )
}