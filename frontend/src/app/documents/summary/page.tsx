"use client";

import { useState, useRef } from 'react';
import { FileText, Upload, Sparkles, AlertCircle, CheckCircle2, FileType, Ruler, Database, Zap } from 'lucide-react';
import { authenticatedFetch } from '@/utils/api';

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

      console.log('[UPLOAD] Starting file upload...');

      // Upload directly to backend using authenticatedFetch
      const uploadRes = await authenticatedFetch('/api/documents', { 
        method: 'POST', 
        body: fd 
      });
      if (!uploadRes.ok) {
        const errorData = await uploadRes.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Error al subir el archivo');
      }
      const uploadData = await uploadRes.json();
      const docId = uploadData?.document?.id;
      if (!docId) throw new Error('No se recibió id del documento');

      console.log('[UPLOAD] File uploaded successfully, requesting summary...');

      // Request summary directly from backend using authenticatedFetch
      const sumRes = await authenticatedFetch('/api/documents/summary', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-10 h-10 text-indigo-600" />
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              Resumidor Inteligente
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Extrae información clave de tus documentos inmobiliarios de forma automática
          </p>
        </div>

        {/* How it works section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-600" />
            ¿Cómo funciona?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Tipos de documentos */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-indigo-600">
                <FileType className="w-5 h-5" />
                <h3 className="font-semibold text-gray-900">Documentos Aceptados</h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Escrituras públicas</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Boletos de compraventa</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Contratos de alquiler</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Tasaciones</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Documentos legales</span>
                </li>
              </ul>
            </div>

            {/* Formatos y tamaño */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-indigo-600">
                <Ruler className="w-5 h-5" />
                <h3 className="font-semibold text-gray-900">Formatos y Límites</h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>PDF, DOC, DOCX, TXT</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Hasta 10MB por archivo</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Procesamiento en segundos</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>100% seguro y privado</span>
                </li>
              </ul>
            </div>

            {/* Datos extraídos */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-indigo-600">
                <Database className="w-5 h-5" />
                <h3 className="font-semibold text-gray-900">Datos Extraídos</h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Partes involucradas</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Datos de la propiedad</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Montos y condiciones</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Fechas importantes</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Cláusulas relevantes</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Proceso rápido */}
          <div className="mt-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
            <div className="flex items-center gap-2 text-indigo-700">
              <Zap className="w-5 h-5" />
              <span className="font-medium">Proceso inteligente en 3 pasos:</span>
            </div>
            <p className="text-sm text-indigo-600 mt-1">
              1) Sube tu documento • 2) IA analiza y extrae datos • 3) Obtén resumen estructurado con toda la información clave
            </p>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-white" />
              <h2 className="text-2xl font-bold text-white">Subir Documento</h2>
            </div>
          </div>

          <div className="p-8">
            <div className="mb-4">
              <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.txt" className="hidden" id="file-upload" />
              <label
                htmlFor="file-upload"
                className="flex items-center justify-center w-full px-6 py-8 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-500 transition-colors"
              >
                <div className="text-center">
                  <Upload className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-sm text-gray-600">
                    {fileRef.current?.files?.[0] ? fileRef.current.files[0].name : 'Haz clic para seleccionar un archivo'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PDF, DOC, DOCX o TXT (máx. 10MB)
                  </p>
                </div>
              </label>
            </div>

            <div className="flex gap-2">
              <button
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                onClick={handleUploadAndSummarize}
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    Procesando...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Analizar documento
                  </span>
                )}
              </button>
            </div>

            {error && (
              <div className="mt-4 flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {summary && (
              <div className="mt-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                  Análisis del documento
                </h3>
                <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                  {summary}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-sm text-gray-500 text-center">
          <p>
            <strong>Privacidad garantizada:</strong> Tus documentos son procesados de forma segura y no se almacenan en nuestros servidores.
          </p>
        </div>
      </div>
    </div>
  );
}
