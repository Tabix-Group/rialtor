'use client'

import React, { useMemo, useState } from 'react'
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, TooltipProps
} from 'recharts'
import { 
  BarChart3, Download, TrendingUp, TrendingDown, Wallet, 
  Calendar, Filter, Search, ChevronDown 
} from 'lucide-react' 

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

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1']

export default function Reportes({ transactions, balance }: Props) {
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
      const label = d.toLocaleString('es-ES', { month: 'short', year: '2-digit' }) // Formato más corto
      if (!map.has(key)) map.set(key, { month: label, ingresos: 0, egresos: 0 })
      const item = map.get(key)!
      // Nota: Aquí sumamos montos mixtos (ARS+USD) solo para el gráfico visual, 
      // idealmente se debería normalizar, pero respetamos la lógica actual.
      if (t.type === 'ingreso') item.ingresos += t.amount
      else item.egresos += t.amount
    })

    const arr = Array.from(map.entries()).map(([k, v]) => ({ key: k, ...v }))
    arr.sort((a, b) => a.key.localeCompare(b.key))
    return arr.slice(-12)
  }, [filteredTransactions])

  // Top concepts
  const topConcepts = useMemo(() => {
    const map = new Map<string, number>()
    filteredTransactions.forEach(t => {
        // Sumamos valor absoluto para ver volumen de movimiento
      map.set(t.concept, (map.get(t.concept) || 0) + t.amount)
    })
    const arr = Array.from(map.entries()).map(([concept, value]) => ({ concept, value }))
    arr.sort((a, b) => b.value - a.value)
    return arr.slice(0, 5) // Top 5
  }, [filteredTransactions])

  const maxConceptValue = useMemo(() => {
      if(topConcepts.length === 0) return 0;
      return topConcepts[0].value;
  }, [topConcepts]);

  const pieData = useMemo(() => {
    // Suma simple para visualización (ARS + USD)
    const totalIngresos = totals.ingresos.ARS + totals.ingresos.USD
    const totalEgresos = totals.egresos.ARS + totals.egresos.USD
    if (totalIngresos === 0 && totalEgresos === 0) return []
    return [
      { name: 'Ingresos', value: totalIngresos },
      { name: 'Egresos', value: totalEgresos }
    ]
  }, [totals])

  const exportToXLSX = async () => {
    if (filteredTransactions.length === 0) return

    try {
      const XLSX = (await import('xlsx')) as typeof import('xlsx')

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
      XLSX.writeFile(wb, `reporte_financiero_${new Date().toISOString().slice(0,10)}.xlsx`)
    } catch (err) {
      console.error('Error exporting XLSX:', err)
      alert('Error al generar el archivo .xlsx.')
    }
  }

  // Custom Tooltip para Gráficos
  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-200 shadow-lg rounded-lg">
          <p className="text-sm font-bold text-slate-700 mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-xs font-medium" style={{ color: entry.color }}>
              {entry.name}: ${entry.value?.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* 1. KPI CARDS - Estilo Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card Ingresos */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
           <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <TrendingUp className="w-16 h-16 text-emerald-600" />
           </div>
           <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-emerald-50 rounded-lg">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-slate-500 font-semibold text-sm uppercase tracking-wide">Ingresos Totales</span>
           </div>
           <div className="space-y-1">
             <div className="flex justify-between items-baseline">
                <span className="text-xs text-slate-400 font-medium">ARS</span>
                <span className="text-lg font-bold text-slate-800 tabular-nums">${totals.ingresos.ARS.toLocaleString()}</span>
             </div>
             <div className="flex justify-between items-baseline">
                <span className="text-xs text-slate-400 font-medium">USD</span>
                <span className="text-lg font-bold text-emerald-600 tabular-nums">${totals.ingresos.USD.toLocaleString()}</span>
             </div>
           </div>
        </div>

        {/* Card Egresos */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
           <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <TrendingDown className="w-16 h-16 text-rose-600" />
           </div>
           <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-rose-50 rounded-lg">
                <TrendingDown className="w-5 h-5 text-rose-600" />
              </div>
              <span className="text-slate-500 font-semibold text-sm uppercase tracking-wide">Egresos Totales</span>
           </div>
           <div className="space-y-1">
             <div className="flex justify-between items-baseline">
                <span className="text-xs text-slate-400 font-medium">ARS</span>
                <span className="text-lg font-bold text-slate-800 tabular-nums">${totals.egresos.ARS.toLocaleString()}</span>
             </div>
             <div className="flex justify-between items-baseline">
                <span className="text-xs text-slate-400 font-medium">USD</span>
                <span className="text-lg font-bold text-rose-600 tabular-nums">${totals.egresos.USD.toLocaleString()}</span>
             </div>
           </div>
        </div>

        {/* Card Balance Neto (Actual) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
           <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Wallet className="w-16 h-16 text-blue-600" />
           </div>
           <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Wallet className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-slate-500 font-semibold text-sm uppercase tracking-wide">Balance Actual</span>
           </div>
           <div className="space-y-1">
             <div className="flex justify-between items-baseline">
                <span className="text-xs text-slate-400 font-medium">ARS</span>
                <span className="text-lg font-bold text-slate-800 tabular-nums">${balance.ARS.toLocaleString()}</span>
             </div>
             <div className="flex justify-between items-baseline">
                <span className="text-xs text-slate-400 font-medium">USD</span>
                <span className="text-lg font-bold text-blue-600 tabular-nums">${balance.USD.toLocaleString()}</span>
             </div>
           </div>
        </div>
      </div>

      {/* 2. FILTROS Y EXPORTAR */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
        <div className="flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center">
            {/* Area de Filtros */}
            <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                 <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input type="date" value={filters.startDate} onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))} className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:border-blue-500 transition-colors" placeholder="Inicio" />
                 </div>
                 <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input type="date" value={filters.endDate} onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))} className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:border-blue-500 transition-colors" placeholder="Fin" />
                 </div>
                 
                 <div className="relative">
                     <Filter className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                     <select value={filters.currency} onChange={(e) => setFilters(prev => ({ ...prev, currency: e.target.value }))} className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:border-blue-500 appearance-none">
                        <option value="">Todas las monedas</option>
                        <option value="ARS">ARS</option>
                        <option value="USD">USD</option>
                     </select>
                     <ChevronDown className="absolute right-3 top-3 h-3 w-3 text-slate-400 pointer-events-none" />
                 </div>

                 <div className="relative">
                     <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                     <select value={filters.concept} onChange={(e) => setFilters(prev => ({ ...prev, concept: e.target.value }))} className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:border-blue-500 appearance-none">
                        <option value="">Todos los conceptos</option>
                        {uniqueConcepts.map(c => <option key={c} value={c}>{c}</option>)}
                     </select>
                     <ChevronDown className="absolute right-3 top-3 h-3 w-3 text-slate-400 pointer-events-none" />
                 </div>
            </div>

            {/* Botones de Acción */}
            <div className="flex items-center gap-3 w-full xl:w-auto">
                <button onClick={() => setFilters({ startDate: '', endDate: '', currency: '', tipo: '', type: '', concept: '' })} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors flex-1 xl:flex-none justify-center flex">
                    Limpiar
                </button>
                <button onClick={exportToXLSX} className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-lg shadow-slate-900/20 flex-1 xl:flex-none justify-center">
                    <Download className="w-4 h-4" />
                    <span>Exportar Excel</span>
                </button>
            </div>
        </div>
      </div>

      {/* 3. GRÁFICOS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Barras */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-500" />
                  Flujo de Caja Mensual
              </h3>
              <span className="text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">Últimos 12 meses</span>
          </div>
          
          <div className="flex-1 min-h-[300px]">
            {monthly.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                    <BarChart3 className="w-10 h-10 mb-2 opacity-20" />
                    <p className="text-sm">No hay datos suficientes</p>
                </div>
            ) : (
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthly} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={32}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                        <Tooltip content={<CustomTooltip />} cursor={{fill: '#f8fafc'}} />
                        <Legend iconType="circle" wrapperStyle={{paddingTop: '20px'}} />
                        <Bar name="Ingresos" dataKey="ingresos" fill="#10B981" radius={[4, 4, 0, 0]} />
                        <Bar name="Egresos" dataKey="egresos" fill="#EF4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Gráfico de Torta */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-purple-500" />
                  Distribución Ingresos vs Egresos
              </h3>
          </div>

          <div className="flex-1 min-h-[300px] flex items-center justify-center relative">
             {pieData.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-slate-400">
                    <PieChart className="w-10 h-10 mb-2 opacity-20" />
                    <p className="text-sm">Sin datos para graficar</p>
                </div>
             ) : (
                 <>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie 
                                data={pieData} 
                                cx="50%" 
                                cy="50%" 
                                innerRadius={80} 
                                outerRadius={110} 
                                paddingAngle={5} 
                                dataKey="value"
                                stroke="none"
                            >
                                {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.name === 'Ingresos' ? '#10B981' : '#EF4444'} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend verticalAlign="bottom" height={36} iconType="circle"/>
                        </PieChart>
                    </ResponsiveContainer>
                    {/* Texto central */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-center">
                            <p className="text-xs text-slate-400 font-medium">Total Vol.</p>
                            <p className="text-xl font-bold text-slate-800">
                                {filteredTransactions.length}
                            </p>
                            <p className="text-[10px] text-slate-400">Ops</p>
                        </div>
                    </div>
                 </>
             )}
          </div>
        </div>
      </div>

      {/* 4. TOP CONCEPTOS (LISTA CON PROGRESO) */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
         <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-500" />
            Top Conceptos (Mayor Volumen)
         </h3>
         
         {topConcepts.length === 0 ? (
             <div className="text-center py-8 text-slate-400 text-sm">No hay registros para analizar</div>
         ) : (
             <div className="space-y-4">
                 {topConcepts.map((item, idx) => {
                     // Calcular porcentaje relativo al mayor para la barra de progreso
                     const percentage = (item.value / maxConceptValue) * 100;
                     return (
                         <div key={item.concept} className="group">
                             <div className="flex justify-between items-center mb-1">
                                 <div className="flex items-center gap-3">
                                     <span className="w-6 h-6 flex items-center justify-center bg-slate-100 text-slate-500 rounded text-xs font-bold">
                                         {idx + 1}
                                     </span>
                                     <span className="text-sm font-medium text-slate-700">{item.concept}</span>
                                 </div>
                                 <span className="text-sm font-bold text-slate-900 tabular-nums">
                                     ${item.value.toLocaleString()}
                                 </span>
                             </div>
                             <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                 <div 
                                    className="h-full bg-indigo-500 rounded-full transition-all duration-500 ease-out group-hover:bg-indigo-600"
                                    style={{ width: `${percentage}%` }}
                                 ></div>
                             </div>
                         </div>
                     )
                 })}
             </div>
         )}
      </div>
    </div>
  )
}