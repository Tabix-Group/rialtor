'use client'

import React, { useState } from 'react'
import { X, Mail, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { authenticatedFetchJson } from '@/utils/api'

interface Newsletter {
  id: string
  title: string
  content: string
  template: string
  status: 'DRAFT' | 'PUBLISHED' | 'SENT'
}

interface SendNewsletterModalProps {
  isOpen: boolean
  newsletter: Newsletter | null
  onClose: () => void
  onSuccess: () => void
}

export default function SendNewsletterModal({
  isOpen,
  newsletter,
  onClose,
  onSuccess
}: SendNewsletterModalProps) {
  const [emailsText, setEmailsText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [results, setResults] = useState<{
    sent: number
    failed: number
    total: number
    failures?: Array<{ email: string; error: string }>
  } | null>(null)

  if (!isOpen || !newsletter) {
    return null
  }

  const handleEmailsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEmailsText(e.target.value)
  }

  const parseEmails = (text: string): string[] => {
    return text
      .split(/[\n,;\s]+/)
      .map(email => email.trim())
      .filter(email => email.length > 0 && email.includes('@'))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const emails = parseEmails(emailsText)
    
    if (emails.length === 0) {
      setError('Por favor ingresa al menos un email válido')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await authenticatedFetchJson(
        `/api/newsletters/${newsletter.id}/send`,
        {
          method: 'POST',
          body: JSON.stringify({ emails })
        }
      )

      setResults(response.results)
      setSuccess(response.message)
      setEmailsText('')

      // Llamar onSuccess después de 2 segundos
      setTimeout(() => {
        onSuccess()
        setTimeout(() => {
          onClose()
          setResults(null)
          setSuccess(null)
        }, 1000)
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Error al enviar el newsletter')
      console.error('Error sending newsletter:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setEmailsText('')
      setError(null)
      setSuccess(null)
      setResults(null)
      onClose()
    }
  }

  const uniqueEmails = Array.from(new Set(parseEmails(emailsText)))
  const hasInvalidEmails = emailsText.trim().length > 0 && parseEmails(emailsText).length === 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      {/* Modal */}
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-3">
            <Mail className="w-6 h-6 text-slate-900" />
            <h2 className="text-xl font-bold text-slate-900">Enviar Newsletter</h2>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-slate-500 hover:text-slate-700 transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Newsletter Info */}
          <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-1">{newsletter.title}</h3>
            <p className="text-sm text-slate-600">
              Estado: <span className="font-medium">{
                newsletter.status === 'DRAFT' ? 'Borrador' :
                newsletter.status === 'PUBLISHED' ? 'Publicado' :
                'Enviado'
              }</span>
            </p>
          </div>

          {!success && !results && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Destinatarios
                </label>
                <textarea
                  value={emailsText}
                  onChange={handleEmailsChange}
                  placeholder="Ingresa emails separados por comas, saltos de línea o punto y coma&#10;&#10;Ejemplo:&#10;usuario1@example.com&#10;usuario2@example.com&#10;usuario3@example.com"
                  className="w-full h-32 px-4 py-3 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent resize-none focus:outline-none"
                  disabled={loading}
                />
                <p className="mt-2 text-sm text-slate-600">
                  {uniqueEmails.length > 0 && (
                    <>
                      {uniqueEmails.length} email{uniqueEmails.length !== 1 ? 's' : ''} válido{uniqueEmails.length !== 1 ? 's' : ''}
                    </>
                  )}
                  {hasInvalidEmails && (
                    <span className="text-red-600 ml-2">⚠️ Algunos emails no son válidos</span>
                  )}
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 disabled:opacity-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || uniqueEmails.length === 0}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {loading ? 'Enviando...' : 'Enviar'}
                </button>
              </div>
            </form>
          )}

          {/* Success State */}
          {success && results && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-emerald-700">{success}</p>
              </div>

              {/* Results Summary */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-xs text-slate-600 font-medium">Total</p>
                  <p className="text-2xl font-bold text-slate-900">{results.total}</p>
                </div>
                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                  <p className="text-xs text-emerald-700 font-medium">Enviados</p>
                  <p className="text-2xl font-bold text-emerald-700">{results.sent}</p>
                </div>
                <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-xs text-red-700 font-medium">Fallidos</p>
                  <p className="text-2xl font-bold text-red-700">{results.failed}</p>
                </div>
              </div>

              {/* Failures List */}
              {results.failures && results.failures.length > 0 && (
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-sm font-medium text-red-700 mb-3">Errores de envío:</p>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {results.failures.map((failure, idx) => (
                      <div key={idx} className="text-xs text-red-600">
                        <span className="font-mono break-all">{failure.email}</span>
                        <p className="text-red-600 opacity-75">{failure.error}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-sm text-slate-600 text-center">
                Cerrando en unos momentos...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
