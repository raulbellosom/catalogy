import { useState } from "react";
import { X, ArrowRight } from "lucide-react";
import {
  StoreNavbar,
  StoreFooter,
  CatalogControls,
  ProductCard,
  ProductDetailModal,
  StorePurchaseInfo,
  useCatalog,
} from "../components";
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

export function EtherealTemplate({ store, products, isPreview = false }) {
  const {
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
    categories,
    sortOrder,
    setSortOrder,
    resetFilters,
  } = useCatalog({ store, products });

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const theme = resolveThemeSettings(store);
  const catalog = resolveCatalogSettings(store);
  const primaryColor = theme.colors.primary;
  const secondaryColor = theme.colors.secondary;
  const fontFamily = resolveFontFamily(theme.font);

  return (
    <div
      className="min-h-screen selection:bg-opacity-20 pt-[calc(var(--store-navbar-height)+var(--store-navbar-offset)+env(safe-area-inset-top))]"
      style={{
        backgroundColor: secondaryColor,
        color: "#1c1917",
        fontFamily,
        colorScheme: "light",
        "--primary": primaryColor,
        "--color-primary": primaryColor,
        "--color-bg-secondary": secondaryColor,
        "--color-border": `${primaryColor}40`,
        "--color-fg": "#1c1917",
        "--card": "#FFFFFF",
        "--border": "rgba(0,0,0,0.05)",
        "--muted": "#f5f5f4",
        "--muted-foreground": "#78716c",
        "--foreground": "#1c1917",
        "--store-navbar-height": "4rem",
        "--store-navbar-offset": isPreview ? "2.5rem" : "0rem",
      }}
    >
      <style>{`
        ::selection {
          background-color: ${primaryColor};
          color: white;
        }
        .ethereal-btn {
            background-color: transparent;
            border: 1px solid ${primaryColor};
            color: #1c1917;
            transition: all 0.3s ease;
        }
        .ethereal-btn:hover {
            background-color: ${primaryColor};
            color: white;
        }
        .ethereal-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 10px 30px -10px rgba(0,0,0,0.1);
        }
      `}</style>

      {/* Shared Navbar */}
      <StoreNavbar
        store={store}
        isPreview={isPreview}
        onMobileMenuToggle={() => setIsMobileMenuOpen(true)}
        search={
          catalog.showSearch
            ? {
                query: searchQuery,
                onQueryChange: setSearchQuery,
              }
            : null
        }
        config={{
          bg: "bg-stone-50/80",
          text: "text-stone-900",
          border: "border-stone-900/5",
          accent: "text-(--primary)",
          glass: true,
        }}
        actions={
          <div className="hidden md:flex items-center space-x-6 text-sm tracking-widest uppercase opacity-80">
            <button
              onClick={() =>
                window.scrollTo({ top: window.innerHeight, behavior: "smooth" })
              }
              className="hover:text-(--primary) transition-colors"
            >
              Catálogo
            </button>
          </div>
        }
      />

      {/* Hero Section */}
      <div className="relative h-[60vh] md:h-[70vh] w-full overflow-hidden mt-0">
        {/* Background with parallax effect */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-[20s] hover:scale-110"
          style={{
            backgroundImage: store?.logoFileId
              ? `url(${getStoreLogoUrl(store.logoFileId)})`
              : "radial-gradient(circle at top, rgba(0,0,0,0.08), transparent 60%)",
            opacity: store?.logoFileId ? 0.15 : 1,
          }}
        />
        <div
          className="absolute inset-0 bg-linear-to-b from-transparent to-current"
          style={{ color: secondaryColor }}
        />

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 pt-16">
          <h1 className="text-5xl md:text-7xl font-light mb-8 tracking-wide">
            {store.name}
          </h1>
          {store.description && (
            <p className="max-w-md mx-auto text-lg opacity-80 mb-8 font-light italic">
              {store.description}
            </p>
          )}
          <button
            onClick={() =>
              window.scrollTo({ top: window.innerHeight, behavior: "smooth" })
            }
            className="group flex items-center gap-2 px-8 py-3 bg-(--primary) text-white hover:bg-opacity-90 transition-all duration-300"
          >
            <span className="tracking-widest uppercase text-sm">
              Ver Productos
            </span>
            <ArrowRight
              size={16}
              className="group-hover:translate-x-1 transition-transform"
            />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-16">
        {/* Filters & Controls */}
        {(catalog.showSearch || catalog.showFilters) && (
          <div
            className="mb-12 sticky top-20 z-30 py-4 transition-all duration-300 bg-opacity-95 backdrop-blur-sm shadow-sm rounded-xl px-6 border border-stone-100"
            style={{ backgroundColor: secondaryColor }}
          >
            <CatalogControls
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              activeCategoryIds={activeCategoryIds}
              onToggleCategory={toggleCategory}
              minPrice={minPrice}
              maxPrice={maxPrice}
              onMinPriceChange={setMinPrice}
              onMaxPriceChange={setMaxPrice}
              priceBounds={priceBounds}
              sortOrder={sortOrder}
              setSortOrder={setSortOrder}
              categories={categories}
              tone="light"
              onReset={resetFilters}
              showSearch={catalog.showSearch}
              showFilters={catalog.showFilters}
              showSort={catalog.showSort}
              showPrice={catalog.showFilters}
              showCategories={catalog.showFilters}
            />
          </div>
        )}

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
          {filteredProducts &&
            filteredProducts.map((product) => (
              <ProductCard
                key={product.$id}
                product={product}
                size="full"
                tone="light"
                onCategoryClick={
                  catalog.showFilters ? (id) => toggleCategory(id) : undefined
                }
                onClick={() => setSelectedProduct(product)}
                showShareButton={catalog.showShareButton}
                showCategories={catalog.showFilters}
              />
            ))}
        </div>

        {(!filteredProducts || filteredProducts.length === 0) && (
          <div className="text-center py-32 opacity-50">
            <p className="text-xl font-light italic">
              No se encontraron productos.
            </p>
            <button
              onClick={resetFilters}
              className="mt-4 text-sm underline hover:text-(--primary)"
            >
              Limpiar Filtros
            </button>
          </div>
        )}
      </main>

      {/* Shared Footer */}
      <div id="footer">
        {catalog.showPurchaseInfo && (
          <div className="max-w-7xl mx-auto px-4 md:px-8 pb-12">
            <StorePurchaseInfo
              store={store}
              showPaymentButton={catalog.showPaymentButton}
            />
          </div>
        )}
        <StoreFooter
          store={store}
          config={{
            bg: "bg-stone-900",
            text: "text-stone-100",
            muted: "text-stone-400",
            border: "border-stone-800",
            accent: "text-(--primary)",
          }}
        />
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 z-60 w-[85%] bg-stone-50 p-6 pt-24 shadow-2xl overflow-y-auto md:hidden">
            <button
              className="absolute top-8 right-8 text-stone-900 p-2 border border-stone-200 rounded-full"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X size={24} strokeWidth={1} />
            </button>

            <div className="space-y-10">
              {(catalog.showSearch || catalog.showFilters) && (
                <CatalogControls
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  activeCategoryIds={activeCategoryIds}
                  onToggleCategory={toggleCategory}
                  minPrice={minPrice}
                  maxPrice={maxPrice}
                  onMinPriceChange={setMinPrice}
                  onMaxPriceChange={setMaxPrice}
                  priceBounds={priceBounds}
                  sortOrder={sortOrder}
                  setSortOrder={setSortOrder}
                  categories={categories}
                  tone="light"
                  onReset={resetFilters}
                  showSearch={catalog.showSearch}
                  showFilters={catalog.showFilters}
                  showSort={catalog.showSort}
                  showPrice={catalog.showFilters}
                  showCategories={catalog.showFilters}
                />
              )}

              {store?.paymentLink && catalog.showPaymentButton && (
                <a
                  href={store.paymentLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 px-4 bg-(--primary) text-white rounded-full font-bold flex items-center justify-center shadow-lg whitespace-nowrap"
                >
                  Ir al pago
                </a>
              )}
            </div>
          </div>
        </>
      )}

      {/* Product Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          store={store}
          showShareButton={catalog.showShareButton}
          showPaymentButton={catalog.showPaymentButton}
        />
      )}
    </div>
  );
}
