'use client'

import React, { useState, useRef } from 'react'
import { Download, Mail, Loader2, CheckCircle, X } from 'lucide-react'
import { useAuth } from '../app/auth/authContext'

interface DualExcelExportButtonProps {
  onExport: () => Promise<Blob | null | void> // Función que descarga el Excel
  onExportBlob: () => Promise<Blob | null> // Función que retorna el Blob del Excel
  fileName: string
  title: string
}

export default function DualExcelExportButton({ onExport, onExportBlob, fileName, title }: DualExcelExportButtonProps) {
  const { user } = useAuth()
  const [isExporting, setIsExporting] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [sendingEmail, setSendingEmail] = useState(false)
  const [showEmailInput, setShowEmailInput] = useState(false)
  const [emailStatus, setEmailStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' })
  const [recipientEmail, setRecipientEmail] = useState<string>(user?.email || '')
  const [emailError, setEmailError] = useState<string>('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleDownload = async () => {
    setIsExporting(true)
    try {
      await onExport()
    } catch (error) {
      console.error('Error al descargar Excel:', error)
      alert('Hubo un error al generar el Excel. Por favor, intenta de nuevo.')
    } finally {
      setIsExporting(false)
      setShowDropdown(false)
    }
  }

  const handleSendEmail = async () => {
    if (!recipientEmail) {
      setEmailError('Por favor ingresa un email')
      return
    }

    if (!validateEmail(recipientEmail)) {
      setEmailError('Por favor ingresa un email válido')
      return
    }

    setSendingEmail(true)
    setEmailStatus({ type: null, message: '' })
    setEmailError('')

    try {
      // Generar el Excel como Blob
      const excelBlob = await onExportBlob()
      
      if (!excelBlob) {
        throw new Error('No se pudo generar el archivo Excel')
      }

      // Convertir Blob a base64 usando Promise
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(excelBlob)
        reader.onload = () => {
          resolve(reader.result as string)
        }
        reader.onerror = () => {
          reject(new Error('Error al procesar el archivo'))
        }
      })
      
      const response = await fetch('/api/finanzas/send-excel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientEmail,
          excelBase64: base64Data,
          fileName: `${fileName}_${new Date().toISOString().slice(0, 10)}.xlsx`
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Error al enviar el email')
      }

      setEmailStatus({ type: 'success', message: 'Excel enviado exitosamente' })
      setShowEmailInput(false)
      setRecipientEmail(user?.email || '')
      setTimeout(() => {
        setEmailStatus({ type: null, message: '' })
        setShowDropdown(false)
      }, 3000)
    } catch (error) {
      console.error('Error al enviar email:', error)
      setEmailStatus({ 
        type: 'error', 
        message: error instanceof Error ? error.message : 'Error al enviar el email' 
      })
    } finally {
      setSendingEmail(false)
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 hover:shadow-emerald-500/30 transition-all transform active:scale-[0.98]"
        disabled={isExporting || sendingEmail}
      >
        {isExporting || sendingEmail ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Download className="w-4 h-4" />
        )}
        <span>{isExporting || sendingEmail ? 'Procesando...' : title}</span>
      </button>

      {showDropdown && (
        <div className="absolute top-full right-0 mt-2 bg-white border border-slate-200 rounded-lg shadow-xl z-50 min-w-[240px]">
          {/* Opción Descargar */}
          <button
            onClick={handleDownload}
            disabled={isExporting || sendingEmail}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-50 border-b border-slate-100 transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <div className="text-left">
              <p className="text-sm font-bold">Descargar Excel</p>
              <p className="text-xs text-slate-500">Guardar en tu dispositivo</p>
            </div>
          </button>

          {/* Opción Enviar por Email */}
          {!showEmailInput ? (
            <button
              onClick={() => setShowEmailInput(true)}
              disabled={sendingEmail}
              className="w-full flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              <Mail className="w-4 h-4 text-blue-600" />
              <div className="text-left">
                <p className="text-sm font-bold">Enviar por Email</p>
                <p className="text-xs text-slate-500">A tu casilla de correo</p>
              </div>
            </button>
          ) : (
            <div className="p-4 border-t border-slate-100 space-y-3">
              <input
                type="email"
                value={recipientEmail}
                onChange={(e) => {
                  setRecipientEmail(e.target.value)
                  setEmailError('')
                }}
                placeholder="correo@ejemplo.com"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
              />
              
              {emailError && (
                <p className="text-xs text-red-600">{emailError}</p>
              )}

              {emailStatus.message && (
                <div className={`flex items-center gap-2 text-xs p-2 rounded ${
                  emailStatus.type === 'success' 
                    ? 'bg-emerald-50 text-emerald-700' 
                    : 'bg-red-50 text-red-700'
                }`}>
                  {emailStatus.type === 'success' && <CheckCircle className="w-3 h-3 flex-shrink-0" />}
                  {emailStatus.message}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowEmailInput(false)
                    setRecipientEmail(user?.email || '')
                    setEmailError('')
                    setEmailStatus({ type: null, message: '' })
                  }}
                  className="flex-1 px-3 py-2 text-sm font-bold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
                  disabled={sendingEmail}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSendEmail}
                  disabled={sendingEmail || !recipientEmail}
                  className="flex-1 px-3 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {sendingEmail ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    'Enviar'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
      
      setEmailStatus({ type: 'error', message: 'Función en desarrollo - usa descargar primero' })
    } catch (error) {
      console.error('Error:', error)
      setEmailStatus({ type: 'error', message: 'Error al generar el Excel' })
    } finally {
      setSendingEmail(false)
    }
  }

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        disabled={isExporting || sendingEmail}
        className="group inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 hover:shadow-emerald-500/30 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isExporting || sendingEmail ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            {isExporting ? 'Descargando...' : 'Enviando...'}
          </>
        ) : (
          <>
            <Download className="w-4 h-4" />
            <span>Exportar</span>
            <span className="text-xs">▼</span>
          </>
        )}
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden">
          {emailStatus.type && (
            <div className={`px-4 py-3 text-sm font-medium flex items-center gap-2 ${
              emailStatus.type === 'success' 
                ? 'bg-green-50 text-green-700 border-b border-green-200' 
                : 'bg-red-50 text-red-700 border-b border-red-200'
            }`}>
              {emailStatus.type === 'success' ? (
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
              ) : (
                <X className="w-4 h-4 flex-shrink-0" />
              )}
              {emailStatus.message}
            </div>
          )}
          
          {!emailStatus.type && (
            <>
              <button
                onClick={handleDownload}
                disabled={isExporting}
                className="w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors flex items-center gap-3 text-sm font-medium text-slate-900 border-b border-gray-100"
              >
                <Download className="w-4 h-4 text-slate-600" />
                <span>Descargar Excel</span>
              </button>

              <button
                onClick={() => setShowEmailInput(!showEmailInput)}
                className="w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors flex items-center gap-3 text-sm font-medium text-slate-900 border-b border-gray-100"
              >
                <Mail className="w-4 h-4 text-blue-600" />
                <div>
                  <p>Enviar por Email</p>
                  <p className="text-xs text-gray-500">Seleccionar destino</p>
                </div>
              </button>

              {showEmailInput && (
                <div className="px-4 py-4 border-t border-gray-100 space-y-3 bg-slate-50">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                      Email destino:
                    </label>
                    <input
                      type="email"
                      value={recipientEmail}
                      onChange={(e) => {
                        setRecipientEmail(e.target.value)
                        setEmailError('')
                      }}
                      placeholder="tu@email.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {emailError && (
                      <p className="text-xs text-red-600 mt-1">{emailError}</p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleSendEmail}
                      disabled={sendingEmail}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {sendingEmail ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Mail className="w-3 h-3" />
                          Enviar
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setShowEmailInput(false)}
                      className="flex-1 px-3 py-2 bg-gray-300 text-gray-800 text-sm font-medium rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>

                  <p className="text-xs text-gray-600">
                    Email registrado: <span className="font-semibold">{user?.email}</span>
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
