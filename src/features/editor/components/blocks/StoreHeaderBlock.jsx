import { Store } from "lucide-react";
import {
  booleanField,
  getStoreLogoPreviewUrl,
  resolveRuntimeContext,
} from "./runtimeContext";

const VARIANT_MAP = {
  minimal: {
    wrapper: "py-8",
    panel: "",
    logo: "h-16 w-16",
    title: "text-3xl",
    description: "text-sm",
  },
  banner: {
    wrapper: "py-10",
    panel:
      "rounded-3xl border border-(--border) bg-gradient-to-r from-(--primary) to-(--primary)/80 text-white p-6 md:p-8",
    logo: "h-16 w-16",
    title: "text-3xl",
    description: "text-sm",
  },
  hero: {
    wrapper: "py-12",
    panel: "rounded-3xl border border-(--border) bg-(--muted) p-8 md:p-12",
    logo: "h-20 w-20",
    title: "text-4xl",
    description: "text-base",
  },
};

const WIDTH_MAP = {
  page: "max-w-7xl",
  wide: "max-w-[90rem]",
  full: "max-w-none",
};

function StoreHeaderPreview({
  puck,
  variant,
  showDescription,
  showLogo,
  align,
  width,
  titleOverride,
  descriptionOverride,
}) {
  const { store } = resolveRuntimeContext(puck);
  const logoUrl = getStoreLogoPreviewUrl(store);
  const selectedVariant = VARIANT_MAP[variant] || VARIANT_MAP.minimal;
  const widthClassName = WIDTH_MAP[width] || WIDTH_MAP.page;
  const isCentered = align !== "left";

  const title = titleOverride?.trim() || store.name;
  const description =
    descriptionOverride?.trim().length > 0
      ? descriptionOverride.trim()
      : store.description;

  return (
    <section className={`${widthClassName} mx-auto px-4 ${selectedVariant.wrapper}`}>
      <header className={selectedVariant.panel}>
        <div
          className={`flex gap-4 ${
            isCentered
              ? "flex-col items-center text-center"
              : "flex-col sm:flex-row sm:items-center text-left"
          }`}
        >
          {showLogo &&
            (logoUrl ? (
              <img
                src={logoUrl}
                alt={`${store.name} logo`}
                className={`${selectedVariant.logo} rounded-2xl object-cover border border-(--border)`}
              />
            ) : (
              <div
                className={`${selectedVariant.logo} rounded-2xl border border-(--border) bg-(--card) flex items-center justify-center`}
              >
                <Store className="h-8 w-8 text-(--muted-foreground)" />
              </div>
            ))}

          <div className="space-y-2">
            <h1
              className={`font-black leading-tight ${selectedVariant.title} ${
                variant === "banner" ? "text-white" : "text-(--foreground)"
              }`}
            >
              {title}
            </h1>
            {showDescription && description && (
              <p
                className={`${selectedVariant.description} max-w-2xl ${
                  variant === "banner" ? "text-white/90" : "text-(--muted-foreground)"
                }`}
              >
                {description}
              </p>
            )}
          </div>
        </div>
      </header>
    </section>
  );
}

export const StoreHeaderBlock = {
  label: "Header de tienda",
  fields: {
    variant: {
      type: "select",
      label: "Estilo de header",
      options: [
        { label: "Minimal", value: "minimal" },
        { label: "Banner", value: "banner" },
        { label: "Hero", value: "hero" },
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
    align: {
      type: "select",
      label: "Alineacion",
      options: [
        { label: "Centro", value: "center" },
        { label: "Izquierda", value: "left" },
      ],
    },
    showLogo: booleanField("Mostrar logo"),
    showDescription: booleanField("Mostrar descripcion"),
    titleOverride: {
      type: "text",
      label: "Titulo personalizado (opcional)",
      placeholder: "Si se deja vacio, usa el nombre de la tienda",
    },
    descriptionOverride: {
      type: "textarea",
      label: "Descripcion personalizada (opcional)",
      placeholder: "Si se deja vacio, usa la descripcion de la tienda",
    },
  },
  defaultProps: {
    variant: "minimal",
    width: "page",
    align: "center",
    showLogo: true,
    showDescription: true,
    titleOverride: "",
    descriptionOverride: "",
  },
  render: (props) => <StoreHeaderPreview {...props} />,
};
