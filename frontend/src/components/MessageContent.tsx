'use client'

import React from 'react'
import { ExternalLink, DollarSign, Calculator, FileText } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

interface MessageContentProps {
    content: string
    isUser: boolean
    sources?: Array<{
        title: string
        url: string
        snippet?: string
    }>
    calculation?: any
}

export default function MessageContent({ content, isUser, sources, calculation }: MessageContentProps) {
    // Formatear números con separadores de miles
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(value)
    }

    return (
        <div className="space-y-3">
            {/* Contenido principal del mensaje */}
            <div className={`text-sm leading-relaxed ${isUser ? 'text-white' : 'text-gray-800'}`}>
                {isUser ? (
                    <p className="whitespace-pre-wrap">{content}</p>
                ) : (
                    <ReactMarkdown
                        className="prose prose-sm max-w-none"
                        components={{
                            p: ({ children }) => <p className="mb-2">{children}</p>,
                            strong: ({ children }) => <strong className="font-semibold text-blue-600">{children}</strong>,
                            em: ({ children }) => <em className="italic">{children}</em>,
                            ul: ({ children }) => <ul className="list-disc ml-4 mb-2 space-y-1">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal ml-4 mb-2 space-y-1">{children}</ol>,
                            li: ({ children }) => <li className="text-gray-700">{children}</li>,
                            code: ({ children }) => (
                                <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono text-gray-800">
                                    {children}
                                </code>
                            ),
                            a: ({ href, children }) => (
                                <a
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 underline"
                                >
                                    {children}
                                </a>
                            )
                        }}
                    >
                        {content}
                    </ReactMarkdown>
                )}
            </div>

            {/* Mostrar resultados de cálculos si existen */}
            {calculation && !isUser && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                        <Calculator className="w-4 h-4 text-blue-600" />
                        <h4 className="text-xs font-semibold text-blue-900">Resultado del Cálculo</h4>
                    </div>
                    
                    {calculation.monto_operacion && (
                        <div className="space-y-1 text-xs">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Monto operación:</span>
                                <span className="font-medium">{formatCurrency(calculation.monto_operacion)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Comisión bruta:</span>
                                <span className="font-medium">{formatCurrency(calculation.comision_bruta)}</span>
                            </div>
                            {calculation.deducciones && Object.keys(calculation.deducciones).length > 0 && (
                                <>
                                    <div className="border-t border-blue-300 my-2 pt-2">
                                        <p className="font-medium text-gray-700 mb-1">Deducciones:</p>
                                        {Object.entries(calculation.deducciones).map(([key, value]: [string, any]) => (
                                            <div key={key} className="flex justify-between ml-2">
                                                <span className="text-gray-600 capitalize">{key}:</span>
                                                <span className="text-red-600">-{formatCurrency(value)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                            <div className="flex justify-between border-t border-blue-300 pt-2 mt-2">
                                <span className="font-semibold text-gray-800">Neto a cobrar:</span>
                                <span className="font-bold text-green-600">{formatCurrency(calculation.neto)}</span>
                            </div>
                        </div>
                    )}

                    {calculation.valor_propiedad && (
                        <div className="space-y-1 text-xs">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Valor propiedad:</span>
                                <span className="font-medium">{formatCurrency(calculation.valor_propiedad)}</span>
                            </div>
                            {calculation.desglose && (
                                <>
                                    <div className="border-t border-blue-300 my-2 pt-2">
                                        <p className="font-medium text-gray-700 mb-1">Desglose de gastos:</p>
                                        {Object.entries(calculation.desglose).map(([key, value]: [string, any]) => (
                                            <div key={key} className="flex justify-between ml-2">
                                                <span className="text-gray-600 capitalize">{key.replace(/_/g, ' ')}:</span>
                                                <span>{formatCurrency(value)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                            <div className="flex justify-between border-t border-blue-300 pt-2 mt-2">
                                <span className="font-semibold text-gray-800">Total gastos:</span>
                                <span className="font-bold text-blue-600">{formatCurrency(calculation.total)}</span>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Mostrar fuentes si existen */}
            {sources && sources.length > 0 && !isUser && (
                <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                        <FileText className="w-4 h-4 text-amber-600" />
                        <h4 className="text-xs font-semibold text-amber-900">Fuentes consultadas</h4>
                    </div>
                    <div className="space-y-2">
                        {sources.slice(0, 3).map((source, index) => (
                            <a
                                key={index}
                                href={source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block p-2 bg-white rounded border border-amber-200 hover:border-amber-400 hover:shadow-sm transition-all group"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 mr-2">
                                        <p className="text-xs font-medium text-gray-800 group-hover:text-blue-600 line-clamp-1">
                                            {source.title}
                                        </p>
                                        {source.snippet && (
                                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                                {source.snippet}
                                            </p>
                                        )}
                                    </div>
                                    <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-blue-600 flex-shrink-0 mt-0.5" />
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
