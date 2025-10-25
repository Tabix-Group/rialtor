export default function CentroAyuda() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl sm:text-5xl font-bold">Centro de Ayuda</h1>
            <p className="text-lg text-muted-foreground">
              Encuentra respuestas a tus preguntas y guías para usar RIALTOR
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <section>
                <h2 className="text-2xl font-semibold mb-4">Primeros Pasos</h2>
                <ul className="space-y-3">
                  <li>
                    <a href="#registro" className="text-primary hover:underline">
                      Cómo registrarse en RIALTOR
                    </a>
                  </li>
                  <li>
                    <a href="#configuracion" className="text-primary hover:underline">
                      Configuración inicial de tu perfil
                    </a>
                  </li>
                  <li>
                    <a href="#navegacion" className="text-primary hover:underline">
                      Navegando por la plataforma
                    </a>
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Herramientas</h2>
                <ul className="space-y-3">
                  <li>
                    <a href="#calculadoras" className="text-primary hover:underline">
                      Uso de calculadoras fiscales
                    </a>
                  </li>
                  <li>
                    <a href="#documentos" className="text-primary hover:underline">
                      Generación de documentos legales
                    </a>
                  </li>
                  <li>
                    <a href="#chat" className="text-primary hover:underline">
                      Consultor IA inmobiliario
                    </a>
                  </li>
                  <li>
                    <a href="#placas" className="text-primary hover:underline">
                      Generador de placas profesionales
                    </a>
                  </li>
                </ul>
              </section>
            </div>

            <div className="space-y-6">
              <section>
                <h2 className="text-2xl font-semibold mb-4">Soporte Técnico</h2>
                <ul className="space-y-3">
                  <li>
                    <a href="#problemas" className="text-primary hover:underline">
                      Solución de problemas comunes
                    </a>
                  </li>
                  <li>
                    <a href="#compatibilidad" className="text-primary hover:underline">
                      Compatibilidad de navegadores
                    </a>
                  </li>
                  <li>
                    <a href="#seguridad" className="text-primary hover:underline">
                      Seguridad y privacidad
                    </a>
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Facturación y Pagos</h2>
                <ul className="space-y-3">
                  <li>
                    <a href="#planes" className="text-primary hover:underline">
                      Comparación de planes
                    </a>
                  </li>
                  <li>
                    <a href="#pagos" className="text-primary hover:underline">
                      Métodos de pago aceptados
                    </a>
                  </li>
                  <li>
                    <a href="#cancelacion" className="text-primary hover:underline">
                      Cancelación y reembolsos
                    </a>
                  </li>
                </ul>
              </section>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-8 text-center space-y-4">
            <h3 className="text-xl font-semibold">¿No encontraste lo que buscas?</h3>
            <p className="text-muted-foreground">
              Nuestro equipo de soporte está aquí para ayudarte
            </p>
            <a
              href="mailto:rialtor@rialtor.app"
              className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground font-medium rounded-full hover:bg-primary/90 transition-colors"
            >
              Contactar Soporte
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}