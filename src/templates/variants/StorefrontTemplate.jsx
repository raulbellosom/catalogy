/**
 * StorefrontTemplate
 *
 * Template JSX-only con header prominente y catalogo destacado.
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
export function StorefrontTemplate({ store, products }) {
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
      <StoreHeader store={store} variant="banner" showDescription={true} />

      <main className="container mx-auto px-4 py-12 space-y-10">
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
        <section className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-[var(--foreground)] mb-2">
            Productos destacados
          </h2>
          <p className="text-sm text-[var(--muted-foreground)] mb-6">
            Descubre lo mas nuevo de {store?.name}
          </p>
          <ProductGrid
            products={filteredProducts}
            variant="wide"
            showDescription={true}
            onShare={handleShare}
            sharedProductId={sharedProductId}
            emptyMessage="No hay productos que coincidan con los filtros."
          />
        </section>
        <StorePurchaseInfo store={store} />
      </main>

      <StoreFooter store={store} variant="prominent" />
    </div>
  );
}
