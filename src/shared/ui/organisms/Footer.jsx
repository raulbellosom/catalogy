import { Link } from "react-router-dom";
import { Mail, MapPin, ExternalLink, Shield } from "lucide-react";
import { Logo } from "@/shared/ui/atoms/Logo";

import { useSubdomainContext } from "@/app/providers/SubdomainProvider";

/**
 * Footer component
 * Shared footer for all public pages
 */
export function Footer() {
  const { isStoreDomain } = useSubdomainContext();
  const currentYear = new Date().getFullYear();

  if (isStoreDomain) {
    return (
      <footer className="bg-[var(--color-bg)] border-t border-[var(--color-border)] py-8">
        <div className="max-w-6xl mx-auto px-4">
          <p className="text-center text-sm text-[var(--color-fg-secondary)] flex items-center justify-center gap-1">
            Powered by{" "}
            <a
              href="https://catalogy.racoondevs.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-primary)] font-semibold hover:underline inline-flex items-center gap-1"
            >
              Catalogy
              <ExternalLink className="w-3 h-3" />
            </a>
          </p>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-[var(--color-bg-tertiary)] border-t border-[var(--color-border)]">
      {/* Main footer - responsive layout */}
      <div className="max-w-6xl mx-auto px-4 py-6 md:py-12">
        <div className="grid md:grid-cols-4 gap-6 md:gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="mb-3 md:mb-4">
              <Logo />
            </div>
            <p className="text-xs md:text-sm text-[var(--color-fg-secondary)] mb-3 md:mb-4 line-clamp-2 md:line-clamp-none">
              La plataforma mas sencilla para crear y publicar catalogos de
              productos online.
            </p>
            <div className="hidden md:flex items-center gap-2 text-sm text-[var(--color-fg-muted)]">
              <MapPin className="w-4 h-4" />
              <span>Mexico</span>
            </div>
          </div>

          {/* Product */}
          <div className="hidden md:block">
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
          <div className="hidden md:block">
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

          {/* Contact - Show simplified version on mobile */}
          <div>
            <h4 className="font-semibold text-[var(--color-fg)] mb-3 md:mb-4 text-sm md:text-base">
              Contacto
            </h4>
            <ul className="space-y-1 md:space-y-2">
              <li className="flex items-center gap-2 text-xs md:text-sm text-[var(--color-fg-secondary)]">
                <Mail className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                <a
                  href="mailto:soporte@racoondevs.com"
                  className="hover:text-[var(--color-primary)] transition-colors truncate"
                >
                  soporte@racoondevs.com
                </a>
              </li>
              <li className="hidden md:flex items-center gap-2 text-xs md:text-sm text-[var(--color-fg-secondary)]">
                <ExternalLink className="w-3 h-3 md:w-4 md:h-4" />
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
        <div className="max-w-6xl mx-auto px-4 py-3 md:py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-2 md:gap-4">
            <p className="text-xs md:text-sm text-[var(--color-fg-muted)] text-center md:text-left">
              © {currentYear} Catalogy. Todos los derechos reservados.
            </p>
            <p className="text-xs md:text-sm text-[var(--color-fg-muted)] text-center md:text-right">
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

      {/* Disclaimer banner - simplified on mobile */}
      <div className="bg-[var(--color-bg-secondary)] border-t border-[var(--color-border)]">
        <div className="max-w-6xl mx-auto px-4 py-3 md:py-4">
          <p className="text-xs text-[var(--color-fg-muted)] text-center leading-relaxed">
            <Shield className="w-3 h-3 inline mr-1 flex-shrink-0" />
            <span className="md:inline block">
              Catalogy es una plataforma de catalogos en linea.
            </span>
            <span className="hidden md:inline">
              {" "}
              No procesamos pagos ni somos responsables de las transacciones
              realizadas fuera de nuestra plataforma.
            </span>
            <span className="block md:inline mt-1 md:mt-0">
              {" "}
              Consulta nuestros{" "}
              <Link
                to="/legal/terms"
                className="underline hover:text-[var(--color-primary)] transition-colors"
              >
                Terminos de uso
              </Link>
              <span className="hidden md:inline">
                {" "}
                y{" "}
                <Link
                  to="/legal/disclaimer"
                  className="underline hover:text-[var(--color-primary)]"
                >
                  Deslinde de responsabilidad
                </Link>
              </span>
              .
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
