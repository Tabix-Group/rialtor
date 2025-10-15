'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../auth/authContext'
import { useRouter } from 'next/navigation'
import { authenticatedFetch } from '@/utils/api'
import {
  DollarSign, Plus, Minus, Calendar, Filter, TrendingUp, TrendingDown,
  ArrowUpRight, Edit3, Trash2, Search, X, ChevronDown, BarChart3
} from 'lucide-react'

interface FinanceTransaction {
  id: string
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

  // Form state
  const [formData, setFormData] = useState({
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
    type: ''
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
      type: 'ingreso',
      concept: '',
      description: '',
      amount: '',
      currency: 'ARS',
      date: new Date().toISOString().split('T')[0]
    })
  }

  const startEdit = (transaction: FinanceTransaction) => {
    setEditingTransaction(transaction)
    setFormData({
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
    if (filters.type && t.type !== filters.type) return false
    return true
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
        <div className="text-center">
          <div className="relative inline-block">
            <div className="w-20 h-20 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-slate-100 border-t-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <p className="mt-6 text-slate-600 font-semibold text-lg">Cargando finanzas...</p>
          <p className="mt-2 text-slate-400 text-sm">Preparando tu centro financiero</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/10">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItaDJWMzZoLTJ6bTAtNHYyaDJWMzBoLTJ6bTAtNHYyaDJWMjZoLTJ6bTAtNHYyaDJWMjJoLTJ6bTAtNHYyaDJWMThoLTJ6bTAtNHYyaDJWMTRoLTJ6bTAtNHYyaDJWMTBoLTJ6bTAtNHYyaDJWNmgtMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/20 to-slate-900/90"></div>

        <div className="relative max-w-[1600px] mx-auto px-6 lg:px-8 py-16">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-6">
                <BarChart3 className="w-4 h-4 text-green-400" />
                <span className="text-sm font-semibold text-white">Centro Financiero</span>
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight">
                Mis <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">Finanzas</span>
              </h1>

              <p className="text-xl text-slate-300 mb-8 max-w-2xl leading-relaxed">
                Controla tus ingresos y egresos personales. Mantén un registro detallado de tu flujo de caja.
              </p>

              <button
                onClick={() => setShowForm(true)}
                className="group inline-flex items-center gap-3 bg-white text-slate-900 px-8 py-4 rounded-2xl hover:shadow-2xl hover:shadow-white/20 transition-all duration-300 hover:-translate-y-1 font-semibold"
              >
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                Nueva Transacción
              </button>
            </div>

            {/* Balance Cards */}
            <div className="w-full lg:w-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-300">Saldo ARS</p>
                    <p className="text-2xl font-bold text-white">
                      ${balance.ARS.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-300">Saldo USD</p>
                    <p className="text-2xl font-bold text-white">
                      ${balance.USD.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 lg:px-8 py-12">
        {/* Filters */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200/60 p-6 mb-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-slate-600" />
              <span className="font-semibold text-slate-900">Filtros</span>
            </div>

            <div className="flex flex-wrap items-center gap-4 flex-1">
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Fecha inicio"
              />
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Fecha fin"
              />

              <select
                value={filters.currency}
                onChange={(e) => setFilters(prev => ({ ...prev, currency: e.target.value }))}
                className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas las monedas</option>
                <option value="ARS">ARS</option>
                <option value="USD">USD</option>
              </select>

              <select
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos los tipos</option>
                <option value="ingreso">Ingresos</option>
                <option value="egreso">Egresos</option>
              </select>

              <button
                onClick={() => setFilters({ startDate: '', endDate: '', currency: '', type: '' })}
                className="px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors"
              >
                Limpiar filtros
              </button>
            </div>
          </div>
        </div>

        {/* Transaction Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-slate-900">
                    {editingTransaction ? 'Editar Transacción' : 'Nueva Transacción'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowForm(false)
                      setEditingTransaction(null)
                      resetForm()
                    }}
                    className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Tipo</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="type"
                          value="ingreso"
                          checked={formData.type === 'ingreso'}
                          onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'ingreso' | 'egreso' }))}
                          className="text-green-600"
                        />
                        <span className="text-green-600 font-medium">Ingreso</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="type"
                          value="egreso"
                          checked={formData.type === 'egreso'}
                          onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'ingreso' | 'egreso' }))}
                          className="text-red-600"
                        />
                        <span className="text-red-600 font-medium">Egreso</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Concepto</label>
                    <input
                      type="text"
                      value={formData.concept}
                      onChange={(e) => setFormData(prev => ({ ...prev, concept: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Descripción (opcional)</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Monto</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.amount}
                        onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Moneda</label>
                      <select
                        value={formData.currency}
                        onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value as 'ARS' | 'USD' }))}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="ARS">ARS</option>
                        <option value="USD">USD</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Fecha</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl hover:shadow-lg transition-all duration-300 font-semibold"
                    >
                      {editingTransaction ? 'Actualizar' : 'Guardar'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false)
                        setEditingTransaction(null)
                        resetForm()
                      }}
                      className="px-6 py-3 text-slate-600 hover:text-slate-900 transition-colors font-semibold"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Transactions List */}
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/60 overflow-hidden">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Transacciones</h2>

            {loadingData ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 w-16 h-16 border-4 border-slate-100 border-t-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                </div>
                <p className="mt-6 text-slate-600 font-semibold">Cargando transacciones...</p>
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-32 h-32 bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl flex items-center justify-center mx-auto shadow-xl mb-8">
                  <DollarSign className="w-16 h-16 text-slate-400" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">No hay transacciones</h3>
                <p className="text-slate-600 mb-8 max-w-lg mx-auto leading-relaxed">
                  Comienza registrando tus primeros ingresos y egresos para mantener un control financiero personal.
                </p>
                <button
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-2xl hover:shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 hover:-translate-y-1 font-semibold"
                >
                  <Plus className="w-5 h-5" />
                  Agregar Primera Transacción
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTransactions.map((transaction) => (
                  <div key={transaction.id} className="group relative bg-gradient-to-r from-slate-50/50 to-white rounded-2xl border border-slate-200/60 hover:border-blue-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    <div className="flex items-center justify-between p-6 pl-8">
                      <div className="flex items-center gap-6 flex-1">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${
                          transaction.type === 'ingreso'
                            ? 'bg-green-500/20 text-green-600'
                            : 'bg-red-500/20 text-red-600'
                        }`}>
                          {transaction.type === 'ingreso' ? (
                            <TrendingUp className="w-6 h-6" />
                          ) : (
                            <TrendingDown className="w-6 h-6" />
                          )}
                        </div>

                        <div className="flex-1">
                          <h4 className="font-bold text-slate-900 mb-1">{transaction.concept}</h4>
                          {transaction.description && (
                            <p className="text-sm text-slate-600 mb-2">{transaction.description}</p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-slate-500">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              {new Date(transaction.date).toLocaleDateString('es-ES', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              transaction.currency === 'ARS'
                                ? 'bg-blue-50 text-blue-700'
                                : 'bg-green-50 text-green-700'
                            }`}>
                              {transaction.currency}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className={`text-xl font-bold ${
                            transaction.type === 'ingreso' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.type === 'ingreso' ? '+' : '-'}$
                            {transaction.amount.toLocaleString(transaction.currency === 'ARS' ? 'es-AR' : 'en-US', {
                              minimumFractionDigits: 2
                            })}
                          </p>
                          <p className="text-sm text-slate-500">{transaction.currency}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => startEdit(transaction)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(transaction.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}