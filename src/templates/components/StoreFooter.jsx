/**
 * StoreFooter Component
 *
 * Footer for stores with permissible customization.
 */
import { appConfig } from "@/shared/lib/env";
import { Logo } from "@/shared/ui/atoms/Logo";

export function StoreFooter({ store, config = {} }) {
  const currentYear = new Date().getFullYear();

  const {
    bg = "bg-white",
    text = "text-slate-600",
    border = "border-slate-200",
    muted = "text-slate-400",
    accent = "text-blue-600",
  } = config;

  return (
    <footer
      className={`${bg} ${text} border-t ${border} py-12 mt-auto transition-colors duration-300`}
    >
      <div className="mx-auto max-w-7xl px-4 flex flex-col items-center gap-8 text-center">
        {/* Store Info */}
        <div className="space-y-2">
          <h4 className="text-xl font-bold tracking-tight">{store?.name}</h4>
          {store?.description && (
            <p className={`text-sm ${muted} max-w-md mx-auto`}>
              {store.description}
            </p>
          )}
        </div>

        {/* Legal & Links */}
        <div
          className={`flex flex-wrap justify-center gap-x-8 gap-y-3 text-[10px] uppercase tracking-[0.2em] opacity-80 ${muted}`}
        >
          <a
            href={`${appConfig.baseUrl}/legal/privacy`}
            target="_blank"
            rel="noopener noreferrer"
            className={`hover:${accent} transition-colors`}
          >
            Aviso de Privacidad
          </a>
          <a
            href={`${appConfig.baseUrl}/legal/terms`}
            target="_blank"
            rel="noopener noreferrer"
            className={`hover:${accent} transition-colors`}
          >
            Términos y Condiciones
          </a>
          <a
            href={`${appConfig.baseUrl}/legal/disclaimer`}
            target="_blank"
            rel="noopener noreferrer"
            className={`hover:${accent} transition-colors`}
          >
            Deslinde de responsabilidad
          </a>
        </div>

        {/* Branding */}
        <div className="flex flex-col items-center gap-2">
          <div
            className={`flex items-center justify-center gap-2 text-sm ${muted}`}
          >
            <span className="opacity-60 font-medium">Powered by</span>
            <a
              href={appConfig.baseUrl}
              className="group flex items-center gap-1.5 hover:opacity-100 transition-opacity"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Logo
                variant="icon"
                asLink={false}
                forcePlatform={true}
                className={`h-4 w-auto grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all`}
              />
              <span className="font-bold tracking-tight opacity-80 group-hover:opacity-100">
                Catalogy
              </span>
            </a>
          </div>
          <p
            className={`text-[10px] uppercase tracking-[0.2em] ${muted} opacity-40`}
          >
            © {currentYear} Catalogy. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
