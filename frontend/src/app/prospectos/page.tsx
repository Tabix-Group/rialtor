"use client"

import React, { useEffect, useState, useCallback } from 'react'
import ProspectSummary from '../../components/prospects/ProspectSummary'
import ProspectCard from '../../components/prospects/ProspectCard'
import ProspectForm from '../../components/prospects/ProspectForm'
import Link from 'next/link'
import { useAuth } from '../auth/authContext'

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
      const r1 = await fetch('/api/prospects')
      const data1 = await r1.json()
      setProspects(data1.prospects || [])
    } catch (e) {
      console.error('Error fetching prospects', e)
    }
    try {
      const r2 = await fetch('/api/prospects/stats')
      const data2 = await r2.json()
      setStats(data2.stats || {})
    } catch (e) {
      console.error('Error fetching prospect stats', e)
    }
    setLoading(false)
  }, [user])

  useEffect(()=>{ if (user) load() },[user, load])

  const handleCreate = () => { setEditing(null); setIsFormOpen(true) }
  const handleEdit = (p: Prospect) => { setEditing(p); setIsFormOpen(true) }
  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que querés eliminar este prospecto?')) return
    try {
      const r = await fetch(`/api/prospects/${id}`, { method: 'DELETE' })
      if (r.ok) load()
    } catch (e) { console.error(e) }
  }

  const handleSave = async (form: ProspectFormData) => {
    try {
      if (editing) {
        const r = await fetch(`/api/prospects/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
        if (r.ok) {
          setIsFormOpen(false); setEditing(null); load()
        }
      } else {
        const r = await fetch('/api/prospects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
        if (r.ok) {
          setIsFormOpen(false); load()
        }
      }
    } catch (e) { console.error('Error saving prospect', e) }
  }

  return (
    <div className="min-h-screen bg-background py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 rounded-2xl p-8 text-white mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Mis <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">Prospectos</span></h1>
              <p className="mt-2 text-slate-200 max-w-2xl">Seguimiento minimalista para tus proyecciones y conversiones de clientes potenciales.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={handleCreate} className="bg-white text-slate-900 px-4 py-2 rounded-xl font-semibold">Nueva Proyección</button>
              <Link href="/dashboard" className="px-4 py-2 rounded-xl border border-white/20 hover:bg-white/10">Volver</Link>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <ProspectSummary stats={stats} />

          {isFormOpen && (
            <ProspectForm initial={editing || undefined} onCancel={() => { setIsFormOpen(false); setEditing(null) }} onSave={handleSave} />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              <div>Loading...</div>
            ) : (
              prospects.map((p) => (
                <ProspectCard key={p.id} prospect={p} onEdit={handleEdit} onDelete={handleDelete} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
