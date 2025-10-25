export default function Contacto() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl sm:text-5xl font-bold">Contacto</h1>
            <p className="text-lg text-muted-foreground">
              Estamos aquí para ayudarte
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <section>
                <h2 className="text-2xl font-semibold mb-4">Información de Contacto</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Email Principal</h3>
                    <a
                      href="mailto:rialtor@rialtor.app"
                      className="text-primary hover:underline text-lg"
                    >
                      rialtor@rialtor.app
                    </a>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Horarios de Atención</h3>
                    <p className="text-muted-foreground">
                      Lunes a Viernes: 9:00 - 18:00 (GMT-3)<br />
                      Sábados: 9:00 - 13:00 (GMT-3)
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">¿En qué podemos ayudarte?</h2>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Soporte técnico y resolución de problemas</li>
                  <li>• Consultas sobre funcionalidades</li>
                  <li>• Sugerencias y feedback</li>
                  <li>• Información sobre planes y precios</li>
                  <li>• Reporte de bugs o errores</li>
                </ul>
              </section>
            </div>

            <div className="space-y-6">
              <section>
                <h2 className="text-2xl font-semibold mb-4">Respuesta Garantizada</h2>
                <p className="text-muted-foreground mb-4">
                  Nos comprometemos a responder todas las consultas dentro de las 24 horas hábiles.
                  Para casos urgentes, utilizaremos todos los canales disponibles para resolver tu situación.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Recursos Adicionales</h2>
                <ul className="space-y-3">
                  <li>
                    <a href="/centro-ayuda" className="text-primary hover:underline">
                      Centro de Ayuda →
                    </a>
                  </li>
                  <li>
                    <a href="/terminos" className="text-primary hover:underline">
                      Términos y Condiciones →
                    </a>
                  </li>
                  <li>
                    <a href="/politica-privacidad" className="text-primary hover:underline">
                      Política de Privacidad →
                    </a>
                  </li>
                </ul>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}