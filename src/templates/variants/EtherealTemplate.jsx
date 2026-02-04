import React, { useState, useMemo } from "react";
import { Menu, X, ArrowRight, ShoppingBag } from "lucide-react";
import {
  StoreNavbar,
  StoreFooter,
  CatalogControls,
  ProductGrid,
  ProductCard,
  ProductDetailModal,
  useCatalog,
} from "../components";
import { getStoreLogoUrl } from "@/shared/services/storeService";
import { getProductImageUrl } from "@/shared/services/productService";

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

  // Resolution of colors and fonts
  const settings = useMemo(() => {
    try {
      if (store?.settings?.useTemplateStyles) {
        return {
          colors: { primary: "#BFA181", secondary: "#FAFAF9" },
          font: "playfair",
        };
      }
      return typeof store.settings === "string"
        ? JSON.parse(store.settings)
        : store.settings;
    } catch (e) {
      return {
        colors: { primary: "#BFA181", secondary: "#FAFAF9" },
        font: "playfair",
      };
    }
  }, [store]);

  const primaryColor = settings?.colors?.primary || "#BFA181";
  const secondaryColor = settings?.colors?.secondary || "#FAFAF9";
  const fontFamily = settings?.font || "playfair";

  // Dynamic Styles
  const fontStyles =
    {
      inter: "font-sans",
      merriweather: "font-serif",
      montserrat: "font-sans",
      playfair: "font-serif",
      roboto: "font-sans",
      jetbrains: "font-mono",
    }[fontFamily] || "font-serif"; // Default to serif for Ethereal

  return (
    <div
      className={`min-h-screen selection:bg-opacity-20 ${fontStyles} ${isPreview ? "pt-10" : ""}`}
      style={{
        backgroundColor: secondaryColor,
        color: "#1c1917", // Stone 900
        "--primary": primaryColor,
        "--color-primary": primaryColor, // Compatibility for shared components
        "--color-bg-secondary": secondaryColor,
        "--color-border": `${primaryColor}40`,
        "--color-fg": "#1c1917",
        "--card": "#FFFFFF",
        "--border": "rgba(0,0,0,0.05)",
        "--muted": "#f5f5f4",
        "--muted-foreground": "#78716c",
        "--foreground": "#1c1917",
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
        search={{
          query: searchQuery,
          onQueryChange: setSearchQuery,
        }}
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
            backgroundImage: `url(${store.logoFileId ? getStoreLogoUrl(store.logoFileId) : "/placeholder.jpg"})`,
            opacity: 0.15,
          }}
        />
        <div
          className="absolute inset-0 bg-linear-to-b from-transparent to-current"
          style={{ color: secondaryColor }}
        />

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 pt-16">
          <p className="text-sm md:text-base tracking-[0.3em] uppercase mb-4 opacity-70">
            Bienvenido a
          </p>
          <h1 className="text-5xl md:text-7xl font-light mb-8 tracking-wide">
            {store.name}
          </h1>
          <p className="max-w-md mx-auto text-lg opacity-80 mb-8 font-light italic">
            {store.description}
          </p>
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
          />
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
          {filteredProducts &&
            filteredProducts.map((product) => (
              <ProductCard
                key={product.$id}
                product={product}
                size="full"
                tone="light"
                onCategoryClick={(id) => toggleCategory(id)}
                onClick={() => setSelectedProduct(product)}
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

      {/* Mobile Menu Overlay - Keeping custom for now as no shared component exists, but cleaner integration */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900 bg-opacity-95 backdrop-blur-md flex flex-col items-center justify-center">
          <button
            className="absolute top-6 right-6 text-white p-2"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X size={32} strokeWidth={1} />
          </button>

          <nav className="flex flex-col items-center gap-8 text-white text-2xl font-light tracking-widest">
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              Home
            </button>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                window.scrollTo({
                  top: window.innerHeight,
                  behavior: "smooth",
                });
              }}
            >
              Collection
            </button>
            <button
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

      {/* Product Modal */}
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
