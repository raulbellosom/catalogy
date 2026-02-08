import { appConfig } from "@/shared/lib/env";
import { Logo } from "@/shared/ui/atoms/Logo";
import { booleanField, resolveRuntimeContext } from "./runtimeContext";

const TONE_MAP = {
  light: {
    panel: "bg-(--card) border-(--border) text-(--foreground)",
    muted: "text-(--muted-foreground)",
    accent: "text-(--primary)",
  },
  dark: {
    panel: "bg-slate-950 border-slate-800 text-slate-100",
    muted: "text-slate-400",
    accent: "text-slate-200",
  },
  contrast: {
    panel: "bg-(--primary) border-(--primary) text-white",
    muted: "text-white/80",
    accent: "text-white",
  },
};

const WIDTH_MAP = {
  page: "max-w-7xl",
  wide: "max-w-[90rem]",
  full: "max-w-none",
};

function StoreFooterPreview({
  puck,
  tone,
  compact,
  showDescription,
  showLegalLinks,
  showBranding,
  width,
}) {
  const { store } = resolveRuntimeContext(puck);
  const styles = TONE_MAP[tone] || TONE_MAP.dark;
  const widthClassName = WIDTH_MAP[width] || WIDTH_MAP.page;
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`border-t ${styles.panel} ${compact ? "py-8" : "py-12"}`}>
      <div className={`${widthClassName} mx-auto px-4 flex flex-col items-center text-center gap-6`}>
        <div className="space-y-2">
          <h4 className="text-xl font-bold tracking-tight">{store?.name}</h4>
          {showDescription && store?.description && (
            <p className={`text-sm max-w-2xl ${styles.muted}`}>{store.description}</p>
          )}
        </div>

        {showLegalLinks && (
          <nav className={`flex flex-wrap justify-center gap-x-6 gap-y-2 text-[11px] uppercase tracking-[0.16em] ${styles.muted}`}>
            <a
              href={`${appConfig.baseUrl}/legal/privacy`}
              target="_blank"
              rel="noreferrer"
              className="hover:opacity-80"
            >
              Aviso de privacidad
            </a>
            <a
              href={`${appConfig.baseUrl}/legal/terms`}
              target="_blank"
              rel="noreferrer"
              className="hover:opacity-80"
            >
              Terminos y condiciones
            </a>
            <a
              href={`${appConfig.baseUrl}/legal/disclaimer`}
              target="_blank"
              rel="noreferrer"
              className="hover:opacity-80"
            >
              Deslinde
            </a>
          </nav>
        )}

        {showBranding && (
          <div className="space-y-2">
            <a
              href={appConfig.baseUrl}
              target="_blank"
              rel="noreferrer"
              className={`inline-flex items-center gap-2 text-sm ${styles.accent}`}
            >
              <span className={styles.muted}>Powered by</span>
              <Logo
                variant="icon"
                asLink={false}
                forcePlatform={true}
                className="h-4 w-auto"
              />
              <span className="font-bold tracking-tight">Catalogy</span>
            </a>
            <p className={`text-[10px] uppercase tracking-[0.2em] ${styles.muted}`}>
              Copyright {currentYear} Catalogy
            </p>
          </div>
        )}
      </div>
    </footer>
  );
}

export const StoreFooterBlock = {
  label: "Footer de tienda",
  fields: {
    tone: {
      type: "select",
      label: "Tema de footer",
      options: [
        { label: "Oscuro", value: "dark" },
        { label: "Claro", value: "light" },
        { label: "Contraste", value: "contrast" },
      ],
    },
    width: {
      type: "select",
      label: "Ancho de seccion",
      options: [
        { label: "Pagina", value: "page" },
        { label: "Amplio", value: "wide" },
        { label: "Completo", value: "full" },
      ],
    },
    compact: booleanField("Usar version compacta"),
    showDescription: booleanField("Mostrar descripcion de tienda"),
    showLegalLinks: booleanField("Mostrar links legales"),
    showBranding: booleanField("Mostrar branding Catalogy"),
  },
  defaultProps: {
    tone: "dark",
    width: "page",
    compact: false,
    showDescription: true,
    showLegalLinks: true,
    showBranding: true,
  },
  render: (props) => <StoreFooterPreview {...props} />,
};
