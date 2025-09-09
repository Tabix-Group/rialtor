import React from 'react';
import Link from 'next/link';

export default function Creditos() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col">
      {/* Hero / Título */}
      <section className="w-full bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 py-10 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Calculador de Costos de Garantía de Alquiler</h1>
          <p className="text-blue-100 mb-2">Completá los datos y obtené el mejor precio del mercado.</p>
        </div>
      </section>

      {/* Formulario embebido */}
      <section className="md:py-16 py-8 bg-gray-200">
        <div className="max-w-4xl mx-auto px-4">
          <iframe
            src="https://www.respaldar.com.ar/calcularcosto.html"
            title="Calculador Respaldar"
            width="100%"
            height="600"
            style={{ border: 'none', borderRadius: '12px', boxShadow: '0 2px 16px rgba(0,0,0,0.08)' }}
            allow="clipboard-write"
          ></iframe>
        </div>
      </section>


      {/* Pasos explicativos */}
      <section className="relative flex justify-center bg-gray-200 py-10">
        <div className="max-w-4xl mx-auto px-4">
          <header className="text-center mb-8">
            <h2 className="text-3xl font-bold text-green-700 mb-4">¿Cómo obtener tu garantía para alquilar?</h2>
          </header>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-4 rounded-lg shadow-lg text-center flex flex-col items-center">
              <div className="bg-green-700 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mb-2">1</div>
              <h3 className="md:mt-4 md:text-xl font-semibold">Completá tus datos</h3>
              <p className="mt-2 text-gray-700">Ingresa la información necesaria para que podamos evaluar tu solicitud.</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-lg text-center flex flex-col items-center">
              <div className="bg-green-700 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mb-2">2</div>
              <h3 className="md:mt-4 md:text-xl font-semibold">Verificación rápida</h3>
              <p className="mt-2 text-gray-700">Averiguá si calificás para la garantía sin compromiso alguno.</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-lg text-center flex flex-col items-center">
              <div className="bg-green-700 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mb-2">3</div>
              <h3 className="md:mt-4 md:text-xl font-semibold">Nos contactamos con vos</h3>
              <p className="mt-2 text-gray-700">Una vez completado el proceso, nos pondremos en contacto para continuar con los próximos pasos.</p>
            </div>
          </div>
          <p className="mt-8 text-green-700 text-center font-bold">¡Es fácil y rápido! No te comprometes a nada, solo completá el formulario y te contactaremos.</p>
        </div>
      </section>
    </div>
  );
}
