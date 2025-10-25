export default function TerminosCondiciones() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl sm:text-5xl font-bold">Términos y Condiciones</h1>
            <p className="text-lg text-muted-foreground">
              Última actualización: {new Date().toLocaleDateString('es-AR')}
            </p>
          </div>

          <div className="prose prose-lg max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Aceptación de los Términos</h2>
              <p>
                Al acceder y utilizar RIALTOR, aceptas estar sujeto a estos términos y condiciones de uso.
                Si no estás de acuerdo con alguna parte de estos términos, no podrás acceder al servicio.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Descripción del Servicio</h2>
              <p>
                RIALTOR es una plataforma digital diseñada para profesionales inmobiliarios en Argentina,
                que ofrece herramientas de IA, calculadoras fiscales, generadores de documentos y otras
                funcionalidades para optimizar el trabajo de martilleros y agentes inmobiliarios.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Uso del Servicio</h2>
              <p>
                El servicio está destinado exclusivamente para uso profesional inmobiliario.
                Queda prohibido utilizar la plataforma para fines ilegales o contrarios a la legislación argentina.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Propiedad Intelectual</h2>
              <p>
                Todo el contenido, funcionalidades y tecnología de RIALTOR están protegidos por derechos
                de propiedad intelectual. El usuario obtiene una licencia limitada para utilizar el servicio
                conforme a estos términos.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Responsabilidad</h2>
              <p>
                RIALTOR proporciona herramientas y información de apoyo, pero no sustituye el juicio
                profesional del usuario. La responsabilidad por las decisiones tomadas basándose en
                la información proporcionada recae exclusivamente en el usuario.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Privacidad</h2>
              <p>
                La privacidad de los usuarios es fundamental. Consulta nuestra Política de Privacidad
                para entender cómo manejamos tus datos personales.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Modificaciones</h2>
              <p>
                Nos reservamos el derecho de modificar estos términos en cualquier momento.
                Los cambios serán notificados a través de la plataforma.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Contacto</h2>
              <p>
                Para cualquier consulta sobre estos términos, puedes contactarnos en:
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