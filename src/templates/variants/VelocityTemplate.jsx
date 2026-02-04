import React, { useState, useMemo } from "react";
import {
  Menu,
  X,
  ChevronRight,
  Gauge,
  ExternalLink,
  Share2,
} from "lucide-react";
import {
  CatalogControls,
  ProductDetailModal,
  useCatalog,
  StoreNavbar,
  StoreFooter,
} from "../components";
import { getStoreLogoUrl } from "@/shared/services/storeService";
import { getProductImageUrl } from "@/shared/services/productService";

export function VelocityTemplate({ store, products, isPreview = false }) {
  const {
    searchQuery,
    setSearchQuery,
    activeCategoryIds,
    toggleCategory,
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice, // Added
    priceBounds, // Added
    filteredProducts,
    categories,
    sortOrder,
    setSortOrder,
    resetFilters,
  } = useCatalog({ store, products });

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const settings = useMemo(() => {
    try {
      if (store?.settings?.useTemplateStyles) {
        return {
          colors: { primary: "#DC2626", secondary: "#F8FAFC" },
          font: "inter", // Use Inter or Montserrat
        };
      }
      return typeof store.settings === "string"
        ? JSON.parse(store.settings)
        : store.settings;
    } catch (e) {
      return {
        colors: { primary: "#DC2626", secondary: "#F8FAFC" },
        font: "inter",
      };
    }
  }, [store]);

  const primaryColor = settings?.colors?.primary || "#DC2626";
  const secondaryColor = settings?.colors?.secondary || "#F8FAFC";
  const fontFamily = settings?.font || "inter";

  const fontStyles =
    {
      inter: "font-sans",
      merriweather: "font-serif",
      montserrat: "font-sans",
      playfair: "font-serif",
      roboto: "font-sans",
      jetbrains: "font-mono",
    }[fontFamily] || "font-sans";

  return (
    <div
      className={`min-h-screen ${fontStyles} text-slate-900 ${isPreview ? "pt-10" : ""}`}
      style={{
        backgroundColor: secondaryColor,
        "--velocity-accent": primaryColor,
        "--color-primary": primaryColor, // Compatibility
        "--color-bg-secondary": secondaryColor,
        "--color-border": `${primaryColor}40`,
        "--color-fg": "#0f172a", // slate-900
      }}
    >
      <style>{`
            .velocity-clip {
                clip-path: polygon(0 0, 100% 0, 100% 85%, 95% 100%, 0 100%);
            }
            .velocity-btn {
                background: var(--velocity-accent);
                color: white;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px);
                transition: all 0.2s;
            }
            .velocity-btn:hover {
                filter: brightness(1.1);
                transform: skewX(-10deg);
            }
        `}</style>

      {/* Shared Navbar */}
      <StoreNavbar
        store={store}
        isPreview={isPreview}
        onMobileMenuToggle={() => setIsMobileMenuOpen(true)}
        search={{
          query: searchQuery,
          onQueryChange: setSearchQuery,
        }}
        config={{
          bg: "bg-slate-900",
          text: "text-white",
          border: "border-white/10",
          accent: "text-(--velocity-accent)",
          glass: false,
        }}
        actions={
          <div className="hidden md:flex gap-8 text-sm font-semibold tracking-wide border-b border-white/20 pb-2">
            <button
              onClick={() =>
                window.scrollTo({
                  top: window.innerHeight,
                  behavior: "smooth",
                })
              }
              className="hover:text-(--velocity-accent) transition-colors"
            >
              CATÁLOGO
            </button>
          </div>
        }
      />

      {/* Dynamic Header / Hero */}
      <header className="relative bg-slate-900 text-white overflow-hidden pt-16">
        {/* Background Pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        ></div>

        <div className="relative max-w-[1440px] mx-auto px-6 py-8">
          <div className="grid md:grid-cols-2 gap-12 items-center py-12 md:py-24">
            <div className="order-2 md:order-1 space-y-6">
              <div className="inline-block px-3 py-1 bg-white/10 text-(--velocity-accent) text-xs font-bold uppercase tracking-widest rounded-sm mb-2">
                Selección Premium
              </div>
              <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter leading-[0.9]">
                {store.name}
              </h1>
              <p className="text-slate-400 text-lg max-w-md font-medium">
                {store.description ||
                  "Descubre nuestra colección exclusiva de productos seleccionados para ti."}
              </p>
              <button
                onClick={() =>
                  window.scrollTo({
                    top: window.innerHeight,
                    behavior: "smooth",
                  })
                }
                className="mt-8 px-8 py-4 bg-(--velocity-accent) text-white font-bold uppercase tracking-wider hover:bg-white hover:text-black transition-colors skew-x-[-10deg]"
              >
                <span className="block skew-x-10">Explorar</span>
              </button>
            </div>

            <div className="order-1 md:order-2 relative h-[300px] md:h-[500px] w-full">
              {/* Abstract decorative shape or logo if available */}
              <div className="absolute inset-0 bg-linear-to-tr from-(--velocity-accent)/20 to-transparent rounded-full blur-3xl transform translate-x-12"></div>
              {store.logoFileId ? (
                <img
                  src={getStoreLogoUrl(store.logoFileId)}
                  className="w-full h-full object-contain filter drop-shadow-2xl"
                  alt="Logo"
                />
              ) : (
                // Placeholder abstract graphic
                <div className="w-full h-full flex items-center justify-center border border-white/10 bg-white/5 backdrop-blur-sm skew-x-[-5deg]">
                  <Gauge size={120} className="text-white/20" strokeWidth={1} />
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Showroom / Content */}
      <main className="max-w-[1600px] mx-auto px-4 md:px-8 py-16">
        {/* Controls Bar */}
        <div className="bg-white p-4 shadow-xl border border-slate-100 rounded-sm mb-12 sticky top-20 z-30 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="w-full md:w-auto flex-1">
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
              tone="noir"
            />
          </div>
          <div className="text-xs font-bold uppercase text-slate-400 hidden md:block">
            {filteredProducts ? filteredProducts.length : 0} Productos
          </div>
        </div>

        {/* Wide Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredProducts &&
            filteredProducts.map((product) => (
              <div
                key={product.$id}
                className="group bg-white rounded-lg shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-slate-200 overflow-hidden flex flex-col"
                onClick={() => setSelectedProduct(product)}
              >
                {/* Image Area - Aspect Ratio 16/9 for cinematic feel */}
                <div className="relative aspect-video bg-slate-100 overflow-hidden">
                  {product.imageFileIds?.[0] ? (
                    <img
                      src={getProductImageUrl(product.imageFileIds[0])}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <span className="font-bold text-lg">SIN IMAGEN</span>
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="absolute top-4 left-4">
                    {product.stock > 0 ? (
                      <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 uppercase rounded-sm">
                        Disponible
                      </span>
                    ) : (
                      <span className="bg-slate-500 text-white text-[10px] font-bold px-2 py-1 uppercase rounded-sm">
                        Agotado
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-0 right-0 left-0 h-1/2 bg-linear-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-6">
                    <span className="text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                      Ver Detalles{" "}
                      <ChevronRight
                        size={14}
                        className="text-(--velocity-accent)"
                      />
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold uppercase italic tracking-tight">
                      {product.name}
                    </h3>
                  </div>

                  {/* Categories as Specs Tags */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {product.categoryIds.slice(0, 3).map((catId) => {
                      const cat = categories.find((c) => c.id === catId);
                      if (!cat) return null;
                      return (
                        <span
                          key={catId}
                          className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded-sm uppercase tracking-wide"
                        >
                          {cat.name}
                        </span>
                      );
                    })}
                  </div>

                  <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="text-2xl font-black text-(--velocity-accent) tracking-tight">
                      {new Intl.NumberFormat("es-MX", {
                        style: "currency",
                        currency: product.currency,
                      }).format(product.price)}
                    </div>
                    <button className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-(--velocity-accent) transition-colors">
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>

        {(!filteredProducts || filteredProducts.length === 0) && (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <Gauge size={64} strokeWidth={1} className="mb-4 text-slate-300" />
            <h3 className="text-2xl font-bold uppercase tracking-wide mb-2">
              No se encontraron productos
            </h3>
            <p className="mb-8">Intenta ajustar tus criterios de búsqueda.</p>
            <button onClick={resetFilters} className="velocity-btn px-6 py-3">
              Limpiar Filtros
            </button>
          </div>
        )}
      </main>

      {/* Shared Footer */}
      <div id="footer">
        <StoreFooter
          store={store}
          config={{
            bg: "bg-slate-900",
            text: "text-white",
            muted: "text-slate-400",
            border: "border-slate-800",
            accent: "text-(--velocity-accent)",
          }}
        />
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900 flex flex-col p-6">
          <div className="flex justify-end mb-12">
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 text-white"
            >
              <X size={32} />
            </button>
          </div>
          <nav className="flex flex-col gap-8 text-2xl font-black italic uppercase tracking-tighter text-white">
            <button
              className="text-left py-4 border-b border-white/10 hover:text-(--velocity-accent)"
              onClick={() => {
                setIsMobileMenuOpen(false);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              Home
            </button>
            <button
              className="text-left py-4 border-b border-white/10 hover:text-(--velocity-accent)"
              onClick={() => {
                setIsMobileMenuOpen(false);
                window.scrollTo({
                  top: window.innerHeight,
                  behavior: "smooth",
                });
              }}
            >
              Inventory
            </button>
            <button
              className="text-left py-4 border-b border-white/10 hover:text-(--velocity-accent)"
              onClick={() => {
                setIsMobileMenuOpen(false);
                document
                  .getElementById("footer")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Contact
            </button>
          </nav>
        </div>
      )}

      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          storeSettings={{
            colors: { primary: primaryColor, secondary: secondaryColor },
          }}
          store={store}
        />
      )}
    </div>
  );
}
