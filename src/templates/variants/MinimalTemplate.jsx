/**
 * MinimalTemplate
 *
 * Template JSX-only, rapido y limpio.
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
export function MinimalTemplate({ store, products }) {
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
      <StoreHeader store={store} variant="minimal" showDescription={true} />

      <main className="container mx-auto px-4 py-10 space-y-8">
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
          variant="standard"
          showDescription={true}
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
