import { AlertTriangle, Calendar, ShieldOff } from "lucide-react";

/**
 * Disclaimer Page
 * Deslinde de responsabilidad - MUY IMPORTANTE para Catalogy
 * Aclara que NO somos una plataforma de comercio electronico
 */
export function DisclaimerPage() {
  const lastUpdated = "1 de febrero de 2026";

  return (
    <article className="prose prose-slate dark:prose-invert max-w-none">
      {/* Header */}
      <div className="not-prose mb-8 pb-8 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-4">
          <AlertTriangle className="w-6 h-6" />
          <span className="text-sm font-medium uppercase tracking-wide">
            Aviso Importante
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-[var(--color-fg)] mb-4">
          Deslinde de Responsabilidad
        </h1>
        <div className="flex items-center gap-2 text-sm text-[var(--color-fg-muted)]">
          <Calendar className="w-4 h-4" />
          <span>Ultima actualizacion: {lastUpdated}</span>
        </div>
      </div>

      {/* Important Notice Banner */}
      <div className="not-prose bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6 mb-8">
        <div className="flex gap-4">
          <ShieldOff className="w-8 h-8 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-1" />
          <div>
            <h2 className="text-lg font-bold text-amber-800 dark:text-amber-200 mb-2">
              Catalogy NO es una tienda en linea
            </h2>
            <p className="text-amber-700 dark:text-amber-300">
              Catalogy es exclusivamente una plataforma para crear y publicar
              catalogos digitales.
              <strong>
                {" "}
                NO procesamos pagos, NO intermediamos transacciones y NO
                participamos en ninguna operacion de compra-venta
              </strong>{" "}
              entre los propietarios de catalogos y sus clientes.
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <section>
        <h2>1. Naturaleza del Servicio</h2>
        <p>
          <strong>Catalogy</strong> es una herramienta de publicacion de
          catalogos digitales que permite a los usuarios:
        </p>
        <ul>
          <li>
            Crear catalogos de productos con imagenes, descripciones y precios
            referenciales
          </li>
          <li>Publicar sus catalogos en un subdominio personalizado</li>
          <li>Personalizar la apariencia de su catalogo</li>
        </ul>
        <p>
          <strong>Catalogy NO es:</strong>
        </p>
        <ul>
          <li>Una plataforma de comercio electronico (e-commerce)</li>
          <li>Un marketplace o mercado digital</li>
          <li>Un procesador de pagos</li>
          <li>Un intermediario comercial</li>
          <li>Un servicio de logistica o envios</li>
        </ul>
      </section>

      <section>
        <h2>2. Deslinde Sobre Transacciones</h2>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 my-4">
          <p className="text-red-800 dark:text-red-200 font-medium m-0">
            <strong>AVISO IMPORTANTE:</strong> Cualquier transaccion comercial,
            negociacion, pago o intercambio de bienes/servicios que se realice
            entre un propietario de catalogo y cualquier visitante o cliente
            potencial, se lleva a cabo <strong>COMPLETAMENTE FUERA</strong> de
            la plataforma Catalogy.
          </p>
        </div>
        <p>
          Por lo tanto, <strong>RacoonDevs y Catalogy:</strong>
        </p>
        <ul>
          <li>
            <strong>NO son responsables</strong> de la calidad, seguridad,
            legalidad o disponibilidad de los productos mostrados en los
            catalogos
          </li>
          <li>
            <strong>NO garantizan</strong> que los precios mostrados sean
            precisos o actuales
          </li>
          <li>
            <strong>NO intervienen</strong> en la comunicacion entre vendedores
            y compradores
          </li>
          <li>
            <strong>NO participan</strong> en la negociacion de terminos de
            venta
          </li>
          <li>
            <strong>NO procesan</strong> pagos de ningun tipo
          </li>
          <li>
            <strong>NO son responsables</strong> de incumplimientos, fraudes o
            disputas comerciales
          </li>
          <li>
            <strong>NO ofrecen</strong> proteccion al comprador ni garantias de
            devolucion
          </li>
        </ul>
      </section>

      <section>
        <h2>3. Responsabilidad del Propietario del Catalogo</h2>
        <p>
          Los usuarios que publican catalogos en Catalogy son los unicos
          responsables de:
        </p>
        <ul>
          <li>La veracidad y exactitud de la informacion de sus productos</li>
          <li>
            El cumplimiento de las leyes aplicables (Ley Federal de Proteccion
            al Consumidor, NOM aplicables, etc.)
          </li>
          <li>La gestion de sus propias transacciones comerciales</li>
          <li>El servicio al cliente y atencion de quejas</li>
          <li>El cumplimiento de obligaciones fiscales</li>
          <li>La proteccion de datos de sus clientes</li>
          <li>Cualquier garantia o politica de devolucion que ofrezcan</li>
        </ul>
      </section>

      <section>
        <h2>4. Recomendaciones para Visitantes/Compradores</h2>
        <p>
          Si visitas un catalogo publicado en Catalogy y deseas adquirir algun
          producto, te recomendamos:
        </p>
        <ul>
          <li>
            <strong>Verificar la identidad del vendedor:</strong> Asegurate de
            que el vendedor sea legitimo y tenga forma de contacto verificable
          </li>
          <li>
            <strong>Investigar antes de comprar:</strong> Busca resenas,
            referencias o reputacion del vendedor en otras plataformas
          </li>
          <li>
            <strong>Usar metodos de pago seguros:</strong> Prefiere metodos que
            ofrezcan proteccion al comprador
          </li>
          <li>
            <strong>Conservar comprobantes:</strong> Guarda evidencia de toda
            comunicacion y transaccion
          </li>
          <li>
            <strong>Acordar terminos claros:</strong> Antes de pagar, aclara
            politicas de envio, devolucion y garantia
          </li>
          <li>
            <strong>Desconfiar de ofertas sospechosas:</strong> Precios
            extremadamente bajos pueden ser indicadores de fraude
          </li>
        </ul>
      </section>

      <section>
        <h2>5. Informacion de Productos</h2>
        <p>
          Los precios, descripciones, imagenes y disponibilidad de productos
          mostrados en los catalogos son proporcionados directamente por los
          propietarios de cada catalogo. Catalogy:
        </p>
        <ul>
          <li>No verifica la exactitud de esta informacion</li>
          <li>No garantiza que los productos esten disponibles</li>
          <li>No controla ni actualiza los precios</li>
          <li>
            No valida que las imagenes correspondan a los productos reales
          </li>
        </ul>
      </section>

      <section>
        <h2>6. Enlaces y Contactos Externos</h2>
        <p>
          Los catalogos pueden contener enlaces a sitios web externos, numeros
          de telefono, cuentas de redes sociales u otros medios de contacto.
          Catalogy:
        </p>
        <ul>
          <li>No controla el contenido de sitios externos</li>
          <li>No respalda ni garantiza la seguridad de enlaces externos</li>
          <li>
            No es responsable de la comunicacion a traves de canales externos
          </li>
          <li>
            No monitorea las interacciones que ocurran fuera de la plataforma
          </li>
        </ul>
      </section>

      <section>
        <h2>7. Limitacion de Responsabilidad</h2>
        <p>
          <strong>EN LA MAXIMA MEDIDA PERMITIDA POR LA LEY APLICABLE:</strong>
        </p>
        <p>
          RacoonDevs, Catalogy, sus directores, empleados, socios y afiliados no
          seran responsables por:
        </p>
        <ul>
          <li>
            Perdidas o danos derivados de transacciones con propietarios de
            catalogos
          </li>
          <li>Fraudes cometidos por terceros usando la plataforma</li>
          <li>Productos defectuosos, falsificados o no entregados</li>
          <li>Perdidas financieras por compras realizadas</li>
          <li>Danos a la salud o seguridad por productos adquiridos</li>
          <li>Incumplimiento de garantias ofrecidas por vendedores</li>
          <li>Problemas legales derivados de transacciones</li>
        </ul>
      </section>

      <section>
        <h2>8. Reportar Abusos</h2>
        <p>
          Aunque no somos responsables de las transacciones externas, nos
          preocupamos por mantener una comunidad segura. Si detectas:
        </p>
        <ul>
          <li>Catalogos con contenido ilegal o fraudulento</li>
          <li>Productos falsificados o peligrosos</li>
          <li>Suplantacion de identidad de marcas</li>
          <li>Uso de la plataforma para estafas</li>
        </ul>
        <p>
          Por favor, reportalo a:{" "}
          <a href="mailto:abuse@racoondevs.com">abuse@racoondevs.com</a>
        </p>
        <p>
          Investigaremos los reportes y tomaremos acciones apropiadas, que
          pueden incluir la suspension o eliminacion de catalogos infractores.
        </p>
      </section>

      <section>
        <h2>9. Sin Relacion Laboral o Comercial</h2>
        <p>El uso de Catalogy no crea ninguna relacion de:</p>
        <ul>
          <li>Agencia entre Catalogy y los propietarios de catalogos</li>
          <li>Sociedad o joint venture</li>
          <li>Franquicia o representacion comercial</li>
          <li>Empleador-empleado</li>
        </ul>
        <p>
          Los propietarios de catalogos operan de manera independiente y son los
          unicos responsables de sus actividades comerciales.
        </p>
      </section>

      <section>
        <h2>10. Jurisdiccion y Autoridades Competentes</h2>
        <p>
          En caso de controversias relacionadas con transacciones comerciales,
          los afectados deberan acudir a las autoridades competentes, tales
          como:
        </p>
        <ul>
          <li>
            <strong>PROFECO</strong> (Procuraduria Federal del Consumidor) -
            Para quejas de consumidores
          </li>
          <li>
            <strong>Ministerio Publico</strong> - Para denuncias de fraude
          </li>
          <li>
            <strong>CONDUSEF</strong> - Para temas financieros
          </li>
          <li>
            <strong>Tribunales civiles</strong> - Para disputas comerciales
          </li>
        </ul>
        <p>
          Catalogy podra cooperar con las autoridades cuando sea requerido
          legalmente, pero no es parte en las controversias comerciales entre
          usuarios y terceros.
        </p>
      </section>

      <section>
        <h2>11. Contacto</h2>
        <p>Para preguntas sobre este deslinde de responsabilidad:</p>
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

      {/* Final Notice */}
      <div className="not-prose mt-12 bg-slate-100 dark:bg-slate-800 rounded-xl p-6 text-center">
        <p className="text-[var(--color-fg-muted)] text-sm mb-2">
          Al utilizar Catalogy, reconoces haber leido y comprendido este
          deslinde de responsabilidad.
        </p>
        <p className="text-[var(--color-fg)] font-medium">
          Catalogy: Tu catalogo digital. Tus transacciones, tu responsabilidad.
        </p>
      </div>
    </article>
  );
}
