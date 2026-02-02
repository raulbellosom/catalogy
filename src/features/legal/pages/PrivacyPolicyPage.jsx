import { Shield, Calendar } from "lucide-react";

/**
 * Privacy Policy Page
 * Aviso de privacidad conforme a la LFPDPPP de Mexico
 */
export function PrivacyPolicyPage() {
  const lastUpdated = "1 de febrero de 2026";

  return (
    <article className="prose prose-slate dark:prose-invert max-w-none">
      {/* Header */}
      <div className="not-prose mb-8 pb-8 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2 text-[var(--color-primary)] mb-4">
          <Shield className="w-6 h-6" />
          <span className="text-sm font-medium uppercase tracking-wide">
            Documento Legal
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-[var(--color-fg)] mb-4">
          Aviso de Privacidad
        </h1>
        <div className="flex items-center gap-2 text-sm text-[var(--color-fg-muted)]">
          <Calendar className="w-4 h-4" />
          <span>Ultima actualizacion: {lastUpdated}</span>
        </div>
      </div>

      {/* Content */}
      <section>
        <h2>1. Identidad del Responsable</h2>
        <p>
          <strong>Catalogy</strong>, operado por <strong>RacoonDevs</strong> (en
          adelante "nosotros", "nuestro" o "la Plataforma"), con domicilio en
          Mexico, es responsable del tratamiento de los datos personales que nos
          proporcione, los cuales seran protegidos conforme a lo dispuesto por
          la Ley Federal de Proteccion de Datos Personales en Posesion de los
          Particulares (LFPDPPP) y demas normatividad aplicable.
        </p>
      </section>

      <section>
        <h2>2. Datos Personales que Recabamos</h2>
        <p>
          Para cumplir con las finalidades descritas en este aviso, recabamos
          las siguientes categorias de datos personales:
        </p>

        <h3>2.1 Datos de Identificacion</h3>
        <ul>
          <li>Nombre completo</li>
          <li>Correo electronico</li>
          <li>Nombre de usuario o alias</li>
        </ul>

        <h3>2.2 Datos de la Tienda/Catalogo</h3>
        <ul>
          <li>Nombre del negocio o tienda</li>
          <li>Descripcion del negocio</li>
          <li>Imagenes de productos</li>
          <li>Precios y descripciones de productos</li>
          <li>Logo e imagenes de la tienda</li>
        </ul>

        <h3>2.3 Datos Tecnicos</h3>
        <ul>
          <li>Direccion IP</li>
          <li>Tipo de navegador y dispositivo</li>
          <li>Datos de uso y navegacion en la plataforma</li>
          <li>Cookies y tecnologias similares</li>
        </ul>
      </section>

      <section>
        <h2>3. Finalidades del Tratamiento</h2>
        <p>
          Los datos personales que recabamos seran utilizados para las
          siguientes finalidades:
        </p>

        <h3>3.1 Finalidades Primarias (necesarias)</h3>
        <ul>
          <li>Crear y administrar tu cuenta de usuario</li>
          <li>
            Proporcionar los servicios de creacion y publicacion de catalogos
          </li>
          <li>Generar tu subdominio personalizado</li>
          <li>Almacenar y mostrar tus productos en tu catalogo publico</li>
          <li>Enviar notificaciones relacionadas con el servicio</li>
          <li>Atender solicitudes de soporte y consultas</li>
          <li>Cumplir con obligaciones legales</li>
        </ul>

        <h3>3.2 Finalidades Secundarias (opcionales)</h3>
        <ul>
          <li>Enviar comunicaciones promocionales y de marketing</li>
          <li>Realizar encuestas de satisfaccion</li>
          <li>Mejorar nuestros servicios mediante analisis de uso</li>
        </ul>

        <p>
          Si no deseas que tus datos sean tratados para las finalidades
          secundarias, puedes manifestarlo enviando un correo a{" "}
          <a href="mailto:privacidad@racoondevs.com">
            privacidad@racoondevs.com
          </a>
          .
        </p>
      </section>

      <section>
        <h2>4. Transferencia de Datos</h2>
        <p>
          Tus datos personales podran ser transferidos y tratados dentro y fuera
          de Mexico por las siguientes entidades:
        </p>
        <ul>
          <li>
            <strong>Proveedores de infraestructura en la nube:</strong> Para el
            almacenamiento seguro de datos (Appwrite, servidores de hosting)
          </li>
          <li>
            <strong>Proveedores de servicios de correo electronico:</strong>{" "}
            Para envio de notificaciones
          </li>
          <li>
            <strong>Autoridades competentes:</strong> Cuando sea requerido por
            ley
          </li>
        </ul>
        <p>
          No vendemos, alquilamos ni compartimos tus datos personales con
          terceros para fines comerciales.
        </p>
      </section>

      <section>
        <h2>5. Derechos ARCO</h2>
        <p>
          Tienes derecho a Acceder, Rectificar, Cancelar u Oponerte (derechos
          ARCO) al tratamiento de tus datos personales. Para ejercer estos
          derechos, puedes:
        </p>
        <ul>
          <li>
            Enviar un correo a{" "}
            <a href="mailto:privacidad@racoondevs.com">
              privacidad@racoondevs.com
            </a>
          </li>
          <li>
            Incluir en tu solicitud: nombre completo, correo asociado a tu
            cuenta, descripcion clara de lo que solicitas, y documento de
            identidad
          </li>
        </ul>
        <p>Responderemos tu solicitud en un plazo maximo de 20 dias habiles.</p>
      </section>

      <section>
        <h2>6. Uso de Cookies</h2>
        <p>
          Utilizamos cookies y tecnologias similares para mejorar tu experiencia
          en la plataforma. Las cookies nos permiten:
        </p>
        <ul>
          <li>Recordar tus preferencias de sesion</li>
          <li>Analizar el uso de la plataforma</li>
          <li>Mejorar la seguridad</li>
        </ul>
        <p>
          Puedes configurar tu navegador para rechazar cookies, aunque esto
          podria afectar algunas funcionalidades.
        </p>
      </section>

      <section>
        <h2>7. Seguridad de los Datos</h2>
        <p>
          Implementamos medidas de seguridad administrativas, tecnicas y fisicas
          para proteger tus datos personales contra dano, perdida, alteracion,
          destruccion o uso no autorizado, incluyendo:
        </p>
        <ul>
          <li>Encriptacion de datos en transito (HTTPS/TLS)</li>
          <li>Almacenamiento seguro con proveedores certificados</li>
          <li>Acceso restringido a personal autorizado</li>
          <li>Monitoreo continuo de seguridad</li>
        </ul>
      </section>

      <section>
        <h2>8. Menores de Edad</h2>
        <p>
          Catalogy no esta dirigido a menores de 18 anos. No recabamos
          intencionalmente datos de menores. Si eres padre o tutor y crees que
          tu hijo nos ha proporcionado datos, contactanos para eliminarlos.
        </p>
      </section>

      <section>
        <h2>9. Cambios al Aviso de Privacidad</h2>
        <p>
          Nos reservamos el derecho de modificar este aviso de privacidad.
          Cualquier cambio sera publicado en esta pagina y, si son cambios
          sustanciales, te notificaremos por correo electronico.
        </p>
      </section>

      <section>
        <h2>10. Contacto</h2>
        <p>
          Si tienes dudas sobre este aviso de privacidad o el tratamiento de tus
          datos, contactanos:
        </p>
        <ul>
          <li>
            <strong>Correo:</strong>{" "}
            <a href="mailto:privacidad@racoondevs.com">
              privacidad@racoondevs.com
            </a>
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
