'use client';

import { useState } from 'react'
import { FileText, Download, Wand2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '../../auth/authContext'
import { useRouter } from 'next/navigation'

export default function DocumentGeneratorPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    // Proteger ruta: si no está logueado, redirigir a login
    if (!loading && !user && typeof window !== 'undefined') {
        router.replace('/auth/login');
        return null;
    }

    const [documentType, setDocumentType] = useState('')
    const [propertyData, setPropertyData] = useState({
        address: '',
        price: '',
        owner: '',
        buyer: '',
        description: ''
    })
    const [isGenerating, setIsGenerating] = useState(false)
    const [generatedDocument, setGeneratedDocument] = useState<string | null>(null)

    const documentTypes = [
        { value: 'reserva', label: 'Modelo de Reserva', description: 'Documento de reserva de propiedad' },
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
        try {
            // Aquí iría la llamada a la API para generar el documento
            // Por ahora simulamos la generación
            await new Promise(resolve => setTimeout(resolve, 2000))

            // Simular documento generado
            const mockDocument = `DOCUMENTO GENERADO\n\nTipo: ${documentType}\nDirección: ${propertyData.address}\nPrecio: ${propertyData.price}\nPropietario: ${propertyData.owner}\nComprador: ${propertyData.buyer}\nDescripción: ${propertyData.description}\n\nFecha: ${new Date().toLocaleDateString('es-AR')}`

            setGeneratedDocument(mockDocument)
        } catch (error) {
            alert('Error al generar el documento')
        } finally {
            setIsGenerating(false)
        }
    }

    const handleDownload = () => {
        if (!generatedDocument) return

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

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-blue-50 py-12">
            <div className="max-w-4xl mx-auto px-2 sm:px-6 lg:px-8">
                <div className="bg-white/90 rounded-3xl shadow-2xl border border-gray-100 backdrop-blur-md">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-red-600 to-red-400 text-white p-8 rounded-t-3xl shadow flex flex-col gap-2">
                        <Link href="/documents" className="flex items-center gap-2 text-red-100 hover:text-white transition-colors mb-2 w-fit">
                            <ArrowLeft className="w-5 h-5" />
                            Volver a Documentos
                        </Link>
                        <h1 className="text-3xl font-extrabold mb-1 tracking-tight flex items-center gap-3">
                            <Wand2 className="w-8 h-8 text-white/80" />
                            Generador de Documentos Inteligentes
                        </h1>
                        <p className="text-red-100 text-lg">
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
                                                    ? 'border-red-500 bg-red-50'
                                                    : 'border-gray-200 hover:border-red-300'
                                                }`}
                                            onClick={() => setDocumentType(type.value)}
                                        >
                                            <h4 className="font-semibold text-gray-800">{type.label}</h4>
                                            <p className="text-sm text-gray-600 mt-1">{type.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Datos de la propiedad */}
                            <div className="space-y-4">
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
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-transparent"
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
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-transparent"
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
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-transparent"
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
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-transparent"
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
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-transparent"
                                            placeholder="Descripción detallada de la propiedad"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Botón de generar */}
                        <div className="mt-8 text-center">
                            <button
                                onClick={handleGenerate}
                                disabled={isGenerating || !documentType}
                                className="bg-gradient-to-r from-red-500 to-red-700 text-white px-8 py-4 rounded-xl shadow-lg hover:from-red-600 hover:to-red-800 transition-all flex items-center gap-3 font-bold text-lg mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Wand2 className="w-6 h-6" />
                                {isGenerating ? 'Generando...' : 'Generar Documento'}
                            </button>
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
