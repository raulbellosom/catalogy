import { useState } from "react";
import {
  Search,
  ShoppingCart,
  Menu,
  X,
  ChevronDown,
  Facebook,
  Instagram,
  Twitter,
  Filter,
  Check,
  Star,
  ExternalLink,
  Info,
} from "lucide-react";
import { getStoreLogoUrl } from "@/shared/services/storeService";
import { getProductImageUrl } from "@/shared/services/productService";
import { ProductDetailModal, StoreNavbar, StoreFooter } from "../components";
import { ImageViewerModal } from "@/shared/ui/molecules/ImageViewerModal";
import { useCatalogFilters, useProductShare } from "../components/catalogHooks";
import { Logo } from "@/shared/ui/atoms/Logo";
import { appConfig } from "@/shared/lib/env";

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
  return map[id] || "'Roboto', sans-serif"; // Default to Roboto for standard ecommerce feel
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

export function StorefrontTemplate({ store, products, isPreview = false }) {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const settings = resolveSettings(store?.settings);
  const fontFamily = resolveFontFamily(settings);
  const primary = settings?.colors?.primary || "#3b82f6"; // Standard Blue default
  const secondary = settings?.colors?.secondary || "#eff6ff";
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
      className="min-h-screen flex flex-col bg-slate-50 text-slate-900"
      style={{
        fontFamily,
        "--store-primary": primary,
        "--store-secondary": secondary,
      }}
    >
      <StoreNavbar
        store={store}
        isPreview={isPreview}
        config={{
          bg: "bg-white",
          text: "text-slate-900",
          border: "border-slate-200",
          accent: "text-(--store-primary)",
        }}
        search={{
          query: searchQuery,
          onQueryChange: setSearchQuery,
        }}
        onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
        actions={
          store?.paymentLink && (
            <a
              href={store.paymentLink}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-2 text-sm font-medium text-(--store-primary) hover:text-slate-900 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Quick Pay link
            </a>
          )
        }
      />

      {/* Mobile Menu Overlay could go here if managed by template, or inside Navbar if robust. 
          For now, keeping the mobile menu logic of StorefrontTemplate might be needed or we rely on Navbar not having one?
          StoreNavbar doesn't have a built-in menu drawer. 
          We need to render it here if open. */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-white p-4 pt-20">
          {/* Simple Mobile Menu Content */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="absolute top-4 right-4 p-2 text-slate-500"
          >
            <X size={24} />
          </button>
          <div className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Search..."
              className="w-full border border-slate-300 rounded-lg py-2 px-4"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {store?.paymentLink && (
              <a
                href={store.paymentLink}
                target="_blank"
                className="flex items-center gap-2 text-lg font-medium text-(--store-primary)"
              >
                <ExternalLink className="w-5 h-5" />
                Quick Pay link
              </a>
            )}
          </div>
        </div>
      )}

      {/* Hero / Banner Area */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-8 md:py-12 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 space-y-4">
            <span className="inline-block px-3 py-1 bg-(--store-secondary) text-(--store-primary) text-xs font-bold uppercase tracking-wider rounded-full">
              Official Store
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 leading-tight">
              {store?.description
                ? "Discover Quality & Style"
                : "Best Products for You"}
            </h2>
            <p className="text-lg text-slate-600 max-w-xl">
              {store?.description ||
                "Browse our selected collection of premium items available directly from us."}
            </p>
            {store?.paymentLink && (
              <div className="pt-4">
                <a
                  href={store.paymentLink}
                  className="inline-flex justify-center items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-(--store-primary) hover:bg-slate-900 transition-colors shadow-lg"
                >
                  Pay / Checkout Now
                </a>
              </div>
            )}
          </div>
          {/* Decorative placeholder right side if no banner image */}
          <div className="flex-1 flex justify-center md:justify-end">
            <div className="w-full max-w-md aspect-video bg-slate-100 rounded-2xl flex items-center justify-center border-2 border-dashed border-slate-300">
              <span className="text-slate-400 font-medium">
                Featured Collection
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout Area */}
      <main
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 w-full flex flex-col md:flex-row gap-8 ${isPreview ? "pt-32" : "pt-24"}`}
      >
        {/* Sidebar Controls (Desktop) */}
        <aside className="hidden md:block w-64 shrink-0 space-y-8">
          {/* Categories Widget */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5">
            <h3 className="font-bold text-slate-900 text-lg mb-4 border-b border-slate-100 pb-2">
              Categories
            </h3>
            <ul className="space-y-2.5">
              <li>
                <button
                  onClick={() =>
                    activeCategoryIds.length > 0 &&
                    toggleCategory(activeCategoryIds[0])
                  } // Reset hack for single-select mostly
                  className={`flex items-center w-full text-sm ${activeCategoryIds.length === 0 ? "text-(--store-primary) font-bold" : "text-slate-600 hover:text-slate-900"}`}
                >
                  <span
                    className={`w-2 h-2 rounded-full mr-2 ${activeCategoryIds.length === 0 ? "bg-(--store-primary)" : "bg-transparent border border-slate-300"}`}
                  ></span>
                  All Products
                </button>
              </li>
              {categories.map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => toggleCategory(cat.id)}
                    className={`flex items-center w-full text-left text-sm transition-colors ${activeCategoryIds.includes(cat.id) ? "text-(--store-primary) font-bold" : "text-slate-600 hover:text-slate-900"}`}
                  >
                    {/* Fake Checkbox/Radio styling */}
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center mr-2 ${activeCategoryIds.includes(cat.id) ? "bg-(--store-primary) border-(--store-primary)" : "border-slate-300"}`}
                    >
                      {activeCategoryIds.includes(cat.id) && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Price Widget */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5">
            <h3 className="font-bold text-slate-900 text-lg mb-4 border-b border-slate-100 pb-2">
              Price Range
            </h3>
            <div className="flex items-center justify-between text-sm text-slate-600 mb-4">
              <span>{formatPrice(minPrice)}</span>
              <span>{formatPrice(maxPrice)}</span>
            </div>
            {/* Visual Bar placeholder */}
            <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-(--store-primary) w-full opacity-50"></div>
            </div>
          </div>

          {/* Purchase Info Widget */}
          {store?.purchaseInstructions && (
            <div className="bg-(--store-secondary) rounded-lg p-5 border border-(--store-primary)/20">
              <h4 className="flex items-center gap-2 text-(--store-primary) font-bold text-sm mb-2">
                <Info className="w-4 h-4" /> Store Info
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed">
                {store.purchaseInstructions}
              </p>
            </div>
          )}
        </aside>

        {/* Mobile Filter Toggle */}
        <div className="md:hidden w-full">
          <button
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            className="w-full flex items-center justify-center gap-2 bg-white border border-slate-300 py-3 rounded-lg font-medium text-slate-700 shadow-sm"
          >
            <Filter className="w-4 h-4" />
            {mobileFiltersOpen ? "Hide Filters" : "Show Filters"}
          </button>

          {mobileFiltersOpen && (
            <div className="mt-4 bg-white p-4 rounded-lg shadow-lg border border-slate-200 space-y-6 animate-in slide-in-from-top-2">
              {/* Mobile version of sidebar content */}
              <div>
                <h4 className="font-bold mb-2">Categories</h4>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => toggleCategory(cat.id)}
                      className={`px-3 py-1 rounded-full text-sm border ${activeCategoryIds.includes(cat.id) ? "bg-(--store-primary) text-white border-(--store-primary)" : "bg-white text-slate-600 border-slate-300"}`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Product Results */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">Products</h2>
            <span className="text-sm text-slate-500">
              {filteredProducts?.length || 0} results
            </span>
          </div>

          {filteredProducts && filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => {
                const imageId = product.imageFileIds?.[0];
                const imageUrl = imageId ? getProductImageUrl(imageId) : null;

                return (
                  <div
                    key={product.id || product.$id}
                    onClick={() => setSelectedProduct(product)}
                    className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col overflow-hidden"
                  >
                    {/* Image */}
                    <div className="relative aspect-square bg-slate-100 overflow-hidden">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <ShoppingCart className="w-10 h-10 opacity-20" />
                        </div>
                      )}
                      {/* Badge? */}
                      {product.price < 500 && (
                        <span className="absolute top-2 left-2 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded">
                          DEAL
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4 flex flex-col flex-1">
                      <div className="mb-1 text-xs text-slate-400 font-medium uppercase tracking-wide">
                        Generic
                      </div>
                      <h3 className="text-slate-900 font-semibold text-lg leading-tight mb-2 group-hover:text-(--store-primary) transition-colors line-clamp-2">
                        {product.name}
                      </h3>
                      <div className="mt-auto pt-4 flex items-center justify-between">
                        <span className="text-lg font-bold text-slate-900">
                          {formatPrice(product.price, product.currency)}
                        </span>
                        <button className="p-2 rounded-full bg-slate-100 text-slate-600 group-hover:bg-(--store-primary) group-hover:text-white transition-colors">
                          <ShoppingCart className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center text-slate-500">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 mb-4">
                <Search className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-medium text-slate-900">
                No products found
              </h3>
              <p>
                Try adjusting your search or filter to find what you're looking
                for.
              </p>
            </div>
          )}
        </div>
      </main>

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
        tone="storefront"
      />
    </div>
  );
}
