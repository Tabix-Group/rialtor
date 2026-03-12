'use client';

import { useState, useRef, useCallback } from 'react';
import {
  Brain, Upload, CheckSquare, Square, ChevronDown, ChevronUp,
  FileText, Sparkles, AlertCircle, Copy, Check, Clock,
  ClipboardList, ArrowLeft, Loader2
} from 'lucide-react';
import Link from 'next/link';
import { authenticatedFetch } from '@/utils/api';
import { formatDateWithWeekday } from '@/utils/dateUtils';

// ─── Definición de bloques y campos ──────────────────────────────────────────

type FieldId = string;

interface FieldDef {
  id: FieldId;
  label: string;
  number: number;
}

interface BlockDef {
  id: string;
  letter: string;
  name: string;
  color: string;
  bgColor: string;
  borderColor: string;
  fields: FieldDef[];
}

const BLOCKS: BlockDef[] = [
  {
    id: 'A', letter: 'A', name: 'Identidad de la operación',
    color: 'text-blue-700', bgColor: 'bg-blue-50', borderColor: 'border-blue-200',
    fields: [
      { id: 'bloque_a_1', number: 1,  label: 'Tipo de documento' },
      { id: 'bloque_a_2', number: 2,  label: 'Tipo de operación' },
      { id: 'bloque_a_3', number: 3,  label: 'Fecha del documento' },
      { id: 'bloque_a_4', number: 4,  label: 'Jurisdicción (CABA / PBA / AMBA)' },
      { id: 'bloque_a_5', number: 5,  label: 'Inmobiliaria/s interviniente/s' },
    ],
  },
  {
    id: 'B', letter: 'B', name: 'Partes',
    color: 'text-violet-700', bgColor: 'bg-violet-50', borderColor: 'border-violet-200',
    fields: [
      { id: 'bloque_b_6',  number: 6,  label: 'Vendedor/es: nombre + DNI/CUIT' },
      { id: 'bloque_b_7',  number: 7,  label: 'Estado civil + régimen patrimonial' },
      { id: 'bloque_b_8',  number: 8,  label: 'Comprador/es: nombre + DNI/CUIT' },
      { id: 'bloque_b_9',  number: 9,  label: 'Representación: apoderado (sí/no)' },
      { id: 'bloque_b_10', number: 10, label: 'Datos del poder: escribano / fecha / registro' },
    ],
  },
  {
    id: 'C', letter: 'C', name: 'Inmueble (identificación)',
    color: 'text-emerald-700', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200',
    fields: [
      { id: 'bloque_c_11', number: 11, label: 'Domicilio del inmueble' },
      { id: 'bloque_c_12', number: 12, label: 'Matrícula / datos registrales' },
      { id: 'bloque_c_13', number: 13, label: 'Partida (ARBA / ABL)' },
      { id: 'bloque_c_14', number: 14, label: 'Nomenclatura catastral' },
      { id: 'bloque_c_15', number: 15, label: 'Tipo: Casa / Depto / PH / Lote / Local' },
      { id: 'bloque_c_16', number: 16, label: 'Unidad funcional / complementaria' },
      { id: 'bloque_c_17', number: 17, label: 'Superficie cubierta (m²)' },
      { id: 'bloque_c_18', number: 18, label: 'Superficie descubierta (m²)' },
      { id: 'bloque_c_19', number: 19, label: 'Superficie total (m²)' },
    ],
  },
  {
    id: 'D', letter: 'D', name: 'Dominio y cargas',
    color: 'text-amber-700', bgColor: 'bg-amber-50', borderColor: 'border-amber-200',
    fields: [
      { id: 'bloque_d_20', number: 20, label: 'Dominio: pleno / condominio / usufructo / otro' },
      { id: 'bloque_d_21', number: 21, label: 'Usufructo: existe (sí/no) + titulares' },
      { id: 'bloque_d_22', number: 22, label: 'Hipoteca: existe (sí/no) + estado' },
      { id: 'bloque_d_23', number: 23, label: 'Embargo: existe (sí/no)' },
      { id: 'bloque_d_24', number: 24, label: 'Inhibición: existe (sí/no)' },
      { id: 'bloque_d_25', number: 25, label: 'Protección de vivienda / bien de familia' },
      { id: 'bloque_d_26', number: 26, label: 'Servidumbres / restricciones' },
    ],
  },
  {
    id: 'E', letter: 'E', name: 'Económico',
    color: 'text-green-700', bgColor: 'bg-green-50', borderColor: 'border-green-200',
    fields: [
      { id: 'bloque_e_27', number: 27, label: 'Precio total' },
      { id: 'bloque_e_28', number: 28, label: 'Moneda' },
      { id: 'bloque_e_29', number: 29, label: 'Forma de pago' },
      { id: 'bloque_e_30', number: 30, label: 'Anticipo / seña / reserva' },
      { id: 'bloque_e_31', number: 31, label: 'Saldo' },
      { id: 'bloque_e_32', number: 32, label: 'Condición crédito hipotecario' },
      { id: 'bloque_e_33', number: 33, label: 'Origen de fondos declarado' },
    ],
  },
  {
    id: 'F', letter: 'F', name: 'Plazos y entrega',
    color: 'text-cyan-700', bgColor: 'bg-cyan-50', borderColor: 'border-cyan-200',
    fields: [
      { id: 'bloque_f_34', number: 34, label: 'Fecha máxima de escrituración' },
      { id: 'bloque_f_35', number: 35, label: 'Posesión: inmediata / diferida / ocupada' },
      { id: 'bloque_f_36', number: 36, label: 'Fecha de entrega de posesión' },
      { id: 'bloque_f_37', number: 37, label: 'Llaves: cuándo y contra qué' },
    ],
  },
  {
    id: 'G', letter: 'G', name: 'Cláusulas de conflicto',
    color: 'text-rose-700', bgColor: 'bg-rose-50', borderColor: 'border-rose-200',
    fields: [
      { id: 'bloque_g_38', number: 38, label: 'Penalidad incumplimiento comprador' },
      { id: 'bloque_g_39', number: 39, label: 'Penalidad incumplimiento vendedor' },
      { id: 'bloque_g_40', number: 40, label: 'Gastos: distribución (comprador/vendedor)' },
      { id: 'bloque_g_41', number: 41, label: 'Comisión inmobiliaria: % + quién paga + cuándo' },
      { id: 'bloque_g_42', number: 42, label: 'Condiciones suspensivas/resolutorias' },
    ],
  },
];

const ALL_FIELD_IDS = BLOCKS.flatMap(b => b.fields.map(f => f.id));

// ─── Tipos de resultado ───────────────────────────────────────────────────────

interface FieldResult {
  block: string;
  blockName: string;
  label: string;
  value: string | null;
}

interface DocuSmartResponse {
  documentId: string;
  documentName: string;
  expiresAt: string;
  results: Record<string, FieldResult>;
  fieldsExtracted: number;
  fieldsFound: number;
  usedVisionOCR?: boolean;
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function DocuSmartPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFields, setSelectedFields] = useState<Set<FieldId>>(new Set());
  const [collapsedBlocks, setCollapsedBlocks] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<DocuSmartResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorHint, setErrorHint] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // ── Drag & Drop handlers ──────────────────────────────────────────────────

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => setIsDragging(false), []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) setSelectedFile(file);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    setResults(null);
    setError(null);
  };

  // ── Field selection helpers ───────────────────────────────────────────────

  const toggleField = (id: FieldId) => {
    setSelectedFields(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleBlock = (block: BlockDef) => {
    const allSelected = block.fields.every(f => selectedFields.has(f.id));
    setSelectedFields(prev => {
      const next = new Set(prev);
      if (allSelected) block.fields.forEach(f => next.delete(f.id));
      else block.fields.forEach(f => next.add(f.id));
      return next;
    });
  };

  const selectAll = () => setSelectedFields(new Set(ALL_FIELD_IDS));
  const deselectAll = () => setSelectedFields(new Set());

  const toggleCollapse = (blockId: string) => {
    setCollapsedBlocks(prev => {
      const next = new Set(prev);
      if (next.has(blockId)) next.delete(blockId); else next.add(blockId);
      return next;
    });
  };

  const blockStatus = (block: BlockDef) => {
    const ids = block.fields.map(f => f.id);
    const selected = ids.filter(id => selectedFields.has(id)).length;
    if (selected === 0) return 'none';
    if (selected === ids.length) return 'all';
    return 'partial';
  };

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleExtract = async () => {
    if (!selectedFile) { setError('Seleccioná un documento'); return; }
    if (selectedFields.size === 0) { setError('Seleccioná al menos un campo a extraer'); return; }

    setError(null);
    setErrorHint(null);
    setResults(null);
    setLoading(true);

    try {
      const fd = new FormData();
      fd.append('file', selectedFile);
      fd.append('selectedFields', JSON.stringify(Array.from(selectedFields)));

      const res = await authenticatedFetch('/api/documents/docusmart', { method: 'POST', body: fd });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        setError(errData.error || `Error ${res.status}`);
        if (errData.hint) setErrorHint(errData.hint);
        return;
      }

      const data: DocuSmartResponse = await res.json();
      setResults(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  // ── Copy results ──────────────────────────────────────────────────────────

  const copyResults = () => {
    if (!results) return;
    const lines: string[] = [`DocuSmart — ${results.documentName}`, ''];
    const blockMap: Record<string, { blockName: string; items: [string, FieldResult][] }> = {};
    for (const [id, field] of Object.entries(results.results)) {
      if (!blockMap[field.block]) blockMap[field.block] = { blockName: field.blockName, items: [] };
      blockMap[field.block].items.push([id, field]);
    }
    for (const block of Object.keys(blockMap).sort()) {
      const { blockName, items } = blockMap[block];
      lines.push(`── Bloque ${block}: ${blockName} ──`);
      for (const [, field] of items) {
        lines.push(`  • ${field.label}: ${field.value ?? '—'}`);
      }
      lines.push('');
    }
    lines.push(`Documentos eliminados automáticamente el: ${new Date(results.expiresAt).toLocaleDateString('es-AR')}`);
    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/10">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-900/20 to-slate-900/80" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <Link
            href="/documents"
            className="inline-flex items-center gap-2 text-slate-300 hover:text-white text-sm mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a Documentos
          </Link>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-4">
            <Brain className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-semibold text-white">DocuSmart · Extracción Inteligente</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3 tracking-tight">
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">DocuSmart</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
            Subí una escritura, boleto o cesión — elegí qué datos necesitás — y la IA los extrae automáticamente.
            Los documentos se almacenan de forma segura por <strong className="text-white">30 días</strong> y luego se eliminan.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* ── Grid: upload + checklist ───────────────────────────────────── */}
        {!results && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

            {/* ── Left: Upload ─────────────────────────────────────────── */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Upload className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-base font-semibold text-gray-900">1. Subí el documento</h2>
                </div>

                {/* Drop zone */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileRef.current?.click()}
                  className={`flex flex-col items-center justify-center gap-3 w-full min-h-[160px] border-2 border-dashed rounded-lg cursor-pointer transition-all ${
                    isDragging
                      ? 'border-indigo-500 bg-indigo-50'
                      : selectedFile
                      ? 'border-green-400 bg-green-50'
                      : 'border-gray-300 hover:border-indigo-400 hover:bg-indigo-50/40'
                  }`}
                >
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={loading}
                  />
                  {selectedFile ? (
                    <>
                      <FileText className="w-10 h-10 text-green-600" />
                      <div className="text-center px-4">
                        <p className="text-sm font-medium text-green-700 break-all">{selectedFile.name}</p>
                        <p className="text-xs text-green-600 mt-1">{(selectedFile.size / 1024).toFixed(1)} KB · Click para cambiar</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <Upload className="w-10 h-10 text-gray-400" />
                      <div className="text-center px-4">
                        <p className="text-sm text-gray-600">Arrastrá o hacé click para seleccionar</p>
                        <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX, TXT · máx. 25 MB</p>
                      </div>
                    </>
                  )}
                </div>

                {/* Info notice */}
                <div className="mt-3 flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <Clock className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700">
                    El documento se almacena de forma segura en la nube y se elimina automáticamente a los <strong>30 días</strong>.
                  </p>
                </div>

                {/* Scanned documents warning */}
                <div className="mt-3 flex items-start gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-orange-700">
                    <strong>Nota:</strong> Los documentos escaneados o imágenes pueden perder calidad durante el procesamiento, lo que afecta la precisión de la extracción.
                  </p>
                </div>
              </div>

              {/* Extract button + field counter */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-600">
                    <strong className="text-gray-900">{selectedFields.size}</strong> de {ALL_FIELD_IDS.length} campos seleccionados
                  </span>
                  <div className="flex gap-2">
                    <button onClick={selectAll} className="text-xs text-indigo-600 hover:underline">Todos</button>
                    <span className="text-xs text-gray-300">|</span>
                    <button onClick={deselectAll} className="text-xs text-gray-500 hover:underline">Ninguno</button>
                  </div>
                </div>

                <button
                  onClick={handleExtract}
                  disabled={loading || !selectedFile || selectedFields.size === 0}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Analizando documento...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Extraer información
                    </>
                  )}
                </button>

                {error && (
                  <div className="mt-3 p-4 bg-amber-50 border border-amber-300 rounded-lg space-y-2">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm font-medium text-amber-800">{error}</p>
                    </div>
                    {errorHint && (
                      <div className="pl-6">
                        <p className="text-xs text-amber-700 leading-relaxed whitespace-pre-line">{errorHint}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* ── Right: Field checklist ────────────────────────────────── */}
            <div className="lg:col-span-3">
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
                  <ClipboardList className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-base font-semibold text-gray-900">2. Elegí qué información extraer</h2>
                </div>

                <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                  {BLOCKS.map(block => {
                    const status = blockStatus(block);
                    const isCollapsed = collapsedBlocks.has(block.id);
                    const allChecked = status === 'all';
                    const someChecked = status === 'partial';

                    return (
                      <div key={block.id}>
                        {/* Block header */}
                        <div
                          className={`flex items-center gap-3 px-5 py-3 cursor-pointer select-none ${block.bgColor} group`}
                        >
                          {/* Block checkbox */}
                          <button
                            onClick={() => toggleBlock(block)}
                            className="flex-shrink-0"
                            aria-label={`Toggle all in block ${block.letter}`}
                          >
                            {allChecked ? (
                              <CheckSquare className={`w-5 h-5 ${block.color}`} />
                            ) : someChecked ? (
                              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${block.borderColor} ${block.bgColor}`}>
                                <div className={`w-2.5 h-0.5 rounded ${block.color.replace('text-', 'bg-')}`} />
                              </div>
                            ) : (
                              <Square className="w-5 h-5 text-gray-400" />
                            )}
                          </button>

                          <button
                            onClick={() => toggleCollapse(block.id)}
                            className="flex-1 flex items-center gap-2 text-left"
                          >
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${block.color} ${block.bgColor} ${block.borderColor}`}>
                              {block.letter}
                            </span>
                            <span className={`text-sm font-semibold ${block.color}`}>{block.name}</span>
                            <span className="ml-auto text-xs text-gray-400">
                              {block.fields.filter(f => selectedFields.has(f.id)).length}/{block.fields.length}
                            </span>
                            {isCollapsed
                              ? <ChevronDown className="w-4 h-4 text-gray-400 ml-1" />
                              : <ChevronUp className="w-4 h-4 text-gray-400 ml-1" />
                            }
                          </button>
                        </div>

                        {/* Field list */}
                        {!isCollapsed && (
                          <div className="px-5 pb-1 pt-0.5 space-y-0.5">
                            {block.fields.map(field => {
                              const checked = selectedFields.has(field.id);
                              return (
                                <label
                                  key={field.id}
                                  className="flex items-center gap-3 py-2 cursor-pointer group/item hover:bg-gray-50 rounded-md px-1 -mx-1"
                                >
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => toggleField(field.id)}
                                    className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                  />
                                  <span className="text-xs font-medium text-gray-500 w-6 text-right flex-shrink-0">
                                    {field.number}.
                                  </span>
                                  <span className={`text-sm leading-snug ${checked ? 'text-gray-800' : 'text-gray-400'}`}>
                                    {field.label}
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Loading overlay ────────────────────────────────────────────── */}
        {loading && (
          <div className="flex flex-col items-center justify-center gap-4 py-16 bg-white border border-gray-200 rounded-xl shadow-sm">
            <div className="relative">
              <Brain className="w-12 h-12 text-indigo-600" />
              <Loader2 className="w-5 h-5 text-purple-500 animate-spin absolute -top-1 -right-1" />
            </div>
            <div className="text-center">
              <p className="text-base font-semibold text-gray-900">Analizando el documento con IA...</p>
              <p className="text-sm text-gray-500 mt-1">Esto puede tardar algunos segundos</p>
            </div>
          </div>
        )}

        {/* ── Results ────────────────────────────────────────────────────── */}
        {results && !loading && (
          <div className="space-y-5">
            {/* Results header */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-base font-semibold text-gray-900">Extracción completada</h2>
                      {results.usedVisionOCR && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200">
                          <Brain className="w-3 h-3" />
                          OCR con IA aplicado automáticamente
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">
                      <strong className="text-green-700">{results.fieldsFound}</strong> de{' '}
                      <strong>{results.fieldsExtracted}</strong> campos encontrados en{' '}
                      <span className="text-gray-700 font-medium">{results.documentName}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full">
                    <Clock className="w-3.5 h-3.5" />
                    Expira {new Date(results.expiresAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </div>

                  <button
                    onClick={copyResults}
                    className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copiado' : 'Copiar todo'}
                  </button>

                  <button
                    onClick={() => { setResults(null); setSelectedFile(null); setError(null); setErrorHint(null); if (fileRef.current) fileRef.current.value = ''; }}
                    className="flex items-center gap-1.5 text-xs text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-full transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Nuevo análisis
                  </button>
                </div>
              </div>
            </div>

            {/* Results grid by block */}
            {BLOCKS.map(block => {
              const blockResults = Object.entries(results.results).filter(([, r]) => r.block === block.id);
              if (blockResults.length === 0) return null;

              return (
                <div key={block.id} className={`bg-white border rounded-xl shadow-sm overflow-hidden ${block.borderColor}`}>
                  <div className={`flex items-center gap-3 px-5 py-3.5 ${block.bgColor}`}>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${block.color} ${block.bgColor} ${block.borderColor}`}>
                      {block.letter}
                    </span>
                    <h3 className={`text-sm font-semibold ${block.color}`}>{block.name}</h3>
                    <span className="ml-auto text-xs text-gray-500">
                      {blockResults.filter(([, r]) => r.value).length}/{blockResults.length} encontrados
                    </span>
                  </div>

                  <div className="divide-y divide-gray-100">
                    {blockResults.map(([id, field]) => {
                      const hasValue = field.value !== null && field.value !== '';
                      return (
                        <div key={id} className="flex items-start gap-4 px-5 py-3.5">
                          <div className="flex-shrink-0 mt-0.5">
                            {hasValue
                              ? <Check className="w-4 h-4 text-green-500" />
                              : <span className="w-4 h-4 flex items-center justify-center text-gray-300 text-lg leading-none">—</span>
                            }
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-500 mb-0.5">{field.label}</p>
                            {hasValue ? (
                              <p className="text-sm text-gray-900 leading-relaxed whitespace-pre-wrap break-words">
                                {field.value}
                              </p>
                            ) : (
                              <p className="text-sm text-gray-300 italic">No encontrado en el documento</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Privacy footer */}
            <div className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-500">
              <Clock className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
              <p>
                El documento fue guardado de forma segura en la nube y será <strong>eliminado automáticamente</strong> el{' '}
                <strong className="text-slate-700">
                  {formatDateWithWeekday(results.expiresAt.split('T')[0])}
                </strong>.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
