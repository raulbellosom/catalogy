import {
  Store as StoreIcon,
  DollarSign,
  Image as ImageIcon,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { useSubdomain } from "@/shared/hooks";
import { useStoreBySlug, useProducts } from "@/shared/hooks";
import { getStoreLogoUrl } from "@/shared/services/storeService";
import { getProductImageUrl } from "@/shared/services/productService";
import { ThemeToggle } from "@/shared/ui/molecules/ThemeToggle";
import { motion } from "motion/react";

/**
 * Public catalog page
 * Renders store catalog for public viewing via subdomain
 */
export function CatalogPage({ previewSlug }) {
  const subdomain = useSubdomain();
  const slug = previewSlug || subdomain;

  // Fetch store by slug (subdomain)
  const {
    data: store,
    isLoading: loadingStore,
    error: storeError,
  } = useStoreBySlug(slug);

  // Fetch products if store exists
  const { data: productsData, isLoading: loadingProducts } = useProducts(
    store?.$id,
  );

  const products = productsData?.documents || [];

  if (loadingStore) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
        <Loader2 className="w-8 h-8 text-[var(--color-primary)] animate-spin" />
      </div>
    );
  }

  if (storeError || !store) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-[var(--color-error-bg)] rounded-full flex items-center justify-center mx-auto mb-4">
            <StoreIcon className="w-8 h-8 text-[var(--color-error)]" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-fg)] mb-2">
            Catálogo no encontrado
          </h1>
          <p className="text-[var(--color-fg-secondary)]">
            Esta tienda no existe o no está disponible públicamente.
          </p>
        </div>
      </div>
    );
  }

  const logoUrl = store.logoFileId ? getStoreLogoUrl(store.logoFileId) : null;

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Header */}
      <header className="bg-[var(--color-card)]/90 backdrop-blur-md border-b border-[var(--color-card-border)] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={store.name}
                  className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[var(--color-primary)]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <StoreIcon className="w-6 h-6 sm:w-8 sm:h-8 text-[var(--color-primary)]" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-2xl font-bold text-[var(--color-fg)] truncate">
                  {store.name}
                </h1>
                {store.description && (
                  <p className="text-sm sm:text-base text-[var(--color-fg-secondary)] mt-1 line-clamp-1 sm:line-clamp-2">
                    {store.description}
                  </p>
                )}
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Products */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 safe-bottom">
        {loadingProducts ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-[var(--color-primary)] animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <EmptyProducts />
        ) : (
          <ProductsGrid products={products} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[var(--color-card)] border-t border-[var(--color-card-border)] mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-[var(--color-fg-secondary)]">
            Powered by{" "}
            <a
              href="https://catalogy.racoondevs.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-primary)] hover:underline inline-flex items-center gap-1"
            >
              Catalogy
              <ExternalLink className="w-3 h-3" />
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

/**
 * Empty products state
 */
function EmptyProducts() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      <div className="w-20 h-20 bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center mb-6">
        <StoreIcon className="w-10 h-10 text-[var(--color-primary)]" />
      </div>
      <h2 className="text-xl font-semibold text-[var(--color-fg)] mb-2">
        Sin productos disponibles
      </h2>
      <p className="text-[var(--color-fg-secondary)] text-center max-w-md">
        Esta tienda aún no tiene productos en su catálogo.
      </p>
    </motion.div>
  );
}

/**
 * Products grid
 */
function ProductsGrid({ products }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product, index) => (
        <ProductCard key={product.$id} product={product} index={index} />
      ))}
    </div>
  );
}

/**
 * Product card
 */
function ProductCard({ product, index }) {
  const imageUrl = product.imageFileId
    ? getProductImageUrl(product.imageFileId)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="bg-[var(--color-card)] border border-[var(--color-card-border)] rounded-2xl overflow-hidden hover:border-[var(--color-primary)] hover:shadow-lg transition-all"
    >
      {/* Image */}
      <div className="aspect-square bg-[var(--color-bg-secondary)] flex items-center justify-center">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <ImageIcon className="w-16 h-16 text-[var(--color-fg-muted)]" />
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-[var(--color-fg)] mb-2 line-clamp-2 min-h-[3rem]">
          {product.name}
        </h3>

        {/* Price */}
        <div className="flex items-center gap-1 mb-3">
          <DollarSign className="w-5 h-5 text-[var(--color-fg-secondary)]" />
          <span className="text-2xl font-bold text-[var(--color-primary)]">
            {product.price.toLocaleString("es-MX", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
          <span className="text-sm text-[var(--color-fg-secondary)]">
            {product.currency || "MXN"}
          </span>
        </div>

        {/* Description */}
        {product.description && (
          <p className="text-sm text-[var(--color-fg-secondary)] line-clamp-3">
            {product.description}
          </p>
        )}
      </div>
    </motion.div>
  );
}
