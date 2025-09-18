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
      // Mostrar toda la información estructurada del backend
      const displayParts: string[] = [];

      // Tipo de documento identificado
      if (sumData.documentType) {
        displayParts.push(`📄 Tipo de documento: ${sumData.documentType}`);
      }

      // Resumen general
      if (sumData.summary) {
        displayParts.push(`\n📝 Resumen: ${sumData.summary}`);
      }

      // Datos adicionales del modelo general
      if (sumData.extracted) {
        const ex = sumData.extracted;
        if (Array.isArray(ex.amounts) && ex.amounts.length) {
          displayParts.push(`\n💰 Montos: ${ex.amounts.join('; ')}`);
        }
        if (Array.isArray(ex.persons) && ex.persons.length) {
          displayParts.push(`👥 Personas: ${ex.persons.join('; ')}`);
        }
        if (Array.isArray(ex.addresses) && ex.addresses.length) {
          displayParts.push(`📍 Direcciones: ${ex.addresses.join('; ')}`);
        }
        if (Array.isArray(ex.dates) && ex.dates.length) {
          displayParts.push(`📅 Fechas: ${ex.dates.join('; ')}`);
        }
        if (Array.isArray(ex.relevant) && ex.relevant.length) {
          displayParts.push(`📋 Otros datos relevantes: ${ex.relevant.join('; ')}`);
        }
      }

      // Datos específicos extraídos según el tipo (al final, más amigable)
      if (sumData.extractedData && typeof sumData.extractedData === 'object') {
        displayParts.push('\n\n📊 DETALLES ESPECÍFICOS DEL DOCUMENTO');

        // Función para mostrar datos de manera amigable
        const formatFriendly = (obj: any, sectionName = ''): string[] => {
          const lines: string[] = [];

          if (sectionName) {
            lines.push(`\n🔸 ${sectionName.toUpperCase()}`);
          }

          for (const [key, value] of Object.entries(obj)) {
            if (value && typeof value === 'object') {
              // Para objetos anidados, crear secciones
              const friendlyName = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
              lines.push(...formatFriendly(value, friendlyName));
            } else if (value !== null && value !== '' && value !== undefined) {
              // Para valores simples, formatear de manera legible
              const friendlyKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
              let displayValue = String(value);

              // Formatear montos (más amplio para capturar diferentes variaciones)
              if (key.toLowerCase().includes('monto') || key.toLowerCase().includes('reserva') ||
                key.toLowerCase().includes('total') || key.toLowerCase().includes('refuerzo') ||
                key.toLowerCase().includes('alquiler') || key.toLowerCase().includes('garantia') ||
                key.toLowerCase().includes('arba') || key.toLowerCase().includes('honorarios') ||
                key.toLowerCase().includes('saldo') || key.toLowerCase().includes('jardinero')) {
                // Mejorar formato de montos
                displayValue = displayValue
                  .replace(/U\$D\s*(\d+(?:[.,]\d{3})*(?:[.,]\d{2})?)/g, 'U$D $1')
                  .replace(/ARS\s*(\d+(?:[.,]\d{3})*(?:[.,]\d{2})?)/g, 'ARS $1')
                  .replace(/\$(\d+(?:[.,]\d{3})*(?:[.,]\d{2})?)/g, '$$1')
                  .replace(/(\d+(?:[.,]\d{3})*(?:[.,]\d{2})?)\s*(?:pesos?|d[oó]lares?)/gi, '$1');
              }

              // Formatear plazos (más amplio)
              if ((key.toLowerCase().includes('plazo') || key.toLowerCase().includes('duracion') ||
                key.toLowerCase().includes('ingreso') || key.toLowerCase().includes('egreso')) &&
                /^\d+$/.test(displayValue)) {
                displayValue = `${displayValue} días`;
              }

              // Formatear porcentajes
              if (key.toLowerCase().includes('porcentaje') || key.toLowerCase().includes('honorarios')) {
                if (/^\d+(?:\.\d+)?$/.test(displayValue)) {
                  displayValue = `${displayValue}%`;
                }
              }

              // Formatear teléfonos
              if (key.toLowerCase().includes('telefono') || key.toLowerCase().includes('tel')) {
                displayValue = displayValue.replace(/(\d{2})(\d{4})(\d{4})/, '$1 $2-$3');
              }

              lines.push(`  • ${friendlyKey}: ${displayValue}`);
            }
          }
          return lines;
        };

        displayParts.push(...formatFriendly(sumData.extractedData));
      }

      setSummary(displayParts.join('\n'));
    } catch (e: any) {
      setError(e.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-start justify-center p-8">
      <div className="w-full max-w-2xl bg-white p-8 rounded-xl shadow">
        <h2 className="text-2xl font-semibold mb-4">Procesamiento inteligente de documentos</h2>
        <p className="text-sm text-gray-600 mb-4">Sube un PDF o Word y obtén un análisis completo con identificación de tipo y extracción de datos específicos.</p>

        <div className="mb-4">
          <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.txt" />
        </div>

        <div className="flex gap-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={handleUploadAndSummarize} disabled={loading}>
            {loading ? 'Procesando...' : 'Analizar documento'}
          </button>
        </div>

        {error && <div className="mt-4 text-red-600">{error}</div>}
        {summary && (
          <div className="mt-6 p-4 bg-gray-50 rounded">
            <h3 className="font-semibold mb-2">Análisis del documento</h3>
            <p className="whitespace-pre-line">{summary}</p>
          </div>
        )}
      </div>
    </div>
  );
}
