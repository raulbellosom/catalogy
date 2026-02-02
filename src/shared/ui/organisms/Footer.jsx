import { Link } from "react-router-dom";
import { Store, Mail, MapPin, ExternalLink, Shield } from "lucide-react";

/**
 * Footer component
 * Shared footer for all public pages
 */
export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[var(--color-bg-tertiary)] border-t border-[var(--color-border)]">
      {/* Main footer */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Store className="w-7 h-7 text-[var(--color-primary)]" />
              <span className="text-xl font-bold text-[var(--color-fg)]">
                Catalogy
              </span>
            </div>
            <p className="text-sm text-[var(--color-fg-secondary)] mb-4">
              La plataforma mas sencilla para crear y publicar catalogos de
              productos online.
            </p>
            <div className="flex items-center gap-2 text-sm text-[var(--color-fg-muted)]">
              <MapPin className="w-4 h-4" />
              <span>Mexico</span>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold text-[var(--color-fg)] mb-4">
              Producto
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="/#como-funciona"
                  className="text-sm text-[var(--color-fg-secondary)] hover:text-[var(--color-primary)] transition-colors"
                >
                  Como funciona
                </a>
              </li>
              <li>
                <Link
                  to="/auth/register"
                  className="text-sm text-[var(--color-fg-secondary)] hover:text-[var(--color-primary)] transition-colors"
                >
                  Crear cuenta
                </Link>
              </li>
              <li>
                <Link
                  to="/auth/login"
                  className="text-sm text-[var(--color-fg-secondary)] hover:text-[var(--color-primary)] transition-colors"
                >
                  Iniciar sesion
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-[var(--color-fg)] mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/legal/privacy"
                  className="text-sm text-[var(--color-fg-secondary)] hover:text-[var(--color-primary)] transition-colors"
                >
                  Aviso de privacidad
                </Link>
              </li>
              <li>
                <Link
                  to="/legal/terms"
                  className="text-sm text-[var(--color-fg-secondary)] hover:text-[var(--color-primary)] transition-colors"
                >
                  Terminos de uso
                </Link>
              </li>
              <li>
                <Link
                  to="/legal/disclaimer"
                  className="text-sm text-[var(--color-fg-secondary)] hover:text-[var(--color-primary)] transition-colors"
                >
                  Deslinde de responsabilidad
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-[var(--color-fg)] mb-4">
              Contacto
            </h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm text-[var(--color-fg-secondary)]">
                <Mail className="w-4 h-4" />
                <a
                  href="mailto:soporte@racoondevs.com"
                  className="hover:text-[var(--color-primary)] transition-colors"
                >
                  soporte@racoondevs.com
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm text-[var(--color-fg-secondary)]">
                <ExternalLink className="w-4 h-4" />
                <a
                  href="https://racoondevs.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[var(--color-primary)] transition-colors"
                >
                  racoondevs.com
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[var(--color-border)]">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-[var(--color-fg-muted)]">
              © {currentYear} Catalogy. Todos los derechos reservados.
            </p>
            <p className="text-sm text-[var(--color-fg-muted)]">
              Desarrollado con amor por{" "}
              <a
                href="https://racoondevs.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--color-primary)] hover:underline"
              >
                RacoonDevs
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Disclaimer banner */}
      <div className="bg-[var(--color-bg-secondary)] border-t border-[var(--color-border)]">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <p className="text-xs text-[var(--color-fg-muted)] text-center">
            <Shield className="w-3 h-3 inline mr-1" />
            Catalogy es una plataforma de catalogos en linea. No procesamos
            pagos ni somos responsables de las transacciones realizadas fuera de
            nuestra plataforma. Consulta nuestros{" "}
            <Link
              to="/legal/terms"
              className="underline hover:text-[var(--color-primary)]"
            >
              Terminos de uso
            </Link>{" "}
            y{" "}
            <Link
              to="/legal/disclaimer"
              className="underline hover:text-[var(--color-primary)]"
            >
              Deslinde de responsabilidad
            </Link>
            .
          </p>
        </div>
      </div>
    </footer>
  );
}
