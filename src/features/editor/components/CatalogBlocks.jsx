/**
 * Puck Editor - Bloques funcionales de Catalogo
 *
 * Solo bloques esenciales para construir el catalogo:
 * header de tienda y catalogo de productos.
 */

import { ImageOff } from "lucide-react";
import { StoreHeader } from "@/templates/components";
import { getProductImageUrl } from "@/shared/services/productService";

const FALLBACK_STORE = {
  name: "Nombre de la tienda",
  description: "Descripcion breve de ejemplo",
};

const FALLBACK_PRODUCTS = [
  {
    $id: "1",
    name: "Producto ejemplo",
    price: 99.99,
    description: "Descripcion corta del producto",
    currency: "MXN",
  },
  {
    $id: "2",
    name: "Otro producto",
    price: 149.99,
    description: "Descripcion simple",
    currency: "MXN",
  },
  {
    $id: "3",
    name: "Tercer producto",
    price: 199.99,
    description: "Descripcion neutral",
    currency: "MXN",
  },
];

const formatPrice = (price, currency = "MXN") => {
  if (typeof price !== "number") return "";
  return price.toLocaleString("es-MX", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const ProductCard = ({ product }) => {
  // Handle both new imageFileIds array and legacy imageFileId
  const firstImageId =
    Array.isArray(product.imageFileIds) && product.imageFileIds.length > 0
      ? product.imageFileIds[0]
      : product.imageFileId;
  const imageUrl = firstImageId ? getProductImageUrl(firstImageId) : null;

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
      <div className="aspect-square bg-[var(--muted)] flex items-center justify-center">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <ImageOff className="w-10 h-10 text-[var(--muted-foreground)]" />
        )}
      </div>
      <div className="p-3 space-y-1.5">
        <h3 className="text-sm font-semibold text-[var(--foreground)] line-clamp-2">
          {product.name}
        </h3>
        {product.description && (
          <p className="text-xs text-[var(--muted-foreground)] line-clamp-2">
            {product.description}
          </p>
        )}
        <div className="text-sm font-semibold text-[var(--foreground)]">
          {formatPrice(product.price, product.currency)}
        </div>
      </div>
    </div>
  );
};

/**
 * StoreHeaderBlock
 * Renderiza el header con datos reales de la tienda
 */
export const StoreHeaderBlock = {
  label: "Header de Tienda",
  fields: {},
  defaultProps: {},
  render: ({ puck }) => {
    const store = puck.appState?.data?.root?.props?.store || FALLBACK_STORE;
    return (
      <StoreHeader store={store} variant="minimal" showDescription={true} />
    );
  },
};

/**
 * ProductCatalogBlock
 * Renderiza un catalogo simple y neutral con grid responsivo
 */
export const ProductCatalogBlock = {
  label: "Catalogo de Productos",
  fields: {},
  defaultProps: {},
  render: ({ puck }) => {
    let products = puck.appState?.data?.root?.props?.products || [];
    if (!products.length) {
      products = FALLBACK_PRODUCTS;
    }

    return (
      <section className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <ProductCard key={product.$id} product={product} />
          ))}
        </div>
      </section>
    );
  },
};
