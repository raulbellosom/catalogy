import { FileText, Calendar } from "lucide-react";

/**
 * Terms of Service Page
 * Terminos y condiciones de uso de Catalogy
 */
export function TermsOfServicePage() {
  const lastUpdated = "1 de febrero de 2026";

  return (
    <article className="prose prose-slate dark:prose-invert max-w-none">
      {/* Header */}
      <div className="not-prose mb-8 pb-8 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2 text-[var(--color-primary)] mb-4">
          <FileText className="w-6 h-6" />
          <span className="text-sm font-medium uppercase tracking-wide">
            Documento Legal
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-[var(--color-fg)] mb-4">
          Terminos y Condiciones de Uso
        </h1>
        <div className="flex items-center gap-2 text-sm text-[var(--color-fg-muted)]">
          <Calendar className="w-4 h-4" />
          <span>Ultima actualizacion: {lastUpdated}</span>
        </div>
      </div>

      {/* Content */}
      <section>
        <h2>1. Aceptacion de los Terminos</h2>
        <p>
          Al acceder o utilizar <strong>Catalogy</strong> (la "Plataforma"),
          operada por <strong>RacoonDevs</strong>, aceptas estar sujeto a estos
          Terminos y Condiciones de Uso. Si no estas de acuerdo con alguna parte
          de estos terminos, no podras acceder al servicio.
        </p>
        <p>
          El uso continuado de la Plataforma despues de la publicacion de
          cambios a estos terminos constituye la aceptacion de dichos cambios.
        </p>
      </section>

      <section>
        <h2>2. Descripcion del Servicio</h2>
        <p>
          Catalogy es una plataforma que permite a los usuarios crear,
          personalizar y publicar catalogos de productos en linea. Nuestros
          servicios incluyen:
        </p>
        <ul>
          <li>Creacion de catalogos digitales de productos</li>
          <li>
            Subdominio personalizado para cada catalogo (ejemplo:
            tutienda.catalog.racoondevs.com)
          </li>
          <li>Editor visual para personalizar la apariencia del catalogo</li>
          <li>Almacenamiento de imagenes de productos</li>
          <li>Panel de administracion para gestionar productos</li>
        </ul>
        <p>
          <strong>Importante:</strong> Catalogy NO es una plataforma de comercio
          electronico. No procesamos pagos, no intermediamos transacciones y no
          somos parte de ninguna operacion de compra-venta que pueda surgir
          entre los usuarios y sus clientes.
        </p>
      </section>

      <section>
        <h2>3. Registro y Cuenta de Usuario</h2>

        <h3>3.1 Requisitos</h3>
        <ul>
          <li>Debes ser mayor de 18 anos para crear una cuenta</li>
          <li>Debes proporcionar informacion veraz y actualizada</li>
          <li>
            Eres responsable de mantener la confidencialidad de tu cuenta y
            contrasena
          </li>
        </ul>

        <h3>3.2 Responsabilidades del Usuario</h3>
        <ul>
          <li>
            Notificarnos inmediatamente sobre cualquier uso no autorizado de tu
            cuenta
          </li>
          <li>No compartir tu cuenta con terceros</li>
          <li>Ser responsable de toda actividad que ocurra bajo tu cuenta</li>
        </ul>
      </section>

      <section>
        <h2>4. Uso Aceptable</h2>
        <p>Al utilizar Catalogy, te comprometes a NO:</p>
        <ul>
          <li>Publicar contenido ilegal, fraudulento o enganoso</li>
          <li>
            Publicar productos falsificados o que infrinjan propiedad
            intelectual
          </li>
          <li>
            Publicar contenido que sea obsceno, difamatorio, amenazante o
            discriminatorio
          </li>
          <li>Publicar productos o servicios prohibidos por la ley mexicana</li>
          <li>Utilizar la plataforma para actividades de phishing o fraude</li>
          <li>Intentar vulnerar la seguridad de la plataforma</li>
          <li>Usar la plataforma para distribuir malware o spam</li>
          <li>Crear multiples cuentas para evadir restricciones</li>
          <li>Suplantar la identidad de otra persona o entidad</li>
        </ul>
      </section>

      <section>
        <h2>5. Contenido del Usuario</h2>

        <h3>5.1 Propiedad</h3>
        <p>
          Conservas todos los derechos sobre el contenido que publicas en tu
          catalogo (imagenes, textos, descripciones). Al publicar contenido, nos
          otorgas una licencia mundial, no exclusiva, libre de regalias para
          usar, mostrar y distribuir dicho contenido unicamente con el proposito
          de operar el servicio.
        </p>

        <h3>5.2 Responsabilidad</h3>
        <p>
          Eres el unico responsable del contenido que publicas. Garantizas que:
        </p>
        <ul>
          <li>Tienes todos los derechos necesarios sobre el contenido</li>
          <li>El contenido no infringe derechos de terceros</li>
          <li>La informacion de productos es veraz y no enganosa</li>
        </ul>
      </section>

      <section>
        <h2>6. Propiedad Intelectual</h2>
        <p>
          La plataforma Catalogy, incluyendo su codigo, diseno, logos, marcas y
          contenido (excepto el contenido de usuarios), son propiedad de
          RacoonDevs y estan protegidos por las leyes de propiedad intelectual
          aplicables.
        </p>
        <p>
          No esta permitido copiar, modificar, distribuir, vender o arrendar
          ninguna parte de nuestros servicios o software sin autorizacion
          expresa.
        </p>
      </section>

      <section>
        <h2>7. Disponibilidad del Servicio</h2>
        <p>
          Nos esforzamos por mantener el servicio disponible 24/7, pero no
          garantizamos disponibilidad ininterrumpida. El servicio puede estar
          temporalmente no disponible por:
        </p>
        <ul>
          <li>Mantenimiento programado o de emergencia</li>
          <li>Actualizaciones del sistema</li>
          <li>
            Causas fuera de nuestro control (fallas de red, desastres naturales,
            etc.)
          </li>
        </ul>
      </section>

      <section>
        <h2>8. Suspension y Terminacion</h2>
        <p>Nos reservamos el derecho de suspender o terminar tu cuenta si:</p>
        <ul>
          <li>Violas estos terminos de uso</li>
          <li>Utilizas la plataforma para actividades ilegales</li>
          <li>Recibes multiples reportes verificados de usuarios</li>
          <li>No utilizas la cuenta por un periodo prolongado (inactividad)</li>
        </ul>
        <p>
          En caso de terminacion, perdera acceso a tu catalogo y datos. Te
          notificaremos con anticipacion razonable cuando sea posible, excepto
          en casos de violaciones graves.
        </p>
      </section>

      <section>
        <h2>9. Limitacion de Responsabilidad</h2>
        <p>
          <strong>EN LA MAXIMA MEDIDA PERMITIDA POR LA LEY:</strong>
        </p>
        <ul>
          <li>
            Catalogy se proporciona "TAL CUAL" y "SEGUN DISPONIBILIDAD", sin
            garantias de ningun tipo, expresas o implicitas
          </li>
          <li>
            No seremos responsables por danos indirectos, incidentales,
            especiales, consecuentes o punitivos
          </li>
          <li>
            Nuestra responsabilidad total no excedera el monto que hayas pagado
            por el servicio (en el caso de servicios de pago)
          </li>
        </ul>
      </section>

      <section>
        <h2>10. Indemnizacion</h2>
        <p>
          Aceptas indemnizar y mantener indemne a RacoonDevs, sus directores,
          empleados y afiliados de cualquier reclamacion, dano, perdida,
          responsabilidad y gasto (incluyendo honorarios legales) que surjan de:
        </p>
        <ul>
          <li>Tu uso de la Plataforma</li>
          <li>Tu violacion de estos terminos</li>
          <li>Tu violacion de derechos de terceros</li>
          <li>El contenido que publiques</li>
        </ul>
      </section>

      <section>
        <h2>11. Modificaciones</h2>
        <p>
          Podemos modificar estos terminos en cualquier momento. Los cambios
          entraran en vigor al ser publicados en esta pagina. Para cambios
          sustanciales, te notificaremos por correo electronico con al menos 15
          dias de anticipacion.
        </p>
      </section>

      <section>
        <h2>12. Ley Aplicable y Jurisdiccion</h2>
        <p>
          Estos terminos se regiran e interpretaran de acuerdo con las leyes de
          los Estados Unidos Mexicanos. Cualquier disputa sera sometida a la
          jurisdiccion exclusiva de los tribunales competentes de la Ciudad de
          Mexico.
        </p>
      </section>

      <section>
        <h2>13. Disposiciones Generales</h2>
        <ul>
          <li>
            <strong>Divisibilidad:</strong> Si alguna disposicion de estos
            terminos es invalida, las demas disposiciones permaneceran en vigor
          </li>
          <li>
            <strong>Renuncia:</strong> La falta de ejercicio de cualquier
            derecho no constituye renuncia al mismo
          </li>
          <li>
            <strong>Acuerdo completo:</strong> Estos terminos constituyen el
            acuerdo completo entre las partes
          </li>
        </ul>
      </section>

      <section>
        <h2>14. Contacto</h2>
        <p>Para preguntas sobre estos terminos, contactanos:</p>
        <ul>
          <li>
            <strong>Correo:</strong>{" "}
            <a href="mailto:legal@racoondevs.com">legal@racoondevs.com</a>
          </li>
          <li>
            <strong>Sitio web:</strong>{" "}
            <a
              href="https://racoondevs.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              racoondevs.com
            </a>
          </li>
        </ul>
      </section>
    </article>
  );
}
