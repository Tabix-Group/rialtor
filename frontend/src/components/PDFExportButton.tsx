'use client'

import React, { useState } from 'react'
import { Download, FileText, Loader2 } from 'lucide-react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

interface PDFExportButtonProps {
  elementId: string
  fileName: string
  title: string
}

export default function PDFExportButton({ elementId, fileName, title }: PDFExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    const element = document.getElementById(elementId)
    if (!element) return

    setIsExporting(true)

    try {
      // Configuraciones para mejorar la calidad
      const canvas = await html2canvas(element, {
        scale: 2, // Mayor resolución
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
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
      
      const finalImgWidth = imgWidth * ratio
      const finalImgHeight = imgHeight * ratio
      
      const xOffset = (pdfWidth - finalImgWidth) / 2
      const yOffset = 10 // Margen superior

      // Añadir título
      pdf.setFontSize(18)
      pdf.setTextColor(15, 23, 42) // Slate 900
      pdf.text(title, pdfWidth / 2, 20, { align: 'center' })

      // Añadir imagen del contenido
      pdf.addImage(imgData, 'PNG', xOffset, 30, finalImgWidth, finalImgHeight)

      // Añadir pie de página
      pdf.setFontSize(10)
      pdf.setTextColor(100, 116, 139) // Slate 500
      pdf.text('rialtor.app - Herramientas Profesionales para el Real Estate', pdfWidth / 2, pdfHeight - 10, { align: 'center' })
      pdf.text(`${new Date().toLocaleDateString()}`, pdfWidth - 20, pdfHeight - 10, { align: 'right' })

      pdf.save(`${fileName}.pdf`)
    } catch (error) {
      console.error('Error al exportar PDF:', error)
      alert('Hubo un error al generar el PDF. Por favor, intenta de nuevo.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className="group inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm font-bold"
    >
      {isExporting ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Generando...
        </>
      ) : (
        <>
          <FileText className="w-4 h-4 text-orange-400 group-hover:scale-110 transition-transform" />
          Descargar PDF
        </>
      )}
    </button>
  )
}
