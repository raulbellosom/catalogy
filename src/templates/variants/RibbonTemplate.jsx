import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ExternalLink, Filter } from "lucide-react";
import {
  ProductCard,
  ProductDetailModal,
  StoreNavbar,
  StoreFooter,
  CatalogFilters,
  StorePurchaseInfo,
} from "../components";
import { useCatalogFilters } from "../components/catalogHooks";
import { getStoreLogoUrl } from "@/shared/services/storeService";
import { resolveThemeSettings } from "@/templates/registry";
import { resolveCatalogSettings } from "@/shared/utils/storeSettings";

const resolveFontFamily = (fontId) => {
  const map = {
    inter: "'Inter', sans-serif",
    merriweather: "'Merriweather', serif",
    jetbrains: "'JetBrains Mono', monospace",
    roboto: "'Roboto', sans-serif",
    playfair: "'Playfair Display', serif",
    montserrat: "'Montserrat', sans-serif",
  };
  return map[fontId] || "'Playfair Display', serif";
};

export function RibbonTemplate({ store, products, isPreview = false }) {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const theme = resolveThemeSettings(store);
  const catalog = resolveCatalogSettings(store);
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

  useEffect(() => {
    if (!catalog.showFilters) {
      setFiltersOpen(false);
    }
  }, [catalog.showFilters]);

  return (
    <div
      className="min-h-screen flex flex-col bg-(--ribbon-bg) text-(--ribbon-fg) pt-[calc(var(--store-navbar-height)+var(--store-navbar-offset)+env(safe-area-inset-top))]"
      style={{
        fontFamily,
        colorScheme: "light",
        "--ribbon-primary": primary,
        "--ribbon-bg": secondary,
        "--ribbon-fg": "#0f172a",
        "--store-navbar-height": "4rem",
        "--store-navbar-offset": isPreview ? "2.5rem" : "0rem",
      }}
    >
      <style>{`
        .ribbon-glow {
          background: radial-gradient(600px circle at 20% 10%, rgba(255,255,255,0.7), transparent 55%),
                      radial-gradient(500px circle at 80% 0%, rgba(255,255,255,0.6), transparent 55%);
        }
        .ribbon-frame {
          clip-path: polygon(0 0, 100% 0, 100% 85%, 96% 100%, 0 100%);
        }
      `}</style>

      <StoreNavbar
        store={store}
        isPreview={isPreview}
        config={{
          bg: "bg-(--ribbon-bg)/80",
          text: "text-slate-900",
          border: "border-slate-200/50",
          accent: "text-(--ribbon-primary)",
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
            <a
              href={store.paymentLink}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-2 text-sm font-medium text-(--ribbon-primary) hover:opacity-80 transition-opacity"
            >
              <ExternalLink className="w-4 h-4" />
              Pagar
            </a>
          )
        }
      />

      <header className="relative overflow-hidden">
        <div className="absolute inset-0 ribbon-glow pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="flex flex-col md:flex-row gap-10 items-start">
            <div className="flex-1 space-y-6">
              {logoUrl && (
                <div className="h-14 w-14 rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm">
                  <img
                    src={logoUrl}
                    alt={store?.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <h1 className="text-4xl md:text-6xl font-semibold tracking-tight text-slate-900">
                {store?.name}
              </h1>
              {store?.description && (
                <p className="text-lg text-slate-600 max-w-2xl leading-relaxed">
                  {store.description}
                </p>
              )}
            </div>
            {catalog.showProductCount && (
              <div className="hidden md:block w-56 shrink-0">
                <div className="ribbon-frame bg-white/70 border border-slate-200/60 rounded-2xl p-6 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                    Productos
                  </p>
                  <p className="text-3xl font-bold text-(--ribbon-primary)">
                    {filteredProducts?.length || 0}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <main
        id="catalog"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 w-full"
      >
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h2 className="text-2xl font-semibold text-slate-900">Productos</h2>
          {catalog.showProductCount && (
            <span className="text-sm text-slate-500">
              {filteredProducts?.length || 0} productos
            </span>
          )}
        </div>

        {catalog.showFilters && categories?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {categories.map((cat) => {
              const isActive = activeCategoryIds.includes(cat.id);
              return (
                <button
                  key={cat.id}
                  onClick={() => toggleCategory(cat.id)}
                  className={`px-4 py-2 rounded-full text-[10px] uppercase tracking-widest font-semibold transition-colors ${
                    isActive
                      ? "bg-slate-900 text-white"
                      : "bg-white/70 text-slate-500 border border-slate-200 hover:bg-slate-900 hover:text-white"
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        )}

        {catalog.showFilters && (
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              {catalog.showSort && (
                <select
                  value={sortOrder}
                  onChange={(event) => setSortOrder(event.target.value)}
                  className="px-4 py-2 rounded-full text-[10px] uppercase tracking-widest font-semibold border border-slate-200 bg-white/70 text-slate-600"
                >
                  <option value="none">Relevancia</option>
                  <option value="asc">Menor precio</option>
                  <option value="desc">Mayor precio</option>
                </select>
              )}
              <button
                onClick={() => setFiltersOpen((prev) => !prev)}
                className="px-4 py-2 rounded-full text-[10px] uppercase tracking-widest font-semibold border border-slate-200 text-slate-600 hover:bg-slate-900 hover:text-white transition-colors flex items-center gap-2"
              >
                <Filter className="h-3.5 w-3.5" />
                Filtros
              </button>
            </div>
            <button
              onClick={resetFilters}
              className="px-4 py-2 rounded-full text-[10px] uppercase tracking-widest font-semibold text-slate-900"
            >
              Reiniciar
            </button>
          </div>
        )}

        {catalog.showFilters && filtersOpen && (
          <div className="mb-8">
            <div className="bg-white/80 border border-slate-200/60 rounded-2xl p-6 shadow-sm">
              <CatalogFilters
                categories={categories}
                activeCategoryIds={activeCategoryIds}
                onToggleCategory={toggleCategory}
                minPrice={minPrice}
                maxPrice={maxPrice}
                onMinPriceChange={setMinPrice}
                onMaxPriceChange={setMaxPrice}
                priceBounds={priceBounds}
                sortOrder={sortOrder}
                setSortOrder={setSortOrder}
                primaryColor={primary}
                showSort={catalog.showSort}
              />
            </div>
          </div>
        )}

        {filteredProducts && filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id || product.$id}
                product={product}
                onCategoryClick={
                  catalog.showFilters ? (id) => toggleCategory(id) : undefined
                }
                onClick={() => setSelectedProduct(product)}
                showShareButton={catalog.showShareButton}
                showCategories={catalog.showFilters}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center text-slate-500">
            <p>No se encontraron productos.</p>
          </div>
        )}
      </main>

      {catalog.showPurchaseInfo && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 w-full">
          <StorePurchaseInfo
            store={store}
            showPaymentButton={catalog.showPaymentButton}
          />
        </div>
      )}
      <StoreFooter
        store={store}
        config={{
          bg: "bg-slate-900",
          text: "text-slate-400",
          border: "border-slate-800",
          muted: "text-slate-500",
          accent: "text-white",
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
              className="fixed inset-0 z-60 bg-slate-900/30 backdrop-blur-sm md:hidden"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 z-60 w-[85%] bg-white p-6 pt-24 shadow-2xl overflow-y-auto md:hidden"
            >
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="absolute top-8 right-8 p-2 border border-slate-200 rounded-full text-slate-900"
              >
                <X size={24} />
              </button>

              <div className="space-y-10">
                {(catalog.showSearch || catalog.showFilters) && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                        Búsqueda y Filtros
                      </h3>
                      <button
                        onClick={resetFilters}
                        className="text-[10px] font-bold uppercase tracking-widest text-slate-900"
                      >
                        Reiniciar
                      </button>
                    </div>
                    {catalog.showSearch && (
                      <div className="relative">
                        <input
                          type="search"
                          value={searchQuery}
                          onChange={(event) =>
                            setSearchQuery(event.target.value)
                          }
                          placeholder="Buscar..."
                          className="w-full px-4 py-3 rounded-xl text-sm outline-none border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400"
                        />
                      </div>
                    )}
                    {catalog.showFilters && (
                      <CatalogFilters
                        categories={categories}
                        activeCategoryIds={activeCategoryIds}
                        onToggleCategory={toggleCategory}
                        minPrice={minPrice}
                        maxPrice={maxPrice}
                        onMinPriceChange={setMinPrice}
                        onMaxPriceChange={setMaxPrice}
                        priceBounds={priceBounds}
                        sortOrder={sortOrder}
                        setSortOrder={setSortOrder}
                        primaryColor={primary}
                        showSort={catalog.showSort}
                      />
                    )}
                  </div>
                )}

                {store?.paymentLink && catalog.showPaymentButton && (
                  <div className="pt-8 border-t border-slate-100">
                    <a
                      href={store.paymentLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-4 bg-slate-900 text-white rounded-full font-bold flex items-center justify-center gap-2 whitespace-nowrap"
                    >
                      <ExternalLink size={20} /> Ir al pago
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ProductDetailModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        store={store}
        tone="ribbon"
        showShareButton={catalog.showShareButton}
        showPaymentButton={catalog.showPaymentButton}
      />
    </div>
  );
}
