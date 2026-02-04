import { useState } from "react";
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
        // Custom search mechanism for Gallery (Right aligned)
        actions={
          <div
            className={`flex items-center transition-all bg-stone-100 rounded-full px-4 overflow-hidden ${searchOpen ? "w-64" : "w-10"}`}
          >
            <Search
              className="w-4 h-4 text-stone-500 cursor-pointer shrink-0 my-3"
              onClick={() => setSearchOpen(!searchOpen)}
            />
            <input
              type="text"
              className={`bg-transparent border-none text-sm ml-2 focus:ring-0 w-full ${searchOpen ? "opacity-100" : "opacity-0"}`}
              placeholder="Search collection..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        }
      />

      {/* Intro / Description as a "Exhibition Card" */}
      {store?.description && (
        <div className="px-6 py-12 max-w-4xl mx-auto text-center">
          <p className="text-xl md:text-2xl font-light leading-relaxed italic text-stone-600">
            "{store.description}"
          </p>
          {store?.purchaseInstructions && (
            <div className="mt-8 flex justify-center">
              <span className="inline-flex items-center gap-2 px-6 py-2 border border-stone-300 rounded-full text-xs uppercase tracking-widest hover:bg-stone-900 hover:text-white transition-colors cursor-help group relative">
                <Info className="w-3 h-3" /> Information
                {/* Tooltip for instructions */}
                <div className="absolute top-full mt-4 left-1/2 -translate-x-1/2 w-72 bg-white p-4 shadow-xl rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all text-left text-normal normal-case z-50 text-stone-600">
                  {store.purchaseInstructions}
                </div>
              </span>
            </div>
          )}
        </div>
      )}

      {/* Filters Section */}
      <div className="px-6 pb-8 flex flex-col items-center gap-6">
        <button
          onClick={() => {
            // Simple toggle logic if I had state, but I don't have it exposed here yet.
            // I will use a ref or just simple state in the next step.
            // For now, I will render it always visible but styled minimally, OR better:
            // Just render it nicely centered.
          }}
          className="hidden" // Placeholder logic, I will implement proper state in next tool call.
        />

        {/* Reusing CatalogFilters but constrained width */}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-[400px]">
            {filteredProducts.map((product, i) => {
              const imageId = product.imageFileIds?.[0];
              const imageUrl = imageId ? getProductImageUrl(imageId) : null;

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
                    <p className="text-white/80 font-medium text-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75">
                      {formatPrice(product.price, product.currency)}
                    </p>

                    {/* Quick Actions */}
                    <div className="flex gap-4 mt-6 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-700 delay-100">
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
            <Grid className="w-16 h-16 mb-4 opacity-20" />
            <p>Collection empty.</p>
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
