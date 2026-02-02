import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Plus,
  Package,
  Edit,
  Trash2,
  Loader2,
  DollarSign,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/shared/ui/atoms/Button";
import { useUserStore, useProducts, useDeleteProduct } from "@/shared/hooks";
import { getProductImageUrl } from "@/shared/services/productService";
import { motion, AnimatePresence } from "motion/react";

/**
 * Products list page
 */
export function ProductsPage() {
  const navigate = useNavigate();
  const { data: store, isLoading: loadingStore } = useUserStore();
  const { data: productsData, isLoading: loadingProducts } = useProducts(
    store?.$id,
  );
  const deleteProduct = useDeleteProduct(store?.$id);

  const [deletingId, setDeletingId] = useState(null);

  const products = productsData?.documents || [];

  const handleDelete = async (productId) => {
    if (!confirm("¿Estás seguro de eliminar este producto?")) return;

    try {
      setDeletingId(productId);
      await deleteProduct.mutateAsync(productId);
    } catch (err) {
      console.error("Delete error:", err);
      alert("Error al eliminar el producto");
    } finally {
      setDeletingId(null);
    }
  };

  if (loadingStore || loadingProducts) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-[var(--color-primary)] animate-spin" />
      </div>
    );
  }

  if (!store) {
    return (
      <div className="text-center py-12">
        <p className="text-[var(--color-fg-secondary)] mb-4">
          Primero debes configurar tu tienda
        </p>
        <Button onClick={() => navigate("/app/store")}>Ir a Mi tienda</Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-fg)]">
            Productos
          </h1>
          <p className="text-[var(--color-fg-secondary)]">
            Gestiona los productos de tu catálogo
          </p>
        </div>
        <Link to="/app/products/new">
          <Button>
            <Plus className="w-5 h-5 mr-2" />
            Agregar producto
          </Button>
        </Link>
      </div>

      {products.length === 0 ? (
        <EmptyState />
      ) : (
        <ProductGrid
          products={products}
          onDelete={handleDelete}
          deletingId={deletingId}
        />
      )}
    </div>
  );
}

/**
 * Empty state when no products
 */
function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      <div className="w-20 h-20 bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center mb-6">
        <Package className="w-10 h-10 text-[var(--color-primary)]" />
      </div>
      <h2 className="text-xl font-semibold text-[var(--color-fg)] mb-2">
        Sin productos aún
      </h2>
      <p className="text-[var(--color-fg-secondary)] text-center mb-6 max-w-md">
        Agrega tu primer producto para empezar a construir tu catálogo
      </p>
      <Link to="/app/products/new">
        <Button>
          <Plus className="w-5 h-5 mr-2" />
          Agregar primer producto
        </Button>
      </Link>
    </motion.div>
  );
}

/**
 * Product grid
 */
function ProductGrid({ products, onDelete, deletingId }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <AnimatePresence>
        {products.map((product, index) => (
          <ProductCard
            key={product.$id}
            product={product}
            index={index}
            onDelete={onDelete}
            isDeleting={deletingId === product.$id}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

/**
 * Product card
 */
function ProductCard({ product, index, onDelete, isDeleting }) {
  const navigate = useNavigate();
  const imageUrl = product.imageFileId
    ? getProductImageUrl(product.imageFileId)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="bg-[var(--color-card)] border border-[var(--color-card-border)] rounded-2xl overflow-hidden hover:border-[var(--color-primary)] transition-colors group"
    >
      {/* Image */}
      <div
        className="aspect-square bg-[var(--color-bg-secondary)] flex items-center justify-center cursor-pointer"
        onClick={() => navigate(`/app/products/${product.$id}`)}
      >
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
        <h3
          className="font-semibold text-[var(--color-fg)] mb-1 truncate cursor-pointer"
          onClick={() => navigate(`/app/products/${product.$id}`)}
        >
          {product.name}
        </h3>

        <div className="flex items-center gap-1 mb-3">
          <DollarSign className="w-4 h-4 text-[var(--color-fg-secondary)]" />
          <span className="text-lg font-bold text-[var(--color-primary)]">
            {product.price.toLocaleString("es-MX", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
          <span className="text-sm text-[var(--color-fg-secondary)]">
            {product.currency || "MXN"}
          </span>
        </div>

        {product.description && (
          <p className="text-sm text-[var(--color-fg-secondary)] line-clamp-2 mb-4">
            {product.description}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => navigate(`/app/products/${product.$id}`)}
          >
            <Edit className="w-4 h-4 mr-1" />
            Editar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(product.$id)}
            isLoading={isDeleting}
            className="text-[var(--color-error)] hover:bg-[var(--color-error-bg)]"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
