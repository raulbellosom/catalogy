/**
 * StoreHeader Component
 *
 * Header de tienda con logo, nombre y descripcion.
 * Reutilizable por diferentes templates.
 */

import { Store, MapPin, Mail } from "lucide-react";

/**
 * URL base para logos de tiendas
 * @param {string} fileId
 * @returns {string|null}
 */
const getLogoUrl = (fileId) => {
  if (!fileId) return null;
  const endpoint = import.meta.env.VITE_APPWRITE_ENDPOINT;
  const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID;
  return `${endpoint}/storage/buckets/storeLogos/files/${fileId}/view?project=${projectId}`;
};

/**
 * Variantes de layout para el header
 */
const layoutVariants = {
  minimal: "text-center py-6",
  banner:
    "py-12 bg-gradient-to-r from-[var(--primary)] to-[var(--primary)]/80 text-white",
  hero: "py-20 text-center bg-[var(--muted)]",
};

/**
 * @param {Object} props
 * @param {Object} props.store - Datos de la tienda
 * @param {string} props.store.name - Nombre de la tienda
 * @param {string} [props.store.description] - Descripcion de la tienda
 * @param {string} [props.store.logoFileId] - ID del logo
 * @param {'minimal'|'banner'|'hero'} [props.variant='minimal'] - Variante de layout
 * @param {boolean} [props.showDescription=true] - Mostrar descripcion
 */
export function StoreHeader({
  store,
  variant = "minimal",
  showDescription = true,
}) {
  const logoUrl = getLogoUrl(store.logoFileId);
  const isBanner = variant === "banner";

  return (
    <header className={layoutVariants[variant]}>
      <div className="container mx-auto px-4">
        <div
          className={`
          flex items-center gap-4
          ${variant === "minimal" || variant === "hero" ? "flex-col" : "flex-row"}
        `}
        >
          {/* Logo */}
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={`${store.name} logo`}
              className={`
                rounded-xl object-cover
                ${variant === "hero" ? "w-24 h-24" : "w-16 h-16"}
                ${isBanner ? "border-2 border-white/20" : "border border-[var(--border)]"}
              `}
            />
          ) : (
            <div
              className={`
              rounded-xl flex items-center justify-center
              ${variant === "hero" ? "w-24 h-24" : "w-16 h-16"}
              ${isBanner ? "bg-white/10" : "bg-[var(--muted)]"}
            `}
            >
              <Store
                className={`
                ${variant === "hero" ? "w-10 h-10" : "w-8 h-8"}
                ${isBanner ? "text-white/70" : "text-[var(--muted-foreground)]"}
              `}
              />
            </div>
          )}

          {/* Info */}
          <div className={variant === "banner" ? "" : ""}>
            <h1
              className={`
              font-bold
              ${variant === "hero" ? "text-3xl" : "text-2xl"}
              ${isBanner ? "text-white" : "text-[var(--foreground)]"}
            `}
            >
              {store.name}
            </h1>

            {showDescription && store.description && (
              <p
                className={`
                mt-1 max-w-lg
                ${variant === "hero" ? "text-base" : "text-sm"}
                ${isBanner ? "text-white/80" : "text-[var(--muted-foreground)]"}
              `}
              >
                {store.description}
              </p>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
