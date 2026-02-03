/**
 * GalleryTemplate
 *
 * Template JSX-only con enfoque visual en productos.
 */

import {
  StoreHeader,
  ProductGrid,
  StoreFooter,
  CatalogControls,
  StorePurchaseInfo,
} from "../components";
import { useCatalogFilters, useProductShare } from "../components/catalogHooks";

/**
 * @param {Object} props
 * @param {Object} props.store
 * @param {Array} props.products
 */
export function GalleryTemplate({ store, products }) {
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
  const { handleShare, sharedProductId } = useProductShare();

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <StoreHeader store={store} variant="hero" showDescription={true} />

      <main className="container mx-auto px-4 py-12 space-y-8">
        <CatalogControls
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
        />
        <ProductGrid
          products={filteredProducts}
          variant="compact"
          showDescription={false}
          onShare={handleShare}
          sharedProductId={sharedProductId}
          emptyMessage="No hay productos que coincidan con los filtros."
        />
        <StorePurchaseInfo store={store} />
      </main>

      <StoreFooter store={store} variant="simple" />
    </div>
  );
}
