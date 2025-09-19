'use client';

import { useState } from 'react'
import { FileText, Download, Wand2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '../../auth/authContext'

export default function DocumentGeneratorPage() {
    const { user } = useAuth();

    const [documentType, setDocumentType] = useState('')
    const [propertyData, setPropertyData] = useState({
        address: '',
        price: '',
        owner: '',
        buyer: '',
        description: ''
    })
    const [reservaData, setReservaData] = useState({
        nombreComprador: '',
        dniComprador: '',
        estadoCivilComprador: '',
        domicilioComprador: '',
        emailComprador: '',
        direccionInmueble: '',
        montoReserva: '',
        montoTotal: '',
        montoRefuerzo: '',
        nombreCorredor: '',
        matriculaCucicba: '',
        matriculaCmcpci: '',
        nombreInmobiliaria: '',
        dia: '',
        mes: '',
        anio: ''
    })
    const [isGenerating, setIsGenerating] = useState(false)
    const [generatedDocument, setGeneratedDocument] = useState<string | null>(null)

    const documentTypes = [
        { value: 'reserva', label: 'Modelo de Reserva y Oferta de Compra', description: 'Documento completo de reserva y oferta de compra inmobiliaria', hasForm: true },
        { value: 'reserva_simple', label: 'Modelo de Reserva', description: 'Documento de reserva de propiedad' },
        { value: 'autorizacion', label: 'Autorización de Publicación', description: 'Autorización para publicar la propiedad' },
        { value: 'boleto', label: 'Boleto de Compra-Venta', description: 'Boleto de compra-venta preliminar' },
        { value: 'contrato', label: 'Contrato de Locación', description: 'Contrato de alquiler de propiedad' }
    ]

    const handleGenerate = async () => {
        if (!documentType) {
            alert('Por favor selecciona un tipo de documento')
            return
        }

        setIsGenerating(true)
        console.log('[FRONTEND] Starting document generation...', documentType)

        try {
            if (documentType === 'reserva') {
                console.log('[FRONTEND] Sending reserva data:', reservaData)

                // Temporary fix: call backend directly to bypass proxy issues
                const backendUrl = 'https://remax-be-production.up.railway.app';
                const response = await fetch(`${backendUrl}/api/documents/generate-reserva`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(reservaData)
                })

                console.log('[FRONTEND] Response status:', response.status)
                console.log('[FRONTEND] Response ok:', response.ok)

                if (!response.ok) {
                    const errorText = await response.text()
                    console.error('[FRONTEND] Error response:', errorText)
                    throw new Error(`Error al generar el documento: ${response.status} - ${errorText}`)
                }

                const result = await response.json()
                console.log('[FRONTEND] Document generation successful:', !!result.documentContent)
                console.log('[FRONTEND] Document length:', result.documentContent?.length || 0)

                setGeneratedDocument(result.documentContent)

                if (result.message) {
                    console.log('[FRONTEND] Success message:', result.message)
                }
            } else {
                // Lógica existente para otros documentos
                await new Promise(resolve => setTimeout(resolve, 2000))

                const mockDocument = `DOCUMENTO GENERADO\n\nTipo: ${documentType}\nDirección: ${propertyData.address}\nPrecio: ${propertyData.price}\nPropietario: ${propertyData.owner}\nComprador: ${propertyData.buyer}\nDescripción: ${propertyData.description}\n\nFecha: ${new Date().toLocaleDateString('es-AR')}`

                setGeneratedDocument(mockDocument)
            }
        } catch (error) {
            console.error('[FRONTEND] Document generation error:', error)

            let errorMessage = 'Error desconocido';
            if (error instanceof Error) {
                if (error.name === 'AbortError') {
                    errorMessage = 'La solicitud tardó demasiado tiempo. Por favor, inténtalo de nuevo.';
                } else {
                    errorMessage = error.message;
                }
            }

            alert('Error al generar el documento: ' + errorMessage)
        } finally {
            setIsGenerating(false)
            console.log('[FRONTEND] Document generation process completed')
        }
    }

    const handleDownload = () => {
        if (!generatedDocument) return

        if (documentType === 'reserva') {
            // Para documentos de reserva, descargar como archivo de texto por ahora
            const blob = new Blob([generatedDocument], { type: 'text/plain;charset=utf-8' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `Reserva_Oferta_Compra_${Date.now()}.txt`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
        } else {
            // Para otros documentos, usar el método anterior
            const blob = new Blob([generatedDocument], { type: 'text/plain' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `documento-${documentType}-${Date.now()}.txt`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-12">
            <div className="max-w-4xl mx-auto px-2 sm:px-6 lg:px-8">
                <div className="bg-white/90 rounded-3xl shadow-2xl border border-gray-100 backdrop-blur-md">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-8 rounded-t-3xl shadow flex flex-col gap-2">
                        <Link href="/documents" className="flex items-center gap-2 text-blue-100 hover:text-white transition-colors mb-2 w-fit">
                            <ArrowLeft className="w-5 h-5" />
                            Volver a Documentos
                        </Link>
                        <h1 className="text-3xl font-extrabold mb-1 tracking-tight flex items-center gap-3">
                            <Wand2 className="w-8 h-8 text-white/80" />
                            Generador de Documentos Inteligentes
                        </h1>
                        <p className="text-blue-100 text-lg">
                            Crea documentos legales profesionales en segundos
                        </p>
                    </div>

                    {/* Form */}
                    <div className="p-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Tipo de documento */}
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold text-gray-800 mb-4">Tipo de Documento</h3>
                                <div className="space-y-3">
                                    {documentTypes.map((type) => (
                                        <div
                                            key={type.value}
                                            className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${documentType === type.value
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 hover:border-blue-300'
                                                }`}
                                            onClick={() => setDocumentType(type.value)}
                                        >
                                            <h4 className="font-semibold text-gray-800">{type.label}</h4>
                                            <p className="text-sm text-gray-600 mt-1">{type.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Datos de la propiedad o reserva */}
                            <div className="space-y-4">
                                {documentType === 'reserva' ? (
                                    <>
                                        <h3 className="text-xl font-bold text-gray-800 mb-4">Datos de la Reserva y Oferta de Compra</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Nombre del Comprador *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={reservaData.nombreComprador}
                                                    onChange={(e) => setReservaData({ ...reservaData, nombreComprador: e.target.value })}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="Nombre completo del comprador"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    DNI del Comprador *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={reservaData.dniComprador}
                                                    onChange={(e) => setReservaData({ ...reservaData, dniComprador: e.target.value })}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="Número de DNI"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Estado Civil
                                                </label>
                                                <select
                                                    value={reservaData.estadoCivilComprador}
                                                    onChange={(e) => setReservaData({ ...reservaData, estadoCivilComprador: e.target.value })}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                >
                                                    <option value="">Seleccionar...</option>
                                                    <option value="soltero">Soltero/a</option>
                                                    <option value="casado">Casado/a</option>
                                                    <option value="divorciado">Divorciado/a</option>
                                                    <option value="viudo">Viudo/a</option>
                                                </select>
                                            </div>

                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Domicilio del Comprador
                                                </label>
                                                <input
                                                    type="text"
                                                    value={reservaData.domicilioComprador}
                                                    onChange={(e) => setReservaData({ ...reservaData, domicilioComprador: e.target.value })}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="Dirección completa"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Email del Comprador
                                                </label>
                                                <input
                                                    type="email"
                                                    value={reservaData.emailComprador}
                                                    onChange={(e) => setReservaData({ ...reservaData, emailComprador: e.target.value })}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="email@ejemplo.com"
                                                />
                                            </div>

                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Dirección del Inmueble *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={reservaData.direccionInmueble}
                                                    onChange={(e) => setReservaData({ ...reservaData, direccionInmueble: e.target.value })}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="Dirección completa del inmueble"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Monto de Reserva (USD) *
                                                </label>
                                                <input
                                                    type="number"
                                                    value={reservaData.montoReserva}
                                                    onChange={(e) => setReservaData({ ...reservaData, montoReserva: e.target.value })}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="0"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Monto Total de Venta (USD) *
                                                </label>
                                                <input
                                                    type="number"
                                                    value={reservaData.montoTotal}
                                                    onChange={(e) => setReservaData({ ...reservaData, montoTotal: e.target.value })}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="0"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Monto de Refuerzo (USD)
                                                </label>
                                                <input
                                                    type="number"
                                                    value={reservaData.montoRefuerzo}
                                                    onChange={(e) => setReservaData({ ...reservaData, montoRefuerzo: e.target.value })}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="0"
                                                />
                                            </div>

                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Nombre del Corredor Inmobiliario
                                                </label>
                                                <input
                                                    type="text"
                                                    value={reservaData.nombreCorredor}
                                                    onChange={(e) => setReservaData({ ...reservaData, nombreCorredor: e.target.value })}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="Nombre completo del corredor"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Matrícula CUCICBA
                                                </label>
                                                <input
                                                    type="text"
                                                    value={reservaData.matriculaCucicba}
                                                    onChange={(e) => setReservaData({ ...reservaData, matriculaCucicba: e.target.value })}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="Número de matrícula"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Matrícula CMCP
                                                </label>
                                                <input
                                                    type="text"
                                                    value={reservaData.matriculaCmcpci}
                                                    onChange={(e) => setReservaData({ ...reservaData, matriculaCmcpci: e.target.value })}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="Número de matrícula"
                                                />
                                            </div>

                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Nombre de la Inmobiliaria
                                                </label>
                                                <input
                                                    type="text"
                                                    value={reservaData.nombreInmobiliaria}
                                                    onChange={(e) => setReservaData({ ...reservaData, nombreInmobiliaria: e.target.value })}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="Nombre de la inmobiliaria"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Día
                                                </label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="31"
                                                    value={reservaData.dia}
                                                    onChange={(e) => setReservaData({ ...reservaData, dia: e.target.value })}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="DD"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Mes
                                                </label>
                                                <select
                                                    value={reservaData.mes}
                                                    onChange={(e) => setReservaData({ ...reservaData, mes: e.target.value })}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                >
                                                    <option value="">Seleccionar...</option>
                                                    <option value="enero">Enero</option>
                                                    <option value="febrero">Febrero</option>
                                                    <option value="marzo">Marzo</option>
                                                    <option value="abril">Abril</option>
                                                    <option value="mayo">Mayo</option>
                                                    <option value="junio">Junio</option>
                                                    <option value="julio">Julio</option>
                                                    <option value="agosto">Agosto</option>
                                                    <option value="septiembre">Septiembre</option>
                                                    <option value="octubre">Octubre</option>
                                                    <option value="noviembre">Noviembre</option>
                                                    <option value="diciembre">Diciembre</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Año
                                                </label>
                                                <input
                                                    type="number"
                                                    min="2020"
                                                    max="2030"
                                                    value={reservaData.anio}
                                                    onChange={(e) => setReservaData({ ...reservaData, anio: e.target.value })}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="AAAA"
                                                />
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <h3 className="text-xl font-bold text-gray-800 mb-4">Datos de la Propiedad</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Dirección
                                                </label>
                                                <input
                                                    type="text"
                                                    value={propertyData.address}
                                                    onChange={(e) => setPropertyData({ ...propertyData, address: e.target.value })}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="Dirección completa de la propiedad"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Precio
                                                </label>
                                                <input
                                                    type="text"
                                                    value={propertyData.price}
                                                    onChange={(e) => setPropertyData({ ...propertyData, price: e.target.value })}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="Precio de la propiedad"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Propietario
                                                </label>
                                                <input
                                                    type="text"
                                                    value={propertyData.owner}
                                                    onChange={(e) => setPropertyData({ ...propertyData, owner: e.target.value })}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="Nombre del propietario"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Comprador/Inquilino
                                                </label>
                                                <input
                                                    type="text"
                                                    value={propertyData.buyer}
                                                    onChange={(e) => setPropertyData({ ...propertyData, buyer: e.target.value })}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="Nombre del comprador o inquilino"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Descripción
                                                </label>
                                                <textarea
                                                    value={propertyData.description}
                                                    onChange={(e) => setPropertyData({ ...propertyData, description: e.target.value })}
                                                    rows={4}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="Descripción detallada de la propiedad"
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Botón de generar */}
                        <div className="mt-8 text-center">
                            <button
                                onClick={handleGenerate}
                                disabled={isGenerating || !documentType || (documentType === 'reserva' && (!reservaData.nombreComprador || !reservaData.dniComprador || !reservaData.direccionInmueble || !reservaData.montoReserva || !reservaData.montoTotal))}
                                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-4 rounded-xl shadow-lg hover:from-blue-600 hover:to-indigo-700 transition-all flex items-center gap-3 font-bold text-lg mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Wand2 className={`w-6 h-6 ${isGenerating ? 'animate-spin' : ''}`} />
                                {isGenerating ? 'Generando documento...' : 'Generar Documento'}
                            </button>
                            {documentType === 'reserva' && (
                                <p className="text-sm text-gray-500 mt-2">
                                    * Campos obligatorios para generar el documento
                                </p>
                            )}
                            {isGenerating && (
                                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <p className="text-blue-700 text-sm">
                                        ⏳ Procesando documento... Esto puede tomar hasta 2 minutos.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Documento generado */}
                        {generatedDocument && (
                            <div className="mt-8">
                                <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-bold text-green-800 flex items-center gap-2">
                                            <FileText className="w-5 h-5" />
                                            Documento Generado
                                        </h3>
                                        <button
                                            onClick={handleDownload}
                                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                                        >
                                            <Download className="w-4 h-4" />
                                            Descargar
                                        </button>
                                    </div>
                                    <div className="bg-white border border-gray-200 rounded-lg p-4 max-h-96 overflow-y-auto">
                                        <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                                            {generatedDocument}
                                        </pre>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
