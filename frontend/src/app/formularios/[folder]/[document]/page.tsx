'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'

export default function DocumentEditorPage() {
    const router = useRouter()
    const params = useParams()
    const folder = (params?.folder as string) || ''
    const documentId = decodeURIComponent((params?.document as string) || '')

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [documentMetadata, setDocumentMetadata] = useState<any>(null)
    const [initialHtml, setInitialHtml] = useState('')

    const editor = useEditor({
        extensions: [
            StarterKit,
            TextStyle,
            Color,
        ],
        content: '',
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none focus:outline-none min-h-[500px] p-8 bg-white',
            },
        },
    })

    useEffect(() => {
        if (documentId) {
            loadDocumentContent()
        }
    }, [documentId])

    const loadDocumentContent = async () => {
        try {
            setLoading(true)
            const encodedId = encodeURIComponent(documentId)
            const response = await fetch(`/api/forms/document/${encodedId}/content`)
            
            if (!response.ok) {
                throw new Error('Error al cargar el documento')
            }
            
            const data = await response.json()
            
            if (data.success && data.data) {
                setDocumentMetadata(data.data.metadata)
                setInitialHtml(data.data.html)
                
                // Cargar contenido en el editor
                if (editor) {
                    editor.commands.setContent(data.data.html)
                }
            }
        } catch (err) {
            console.error('Error loading document:', err)
            setError('Error al cargar el documento. Por favor, intenta nuevamente.')
        } finally {
            setLoading(false)
        }
    }

    // Actualizar contenido del editor cuando cambie
    useEffect(() => {
        if (editor && initialHtml) {
            editor.commands.setContent(initialHtml)
        }
    }, [editor, initialHtml])

    const handleDownloadCompleted = async () => {
        if (!editor) return

        try {
            setSaving(true)
            const htmlContent = editor.getHTML()
            
            // Generar nombre de archivo
            const timestamp = new Date().toISOString().split('T')[0]
            const filename = `${documentMetadata?.filename?.replace('.docx', '') || 'documento'}_completado_${timestamp}.docx`

            const response = await fetch('/api/forms/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    documentId,
                    htmlContent,
                    filename,
                }),
            })

            if (!response.ok) {
                throw new Error('Error al generar el documento')
            }

            // Descargar el archivo
            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = filename
            link.style.display = 'none'
            
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            
            window.URL.revokeObjectURL(url)

            console.log('✅ Documento generado y descargado')
        } catch (err) {
            console.error('Error generating document:', err)
            alert('Error al generar el documento. Por favor, intenta nuevamente.')
        } finally {
            setSaving(false)
        }
    }

    const handleReset = () => {
        if (editor && initialHtml) {
            if (confirm('¿Estás seguro de que deseas restablecer todos los cambios?')) {
                editor.commands.setContent(initialHtml)
            }
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando documento...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md">
                    <div className="flex items-center gap-3 text-red-800 mb-2">
                        <span className="text-2xl">⚠️</span>
                        <h3 className="font-semibold">Error</h3>
                    </div>
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                        onClick={() => router.push(`/formularios/${folder}`)}
                        className="text-blue-600 hover:underline font-semibold"
                    >
                        ← Volver a documentos
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => router.push(`/formularios/${folder}`)}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-4 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Volver a documentos
                    </button>

                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                {documentMetadata?.filename || 'Editor de Documento'}
                            </h1>
                            <p className="text-gray-600">
                                Completa los campos y descarga el documento cuando estés listo
                            </p>
                        </div>
                    </div>
                </div>

                {/* Toolbar */}
                {editor && (
                    <div className="bg-white rounded-xl shadow-lg border-2 border-gray-100 p-4 mb-6">
                        <div className="flex flex-wrap items-center gap-2">
                            {/* Formato de texto */}
                            <div className="flex items-center gap-1 border-r border-gray-300 pr-3">
                                <button
                                    onClick={() => editor.chain().focus().toggleBold().run()}
                                    className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('bold') ? 'bg-blue-100 text-blue-600' : 'text-gray-700'}`}
                                    title="Negrita"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 12h8m-8-6h8m-8 12h8" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => editor.chain().focus().toggleItalic().run()}
                                    className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('italic') ? 'bg-blue-100 text-blue-600' : 'text-gray-700'}`}
                                    title="Cursiva"
                                >
                                    <svg className="w-5 h-5 italic" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => editor.chain().focus().toggleStrike().run()}
                                    className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('strike') ? 'bg-blue-100 text-blue-600' : 'text-gray-700'}`}
                                    title="Tachado"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12h12M6 12l6-6m0 6l6 6" />
                                    </svg>
                                </button>
                            </div>

                            {/* Encabezados */}
                            <div className="flex items-center gap-1 border-r border-gray-300 pr-3">
                                <button
                                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                                    className={`px-3 py-2 rounded text-sm font-semibold hover:bg-gray-100 ${editor.isActive('heading', { level: 1 }) ? 'bg-blue-100 text-blue-600' : 'text-gray-700'}`}
                                >
                                    H1
                                </button>
                                <button
                                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                                    className={`px-3 py-2 rounded text-sm font-semibold hover:bg-gray-100 ${editor.isActive('heading', { level: 2 }) ? 'bg-blue-100 text-blue-600' : 'text-gray-700'}`}
                                >
                                    H2
                                </button>
                                <button
                                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                                    className={`px-3 py-2 rounded text-sm font-semibold hover:bg-gray-100 ${editor.isActive('heading', { level: 3 }) ? 'bg-blue-100 text-blue-600' : 'text-gray-700'}`}
                                >
                                    H3
                                </button>
                            </div>

                            {/* Listas */}
                            <div className="flex items-center gap-1 border-r border-gray-300 pr-3">
                                <button
                                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                                    className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('bulletList') ? 'bg-blue-100 text-blue-600' : 'text-gray-700'}`}
                                    title="Lista con viñetas"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                                    className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('orderedList') ? 'bg-blue-100 text-blue-600' : 'text-gray-700'}`}
                                    title="Lista numerada"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                                    </svg>
                                </button>
                            </div>

                            {/* Acciones */}
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={handleReset}
                                    className="px-3 py-2 rounded text-sm font-semibold text-gray-700 hover:bg-gray-100"
                                    title="Restablecer cambios"
                                >
                                    🔄 Restablecer
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Editor */}
                <div className="bg-white rounded-xl shadow-2xl border-2 border-gray-200 overflow-hidden mb-6">
                    <div className="border-b-2 border-gray-200 bg-gray-50 px-8 py-4">
                        <p className="text-sm text-gray-600">
                            💡 <strong>Tip:</strong> Haz clic en el texto para editarlo. Los campos en blanco están listos para ser completados.
                        </p>
                    </div>
                    <EditorContent editor={editor} />
                </div>

                {/* Botón de descarga */}
                <div className="flex justify-end gap-4">
                    <button
                        onClick={() => router.push(`/formularios/${folder}`)}
                        className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleDownloadCompleted}
                        disabled={saving}
                        className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {saving ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                <span>Generando...</span>
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                <span>Descargar Documento Completado</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
