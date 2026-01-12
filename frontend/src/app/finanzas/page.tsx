'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../auth/authContext'
import { useRouter } from 'next/navigation'
import { authenticatedFetch } from '@/utils/api'
import {
  DollarSign, Plus, Calendar, Filter, TrendingUp, TrendingDown,
  Edit3, Trash2, X, BarChart3, Search, ArrowRightLeft, Briefcase, User, Wallet
} from 'lucide-react'
import Reportes from './Reportes'

interface FinanceTransaction {
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

interface Balance {
  ARS: number
  USD: number
}

export default function FinanzasPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [transactions, setTransactions] = useState<FinanceTransaction[]>([])
  const [balance, setBalance] = useState<Balance>({ ARS: 0, USD: 0 })
  const [loadingData, setLoadingData] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<FinanceTransaction | null>(null)
  const [activeTab, setActiveTab] = useState<'transacciones' | 'reportes'>('transacciones')

  // Conceptos predeterminados por Tipo
  const conceptosLaboralIngresos = [
    'Comisiones Inmobiliarias x Venta',
    'Comisiones Inmobiliarias x Alquiler',
    'Comisiones por Seguro de Caucion',
    'Comisiones Escribanos',
    'Ingresos por Tasaciones',
    'Otros'
  ]

  const conceptosLaboralEgresos = [
    'Gastos de Publicacion',
    'Gastos de Redes Sociales',
    'Gastos Membresia Oficina',
    'Gastos Fee Oficina',
    'Gastos Capacitaciones',
    'Gastos App inmobiliarias',
    'Gastos Tarjetas y Carteleria',
    'Gastos por Regalos Clientes',
    'Gastos de Traslado',
    'Gastos MKT y Eventos',
    'Otros'
  ]

  const conceptosPersonalIngresos = [
    'SALARIO',
    'OTROS'
  ]

  const conceptosPersonalEgresos = [
    'ALQUILER',
    'AYSA',
    'CELULAR',
    'COLEGIO',
    'COMIDA',
    'CONTADOR',
    'EXPENSAS',
    'GARAGE',
    'GAS',
    'IIBB',
    'INTERNET',
    'LUZ',
    'MONOTRIBUTO',
    'OTROS',
    'PERSONAL',
    'PREPAGA',
    'SEGURO'
  ]

  // Form state
  const [formData, setFormData] = useState({
    tipo: 'Laboral' as 'Personal' | 'Laboral',
    type: 'ingreso' as 'ingreso' | 'egreso',
    concept: '',
    description: '',
    amount: '',
    currency: 'ARS' as 'ARS' | 'USD',
    date: new Date().toISOString().split('T')[0]
  })

  // Filters
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    currency: '',
    tipo: '',
    type: '',
    concept: ''
  })

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth/login')
    } else if (user) {
      fetchTransactions()
      fetchBalance()
    }
  }, [user, loading, router])

  const fetchTransactions = async () => {
    try {
      const params = new URLSearchParams()
      if (filters.startDate) params.append('startDate', filters.startDate)
      if (filters.endDate) params.append('endDate', filters.endDate)
      if (filters.currency) params.append('currency', filters.currency)

      const response = await authenticatedFetch(`/api/finances?${params}`)
      const data = await response.json()
      setTransactions(data.transactions || [])
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setLoadingData(false)
    }
  }

  const fetchBalance = async () => {
    try {
      const params = new URLSearchParams()
      if (filters.startDate) params.append('startDate', filters.startDate)
      if (filters.endDate) params.append('endDate', filters.endDate)

      const response = await authenticatedFetch(`/api/finances/balance?${params}`)
      const data = await response.json()
      setBalance(data.balances || { ARS: 0, USD: 0 })
    } catch (error) {
      console.error('Error fetching balance:', error)
    }
  }

  useEffect(() => {
    if (user) {
      fetchTransactions()
      fetchBalance()
    }
  }, [filters, user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingTransaction ? `/api/finances/${editingTransaction.id}` : '/api/finances'
      const method = editingTransaction ? 'PUT' : 'POST'

      const response = await authenticatedFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setShowForm(false)
        setEditingTransaction(null)
        resetForm()
        fetchTransactions()
        fetchBalance()
      }
    } catch (error) {
      console.error('Error saving transaction:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta transacción?')) return

    try {
      const response = await authenticatedFetch(`/api/finances/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchTransactions()
        fetchBalance()
      }
    } catch (error) {
      console.error('Error deleting transaction:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      tipo: 'Laboral',
      type: 'ingreso',
      concept: '',
      description: '',
      amount: '',
      currency: 'ARS',
      date: new Date().toISOString().split('T')[0]
    })
  }

  const handleTypeChange = (newType: 'ingreso' | 'egreso') => {
    setFormData(prev => ({
      ...prev,
      type: newType,
      concept: ''
    }))
  }

  const handleTipoChange = (newTipo: 'Personal' | 'Laboral') => {
    setFormData(prev => ({
      ...prev,
      tipo: newTipo,
      concept: ''
    }))
  }

  const startEdit = (transaction: FinanceTransaction) => {
    setEditingTransaction(transaction)
    setFormData({
      tipo: transaction.tipo,
      type: transaction.type,
      concept: transaction.concept,
      description: transaction.description || '',
      amount: transaction.amount.toString(),
      currency: transaction.currency,
      date: new Date(transaction.date).toISOString().split('T')[0]
    })
    setShowForm(true)
  }

  const filteredTransactions = transactions.filter(t => {
    if (filters.tipo && t.tipo !== filters.tipo) return false
    if (filters.type && t.type !== filters.type) return false
    if (filters.concept && t.concept !== filters.concept) return false
    return true
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-slate-500 font-medium">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header Moderno */}
      <div className="bg-slate-900 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
                  Real Estate Finance
                </div>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                Control Financiero
              </h1>
              <p className="text-slate-400 mt-2 max-w-xl text-sm sm:text-base">
                Gestiona tus comisiones, gastos operativos y finanzas personales en un solo lugar.
              </p>
            </div>

            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg shadow-blue-900/20 active:transform active:scale-95"
            >
              <Plus className="w-5 h-5" />
              <span>Registrar Movimiento</span>
            </button>
          </div>

          {/* Balance Cards superpuestas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700 rounded-xl p-5 flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">Balance Total ARS</p>
                <p className="text-2xl font-bold text-white tabular-nums">
                  $ {balance.ARS.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20">
                <span className="text-green-400 font-bold text-xs">ARS</span>
              </div>
            </div>
            
            <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700 rounded-xl p-5 flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">Balance Total USD</p>
                <p className="text-2xl font-bold text-white tabular-nums">
                  U$S {balance.USD.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                <span className="text-blue-400 font-bold text-xs">USD</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 pb-12">
        {/* Contenedor Principal Blanco */}
        <div className="bg-white rounded-xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
          
          {/* ----- SECCIÓN DE FILTROS MEJORADA ----- */}
          <div className="p-5 border-b border-slate-100 bg-slate-50/50">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2 text-slate-700">
                    <Filter className="w-4 h-4" />
                    <span className="font-semibold text-sm">Filtros Avanzados</span>
                 </div>
                 <button
                    onClick={() => setFilters({ startDate: '', endDate: '', currency: '', tipo: '', type: '', concept: '' })}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium hover:underline"
                 >
                    Limpiar todo
                 </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
                {/* Fechas */}
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                    className="block w-full pl-10 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
                  />
                </div>
                
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                    className="block w-full pl-10 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
                  />
                </div>

                {/* Selectors con estilo uniforme */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                     <Wallet className="h-4 w-4 text-slate-400" />
                  </div>
                  <select
                    value={filters.currency}
                    onChange={(e) => setFilters(prev => ({ ...prev, currency: e.target.value }))}
                    className="block w-full pl-10 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 shadow-sm appearance-none"
                  >
                    <option value="">Moneda</option>
                    <option value="ARS">Pesos (ARS)</option>
                    <option value="USD">Dólares (USD)</option>
                  </select>
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                     <Briefcase className="h-4 w-4 text-slate-400" />
                  </div>
                  <select
                    value={filters.tipo}
                    onChange={(e) => setFilters(prev => ({ ...prev, tipo: e.target.value, concept: '' }))}
                    className="block w-full pl-10 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 shadow-sm appearance-none"
                  >
                    <option value="">Categoría</option>
                    <option value="Laboral">Laboral</option>
                    <option value="Personal">Personal</option>
                  </select>
                </div>

                <div className="relative">
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                     <ArrowRightLeft className="h-4 w-4 text-slate-400" />
                  </div>
                  <select
                    value={filters.type}
                    onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value, concept: '' }))}
                    className="block w-full pl-10 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 shadow-sm appearance-none"
                  >
                    <option value="">Tipo Mov.</option>
                    <option value="ingreso">Ingresos</option>
                    <option value="egreso">Egresos</option>
                  </select>
                </div>

                <div className="relative lg:col-span-1">
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                     <Search className="h-4 w-4 text-slate-400" />
                  </div>
                  <select
                    value={filters.concept}
                    onChange={(e) => setFilters(prev => ({ ...prev, concept: e.target.value }))}
                    className="block w-full pl-10 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 shadow-sm appearance-none"
                  >
                    <option value="">Concepto</option>
                    {/* (Lógica de opciones de conceptos existente se mantiene igual) */}
                    {filters.tipo === 'Laboral' && filters.type === 'ingreso' && conceptosLaboralIngresos.map((concept) => (
                      <option key={concept} value={concept}>{concept}</option>
                    ))}
                    {filters.tipo === 'Laboral' && filters.type === 'egreso' && conceptosLaboralEgresos.map((concept) => (
                      <option key={concept} value={concept}>{concept}</option>
                    ))}
                    {filters.tipo === 'Personal' && filters.type === 'ingreso' && conceptosPersonalIngresos.map((concept) => (
                      <option key={concept} value={concept}>{concept}</option>
                    ))}
                    {filters.tipo === 'Personal' && filters.type === 'egreso' && conceptosPersonalEgresos.map((concept) => (
                      <option key={concept} value={concept}>{concept}</option>
                    ))}
                    {!filters.tipo && !filters.type && (
                    <>
                      <optgroup label="Laboral - Ingresos">
                        {conceptosLaboralIngresos.map((concept) => (<option key={`li-${concept}`} value={concept}>{concept}</option>))}
                      </optgroup>
                      <optgroup label="Laboral - Egresos">
                        {conceptosLaboralEgresos.map((concept) => (<option key={`le-${concept}`} value={concept}>{concept}</option>))}
                      </optgroup>
                      <optgroup label="Personal - Ingresos">
                        {conceptosPersonalIngresos.map((concept) => (<option key={`pi-${concept}`} value={concept}>{concept}</option>))}
                      </optgroup>
                      <optgroup label="Personal - Egresos">
                        {conceptosPersonalEgresos.map((concept) => (<option key={`pe-${concept}`} value={concept}>{concept}</option>))}
                      </optgroup>
                    </>
                  )}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* ----- TAB TABS ----- */}
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setActiveTab('transacciones')}
              className={`flex-1 py-4 text-sm font-medium text-center border-b-2 transition-colors ${
                activeTab === 'transacciones'
                  ? 'border-blue-600 text-blue-600 bg-blue-50/30'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              Listado de Movimientos
            </button>
            <button
              onClick={() => setActiveTab('reportes')}
              className={`flex-1 py-4 text-sm font-medium text-center border-b-2 transition-colors ${
                activeTab === 'reportes'
                  ? 'border-blue-600 text-blue-600 bg-blue-50/30'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              Análisis y Reportes
            </button>
          </div>

          <div className="p-0">
            {activeTab === 'transacciones' ? (
              <>
                {loadingData ? (
                  <div className="py-20 flex flex-col items-center justify-center">
                    <div className="w-10 h-10 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
                    <p className="mt-4 text-slate-400 text-sm">Cargando datos...</p>
                  </div>
                ) : filteredTransactions.length === 0 ? (
                  <div className="text-center py-24 bg-slate-50/30">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-slate-900 font-medium text-lg">No se encontraron movimientos</h3>
                    <p className="text-slate-500 text-sm mt-1 mb-6">Prueba ajustando los filtros o crea una nueva transacción.</p>
                    <button onClick={() => setShowForm(true)} className="text-blue-600 font-medium text-sm hover:underline">
                        + Crear nuevo registro
                    </button>
                  </div>
                ) : (
                  <div className="min-h-[400px]">
                    {/* VISTA DESKTOP: TABLA PROFESIONAL */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider w-32">Fecha</th>
                            <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Concepto</th>
                            <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider w-32">Categoría</th>
                            <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider w-32 text-right">Monto</th>
                            <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider w-24 text-center">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredTransactions.map((t) => (
                            <tr key={t.id} className="hover:bg-blue-50/30 transition-colors group">
                              <td className="py-3 px-6 text-sm text-slate-600 whitespace-nowrap">
                                {new Date(t.date).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </td>
                              <td className="py-3 px-6">
                                <div className="flex flex-col">
                                  <span className="text-sm font-medium text-slate-900">{t.concept}</span>
                                  {t.description && (
                                    <span className="text-xs text-slate-400 truncate max-w-[250px]">{t.description}</span>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 px-6">
                                <div className="flex flex-col gap-1">
                                    <span className={`inline-flex w-fit px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                                        t.tipo === 'Laboral' ? 'bg-indigo-50 text-indigo-700' : 'bg-purple-50 text-purple-700'
                                    }`}>
                                        {t.tipo}
                                    </span>
                                </div>
                              </td>
                              <td className="py-3 px-6 text-right">
                                <div className="flex flex-col items-end">
                                    <span className={`text-sm font-bold tabular-nums ${
                                        t.type === 'ingreso' ? 'text-emerald-600' : 'text-rose-600'
                                    }`}>
                                        {t.type === 'ingreso' ? '+' : '-'} {t.currency === 'USD' ? 'U$S' : '$'} {t.amount.toLocaleString('es-AR', {minimumFractionDigits: 2})}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-medium uppercase">{t.type}</span>
                                </div>
                              </td>
                              <td className="py-3 px-6 text-center">
                                <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button onClick={() => startEdit(t)} className="p-1.5 text-slate-400 hover:text-blue-600 rounded-md hover:bg-blue-50 transition-colors">
                                    <Edit3 className="w-4 h-4" />
                                  </button>
                                  <button onClick={() => handleDelete(t.id)} className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* VISTA MOBILE: CARDS OPTIMIZADAS */}
                    <div className="md:hidden divide-y divide-slate-100">
                      {filteredTransactions.map((t) => (
                        <div key={t.id} className="p-4 active:bg-slate-50">
                          <div className="flex items-start justify-between mb-2">
                             <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                    {new Date(t.date).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}
                                </span>
                                <span className={`text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded border ${
                                    t.tipo === 'Laboral' ? 'border-indigo-100 text-indigo-600' : 'border-purple-100 text-purple-600'
                                }`}>
                                    {t.tipo}
                                </span>
                             </div>
                             <div className="flex gap-2">
                                <button onClick={() => startEdit(t)}><Edit3 className="w-4 h-4 text-slate-300 hover:text-blue-600" /></button>
                                <button onClick={() => handleDelete(t.id)}><Trash2 className="w-4 h-4 text-slate-300 hover:text-red-600" /></button>
                             </div>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <div className="flex-1 pr-4">
                                <p className="text-sm font-semibold text-slate-900 line-clamp-1">{t.concept}</p>
                                {t.description && <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{t.description}</p>}
                            </div>
                            <div className="text-right">
                                <p className={`text-base font-bold tabular-nums ${
                                    t.type === 'ingreso' ? 'text-emerald-600' : 'text-rose-600'
                                }`}>
                                    {t.type === 'ingreso' ? '+' : '-'} {t.currency === 'USD' ? 'U$S' : '$'} {Math.abs(t.amount).toLocaleString('es-AR', {minimumFractionDigits: 0})}
                                </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
                <div className="p-6">
                    <Reportes transactions={filteredTransactions} balance={balance} />
                </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL FORM - Ligeramente estilizado para consistencia */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="text-lg font-bold text-slate-800">
                {editingTransaction ? 'Editar Registro' : 'Nuevo Movimiento'}
              </h3>
              <button
                onClick={() => {
                  setShowForm(false)
                  setEditingTransaction(null)
                  resetForm()
                }}
                className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Selector de Tipo (Personal/Laboral) */}
              <div className="grid grid-cols-2 gap-3 p-1 bg-slate-100 rounded-lg">
                <button
                    type="button"
                    onClick={() => handleTipoChange('Laboral')}
                    className={`py-2 text-sm font-medium rounded-md transition-all ${
                        formData.tipo === 'Laboral' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    Laboral
                </button>
                <button
                    type="button"
                    onClick={() => handleTipoChange('Personal')}
                    className={`py-2 text-sm font-medium rounded-md transition-all ${
                        formData.tipo === 'Personal' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    Personal
                </button>
              </div>

              {/* Selector Ingreso/Egreso */}
              <div className="flex gap-4">
                <label className={`flex-1 cursor-pointer border rounded-lg p-3 flex items-center justify-center gap-2 transition-all ${
                    formData.type === 'ingreso' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 hover:border-emerald-200'
                }`}>
                    <input type="radio" name="type" value="ingreso" checked={formData.type === 'ingreso'} onChange={() => handleTypeChange('ingreso')} className="hidden" />
                    <TrendingUp className="w-4 h-4" />
                    <span className="font-medium text-sm">Ingreso</span>
                </label>
                <label className={`flex-1 cursor-pointer border rounded-lg p-3 flex items-center justify-center gap-2 transition-all ${
                    formData.type === 'egreso' ? 'border-rose-500 bg-rose-50 text-rose-700' : 'border-slate-200 hover:border-rose-200'
                }`}>
                    <input type="radio" name="type" value="egreso" checked={formData.type === 'egreso'} onChange={() => handleTypeChange('egreso')} className="hidden" />
                    <TrendingDown className="w-4 h-4" />
                    <span className="font-medium text-sm">Egreso</span>
                </label>
              </div>

              {/* Campos Restantes */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Concepto</label>
                <select
                  value={formData.concept}
                  onChange={(e) => setFormData(prev => ({ ...prev, concept: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  required
                >
                  <option value="">Seleccionar concepto...</option>
                   {formData.tipo === 'Laboral' && formData.type === 'ingreso' && conceptosLaboralIngresos.map(c => <option key={c} value={c}>{c}</option>)}
                   {formData.tipo === 'Laboral' && formData.type === 'egreso' && conceptosLaboralEgresos.map(c => <option key={c} value={c}>{c}</option>)}
                   {formData.tipo === 'Personal' && formData.type === 'ingreso' && conceptosPersonalIngresos.map(c => <option key={c} value={c}>{c}</option>)}
                   {formData.tipo === 'Personal' && formData.type === 'egreso' && conceptosPersonalEgresos.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Monto y Moneda</label>
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <span className="absolute left-3 top-2.5 text-slate-400 font-medium">$</span>
                        <input
                            type="number"
                            step="0.01"
                            value={formData.amount}
                            onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                            className="w-full pl-7 pr-3 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                            placeholder="0.00"
                            required
                        />
                    </div>
                    <select
                        value={formData.currency}
                        onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value as 'ARS' | 'USD' }))}
                        className="w-24 px-2 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm font-medium text-slate-700"
                    >
                        <option value="ARS">ARS</option>
                        <option value="USD">USD</option>
                    </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Fecha</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Notas Adicionales</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                  rows={2}
                  placeholder="Detalles opcionales..."
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setEditingTransaction(null); resetForm(); }}
                  className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium text-sm transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm shadow-md shadow-blue-500/20 transition-all transform active:scale-95"
                >
                  {editingTransaction ? 'Guardar Cambios' : 'Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}