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
      
      // Ajustar ratio para dejar espacio para título (30mm) y pie de página (20mm)
      const availableHeight = pdfHeight - 50 
      const ratio = Math.min(pdfWidth / imgWidth, availableHeight / imgHeight)
      
      const finalImgWidth = imgWidth * ratio
      const finalImgHeight = imgHeight * ratio
      
      const xOffset = (pdfWidth - finalImgWidth) / 2

      // Añadir título
      pdf.setFontSize(18)
      pdf.setTextColor(15, 23, 42) // Slate 900
      pdf.text(title, pdfWidth / 2, 20, { align: 'center' })

      // Añadir imagen del contenido
      pdf.addImage(imgData, 'PNG', xOffset, 30, finalImgWidth, finalImgHeight)

      // Añadir pie de página
      pdf.setFontSize(10)
      pdf.setTextColor(100, 116, 139) // Slate 500
      pdf.text('www.rialtor.app - Herramientas Profesionales para agentes inmobiliarios', pdfWidth / 2, pdfHeight - 10, { align: 'center' })

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
