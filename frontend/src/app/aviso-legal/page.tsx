"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function AvisoLegalPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0a1a] to-[#1a0e2e]">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900/40 to-purple-800/20 border-b border-purple-500/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link href="/" className="flex items-center gap-2 text-purple-300 hover:text-white mb-4 transition-colors">
            <ChevronLeft className="w-4 h-4" />
            Volver
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold text-white">Aviso Legal</h1>
          <p className="text-purple-200/60 mt-2">Plataforma Inmobiliaria RIALTOR</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-invert max-w-none space-y-8">
          {/* Main Disclaimer */}
          <section className="bg-white/5 border border-purple-500/20 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Disclaimer Legal — Plataforma Inmobiliaria</h2>
            
            <div className="space-y-6 text-purple-100/80 text-sm leading-relaxed">
              <p>
                <strong className="text-white">Realtor.app</strong> provee servicios tecnológicos que permiten a inmobiliarias, profesionales 
                inmobiliarios, agencias, martilleros, corredores y/o anunciantes independientes publicar y gestionar avisos de propiedades.
              </p>

              <div>
                <h3 className="text-white font-semibold mb-3">Alcance de Servicios</h3>
                <p>
                  El operador de la plataforma no ejerce el corretaje inmobiliario, ni presta servicios de intermediación, representación, 
                  asesoramiento o gestión inmobiliaria. Asimismo, no participa en negociaciones, transacciones inmobiliarias, ni en la 
                  confección o firma de contratos u otra documentación legal vinculada a operaciones inmobiliarias.
                </p>
              </div>

              <div>
                <h3 className="text-white font-semibold mb-3">Responsabilidad del Anunciante</h3>
                <p>
                  Cada inmobiliaria, agencia, corredor, agente o anunciante que utiliza la plataforma actúa de forma independiente y es el 
                  único responsable por la veracidad, legalidad, integridad y actualización de la información publicada en sus avisos, así como 
                  por todas las actividades relacionadas con la promoción, negociación y concreción de operaciones inmobiliarias.
                </p>
              </div>

              <div>
                <h3 className="text-white font-semibold mb-3">Transacciones Inmobiliarias</h3>
                <p>
                  Todas las operaciones inmobiliarias, incluyendo —sin limitarse a— reservas, contratos de compraventa, alquileres y procesos 
                  de cierre de operaciones, se realizan directamente entre las partes involucradas y, cuando corresponda, a través del profesional 
                  inmobiliario responsable del aviso.
                </p>
              </div>

              <div>
                <h3 className="text-white font-semibold mb-3">Información Publicada</h3>
                <p>
                  Las descripciones de las propiedades, medidas, superficies, precios, gastos, impuestos, servicios, imágenes y demás información 
                  publicada en la plataforma son provistas por los anunciantes correspondientes y tienen carácter meramente informativo. Dicha 
                  información puede ser aproximada y está sujeta a modificaciones sin previo aviso.
                </p>
              </div>

              <div>
                <h3 className="text-white font-semibold mb-3">Responsabilidad del Usuario</h3>
                <p>
                  Los potenciales compradores, inquilinos u otros usuarios deberán verificar la información relevante directamente con el agente, 
                  corredor, agencia o anunciante responsable antes de tomar decisiones o concretar cualquier operación.
                </p>
              </div>

              <div>
                <h3 className="text-white font-semibold mb-3">Limitación de Responsabilidad</h3>
                <p>
                  El operador de la plataforma no garantiza la exactitud, integridad o actualización de la información publicada y no asume 
                  responsabilidad por errores, omisiones o modificaciones en los datos provistos por anunciantes o terceros.
                </p>
              </div>
            </div>
          </section>


          {/* Contact Section */}
          <section className="bg-gradient-to-r from-purple-900/40 to-purple-800/20 border border-purple-500/20 rounded-lg p-8 text-center">
            <h3 className="text-lg font-semibold text-white mb-2">Preguntas sobre este aviso legal</h3>
            <p className="text-purple-200/60 mb-4">
              Si tienes dudas sobre estos términos, contáctanos
            </p>
            <a
              href="mailto:rialtor@rialtor.app"
              className="inline-flex items-center gap-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              Contactar
            </a>
          </section>
        </div>
      </div>
    </div>
  );
}
