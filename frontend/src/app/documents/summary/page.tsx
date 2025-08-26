"use client"

import React, { useState, useRef } from 'react'

export default function DocumentsSummaryPage() {
  const [text, setText] = useState('')
  const [textLoading, setTextLoading] = useState(false)
  const [fileLoading, setFileLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)
  const fileRef = useRef<HTMLInputElement | null>(null)

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setResult(null)
    if (!text || text.trim().length === 0) {
      setError('Por favor ingresa el texto a resumir.')
      return
    }
    setTextLoading(true)
    try {
      const res = await fetch('/api/documents/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json?.error || 'Error en el servidor')
      } else {
        setResult(json)
      }
    } catch (err: any) {
      setError(err?.message || 'Error de red')
    } finally {
      setTextLoading(false)
    }
  }

  const handleUploadAndSummarize = async () => {
    setError(null)
    setResult(null)
    const file = fileRef.current?.files?.[0]
    if (!file) {
      setError('Seleccione un archivo')
      return
    }
    setFileLoading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('category', 'ChatUpload')

      const uploadRes = await fetch('/api/documents', { method: 'POST', body: fd })
      if (!uploadRes.ok) throw new Error('Error al subir el archivo')
      const uploadData = await uploadRes.json()
      const docId = uploadData?.document?.id
      if (!docId) throw new Error('No se recibió id del documento')

      const sumRes = await fetch('/api/documents/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: docId }),
      })
      if (!sumRes.ok) {
        const err = await sumRes.json().catch(() => ({}))
        throw new Error(err.error || 'Error al generar resumen')
      }
      const sumData = await sumRes.json()
      if (sumData.extracted) {
        const ex = sumData.extracted
        const parts: string[] = []
        if (ex.summary) parts.push(String(ex.summary))
        if (Array.isArray(ex.amounts) && ex.amounts.length) parts.push('\nMontos: ' + ex.amounts.join('; '))
        if (Array.isArray(ex.persons) && ex.persons.length) parts.push('\nPersonas: ' + ex.persons.join('; '))
        if (Array.isArray(ex.addresses) && ex.addresses.length) parts.push('\nDirecciones: ' + ex.addresses.join('; '))
        if (Array.isArray(ex.dates) && ex.dates.length) parts.push('\nFechas: ' + ex.dates.join('; '))
        if (Array.isArray(ex.relevant) && ex.relevant.length) parts.push('\nOtros: ' + ex.relevant.join('; '))
        setResult({ summary: parts.join('\n') })
      } else {
        setResult({ summary: sumData.summary || 'No se recibió resumen' })
      }
    } catch (e: any) {
      setError(e.message || 'Error desconocido')
    } finally {
      setFileLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-6 space-y-8">
      <h1 className="text-2xl font-semibold">Resumidor de Documentos</h1>

      <section className="bg-white p-6 rounded-lg shadow">
        <h2 className="font-medium mb-3">Resumir texto</h2>
        <form onSubmit={handleTextSubmit} className="space-y-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={8}
            className="w-full rounded-md border border-gray-200 p-3 text-sm bg-white text-gray-900"
            placeholder="Pega aquí el texto del documento..."
          />
          <div className="flex items-center gap-3">
            <button type="submit" disabled={textLoading} className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-60">
              {textLoading ? 'Generando...' : 'Generar resumen'}
            </button>
            <button type="button" onClick={() => { setText(''); setResult(null); setError(null) }} className="px-3 py-2 border rounded-md text-sm">
              Limpiar
            </button>
          </div>
        </form>
      </section>

      <section className="bg-white p-6 rounded-lg shadow">
        <h2 className="font-medium mb-3">Subir archivo y resumir</h2>
        <div className="mb-3">
          <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.txt" />
        </div>
        <div>
          <button className="px-4 py-2 bg-orange-600 text-white rounded" onClick={handleUploadAndSummarize} disabled={fileLoading}>
            {fileLoading ? 'Procesando...' : 'Subir y resumir'}
          </button>
        </div>
      </section>

      <section>
        {error && <div className="text-red-600">{error}</div>}
        {result && (
          <div className="mt-4 bg-gray-50 border rounded-md p-4">
            <h3 className="font-medium">Resultado</h3>
            <pre className="whitespace-pre-wrap text-sm mt-2 text-gray-800">{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}
      </section>
    </div>
  )
}
