import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "motion/react";
import { X, ArrowRight, Search, ExternalLink } from "lucide-react";
import {
  StoreNavbar,
  StoreFooter,
  CatalogControls,
  ProductCard,
  ProductDetailModal,
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

// Animated product card with intersection observer
const AnimatedProductCard = ({
  product,
  index,
  onCategoryClick,
  onClick,
  showShareButton,
  showCategories,
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{
        duration: 0.6,
        delay: (index % 4) * 0.1,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
    >
      <ProductCard
        product={product}
        size="full"
        tone="light"
        onCategoryClick={onCategoryClick}
        onClick={onClick}
        showShareButton={showShareButton}
        showCategories={showCategories}
      />
    </motion.div>
  );
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
  } = useCatalogFilters({ store, products });

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [scrollY, setScrollY] = useState(0);

  // Scroll tracking for parallax
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
        @keyframes softFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes textReveal {
          0% { clip-path: inset(0 100% 0 0); }
          100% { clip-path: inset(0 0 0 0); }
        }
        @keyframes fadeSlideUp {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .ethereal-btn {
          background-color: transparent;
          border: 1px solid ${primaryColor};
          color: #1c1917;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .ethereal-btn:hover {
          background-color: ${primaryColor};
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 10px 30px -10px ${primaryColor}60;
        }
        .ethereal-card {
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .ethereal-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 40px -15px rgba(0,0,0,0.12);
        }
        .soft-shadow {
          box-shadow: 0 0 60px -20px rgba(0,0,0,0.08);
          transition: box-shadow 0.5s ease;
        }
        .soft-shadow:hover {
          box-shadow: 0 0 80px -15px ${primaryColor}30;
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
      <div className="relative h-[55vh] md:h-[65vh] w-full overflow-hidden mt-0">
        {/* Background with parallax effect */}
        <motion.div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: store?.logoFileId
              ? `url(${getStoreLogoUrl(store.logoFileId)})`
              : "radial-gradient(circle at top, rgba(0,0,0,0.08), transparent 60%)",
            opacity: store?.logoFileId ? 0.12 : 1,
            y: scrollY * 0.3,
          }}
        />
        <div
          className="absolute inset-0 bg-linear-to-b from-transparent to-current"
          style={{ color: secondaryColor }}
        />

        {/* Decorative floating elements */}
        <div
          className="absolute top-20 right-[15%] w-32 h-32 rounded-full blur-3xl opacity-20"
          style={{
            backgroundColor: primaryColor,
            transform: `translateY(${scrollY * -0.2}px)`,
          }}
        />
        <div
          className="absolute bottom-20 left-[10%] w-48 h-48 rounded-full blur-3xl opacity-15"
          style={{
            backgroundColor: primaryColor,
            transform: `translateY(${scrollY * 0.15}px)`,
          }}
        />

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 pt-10">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="text-4xl md:text-6xl lg:text-7xl font-light mb-6 tracking-wide"
          >
            {store.name}
          </motion.h1>
          {store.description && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                delay: 0.2,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              className="max-w-md mx-auto text-base md:text-lg opacity-70 mb-8 font-light italic line-clamp-2"
            >
              {store.description}
            </motion.p>
          )}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            onClick={() =>
              window.scrollTo({ top: window.innerHeight, behavior: "smooth" })
            }
            className="group flex items-center gap-2 px-8 py-3 bg-(--primary) text-white hover:bg-opacity-90 transition-all duration-300 hover:shadow-lg"
          >
            <span className="tracking-widest uppercase text-sm">
              Ver Productos
            </span>
            <ArrowRight
              size={16}
              className="group-hover:translate-x-1 transition-transform"
            />
          </motion.button>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-16">
        {/* Filters & Controls */}
        {(catalog.showSearch || catalog.showFilters) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12 sticky top-20 z-30 py-4 transition-all duration-300 bg-opacity-95 backdrop-blur-sm shadow-sm rounded-xl px-6 border border-stone-100 soft-shadow"
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
          </motion.div>
        )}

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 md:gap-x-6 gap-y-8 md:gap-y-12">
          {filteredProducts &&
            filteredProducts.map((product, index) => (
              <AnimatedProductCard
                key={product.$id}
                product={product}
                index={index}
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-32 opacity-50"
          >
            <p className="text-xl font-light italic">
              No se encontraron productos.
            </p>
            <button
              onClick={resetFilters}
              className="mt-4 text-sm underline hover:text-(--primary)"
            >
              Limpiar Filtros
            </button>
          </motion.div>
        )}
      </main>

      {/* Shared Footer */}
      <div id="footer">
        {catalog.showPurchaseInfo && (
          <StorePurchaseInfo
            store={store}
            showPaymentButton={catalog.showPaymentButton}
            wrapperClassName="max-w-7xl mx-auto px-4 md:px-8 pb-12"
          />
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
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 z-60 w-[85%] bg-stone-50 p-6 pt-24 shadow-2xl overflow-y-auto md:hidden"
            >
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
            </motion.div>
          </>
        )}
      </AnimatePresence>

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
