import { useState } from "react";
import {
  Heart,
  Image as ImageIcon,
  Store as StoreIcon,
  Share2,
  ExternalLink,
  Tag,
  Package,
  Info,
  CreditCard,
} from "lucide-react";
import { getStoreLogoUrl } from "@/shared/services/storeService";
import { getProductImageUrl } from "@/shared/services/productService";
import {
  CatalogControls,
  ProductImageCarousel,
  ProductDetailModal,
  ProductCard, // Assuming ProductCard is also imported or defined elsewhere
} from "../components";
import { useCatalogFilters, useProductShare } from "../components/catalogHooks";
import { Logo } from "@/shared/ui/atoms/Logo";
import { appConfig } from "@/shared/lib/env";
import { ImageViewerModal } from "@/shared/ui/molecules/ImageViewerModal";

const resolveSettings = (settings) => {
  if (!settings) return {};
  if (typeof settings === "string") {
    try {
      return JSON.parse(settings);
    } catch (error) {
      console.warn("Error parsing store.settings:", error);
      return {};
    }
  }
  return settings;
};

const resolveFontFamily = (settings) => {
  const font = settings?.font;
  const id = typeof font === "object" ? font?.id : font;
  const map = {
    inter: "'Inter', sans-serif",
    merriweather: "'Merriweather', serif",
    jetbrains: "'JetBrains Mono', monospace",
    roboto: "'Roboto', sans-serif",
    playfair: "'Playfair Display', serif",
    montserrat: "'Montserrat', sans-serif",
  };
  return map[id] || "'Inter', sans-serif";
};

const formatPrice = (price, currency = "MXN") => {
  if (typeof price !== "number") return "";
  return price.toLocaleString("es-MX", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export function NoirGridTemplate({ store, products, isPreview = false }) {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const settings = resolveSettings(store?.settings);
  const fontFamily = resolveFontFamily(settings);
  const primary = settings?.colors?.primary || "var(--color-primary)";
  const secondary = settings?.colors?.secondary || "var(--color-primary-hover)";
  const logoUrl = store?.logoFileId ? getStoreLogoUrl(store.logoFileId) : null;
  const {
    categories,
    searchQuery,
    setSearchQuery,
    activeCategoryIds,
    toggleCategory,
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,
    priceBounds,
    filteredProducts,
  } = useCatalogFilters({ store, products });
  const { handleShare, sharedProductId } = useProductShare();

  // ImageViewerModal State
  const [viewer, setViewer] = useState({
    isOpen: false,
    images: [],
    index: 0,
  });

  const openViewer = (index, images) => {
    setViewer({ isOpen: true, images, index });
  };

  return (
    <div
      className="min-h-screen flex flex-col bg-(--noir-bg) text-(--noir-strong)"
      style={{
        fontFamily,
        "--noir-bg": "#0d0f10",
        "--noir-surface": "#17191b",
        "--noir-surface-2": "#1f2326",
        "--noir-border": "rgba(255,255,255,0.08)",
        "--noir-muted": "rgba(255,255,255,0.6)",
        "--noir-strong": "#f4f4f5",
        "--noir-accent": primary,
        "--noir-accent-soft": secondary,
      }}
    >
      {/* Navbar Minimalista Integrado */}
      <nav
        className={`fixed ${isPreview ? "top-10" : "top-0"} left-0 right-0 z-50 bg-(--noir-bg)/80 backdrop-blur-md border-b border-(--noir-border)`}
      >
        <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={store?.name}
                className="h-8 w-8 rounded-lg object-cover border border-(--noir-border)"
              />
            ) : (
              <Logo className="h-6 w-auto" />
            )}
            <span className="font-bold tracking-tight">
              {store?.name || "Catalogy"}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Espacio para acciones futuras del template */}
          </div>
        </div>
      </nav>

      <div
        className={`mx-auto max-w-6xl px-4 py-8 ${isPreview ? "pt-32" : "pt-24"} flex-1 w-full`}
      >
        <main className="flex flex-col gap-8">
          {/* Header de la tienda fusionado */}
          <header className="flex flex-col gap-8 rounded-3xl bg-(--noir-surface) border border-(--noir-border) p-8 md:p-10">
            {/* Sección Info Tienda */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-(--noir-border)">
              <div className="flex items-center gap-5">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={`${store?.name || "Tienda"} logo`}
                    className="h-20 w-20 rounded-2xl object-cover border border-(--noir-border) shadow-lg"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-2xl bg-(--noir-surface-2) border border-(--noir-border) flex items-center justify-center">
                    <StoreIcon className="h-10 w-10 text-(--noir-muted)" />
                  </div>
                )}
                <div className="space-y-1">
                  <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-(--noir-strong)">
                    {store?.name || "Tu tienda"}
                  </h1>
                  {store?.description && (
                    <p className="text-sm text-(--noir-muted) max-w-xl leading-relaxed">
                      {store.description}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Sección de Compra Integrada */}
            {(store?.purchaseInstructions?.trim() ||
              store?.paymentLink?.trim()) && (
              <div className="flex flex-col lg:flex-row gap-8 justify-between">
                {store?.purchaseInstructions?.trim() && (
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-(--noir-surface-2) text-(--noir-accent)">
                        <Info className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm font-bold uppercase tracking-widest text-(--noir-muted)">
                        Instrucciones
                      </h3>
                    </div>
                    <p className="text-sm leading-relaxed text-(--noir-strong)/80">
                      {store.purchaseInstructions}
                    </p>
                  </div>
                )}

                {store?.paymentLink?.trim() && (
                  <div className="flex flex-col gap-3 min-w-[280px]">
                    <div className="flex items-center gap-2 lg:justify-end">
                      <div className="p-1.5 rounded-lg bg-(--noir-surface-2) text-(--noir-accent)">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm font-bold uppercase tracking-widest text-(--noir-muted)">
                        Pago Directo
                      </h3>
                    </div>
                    <a
                      href={store.paymentLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-(--noir-accent) text-black font-bold transition-all duration-300 shadow-xl hover:shadow-2xl hover:bg-white hover:-translate-y-1"
                    >
                      Pagar ahora
                      <ExternalLink className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </a>
                  </div>
                )}
              </div>
            )}
          </header>

          <CatalogControls
            tone="noir"
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            minPrice={minPrice}
            maxPrice={maxPrice}
            onMinPriceChange={setMinPrice}
            onMaxPriceChange={setMaxPrice}
            priceBounds={priceBounds}
            categories={categories}
            activeCategoryIds={activeCategoryIds}
            onToggleCategory={toggleCategory}
          />

          <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filteredProducts?.map((product) => (
              <ProductCard
                key={product.id || product.$id}
                product={product}
                tone="noir"
                size="full"
                onImageClick={(index, images) => openViewer(index, images)}
                onClick={() => setSelectedProduct(product)}
              />
            ))}
          </section>

          {(!filteredProducts || filteredProducts.length === 0) && (
            <div className="rounded-3xl bg-(--noir-surface) border border-(--noir-border) p-16 text-center">
              <ImageIcon className="h-12 w-12 text-(--noir-muted) mx-auto mb-4 opacity-20" />
              <p className="text-(--noir-muted) font-medium">
                No encontramos productos con esos filtros.
              </p>
            </div>
          )}
        </main>
      </div>

      {/* Footer Personalizado */}
      <footer className="mt-12 bg-(--noir-surface) border-t border-(--noir-border) py-12">
        <div className="mx-auto max-w-6xl px-4 flex flex-col items-center gap-8 text-center">
          <div className="space-y-2">
            <h4 className="text-xl font-bold">{store?.name}</h4>
            <p className="text-sm text-(--noir-muted) max-w-md">
              Gracias por visitar nuestro catálogo oficial.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-(--noir-surface-2) border border-(--noir-border) max-w-lg w-full">
            <h5 className="font-semibold mb-2">
              ¿Quieres crear tu propio catálogo?
            </h5>
            <p className="text-sm text-(--noir-muted) mb-6">
              Únete a cientos de emprendedores que ya usan Catalogy para vender
              más.
            </p>
            <a
              href={`${appConfig.baseUrl}/auth/register`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black font-bold hover:bg-gray-200 transition-colors"
            >
              Comenzar Gratis
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>

          <div className="flex flex-col items-center gap-6 text-(--noir-muted)">
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-[10px] uppercase tracking-[0.2em] opacity-60">
              <a
                href={`${appConfig.baseUrl}/legal/privacy`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-(--noir-accent-soft) transition-colors"
              >
                Aviso de Privacidad
              </a>
              <a
                href={`${appConfig.baseUrl}/legal/terms`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-(--noir-accent-soft) transition-colors"
              >
                Términos y Condiciones
              </a>
              <a
                href={`${appConfig.baseUrl}/legal/disclaimer`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-(--noir-accent-soft) transition-colors"
              >
                Deslinde Legal
              </a>
            </div>

            <div className="flex items-center justify-center gap-2 text-sm">
              <span className="opacity-60 font-medium">Powered by</span>
              <a
                href={appConfig.baseUrl}
                className="group/brand transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="flex items-center gap-2">
                  <Logo
                    variant="icon"
                    asLink={false}
                    forcePlatform={true}
                    className="grayscale brightness-200 group-hover/brand:grayscale-0 group-hover/brand:brightness-100 transition-all duration-300"
                  />
                  <span className="font-bold tracking-tight text-white/90 group-hover/brand:text-(--noir-accent-soft) transition-colors duration-300">
                    Catalogy
                  </span>
                </div>
              </a>
            </div>
            <p className="text-[10px] uppercase tracking-[0.2em] opacity-40">
              © {new Date().getFullYear()} Catalogy. Todos los derechos
              reservados.
            </p>
          </div>
        </div>
      </footer>

      <ImageViewerModal
        isOpen={viewer.isOpen}
        onClose={() => setViewer((v) => ({ ...v, isOpen: false }))}
        images={viewer.images}
        initialIndex={viewer.index}
      />
      <ProductDetailModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        store={store}
        tone="noir"
      />
    </div>
  );
}
