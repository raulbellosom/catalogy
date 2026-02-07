import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Store as StoreIcon, ExternalLink, X, Search } from "lucide-react";
import { getStoreLogoUrl } from "@/shared/services/storeService";
import {
  CatalogControls,
  ProductDetailModal,
  ProductCard,
  StoreNavbar,
  StoreFooter,
  StorePurchaseInfo,
} from "../components";
import { useCatalogFilters } from "../components/catalogHooks";
import { resolveThemeSettings } from "@/templates/registry";
import { resolveCatalogSettings } from "@/shared/utils/storeSettings";
import { ImageViewerModal } from "@/shared/ui/molecules/ImageViewerModal";

// Internal helpers removed in favor of registry.resolveThemeSettings
const resolveFontFamily = (fontId) => {
  const map = {
    inter: "'Inter', sans-serif",
    merriweather: "'Merriweather', serif",
    jetbrains: "'JetBrains Mono', monospace",
    roboto: "'Roboto', sans-serif",
    playfair: "'Playfair Display', serif",
    montserrat: "'Montserrat', sans-serif",
  };
  return map[fontId] || "'Inter', sans-serif";
};

export function NoirGridTemplate({ store, products, isPreview = false }) {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // Settings Resolution
  const theme = resolveThemeSettings(store);
  const catalog = resolveCatalogSettings(store);
  const featuredProductIds = catalog.featuredProductIds || [];
  const fontFamily = resolveFontFamily(theme.font);
  const primary = theme.colors.primary;
  const secondary = theme.colors.secondary;
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
    resetFilters,
  } = useCatalogFilters({ store, products });

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
      className="min-h-screen flex flex-col bg-(--noir-bg) text-(--noir-strong) pt-[calc(var(--store-navbar-height)+var(--store-navbar-offset)+env(safe-area-inset-top))]"
      style={{
        fontFamily,
        colorScheme: "dark",
        "--noir-bg": secondary || "#0a0a0a",
        "--noir-surface": "rgba(255,255,255,0.03)",
        "--noir-surface-2": "rgba(255,255,255,0.08)",
        "--noir-border": "rgba(255,255,255,0.1)",
        "--noir-muted": "rgba(255,255,255,0.5)",
        "--noir-strong": "#fafafa",
        "--noir-accent": primary,
        "--noir-accent-soft": `${primary}40`,
        "--store-navbar-height": "4rem",
        "--store-navbar-offset": isPreview ? "2.5rem" : "0rem",
      }}
    >
      <style>{`
        .noir-noise {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 0;
          opacity: 0.03;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
        }
        .noir-spotlight {
          background: radial-gradient(circle at 50% 0%, var(--noir-accent-soft), transparent 60%);
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 600px;
          opacity: 0.3;
          pointer-events: none;
          z-index: 0;
        }
      `}</style>

      {/* Background Texture & Effects */}
      <div className="noir-noise" />
      <div className="noir-spotlight" />

      <StoreNavbar
        store={store}
        isPreview={isPreview}
        config={{
          bg: "bg-(--noir-bg)/90",
          text: "text-(--noir-strong)",
          border: "border-(--noir-border)",
          accent: "text-(--noir-accent)",
          glass: true,
        }}
        search={
          catalog.showSearch
            ? {
                query: searchQuery,
                onQueryChange: setSearchQuery,
              }
            : null
        }
        onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
        actions={
          store?.paymentLink &&
          catalog.showPaymentButton && (
            <div className="hidden md:flex items-center gap-4">
              <a
                href={store.paymentLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-2 bg-(--noir-strong) text-black rounded-full text-sm font-bold tracking-wide hover:bg-(--noir-accent) transition-colors"
              >
                PAGAR
              </a>
            </div>
          )
        }
      />

      <div className="relative z-10 flex-1 w-full mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 pb-16">
        <main className="flex flex-col gap-12">
          {/* Cinematic Hero */}
          <header className="relative pt-16 md:pt-24 pb-8 flex flex-col items-center text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7 }}
              className="mb-8 relative"
            >
              {logoUrl ? (
                <div className="relative">
                  <div className="absolute inset-0 bg-(--noir-accent) blur-3xl opacity-20 rounded-full" />
                  <img
                    src={logoUrl}
                    alt={`${store?.name} logo`}
                    className="relative h-32 w-32 md:h-40 md:w-40 object-contain drop-shadow-2xl"
                  />
                </div>
              ) : (
                <div className="h-32 w-32 rounded-full border border-(--noir-border) flex items-center justify-center bg-(--noir-surface)">
                  <StoreIcon className="h-12 w-12 text-(--noir-muted)" />
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="max-w-4xl mx-auto space-y-6"
            >
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-linear-to-b from-white to-white/60">
                {store?.name || "CINEMATIC STORE"}
              </h1>
              {store?.description && (
                <p className="text-lg md:text-xl text-(--noir-muted) max-w-2xl mx-auto leading-relaxed border-t border-b border-(--noir-border) py-4">
                  {store.description}
                </p>
              )}
            </motion.div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Sidebar Filters (Desktop) */}
            {(catalog.showSearch || catalog.showFilters) && (
              <aside className="hidden lg:block lg:col-span-3 xl:col-span-3 space-y-8 sticky top-24 h-fit">
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
                  onReset={resetFilters}
                  showSearch={catalog.showSearch}
                  showFilters={catalog.showFilters}
                  showSort={catalog.showSort}
                  showPrice={catalog.showFilters}
                  showCategories={catalog.showFilters}
                  orientation="vertical"
                />
              </aside>
            )}

            {/* Product Grid */}
            <div
              className={`${
                catalog.showSearch || catalog.showFilters
                  ? "lg:col-span-9 xl:col-span-9"
                  : "col-span-12"
              }`}
            >
              {(catalog.showSearch || catalog.showFilters) && (
                <div className="lg:hidden mb-8">
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
                    onReset={resetFilters}
                    showSearch={catalog.showSearch}
                    showFilters={catalog.showFilters}
                    showSort={catalog.showSort}
                    showPrice={catalog.showFilters}
                    showCategories={catalog.showFilters}
                  />
                </div>
              )}

              {filteredProducts && filteredProducts.length > 0 ? (
                <>
                  <div className="flex items-end justify-between mb-6 border-b border-(--noir-border) pb-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-(--noir-muted)">
                      Colección
                    </span>
                    {catalog.showProductCount && (
                      <span className="text-xs font-mono text-(--noir-accent)">
                        {filteredProducts.length} ITEMS
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-12">
                    {filteredProducts.map((product, index) => (
                      <motion.div
                        key={product.id || product.$id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          delay: index * 0.05,
                          ease: [0.25, 0.46, 0.45, 0.94],
                        }}
                      >
                        <ProductCard
                          product={product}
                          tone="noir"
                          size="full"
                          onCategoryClick={
                            catalog.showFilters
                              ? (id) => toggleCategory(id)
                              : undefined
                          }
                          onImageClick={(idx, imgs) => openViewer(idx, imgs)}
                          onClick={() => setSelectedProduct(product)}
                          showShareButton={catalog.showShareButton}
                          showCategories={catalog.showFilters}
                          isFeatured={featuredProductIds.includes(
                            product.id || product.$id,
                          )}
                        />
                      </motion.div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-32 border border-dashed border-(--noir-border) rounded-3xl bg-(--noir-surface)">
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-(--noir-accent) blur-2xl opacity-20 rounded-full" />
                    <Search className="relative h-16 w-16 text-(--noir-muted) opacity-50" />
                  </div>
                  <h3 className="text-xl font-bold text-(--noir-strong) mb-2">
                    Sin resultados
                  </h3>
                  <p className="text-(--noir-muted) mb-6 max-w-xs text-center">
                    No encontramos nada que coincida con tu búsqueda.
                  </p>
                  <button
                    onClick={resetFilters}
                    className="px-6 py-2 border border-(--noir-border) hover:border-(--noir-accent) text-(--noir-strong) rounded-full text-xs font-bold uppercase tracking-widest transition-all"
                  >
                    Limpiar Filtros
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Footer */}
      <div className="relative z-10 border-t border-(--noir-border) bg-[#050505]">
        {catalog.showPurchaseInfo && (
          <StorePurchaseInfo
            store={store}
            tone="noir"
            showPaymentButton={catalog.showPaymentButton}
            wrapperClassName="mx-auto max-w-4xl px-4 py-12"
          />
        )}

        <StoreFooter
          store={store}
          config={{
            bg: "transparent",
            text: "text-(--noir-muted)",
            border: "border-(--noir-border)",
            muted: "text-(--noir-muted)",
            accent: "text-(--noir-accent)",
          }}
        />

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileMenuOpen(false)}
                className="fixed inset-0 z-60 bg-black/80 backdrop-blur-md md:hidden"
              />

              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed inset-y-0 right-0 z-60 w-[85%] bg-[#0a0a0a] border-l border-(--noir-border) p-6 pt-24 shadow-2xl overflow-y-auto md:hidden"
              >
                <div className="absolute top-0 inset-x-0 h-32 bg-linear-to-b from-(--noir-accent-soft) to-transparent opacity-20 pointer-events-none" />

                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="absolute top-8 right-8 p-2 border border-(--noir-border) rounded-full text-(--noir-strong) hover:bg-(--noir-surface)"
                >
                  <X size={24} />
                </button>

                <div className="space-y-12 text-(--noir-strong) relative z-10">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-black tracking-tighter">
                      MENÚ
                    </h2>
                    <div className="h-1 w-12 bg-(--noir-accent)" />
                  </div>

                  {(catalog.showSearch || catalog.showFilters) && (
                    <div className="space-y-8">
                      {catalog.showSearch && (
                        <div className="relative">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-(--noir-muted)" />
                          <input
                            type="search"
                            value={searchQuery}
                            onChange={(event) =>
                              setSearchQuery(event.target.value)
                            }
                            placeholder="Buscar productos..."
                            className="w-full pl-12 pr-4 py-4 rounded-xl text-sm outline-none border border-(--noir-border) bg-(--noir-surface) text-(--noir-strong) placeholder:text-(--noir-muted) focus:border-(--noir-accent) transition-colors"
                          />
                        </div>
                      )}
                      {catalog.showFilters && (
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
                          onReset={resetFilters}
                          showSearch={false}
                          showFilters={catalog.showFilters}
                          showSort={catalog.showSort}
                          showPrice={catalog.showFilters}
                          showCategories={catalog.showFilters}
                          orientation="vertical"
                        />
                      )}
                    </div>
                  )}

                  {store?.paymentLink && catalog.showPaymentButton && (
                    <div className="pt-8 border-t border-(--noir-border)">
                      <a
                        href={store.paymentLink}
                        target="_blank"
                        className="w-full py-4 bg-(--noir-strong) text-black rounded-xl font-bold flex items-center justify-center gap-3 shadow-xl hover:bg-white transition-colors"
                      >
                        <ExternalLink size={20} /> IR AL PAGO
                      </a>
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
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
        showShareButton={catalog.showShareButton}
        showPaymentButton={catalog.showPaymentButton}
      />
    </div>
  );
}
