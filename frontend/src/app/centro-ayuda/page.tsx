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
              <section id="registro">
                <h2 className="text-2xl font-semibold mb-4">Primeros Pasos</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Cómo registrarse en RIALTOR</h3>
                    <p className="text-sm text-muted-foreground">
                      Crea tu cuenta gratuita en pocos minutos. Solo necesitas un email válido y datos básicos de tu actividad inmobiliaria.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Configuración inicial de tu perfil</h3>
                    <p className="text-sm text-muted-foreground">
                      Completa tu perfil profesional con tu matrícula, zona de trabajo y especialidades para acceder a todas las herramientas.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Navegando por la plataforma</h3>
                    <p className="text-sm text-muted-foreground">
                      Conoce el menú lateral, el dashboard principal y cómo acceder rápidamente a cada herramienta desde cualquier página.
                    </p>
                  </div>
                </div>
              </section>

              <section id="calculadoras">
                <h2 className="text-2xl font-semibold mb-4">Herramientas</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Uso de calculadoras fiscales</h3>
                    <p className="text-sm text-muted-foreground">
                      Calcula comisiones, IVA, IIBB, ganancias, sellos provinciales e ITI. Soporte para monotributistas y responsables inscriptos.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Generación de documentos legales</h3>
                    <p className="text-sm text-muted-foreground">
                      Crea contratos de alquiler, boletos de compraventa, reservas y formularios editables con datos personalizados.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Consultor IA inmobiliario</h3>
                    <p className="text-sm text-muted-foreground">
                      Asistente inteligente con conocimiento del mercado argentino, cálculos automáticos y búsqueda de información en tiempo real.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Generador de placas profesionales</h3>
                    <p className="text-sm text-muted-foreground">
                      Sube fotos de propiedades y genera automáticamente placas con IA para redes sociales y portales inmobiliarios.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Sistema de gestión financiera</h3>
                    <p className="text-sm text-muted-foreground">
                      Controla tus ingresos, gastos, comisiones y finanzas personales con reportes detallados y análisis de rentabilidad.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Calendario profesional</h3>
                    <p className="text-sm text-muted-foreground">
                      Organiza citas, visitas, eventos y recordatorios. Sincronización con Google Calendar y notificaciones automáticas.
                    </p>
                  </div>
                </div>
              </section>
            </div>

            <div className="space-y-6">
              <section id="problemas">
                <h2 className="text-2xl font-semibold mb-4">Soporte Técnico</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Solución de problemas comunes</h3>
                    <p className="text-sm text-muted-foreground">
                      Guía para resolver errores de carga, problemas de conexión y fallos en la generación de documentos.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Compatibilidad de navegadores</h3>
                    <p className="text-sm text-muted-foreground">
                      Navegadores soportados: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+. Recomendamos usar la versión más reciente.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Seguridad y privacidad</h3>
                    <p className="text-sm text-muted-foreground">
                      Tus datos están protegidos con encriptación SSL, autenticación JWT y cumplimiento de normativas de privacidad.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Límites y cuotas</h3>
                    <p className="text-sm text-muted-foreground">
                      Consulta los límites de uso por plan: documentos mensuales, consultas IA, almacenamiento y soporte prioritario.
                    </p>
                  </div>
                </div>
              </section>

              <section id="planes">
                <h2 className="text-2xl font-semibold mb-4">Facturación y Pagos</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Comparación de planes</h3>
                    <p className="text-sm text-muted-foreground">
                      Plan Mensual ($25 USD) vs Plan Anual ($240 USD/año). Incluye todas las herramientas, soporte y actualizaciones.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Métodos de pago aceptados</h3>
                    <p className="text-sm text-muted-foreground">
                      Tarjetas de crédito/débito, Mercado Pago, transferencias bancarias y PayPal. Facturación en USD o ARS.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Cancelación y reembolsos</h3>
                    <p className="text-sm text-muted-foreground">
                      Cancelación automática al finalizar el período. Reembolso completo si cancelas dentro de los primeros 7 días.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Actualización y downgrade</h3>
                    <p className="text-sm text-muted-foreground">
                      Cambia de plan en cualquier momento. Los upgrades son inmediatos, los downgrades aplican al siguiente ciclo.
                    </p>
                  </div>
                </div>
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