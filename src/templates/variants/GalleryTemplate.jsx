import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  Grid,
  Maximize2,
  X,
  Share2,
  Info,
  ChevronRight,
  Filter,
} from "lucide-react";
import { getStoreLogoUrl } from "@/shared/services/storeService";
import { getProductImageUrl } from "@/shared/services/productService";
import {
  ProductDetailModal,
  StoreNavbar,
  StoreFooter,
  CatalogFilters,
} from "../components";
import { ImageViewerModal } from "@/shared/ui/molecules/ImageViewerModal";
import { useCatalogFilters, useProductShare } from "../components/catalogHooks";
import { Logo } from "@/shared/ui/atoms/Logo";
import { appConfig } from "@/shared/lib/env";
import { resolveThemeSettings } from "@/templates/registry";

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
  return map[fontId] || "'Playfair Display', serif";
};

const formatPrice = (price, currency = "MXN") => {
  if (typeof price !== "number") return "";
  return price.toLocaleString("es-MX", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

export function GalleryTemplate({ store, products, isPreview = false }) {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Settings Resolution
  const theme = resolveThemeSettings(store);
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

  // ImageViewer
  const [viewer, setViewer] = useState({
    isOpen: false,
    images: [],
    index: 0,
  });

  const openViewer = (index, images, e) => {
    e.stopPropagation();
    setViewer({ isOpen: true, images, index });
  };

  return (
    <div
      className={`min-h-screen flex flex-col bg-(--color-bg) text-stone-900 ${isPreview ? "pt-32" : "pt-24"}`}
      style={{
        fontFamily,
        "--gallery-accent": primary,
        "--gallery-contrast": secondary,
      }}
    >
      <StoreNavbar
        store={store}
        isPreview={isPreview}
        config={{
          bg: "bg-(--color-bg)/80",
          text: "text-stone-900",
          border: "border-stone-200/50",
          accent: "text-(--gallery-accent)",
          glass: true,
        }}
        search={{
          query: searchQuery,
          onQueryChange: setSearchQuery,
        }}
        onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
      />

      {/* Intro / Description */}
      {store?.description && (
        <div className="px-6 py-12 max-w-4xl mx-auto text-center">
          <p className="text-xl md:text-2xl font-light leading-relaxed italic text-stone-600">
            "{store.description}"
          </p>
          {store?.purchaseInstructions && (
            <div className="mt-8 flex justify-center">
              <span className="inline-flex items-center gap-2 px-6 py-2 border border-stone-300 rounded-full text-xs uppercase tracking-widest hover:bg-stone-900 hover:text-white transition-colors cursor-help group relative">
                <Info className="w-3 h-3" /> Info
                {/* Tooltip for instructions */}
                <div className="absolute top-full mt-4 left-1/2 -translate-x-1/2 w-72 bg-white p-4 shadow-xl rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all text-left text-normal normal-case z-50 text-stone-600">
                  {store.purchaseInstructions}
                </div>
              </span>
            </div>
          )}
        </div>
      )}

      {/* Filters Section - Hidden on Mobile */}
      <div className="hidden md:flex px-6 pb-8 flex-col items-center gap-6">
        <div className="w-full max-w-md bg-(--color-bg) p-6 rounded-xl shadow-sm border border-stone-200/50">
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
          />
        </div>
      </div>

      {/* Masonry-like Grid (CSS Grid) */}
      <main className="px-4 md:px-6 pb-20">
        {filteredProducts && filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-[250px] md:auto-rows-[400px]">
            {filteredProducts.map((product, i) => {
              const imageId = product.imageFileIds?.[0];
              const imageUrl = imageId ? getProductImageUrl(imageId) : null;

              const handleCategoryClick = (e, catId) => {
                e.stopPropagation();
                toggleCategory(catId);
              };

              // Simple logic to make some items span 2 cols to create "Gallery" feel
              const isLarge = i % 7 === 0;

              return (
                <div
                  key={product.id || product.$id}
                  className={`group relative bg-stone-200 overflow-hidden cursor-pointer ${isLarge ? "md:col-span-2 md:row-span-2" : ""}`}
                  onClick={() => setSelectedProduct(product)}
                >
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-stone-400">
                      <Grid className="w-12 h-12 opacity-20" />
                      <span className="mt-2 text-xs uppercase tracking-widest">
                        No Image
                      </span>
                    </div>
                  )}

                  {/* Hover Overlay info */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-8">
                    <h3 className="text-white text-2xl font-light mb-1 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      {product.name}
                    </h3>

                    {product.categories && product.categories.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                        {product.categories.map((cat) => (
                          <button
                            key={cat.id || cat.name}
                            onClick={(e) => handleCategoryClick(e, cat.id)}
                            className="text-[8px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded bg-white/20 text-white hover:bg-white hover:text-black transition-colors"
                          >
                            {cat.name}
                          </button>
                        ))}
                      </div>
                    )}

                    <p className="text-white/80 font-medium text-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-100">
                      {formatPrice(product.price, product.currency)}
                    </p>

                    {/* Quick Actions */}
                    <div className="flex gap-4 mt-6 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-700 delay-150">
                      {imageUrl && (
                        <button
                          onClick={(e) =>
                            openViewer(
                              0,
                              product.imageFileIds.map((id) =>
                                getProductImageUrl(id),
                              ),
                              e,
                            )
                          }
                          className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                          title="View Fullscreen"
                        >
                          <Maximize2 className="w-5 h-5" />
                        </button>
                      )}
                      <button className="px-6 py-2 bg-white text-black font-bold uppercase text-xs tracking-widest rounded-full hover:bg-stone-200 transition-colors">
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center text-stone-400">
            <p>No se encontraron productos.</p>
          </div>
        )}
      </main>

      <StoreFooter
        store={store}
        config={{
          bg: "bg-stone-900",
          text: "text-stone-400",
          border: "border-stone-800",
          muted: "text-stone-500",
          accent: "text-white",
        }}
      />

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-60 bg-stone-900/20 backdrop-blur-sm md:hidden"
            />

            {/* Menu Sidebar */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 z-60 w-[85%] bg-[#fafaf9] p-6 pt-24 shadow-2xl overflow-y-auto md:hidden"
            >
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="absolute top-8 right-8 p-2 border border-stone-200 rounded-full text-stone-900"
              >
                <X size={24} />
              </button>

              <div className="space-y-12">
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400 font-sans">
                      Búsqueda y Filtros
                    </h3>
                    <button
                      onClick={resetFilters}
                      className="text-[10px] font-bold uppercase tracking-widest text-stone-900"
                    >
                      Reiniciar
                    </button>
                  </div>
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
                  />
                </div>

                {store?.paymentLink && (
                  <div className="pt-8 border-t border-stone-100">
                    <a
                      href={store.paymentLink}
                      target="_blank"
                      className="w-full py-4 bg-stone-900 text-white rounded-full font-bold flex items-center justify-center gap-2"
                    >
                      <ExternalLink size={20} /> Checkout
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modals */}
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
        tone="gallery" // We can add a gallery tone to the modal or fallback
      />
    </div>
  );
}
