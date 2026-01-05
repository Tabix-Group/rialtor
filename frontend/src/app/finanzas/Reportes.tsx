'use client'

import React, { useMemo, useState } from 'react'
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts'
import { BarChart3, Download } from 'lucide-react' 
import * as XLSX from 'xlsx' 

type FinanceTransaction = {
  id: string
  tipo: 'Personal' | 'Laboral'
  type: 'ingreso' | 'egreso'
  concept: string
  description?: string
  amount: number
  currency: 'ARS' | 'USD'
  date: string
  createdAt: string
}

interface Props {
  transactions: FinanceTransaction[]
  balance: { ARS: number; USD: number }
}

const COLORS = ['#10B981', '#EF4444', '#3B82F6', '#A78BFA', '#F59E0B', '#06B6D4']

export default function Reportes({ transactions, balance }: Props) {
  const [showCurrencies, setShowCurrencies] = useState(false)

  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    currency: '',
    tipo: '',
    type: '',
    concept: ''
  })

  const uniqueConcepts = useMemo(() => Array.from(new Set(transactions.map(t => t.concept))).sort(), [transactions])

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      if (filters.startDate && new Date(t.date) < new Date(filters.startDate)) return false
      if (filters.endDate && new Date(t.date) > new Date(filters.endDate)) return false
      if (filters.currency && t.currency !== filters.currency) return false
      if (filters.tipo && t.tipo !== filters.tipo) return false
      if (filters.type && t.type !== filters.type) return false
      if (filters.concept && t.concept !== filters.concept) return false
      return true
    })
  }, [transactions, filters])

  const totals = useMemo(() => {
    const acc = {
      ingresos: { ARS: 0, USD: 0 },
      egresos: { ARS: 0, USD: 0 }
    }

    filteredTransactions.forEach(t => {
      if (t.type === 'ingreso') acc.ingresos[t.currency] += t.amount
      else acc.egresos[t.currency] += t.amount
    })

    return acc
  }, [filteredTransactions])

  // Monthly aggregation (YYYY-MM)
  const monthly = useMemo(() => {
    const map = new Map<string, { month: string; ingresos: number; egresos: number }>()

    filteredTransactions.forEach(t => {
      const d = new Date(t.date)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const label = d.toLocaleString('default', { month: 'short', year: 'numeric' })
      if (!map.has(key)) map.set(key, { month: label, ingresos: 0, egresos: 0 })
      const item = map.get(key)!
      if (t.type === 'ingreso') item.ingresos += t.amount
      else item.egresos += t.amount
    })

    const arr = Array.from(map.entries()).map(([k, v]) => ({ key: k, ...v }))
    arr.sort((a, b) => a.key.localeCompare(b.key))
    // show last 12 months if many
    return arr.slice(-12)
  }, [filteredTransactions])

  // Top concepts
  const topConcepts = useMemo(() => {
    const map = new Map<string, number>()
    filteredTransactions.forEach(t => {
      map.set(t.concept, (map.get(t.concept) || 0) + (t.type === 'ingreso' ? t.amount : -t.amount))
    })
    const arr = Array.from(map.entries()).map(([concept, value]) => ({ concept, value: Math.abs(value) }))
    arr.sort((a, b) => b.value - a.value)
    return arr.slice(0, 6)
  }, [filteredTransactions])

  const pieData = useMemo(() => {
    const totalIngresos = totals.ingresos.ARS + totals.ingresos.USD
    const totalEgresos = totals.egresos.ARS + totals.egresos.USD
    return [
      { name: 'Ingresos', value: totalIngresos },
      { name: 'Egresos', value: totalEgresos }
    ]
  }, [totals])

  const exportToXLSX = () => {
    if (filteredTransactions.length === 0) return

    const wsData = filteredTransactions.map(t => ({
      Fecha: new Date(t.date).toISOString().split('T')[0],
      Categoria: t.tipo,
      Tipo: t.type,
      Concepto: t.concept,
      Descripcion: t.description || '',
      Monto: Number(t.amount),
      Moneda: t.currency,
      Creado: new Date(t.createdAt).toISOString()
    }))

    const ws = XLSX.utils.json_to_sheet(wsData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Reportes')
    XLSX.writeFile(wb, `reportes_finanzas_${new Date().toISOString().slice(0,10)}.xlsx`)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/10 shadow-inner">
          <p className="text-xs text-slate-300">Total Ingresos</p>
          <p className="text-lg sm:text-xl font-bold text-white mt-2">${(totals.ingresos.ARS + totals.ingresos.USD).toLocaleString()} <span className="text-sm text-slate-300 font-medium">(ARS+USD)</span></p>
          <div className="text-xs text-slate-400 mt-2">
            <div>ARS: ${totals.ingresos.ARS.toLocaleString()}</div>
            <div>USD: ${totals.ingresos.USD.toLocaleString()}</div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/10 shadow-inner">
          <p className="text-xs text-slate-300">Total Egresos</p>
          <p className="text-lg sm:text-xl font-bold text-white mt-2">${(totals.egresos.ARS + totals.egresos.USD).toLocaleString()} <span className="text-sm text-slate-300 font-medium">(ARS+USD)</span></p>
          <div className="text-xs text-slate-400 mt-2">
            <div>ARS: ${totals.egresos.ARS.toLocaleString()}</div>
            <div>USD: ${totals.egresos.USD.toLocaleString()}</div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/10 shadow-inner flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-green-300" />
              <p className="text-xs text-slate-300">Balance</p>
            </div>
            <p className="text-lg sm:text-xl font-bold text-white mt-2">${(balance.ARS + balance.USD).toLocaleString()} <span className="text-sm text-slate-300 font-medium">(sum)</span></p>
          </div>
          <div className="mt-3">
            <label className="text-xs text-slate-300">Ver por moneda</label>
            <div className="inline-flex gap-1 mt-2 bg-slate-50 rounded-xl p-1">
              <button onClick={() => setShowCurrencies(false)} className={`px-2 py-1 rounded-lg text-xs font-semibold ${!showCurrencies ? 'bg-white' : 'text-slate-500'}`}>Combinado</button>
              <button onClick={() => setShowCurrencies(true)} className={`px-2 py-1 rounded-lg text-xs font-semibold ${showCurrencies ? 'bg-white' : 'text-slate-500'}`}>Por Moneda</button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-xl mb-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              placeholder="Fecha inicio"
            />

            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              placeholder="Fecha fin"
            />

            <select
              value={filters.currency}
              onChange={(e) => setFilters(prev => ({ ...prev, currency: e.target.value }))}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            >
              <option value="">Todas las monedas</option>
              <option value="ARS">ARS</option>
              <option value="USD">USD</option>
            </select>

            <select
              value={filters.tipo}
              onChange={(e) => setFilters(prev => ({ ...prev, tipo: e.target.value }))}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            >
              <option value="">Todas las categorias</option>
              <option value="Laboral">Laboral</option>
              <option value="Personal">Personal</option>
            </select>

            <select
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            >
              <option value="">Todos los tipos</option>
              <option value="ingreso">Ingreso</option>
              <option value="egreso">Egreso</option>
            </select>

            <select
              value={filters.concept}
              onChange={(e) => setFilters(prev => ({ ...prev, concept: e.target.value }))}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            >
              <option value="">Todos los conceptos</option>
              {uniqueConcepts.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <button
              onClick={() => setFilters({ startDate: '', endDate: '', currency: '', tipo: '', type: '', concept: '' })}
              className="px-3 py-2 rounded-xl bg-slate-50 text-slate-700 border border-slate-200 text-sm"
            >
              Limpiar
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-sm text-slate-500 mr-2">{filteredTransactions.length} registros</div>
            <button onClick={exportToXLSX} className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-2 rounded-xl hover:shadow-lg text-sm">
              <Download className="w-4 h-4" />
              Exportar a Excel (.xlsx)
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/40 shadow-md">
          <h3 className="font-bold text-slate-900 mb-2">Ingresos vs Egresos</h3>
          {transactions.length === 0 ? (
            <div className="text-center text-slate-500 py-12">No hay datos para mostrar</div>
          ) : (
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={40} outerRadius={80} paddingAngle={4}>
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/40 shadow-md">
          <h3 className="font-bold text-slate-900 mb-2">Tendencia mensual (ultimos 12 meses)</h3>
          {monthly.length === 0 ? (
            <div className="text-center text-slate-500 py-12">No hay datos</div>
          ) : (
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer>
                <BarChart data={monthly} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                  <Legend />
                  <Bar dataKey="ingresos" stackId="a" fill="#10B981" />
                  <Bar dataKey="egresos" stackId="a" fill="#EF4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-slate-200/40 shadow-md">
        <h3 className="font-bold text-slate-900 mb-2">Top conceptos</h3>
        {topConcepts.length === 0 ? (
          <div className="text-center text-slate-500 py-6">No hay conceptos</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {topConcepts.map((c) => (
              <div key={c.concept} className="bg-white/5 rounded-xl p-3">
                <p className="text-sm font-semibold text-slate-900 mb-1 truncate">{c.concept}</p>
                <p className="text-xs text-slate-400">${c.value.toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
