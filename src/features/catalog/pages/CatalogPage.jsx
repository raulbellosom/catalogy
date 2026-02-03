import {
  Store as StoreIcon,
  DollarSign,
  Image as ImageIcon,
  Loader2,
  ExternalLink,
  Clock,
} from "lucide-react";
import { useSubdomainContext } from "@/app/providers";
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
  const {
    slug: subdomainSlug,
    store: subdomainStore,
    user,
  } = useSubdomainContext();
  const slug = previewSlug || subdomainSlug;

  // Use store from context if on subdomain, otherwise fetch (for preview)
  const {
    data: previewStore,
    isLoading: loadingPreviewStore,
    error: storeError,
  } = useStoreBySlug(previewSlug ? previewSlug : null);

  const store = previewSlug ? previewStore : subdomainStore;
  const loadingStore = previewSlug ? loadingPreviewStore : false;

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
          <h1 className="text-2xl font-bold text-(--color-fg) mb-2">
            Catálogo no encontrado
          </h1>
          <p className="text-(--color-fg-secondary)">
            Esta tienda no existe o no está disponible públicamente.
          </p>
        </div>
      </div>
    );
  }

  // Security check: If not published and not the owner, don't show products
  // (AppRoutes should prevent this, but this is an extra layer)
  const isOwner = user?.$id === store.profileId;
  const isAvailable = store.published || isOwner || !!previewSlug;

  if (!isAvailable) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-(--color-warning-bg) rounded-full flex items-center justify-center mb-6">
          <Clock className="w-10 h-10 text-(--color-warning)" />
        </div>
        <h1 className="text-3xl font-bold text-(--color-fg) mb-2">
          Catálogo no disponible
        </h1>
        <p className="text-(--color-fg-secondary) mb-8 max-w-md">
          Este catálogo aún no ha sido publicado. Vuelve pronto para ver los
          productos.
        </p>
      </div>
    );
  }

  const logoUrl = store.logoFileId ? getStoreLogoUrl(store.logoFileId) : null;

  return (
    <div className="bg-[var(--color-bg)]">
      {/* Hero section for store info */}
      <div className="bg-(--color-card) border-b border-[var(--color-card-border)] py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={store.name}
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl object-cover shadow-lg"
              />
            ) : (
              <div className="w-24 h-24 sm:w-32 sm:h-32 bg-[var(--color-primary)]/10 rounded-3xl flex items-center justify-center">
                <StoreIcon className="w-12 h-12 text-[var(--color-primary)]" />
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold text-[var(--color-fg)] mb-3">
                {store.name}
              </h1>
              {store.description && (
                <p className="text-lg text-[var(--color-fg-secondary)] max-w-2xl">
                  {store.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Products */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 safe-bottom">
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
