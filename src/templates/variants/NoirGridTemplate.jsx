import { useState } from "react";
import {
  Image as ImageIcon,
  Store as StoreIcon,
  ExternalLink,
  Info,
  CreditCard,
} from "lucide-react";
import { getStoreLogoUrl } from "@/shared/services/storeService";
import {
  CatalogControls,
  ProductDetailModal,
  ProductCard,
  StoreNavbar,
  StoreFooter,
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
    sortOrder,
    setSortOrder,
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
      <StoreNavbar
        store={store}
        isPreview={isPreview}
        config={{
          bg: "bg-(--noir-bg)/80",
          text: "text-(--noir-strong)",
          border: "border-(--noir-border)",
          accent: "text-(--noir-accent)",
          glass: true,
        }}
        search={{
          query: searchQuery,
          onQueryChange: setSearchQuery,
        }}
      />

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
                      className="group flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-(--noir-accent) text-black font-bold transition-all duration-300 shadow-xl hover:shadow-2xl hover:bg-(--noir-accent-soft) hover:-translate-y-1"
                    >
                      Ir al pago
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
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
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
      <div className="bg-(--noir-surface) pt-12">
        <div className="mx-auto max-w-6xl px-4 flex flex-col items-center gap-8 text-center pb-8 text-(--noir-strong)">
          {/* CTA Reubicado antes del footer */}
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
        </div>

        <StoreFooter
          store={store}
          config={{
            bg: "bg-(--noir-surface)",
            text: "text-(--noir-muted)",
            border: "border-(--noir-border)",
            muted: "text-(--noir-muted)",
            accent: "text-(--noir-accent-soft)",
          }}
        />
      </div>

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
