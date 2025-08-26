"use client";

import { useState, useRef } from 'react';

export default function DocumentSummaryPage() {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUploadAndSummarize = async () => {
    setError(null);
    setSummary(null);
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setError('Seleccione un archivo');
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('category', 'ChatUpload');

      // Upload via frontend proxy
      const uploadRes = await fetch('/api/documents', { method: 'POST', body: fd });
      if (!uploadRes.ok) throw new Error('Error al subir el archivo');
      const uploadData = await uploadRes.json();
      const docId = uploadData?.document?.id;
      if (!docId) throw new Error('No se recibió id del documento');

      // Request summary
      const sumRes = await fetch('/api/documents/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: docId })
      });
      if (!sumRes.ok) {
        const err = await sumRes.json().catch(() => ({}));
        throw new Error(err.error || 'Error al generar resumen');
      }
      const sumData = await sumRes.json();
      // If backend returns structured extraction, show readable summary plus extracted fields
      if (sumData.extracted) {
        const ex = sumData.extracted;
        const parts: string[] = [];
        if (ex.summary) parts.push(String(ex.summary));
        if (Array.isArray(ex.amounts) && ex.amounts.length) parts.push('\nMontos: ' + ex.amounts.join('; '));
        if (Array.isArray(ex.persons) && ex.persons.length) parts.push('\nPersonas: ' + ex.persons.join('; '));
        if (Array.isArray(ex.addresses) && ex.addresses.length) parts.push('\nDirecciones: ' + ex.addresses.join('; '));
        if (Array.isArray(ex.dates) && ex.dates.length) parts.push('\nFechas: ' + ex.dates.join('; '));
        if (Array.isArray(ex.relevant) && ex.relevant.length) parts.push('\nOtros: ' + ex.relevant.join('; '));
        setSummary(parts.join('\n'));
      } else {
        setSummary(sumData.summary || 'No se recibió resumen');
      }
    } catch (e: any) {
      setError(e.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-start justify-center p-8">
      <div className="w-full max-w-2xl bg-white p-8 rounded-xl shadow">
        <h2 className="text-2xl font-semibold mb-4">Subir documento y obtener resumen</h2>
        <p className="text-sm text-gray-600 mb-4">Sube un PDF o Word y obtén un resumen breve (3 líneas).</p>

        <div className="mb-4">
          <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.txt" />
        </div>

        <div className="flex gap-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={handleUploadAndSummarize} disabled={loading}>
            {loading ? 'Procesando...' : 'Subir y resumir'}
          </button>
        </div>

        {error && <div className="mt-4 text-red-600">{error}</div>}
        {summary && (
          <div className="mt-6 p-4 bg-gray-50 rounded">
            <h3 className="font-semibold mb-2">Resumen</h3>
            <p className="whitespace-pre-line">{summary}</p>
          </div>
        )}
      </div>
    </div>
  );
}
