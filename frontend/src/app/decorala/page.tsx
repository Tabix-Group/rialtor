'use client'

import { useAuth } from '../auth/authContext'
import { useRouter } from 'next/navigation'
import { authenticatedFetch } from '@/utils/api'
import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Upload, Wand2, Download, Trash2, Clock, ChevronLeft,
  ImageIcon, Loader2, CheckCircle2, XCircle, Sparkles, Info
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type DecorationStatus = 'PROCESSING' | 'COMPLETED' | 'ERROR'

interface Decoration {
  id: string
  originalUrl: string
  generatedUrl?: string
  style: string
  status: DecorationStatus
  errorMessage?: string
  expiresAt: string
  createdAt: string
}

interface UsageInfo {
  used: number
  limit: number
}

// ─── Style config ─────────────────────────────────────────────────────────────

const STYLES = [
  {
    id: 'moderno',
    label: 'Moderno',
    description: 'Líneas limpias, tonos neutros',
    emoji: '🏙️',
  },
  {
    id: 'escandinavo',
    label: 'Escandinavo',
    description: 'Madera clara, minimalista y cálido',
    emoji: '🌿',
  },
  {
    id: 'clasico',
    label: 'Clásico',
    description: 'Elegante, maderas oscuras, alfombras',
    emoji: '🏛️',
  },
  {
    id: 'industrial',
    label: 'Industrial',
    description: 'Metal, ladrillo, estilo loft',
    emoji: '🏗️',
  },
]

// ─── Helper ───────────────────────────────────────────────────────────────────

function daysUntil(dateStr: string): number {
  const diff = new Date(dateStr).getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-AR', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DecoralaPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  // Form state
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [selectedStyle, setSelectedStyle] = useState('moderno')
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Request state
  const [isGenerating, setIsGenerating] = useState(false)
  const [pollingId, setPollingId] = useState<string | null>(null)
  const [currentResult, setCurrentResult] = useState<Decoration | null>(null)
  const [generateError, setGenerateError] = useState<string | null>(null)

  // History & usage
  const [decorations, setDecorations] = useState<Decoration[]>([])
  const [usage, setUsage] = useState<UsageInfo>({ used: 0, limit: 3 })
  const [loadingHistory, setLoadingHistory] = useState(true)

  // Auth guard
  useEffect(() => {
    if (!authLoading && !user) router.replace('/login')
  }, [user, authLoading, router])

  // Load history on mount
  const loadDecorations = useCallback(async () => {
    try {
      const res = await authenticatedFetch('/api/decorala')
      if (res.ok) {
        const data = await res.json()
        setDecorations(data.decorations || [])
        setUsage(data.usage || { used: 0, limit: 3 })
      }
    } catch (_) {
      // silencioso
    } finally {
      setLoadingHistory(false)
    }
  }, [])

  useEffect(() => {
    if (user) loadDecorations()
  }, [user, loadDecorations])

  // Polling for PROCESSING result
  useEffect(() => {
    if (!pollingId) return
    const interval = setInterval(async () => {
      try {
        const res = await authenticatedFetch(`/api/decorala/${pollingId}`)
        if (!res.ok) return
        const data: Decoration = await res.json()
        if (data.status === 'COMPLETED') {
          setCurrentResult(data)
          setIsGenerating(false)
          setPollingId(null)
          // Refresh history
          loadDecorations()
        } else if (data.status === 'ERROR') {
          setGenerateError(data.errorMessage || 'Error generando la imagen. Intentá de nuevo.')
          setIsGenerating(false)
          setPollingId(null)
        }
      } catch (_) {}
    }, 3000)

    return () => clearInterval(interval)
  }, [pollingId, loadDecorations])

  // ─── Handlers ───────────────────────────────────────────────────────────────

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setGenerateError('Solo se permiten imágenes (JPG, PNG, WEBP)')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setGenerateError('La imagen no puede superar los 10MB')
      return
    }
    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
    setGenerateError(null)
    setCurrentResult(null)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }

  const handleGenerate = async () => {
    if (!selectedFile) return
    setIsGenerating(true)
    setGenerateError(null)
    setCurrentResult(null)

    const formData = new FormData()
    formData.append('image', selectedFile)
    formData.append('style', selectedStyle)

    try {
      const res = await authenticatedFetch('/api/decorala', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()

      if (!res.ok) {
        if (res.status === 429) {
          setGenerateError(data.message || 'Límite mensual alcanzado.')
        } else {
          setGenerateError(data.error || 'Error al iniciar la generación.')
        }
        setIsGenerating(false)
        return
      }

      setUsage((prev) => ({ ...prev, used: data.used }))
      setPollingId(data.id)
    } catch (err) {
      setGenerateError('Error de conexión. Intentá de nuevo.')
      setIsGenerating(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta decoración?')) return
    try {
      await authenticatedFetch(`/api/decorala/${id}`, { method: 'DELETE' })
      setDecorations((prev) => prev.filter((d) => d.id !== id))
      if (currentResult?.id === id) setCurrentResult(null)
    } catch (_) {}
  }

  const handleDownload = async (url: string, filename: string) => {
    const res = await fetch(url)
    const blob = await res.blob()
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = filename
    a.click()
  }

  const resetForm = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    setCurrentResult(null)
    setGenerateError(null)
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const remaining = usage.limit - usage.used
  const canGenerate = remaining > 0 && !isGenerating

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/10">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-cyan-900 to-blue-900">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-900/20 to-slate-900/90"></div>

        <div className="relative max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 lg:gap-8">
            <div className="flex-1 w-full lg:w-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-4 sm:mb-6">
                <Wand2 className="w-3 h-3 sm:w-4 sm:h-4 text-cyan-400" />
                <span className="text-xs sm:text-sm font-semibold text-white">Diseño con IA</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-3 sm:mb-4 tracking-tight">
                <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Decorala</span>
              </h1>

              <p className="text-base sm:text-lg lg:text-xl text-slate-300 mb-6 sm:mb-8 max-w-2xl leading-relaxed">
                Sube la foto de un ambiente vacío y recibí una versión completamente decorada con IA. Elige entre 4 estilos profesionales.
              </p>
            </div>

            {/* Contador de uso en header */}
            <div className={`flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 rounded-xl border text-sm sm:text-base font-medium backdrop-blur-md
              ${remaining === 0
                ? 'bg-red-500/20 border-red-400/50 text-red-200'
                : remaining <= 2
                ? 'bg-amber-500/20 border-amber-400/50 text-amber-200'
                : 'bg-emerald-500/20 border-emerald-400/50 text-emerald-200'
              }`}>
              <Wand2 className="w-4 h-4" />
              <span>{remaining} / {usage.limit}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

        {/* ─── Main card ──────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 space-y-6">

            {/* Upload zone */}
            {!currentResult ? (
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => !isGenerating && fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-xl transition-all cursor-pointer
                  ${isDragging ? 'border-primary bg-primary/5' : 'border-slate-200 hover:border-primary/50 hover:bg-slate-50'}
                  ${previewUrl ? 'p-0 overflow-hidden' : 'p-10 flex flex-col items-center justify-center gap-3'}
                  ${isGenerating ? 'pointer-events-none opacity-70' : ''}
                `}
              >
                {previewUrl ? (
                  <div className="relative group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={previewUrl}
                      alt="Vista previa"
                      className="w-full max-h-72 object-contain"
                    />
                    {!isGenerating && (
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <p className="text-white text-sm font-medium">Clic para cambiar imagen</p>
                      </div>
                    )}
                    {isGenerating && (
                      <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-3">
                        <Loader2 className="w-8 h-8 text-white animate-spin" />
                        <p className="text-white text-sm font-medium">Generando decoración…</p>
                        <p className="text-white/70 text-xs">Esto puede demorar hasta 30 segundos</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                      <Upload className="w-5 h-5 text-slate-400" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-slate-700">Arrastrá tu imagen o hacé clic aquí</p>
                      <p className="text-xs text-slate-400 mt-0.5">JPG, PNG o WEBP · máx. 10 MB</p>
                    </div>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                />
              </div>
            ) : (
              /* Resultado */
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-slate-800 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    Ambiente decorado — estilo {STYLES.find(s => s.id === currentResult.style)?.label}
                  </h2>
                  <button onClick={resetForm} className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1">
                    <ChevronLeft className="w-4 h-4" /> Nueva decoración
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Antes</p>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={currentResult.originalUrl} alt="Original" className="w-full rounded-xl border border-slate-200 object-cover aspect-video" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-emerald-600 uppercase tracking-wide">Después</p>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={currentResult.generatedUrl} alt="Generada" className="w-full rounded-xl border border-emerald-200 object-cover aspect-video" />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <button
                    onClick={() => handleDownload(currentResult.generatedUrl!, `decorala_${currentResult.style}.jpg`)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    <Download className="w-4 h-4" /> Descargar imagen
                  </button>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    Disponible por {daysUntil(currentResult.expiresAt)} días más
                  </div>
                </div>
              </div>
            )}

            {/* Style selector */}
            {!currentResult && (
              <div className="space-y-3">
                <label className="text-sm font-medium text-slate-700">Estilo de decoración</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {STYLES.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setSelectedStyle(style.id)}
                      disabled={isGenerating}
                      className={`p-3 rounded-xl border-2 text-left transition-all
                        ${selectedStyle === style.id
                          ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                        }
                        ${isGenerating ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
                      `}
                    >
                      <div className="text-xl mb-1">{style.emoji}</div>
                      <div className="text-sm font-semibold text-slate-800">{style.label}</div>
                      <div className="text-xs text-slate-400 mt-0.5 leading-tight">{style.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Error */}
            {generateError && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                {generateError}
              </div>
            )}

            {/* CTA */}
            {!currentResult && (
              <div className="flex items-center gap-4">
                <button
                  onClick={handleGenerate}
                  disabled={!selectedFile || !canGenerate}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all
                    ${selectedFile && canGenerate
                      ? 'bg-primary text-white hover:bg-primary/90 shadow-sm'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }
                  `}
                >
                  {isGenerating
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Generando…</>
                    : <><Wand2 className="w-4 h-4" /> Decorar ambiente</>
                  }
                </button>

                {remaining === 0 && (
                  <p className="text-xs text-slate-400 flex items-center gap-1">
                    <Info className="w-3.5 h-3.5" /> El contador se reinicia el 1° del próximo mes
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ─── History ────────────────────────────────────────── */}
        <div className="space-y-4">
          <h2 className="text-base font-semibold text-slate-800">Mis decoraciones</h2>

          {loadingHistory ? (
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" /> Cargando historial…
            </div>
          ) : decorations.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
              <ImageIcon className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">Todavía no generaste ninguna decoración.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {decorations.map((d) => (
                <div key={d.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden group">
                  <div className="relative aspect-video bg-slate-100">
                    {d.status === 'COMPLETED' && d.generatedUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={d.generatedUrl}
                        alt="Decoración generada"
                        className="w-full h-full object-cover"
                      />
                    ) : d.status === 'PROCESSING' ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
                        <p className="text-xs text-slate-400">Generando…</p>
                      </div>
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                        <XCircle className="w-6 h-6 text-red-400" />
                        <p className="text-xs text-red-400">Error</p>
                      </div>
                    )}
                  </div>

                  <div className="p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-700 capitalize">
                        {STYLES.find(s => s.id === d.style)?.emoji}{' '}
                        {STYLES.find(s => s.id === d.style)?.label}
                      </span>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium
                        ${d.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                          d.status === 'PROCESSING' ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'}`}>
                        {d.status === 'COMPLETED' ? 'Listo' : d.status === 'PROCESSING' ? 'En proceso' : 'Error'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>{formatDate(d.createdAt)}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {daysUntil(d.expiresAt)}d
                      </span>
                    </div>

                    <div className="flex gap-2 pt-1">
                      {d.status === 'COMPLETED' && d.generatedUrl && (
                        <button
                          onClick={() => handleDownload(d.generatedUrl!, `decorala_${d.style}.jpg`)}
                          className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-xs text-slate-600 transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" /> Descargar
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(d.id)}
                        className="flex items-center justify-center px-2 py-1.5 bg-slate-50 hover:bg-red-50 hover:text-red-600 rounded-lg text-slate-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
