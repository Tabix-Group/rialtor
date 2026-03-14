'use client'

import React, { useState, useRef } from 'react'
import { Download, Mail, Loader2, CheckCircle, X } from 'lucide-react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { useAuth } from '../app/auth/authContext'

interface DualExportButtonProps {
  elementId: string
  fileName: string
  title: string
}

export default function DualExportButton({ elementId, fileName, title }: DualExportButtonProps) {
  const { user } = useAuth()
  const [isExporting, setIsExporting] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [sendingEmail, setSendingEmail] = useState(false)
  const [emailStatus, setEmailStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' })
  const dropdownRef = useRef<HTMLDivElement>(null)

  const generatePDF = async () => {
    const element = document.getElementById(elementId)
    if (!element) return null

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })

      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = canvas.width
      const imgHeight = canvas.height
      
      const availableHeight = pdfHeight - 50 
      const ratio = Math.min(pdfWidth / imgWidth, availableHeight / imgHeight)
      
      const finalImgWidth = imgWidth * ratio
      const finalImgHeight = imgHeight * ratio
      
      const xOffset = (pdfWidth - finalImgWidth) / 2

      // Añadir título
      pdf.setFontSize(18)
      pdf.setTextColor(15, 23, 42)
      pdf.text(title, pdfWidth / 2, 20, { align: 'center' })

      // Añadir imagen del contenido
      pdf.addImage(imgData, 'PNG', xOffset, 30, finalImgWidth, finalImgHeight)

      // Añadir pie de página
      pdf.setFontSize(10)
      pdf.setTextColor(100, 116, 139)
      pdf.text('www.rialtor.app - Herramientas Profesionales para agentes inmobiliarios', pdfWidth / 2, pdfHeight - 10, { align: 'center' })

      return pdf
    } catch (error) {
      console.error('Error al generar PDF:', error)
      throw error
    }
  }

  const handleDownload = async () => {
    setIsExporting(true)
    try {
      const pdf = await generatePDF()
      if (pdf) {
        pdf.save(`${fileName}.pdf`)
      }
    } catch (error) {
      console.error('Error al descargar PDF:', error)
      alert('Hubo un error al generar el PDF. Por favor, intenta de nuevo.')
    } finally {
      setIsExporting(false)
      setShowDropdown(false)
    }
  }

  const handleSendEmail = async () => {
    if (!user?.email) {
      setEmailStatus({ type: 'error', message: 'No se encontró tu email' })
      return
    }

    setSendingEmail(true)
    setEmailStatus({ type: null, message: '' })

    try {
      const pdf = await generatePDF()
      if (!pdf) throw new Error('No se pudo generar el PDF')

      // Convertir PDF a base64
      const pdfBlob = pdf.output('blob')
      const reader = new FileReader()
      
      reader.onload = async (e) => {
        const base64PDF = (e.target?.result as string)?.split(',')[1]
        
        try {
          const response = await fetch('/api/calculator/send-pdf', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
              to: user.email,
              subject: `Cálculo: ${title}`,
              fileName: `${fileName}.pdf`,
              pdfData: base64PDF
            })
          })

          if (!response.ok) {
            throw new Error('Error al enviar el email')
          }

          const data = await response.json()
          setEmailStatus({ type: 'success', message: '✓ Email enviado correctamente' })
          setTimeout(() => {
            setShowDropdown(false)
            setEmailStatus({ type: null, message: '' })
          }, 2000)
        } catch (error) {
          console.error('Error:', error)
          setEmailStatus({ type: 'error', message: 'Error al enviar el email' })
        } finally {
          setSendingEmail(false)
        }
      }
      
      reader.readAsDataURL(pdfBlob)
    } catch (error) {
      console.error('Error al generar PDF:', error)
      setEmailStatus({ type: 'error', message: 'Error al generar el PDF' })
      setSendingEmail(false)
    }
  }

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        disabled={isExporting || sendingEmail}
        className="group inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm font-bold"
      >
        {isExporting || sendingEmail ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            {isExporting ? 'Descargando...' : 'Enviando...'}
          </>
        ) : (
          <>
            <Download className="w-4 h-4 text-orange-400 group-hover:scale-110 transition-transform" />
            Exportar
            <span className="text-xs ml-1">▼</span>
          </>
        )}
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden">
          {emailStatus.type && (
            <div className={`px-4 py-3 text-sm font-medium flex items-center gap-2 ${
              emailStatus.type === 'success' 
                ? 'bg-green-50 text-green-700 border-b border-green-200' 
                : 'bg-red-50 text-red-700 border-b border-red-200'
            }`}>
              {emailStatus.type === 'success' ? (
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
              ) : (
                <X className="w-4 h-4 flex-shrink-0" />
              )}
              {emailStatus.message}
            </div>
          )}
          
          {!emailStatus.type && (
            <>
              <button
                onClick={handleDownload}
                disabled={isExporting}
                className="w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors flex items-center gap-3 text-sm font-medium text-slate-900 border-b border-gray-100"
              >
                <Download className="w-4 h-4 text-slate-600" />
                <span>Descargar PDF</span>
              </button>

              <button
                onClick={handleSendEmail}
                disabled={sendingEmail}
                className="w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors flex items-center gap-3 text-sm font-medium text-slate-900"
              >
                <Mail className="w-4 h-4 text-blue-600" />
                <div>
                  <p>Enviar por Email</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
