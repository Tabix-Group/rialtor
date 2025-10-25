export default function PoliticaPrivacidad() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl sm:text-5xl font-bold">Política de Privacidad</h1>
            <p className="text-lg text-muted-foreground">
              Última actualización: {new Date().toLocaleDateString('es-AR')}
            </p>
          </div>

          <div className="prose prose-lg max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Información que Recopilamos</h2>
              <p>
                Recopilamos información personal que nos proporcionas directamente, como nombre,
                email, información profesional y datos necesarios para el funcionamiento de nuestras herramientas.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Uso de la Información</h2>
              <p>
                Utilizamos tu información para proporcionar nuestros servicios, mejorar la plataforma,
                comunicarnos contigo y cumplir con obligaciones legales. Nunca vendemos tus datos personales.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Protección de Datos</h2>
              <p>
                Implementamos medidas de seguridad técnicas y organizativas para proteger tu información
                contra acceso no autorizado, pérdida o alteración.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Compartir Información</h2>
              <p>
                No compartimos tu información personal con terceros, excepto cuando sea necesario
                para proporcionar el servicio o cuando lo exija la ley.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Tus Derechos</h2>
              <p>
                Tienes derecho a acceder, rectificar, eliminar o portar tus datos personales.
                Puedes ejercer estos derechos contactándonos directamente.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Cookies y Tecnologías Similares</h2>
              <p>
                Utilizamos cookies y tecnologías similares para mejorar tu experiencia en la plataforma
                y analizar el uso del servicio.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Cambios en la Política</h2>
              <p>
                Podemos actualizar esta política de privacidad. Te notificaremos sobre cambios
                significativos a través de la plataforma o por email.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Contacto</h2>
              <p>
                Para preguntas sobre esta política de privacidad, contactanos en:
                <a href="mailto:rialtor@rialtor.app" className="text-primary hover:underline ml-1">
                  rialtor@rialtor.app
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}