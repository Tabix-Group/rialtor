'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../auth/authContext'
import { useRouter } from 'next/navigation'
import { authenticatedFetch } from '@/utils/api'
import {
  DollarSign, Plus, Minus, Calendar, Filter, TrendingUp, TrendingDown,
  ArrowUpRight, Edit3, Trash2, Search, X, ChevronDown, BarChart3,
  Wallet, ArrowRightLeft, FileText
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
        <div className="text-center">
          <div className="relative inline-block">
            <div className="w-20 h-20 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
          <p className="mt-6 text-slate-600 font-semibold text-lg">Cargando finanzas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      
      {/* ================================================================================= */}
      {/* CABECERA ORIGINAL RESTAURADA (NO TOCAR) */}
      {/* ================================================================================= */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 pb-20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItaDJWMzZoLTJ6bTAtNHYyaDJWMzBoLTJ6bTAtNHYyaDJWMjZoLTJ6bTAtNHYyaDJWMjJoLTJ6bTAtNHYyaDJWMThoLTJ6bTAtNHYyaDJWMTRoLTJ6bTAtNHYyaDJWMTBoLTJ6bTAtNHYyaDJWNmgtMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/20 to-slate-900/90"></div>

        <div className="relative max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 lg:gap-8">
            <div className="flex-1 w-full lg:w-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-4 sm:mb-6">
                <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                <span className="text-xs sm:text-sm font-semibold text-white">Centro Financiero</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-3 sm:mb-4 tracking-tight">
                Mis <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">Finanzas</span>
              </h1>

              <p className="text-base sm:text-lg lg:text-xl text-slate-300 mb-6 sm:mb-8 max-w-2xl leading-relaxed">
                Controla tus ingresos y egresos personales. Mantén un registro detallado de tu flujo de caja.
              </p>

              <button
                onClick={() => setShowForm(true)}
                className="group inline-flex items-center gap-2 sm:gap-3 bg-white text-slate-900 px-6 sm:px-8 py-3 sm:py-4 rounded-2xl hover:shadow-2xl hover:shadow-white/20 transition-all duration-300 hover:-translate-y-1 font-semibold text-sm sm:text-base"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-90 transition-transform duration-300" />
                Nueva Transacción
              </button>
            </div>

            {/* Balance Cards */}
            <div className="w-full lg:w-auto grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="bg-white/10 backdrop-blur-xl rounded-xl sm:rounded-2xl lg:rounded-3xl p-4 sm:p-5 lg:p-6 border border-white/20 shadow-2xl">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm text-slate-300 mb-1">Saldo ARS</p>
                    <p className="text-base sm:text-xl lg:text-2xl font-bold text-white truncate">
                      ${balance.ARS.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-xl rounded-xl sm:rounded-2xl lg:rounded-3xl p-4 sm:p-5 lg:p-6 border border-white/20 shadow-2xl">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm text-slate-300 mb-1">Saldo USD</p>
                    <p className="text-base sm:text-xl lg:text-2xl font-bold text-white truncate">
                      ${balance.USD.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* ================================================================================= */}
      {/* FIN CABECERA */}
      {/* ================================================================================= */}


      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10 pb-20">
        
        {/* ================================================================================= */}
        {/* NUEVA BARRA DE FILTROS FLOTANTE */}
        {/* ================================================================================= */}
        <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-5 mb-8">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-700">
                    <Filter className="w-4 h-4 text-blue-600" />
                    <span className="font-bold text-sm tracking-wide uppercase text-slate-500">Filtrar Movimientos</span>
                </div>
                <button
                    onClick={() => setFilters({ startDate: '', endDate: '', currency: '', tipo: '', type: '', concept: '' })}
                    className="text-xs text-slate-400 hover:text-blue-600 font-medium transition-colors hover:underline"
                >
                    Limpiar todo
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
               {/* Date Inputs */}
               <div className="relative group">
                  <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors pointer-events-none" />
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
                <div className="relative group">
                  <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors pointer-events-none" />
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>

                {/* Selects with Icons */}
                <div className="relative group">
                  <Wallet className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors pointer-events-none" />
                  <select
                    value={filters.currency}
                    onChange={(e) => setFilters(prev => ({ ...prev, currency: e.target.value }))}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none"
                  >
                    <option value="">Moneda</option>
                    <option value="ARS">ARS</option>
                    <option value="USD">USD</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-3 h-3 w-3 text-slate-400 pointer-events-none" />
                </div>

                <div className="relative group">
                  <div className="absolute left-3 top-2.5 text-slate-400 font-bold text-xs group-focus-within:text-blue-500 pointer-events-none">ID</div>
                  <select
                    value={filters.tipo}
                    onChange={(e) => setFilters(prev => ({ ...prev, tipo: e.target.value, concept: '' }))}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none"
                  >
                    <option value="">Categoría</option>
                    <option value="Laboral">Laboral</option>
                    <option value="Personal">Personal</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-3 h-3 w-3 text-slate-400 pointer-events-none" />
                </div>

                <div className="relative group">
                  <ArrowRightLeft className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors pointer-events-none" />
                  <select
                    value={filters.type}
                    onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value, concept: '' }))}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none"
                  >
                    <option value="">Tipo</option>
                    <option value="ingreso">Ingresos</option>
                    <option value="egreso">Egresos</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-3 h-3 w-3 text-slate-400 pointer-events-none" />
                </div>

                <div className="relative group lg:col-span-1">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors pointer-events-none" />
                  <select
                    value={filters.concept}
                    onChange={(e) => setFilters(prev => ({ ...prev, concept: e.target.value }))}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none"
                  >
                    <option value="">Concepto</option>
                    {/* (Lógica de opciones existente se mantiene) */}
                    {filters.tipo === 'Laboral' && filters.type === 'ingreso' && conceptosLaboralIngresos.map(c => <option key={c} value={c}>{c}</option>)}
                    {filters.tipo === 'Laboral' && filters.type === 'egreso' && conceptosLaboralEgresos.map(c => <option key={c} value={c}>{c}</option>)}
                    {filters.tipo === 'Personal' && filters.type === 'ingreso' && conceptosPersonalIngresos.map(c => <option key={c} value={c}>{c}</option>)}
                    {filters.tipo === 'Personal' && filters.type === 'egreso' && conceptosPersonalEgresos.map(c => <option key={c} value={c}>{c}</option>)}
                    {!filters.tipo && !filters.type && (
                        <>
                        <optgroup label="Laboral - Ingresos">{conceptosLaboralIngresos.map(c => <option key={`li-${c}`} value={c}>{c}</option>)}</optgroup>
                        <optgroup label="Laboral - Egresos">{conceptosLaboralEgresos.map(c => <option key={`le-${c}`} value={c}>{c}</option>)}</optgroup>
                        <optgroup label="Personal - Ingresos">{conceptosPersonalIngresos.map(c => <option key={`pi-${c}`} value={c}>{c}</option>)}</optgroup>
                        <optgroup label="Personal - Egresos">{conceptosPersonalEgresos.map(c => <option key={`pe-${c}`} value={c}>{c}</option>)}</optgroup>
                        </>
                    )}
                  </select>
                  <ChevronDown className="absolute right-3 top-3 h-3 w-3 text-slate-400 pointer-events-none" />
                </div>
            </div>
          </div>
        </div>


        {/* ================================================================================= */}
        {/* CONTENEDOR PRINCIPAL: TABLA Y REPORTES */}
        {/* ================================================================================= */}
        <div className="bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden min-h-[500px]">
            {/* Tab Navigation */}
            <div className="flex border-b border-slate-200">
                <button
                  onClick={() => setActiveTab('transacciones')}
                  className={`flex-1 py-4 text-sm font-semibold text-center border-b-2 transition-colors flex items-center justify-center gap-2 ${
                    activeTab === 'transacciones'
                      ? 'border-blue-600 text-blue-600 bg-blue-50/30'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <FileText className="w-4 h-4" /> Listado de Movimientos
                </button>
                <button
                  onClick={() => setActiveTab('reportes')}
                  className={`flex-1 py-4 text-sm font-semibold text-center border-b-2 transition-colors flex items-center justify-center gap-2 ${
                    activeTab === 'reportes'
                      ? 'border-blue-600 text-blue-600 bg-blue-50/30'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" /> Análisis y Reportes
                </button>
            </div>

            <div className="p-0">
            {activeTab === 'transacciones' ? (
              <>
                {loadingData ? (
                  <div className="flex flex-col items-center justify-center py-24">
                    <div className="w-10 h-10 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
                    <p className="mt-4 text-slate-400 text-sm font-medium">Cargando datos...</p>
                  </div>
                ) : filteredTransactions.length === 0 ? (
                  <div className="text-center py-24 bg-slate-50/30">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100">
                        <Search className="w-8 h-8 text-slate-300" />
                    </div>
                    <h3 className="text-slate-900 font-bold text-lg">No se encontraron movimientos</h3>
                    <p className="text-slate-500 text-sm mt-1 mb-6 max-w-sm mx-auto">Prueba ajustando los filtros seleccionados o crea una nueva transacción para comenzar.</p>
                    <button onClick={() => setShowForm(true)} className="text-blue-600 font-bold text-sm hover:underline">
                        + Crear nuevo registro
                    </button>
                  </div>
                ) : (
                  <>
                    {/* ======================= */}
                    {/* VISTA DESKTOP: TABLA    */}
                    {/* ======================= */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider w-32">Fecha</th>
                            <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Concepto</th>
                            <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider w-32">Categoría</th>
                            <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider w-40 text-right">Monto</th>
                            <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider w-24 text-center">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredTransactions.map((t) => (
                            <tr key={t.id} className="hover:bg-blue-50/20 transition-colors group">
                              <td className="py-4 px-6 text-sm text-slate-600 whitespace-nowrap">
                                {new Date(t.date).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </td>
                              <td className="py-4 px-6">
                                <div className="flex flex-col">
                                  <span className="text-sm font-semibold text-slate-800">{t.concept}</span>
                                  {t.description && (
                                    <span className="text-xs text-slate-400 truncate max-w-[250px] mt-0.5">{t.description}</span>
                                  )}
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                                    t.tipo === 'Laboral' 
                                        ? 'bg-blue-50 text-blue-700 border-blue-100' 
                                        : 'bg-purple-50 text-purple-700 border-purple-100'
                                }`}>
                                    {t.tipo}
                                </span>
                              </td>
                              <td className="py-4 px-6 text-right">
                                <div className="flex flex-col items-end">
                                    <span className={`text-sm font-bold tabular-nums tracking-tight ${
                                        t.type === 'ingreso' ? 'text-emerald-600' : 'text-slate-900'
                                    }`}>
                                        {t.type === 'ingreso' ? '+' : '-'} {t.currency === 'USD' ? 'U$S' : '$'} {t.amount.toLocaleString('es-AR', {minimumFractionDigits: 2})}
                                    </span>
                                    {t.type === 'egreso' && <span className="text-[10px] text-slate-400 font-medium uppercase">Egreso</span>}
                                </div>
                              </td>
                              <td className="py-4 px-6 text-center">
                                <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button onClick={() => startEdit(t)} className="p-1.5 text-slate-400 hover:text-blue-600 rounded hover:bg-blue-50 transition-colors">
                                    <Edit3 className="w-4 h-4" />
                                  </button>
                                  <button onClick={() => handleDelete(t.id)} className="p-1.5 text-slate-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* ======================= */}
                    {/* VISTA MOBILE: CARDS     */}
                    {/* ======================= */}
                    <div className="md:hidden divide-y divide-slate-100">
                      {filteredTransactions.map((t) => (
                        <div key={t.id} className="p-4 active:bg-slate-50 transition-colors">
                          <div className="flex items-start justify-between mb-2">
                             <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                    {new Date(t.date).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}
                                </span>
                                <span className={`text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded border ${
                                    t.tipo === 'Laboral' ? 'border-blue-100 text-blue-600' : 'border-purple-100 text-purple-600'
                                }`}>
                                    {t.tipo}
                                </span>
                             </div>
                             <div className="flex gap-3">
                                <button onClick={() => startEdit(t)}><Edit3 className="w-4 h-4 text-slate-300 hover:text-blue-600" /></button>
                                <button onClick={() => handleDelete(t.id)}><Trash2 className="w-4 h-4 text-slate-300 hover:text-red-600" /></button>
                             </div>
                          </div>
                          
                          <div className="flex justify-between items-center mt-3">
                            <div className="flex-1 pr-4 min-w-0">
                                <p className="text-sm font-bold text-slate-900 truncate">{t.concept}</p>
                                {t.description && <p className="text-xs text-slate-400 truncate mt-0.5">{t.description}</p>}
                            </div>
                            <div className="text-right whitespace-nowrap">
                                <p className={`text-base font-bold tabular-nums ${
                                    t.type === 'ingreso' ? 'text-emerald-600' : 'text-slate-900'
                                }`}>
                                    {t.type === 'ingreso' ? '+' : '-'} {t.currency === 'USD' ? 'U$S' : '$'} {Math.abs(t.amount).toLocaleString('es-AR', {minimumFractionDigits: 0})}
                                </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
                <div className="p-6">
                    <Reportes transactions={filteredTransactions} balance={balance} />
                </div>
            )}
            </div>
        </div>

        {/* ================================================================================= */}
        {/* MODAL / FORMULARIO MEJORADO */}
        {/* ================================================================================= */}
        {showForm && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-200">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
                <h3 className="text-lg font-bold text-slate-800">
                  {editingTransaction ? 'Editar Registro' : 'Nueva Transacción'}
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
                      className={`py-2 text-sm font-bold rounded-md transition-all ${
                          formData.tipo === 'Laboral' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                      }`}
                  >
                      Laboral
                  </button>
                  <button
                      type="button"
                      onClick={() => handleTipoChange('Personal')}
                      className={`py-2 text-sm font-bold rounded-md transition-all ${
                          formData.tipo === 'Personal' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
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
                      <span className="font-semibold text-sm">Ingreso</span>
                  </label>
                  <label className={`flex-1 cursor-pointer border rounded-lg p-3 flex items-center justify-center gap-2 transition-all ${
                      formData.type === 'egreso' ? 'border-red-500 bg-red-50 text-red-700' : 'border-slate-200 hover:border-red-200'
                  }`}>
                      <input type="radio" name="type" value="egreso" checked={formData.type === 'egreso'} onChange={() => handleTypeChange('egreso')} className="hidden" />
                      <TrendingDown className="w-4 h-4" />
                      <span className="font-semibold text-sm">Egreso</span>
                  </label>
                </div>

                {/* Campos Restantes */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Concepto</label>
                  <div className="relative">
                    <select
                        value={formData.concept}
                        onChange={(e) => setFormData(prev => ({ ...prev, concept: e.target.value }))}
                        className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium appearance-none"
                        required
                    >
                        <option value="">Seleccionar concepto...</option>
                        {formData.tipo === 'Laboral' && formData.type === 'ingreso' && conceptosLaboralIngresos.map(c => <option key={c} value={c}>{c}</option>)}
                        {formData.tipo === 'Laboral' && formData.type === 'egreso' && conceptosLaboralEgresos.map(c => <option key={c} value={c}>{c}</option>)}
                        {formData.tipo === 'Personal' && formData.type === 'ingreso' && conceptosPersonalIngresos.map(c => <option key={c} value={c}>{c}</option>)}
                        {formData.tipo === 'Personal' && formData.type === 'egreso' && conceptosPersonalEgresos.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Monto y Moneda</label>
                  <div className="flex gap-2">
                      <div className="relative flex-1">
                          <span className="absolute left-3 top-2.5 text-slate-400 font-semibold">$</span>
                          <input
                              type="number"
                              step="0.01"
                              value={formData.amount}
                              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                              className="w-full pl-7 pr-3 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm font-semibold"
                              placeholder="0.00"
                              required
                          />
                      </div>
                      <select
                          value={formData.currency}
                          onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value as 'ARS' | 'USD' }))}
                          className="w-24 px-2 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm font-bold text-slate-700"
                      >
                          <option value="ARS">ARS</option>
                          <option value="USD">USD</option>
                      </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Fecha</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Notas (Opcional)</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                    rows={2}
                    placeholder="Detalle adicional..."
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => { setShowForm(false); setEditingTransaction(null); resetForm(); }}
                    className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-bold text-sm transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold text-sm shadow-md shadow-blue-500/20 transition-all transform active:scale-[0.98]"
                  >
                    {editingTransaction ? 'Guardar Cambios' : 'Registrar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}