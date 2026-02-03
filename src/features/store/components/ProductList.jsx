import { motion, AnimatePresence } from "motion/react";
import {
  Edit,
  Trash2,
  DollarSign,
  Image as ImageIcon,
  MoreVertical,
  Eye,
  EyeOff,
  Package,
} from "lucide-react";
import { Button } from "@/shared/ui/atoms/Button";
import { getProductImageUrl } from "@/shared/services/productService";

/**
 * Product List - Handles Grid and Table views
 */
export function ProductList({
  products,
  viewMode = "grid", // 'grid' | 'table'
  onEdit,
  onDelete,
  onToggleStatus,
  actionLoadingId = null, // ID of product currently being modified
  actionType = null, // 'delete' | 'toggle'
}) {
  if (!products || products.length === 0) {
    return <EmptyState />;
  }

  if (viewMode === "table") {
    return (
      <div className="bg-[var(--color-card)] border border-[var(--color-card-border)] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-fg-secondary)] uppercase tracking-wider w-[80px]">
                  Imagen
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-fg-secondary)] uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-fg-secondary)] uppercase tracking-wider">
                  Precio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-fg-secondary)] uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-fg-secondary)] uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-[var(--color-fg-secondary)] uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {products.map((product) => (
                <ProductRow
                  key={product.$id}
                  product={product}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onToggleStatus={onToggleStatus}
                  isActionLoading={actionLoadingId === product.$id}
                  actionType={actionType}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Grid View
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <AnimatePresence>
        {products.map((product, index) => (
          <ProductCard
            key={product.$id}
            product={product}
            index={index}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleStatus={onToggleStatus}
            isActionLoading={actionLoadingId === product.$id}
            actionType={actionType}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ProductRow({
  product,
  onEdit,
  onDelete,
  onToggleStatus,
  isActionLoading,
  actionType,
}) {
  const imageUrl = product.imageFileId
    ? getProductImageUrl(product.imageFileId)
    : null;

  const isToggling = isActionLoading && actionType === "toggle";
  const isDeleting = isActionLoading && actionType === "delete";

  return (
    <tr
      className={`hover:bg-[var(--color-bg-secondary)] transition-colors ${!product.enabled ? "opacity-60 bg-[var(--color-bg-secondary)]/30" : ""}`}
    >
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="w-12 h-12 rounded-lg bg-[var(--color-bg-tertiary)] overflow-hidden flex items-center justify-center border border-[var(--color-border)]">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <ImageIcon className="w-6 h-6 text-[var(--color-fg-muted)]" />
          )}
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm font-medium text-[var(--color-fg)]">
          {product.name}
        </div>
        {product.description && (
          <div className="text-xs text-[var(--color-fg-secondary)] truncate max-w-[200px]">
            {product.description}
          </div>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-semibold text-[var(--color-fg)]">
          ${product.price.toFixed(2)} {product.currency}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-1.5 text-sm text-[var(--color-fg-secondary)]">
          <Package className="w-4 h-4" />
          <span>{product.stock || 0}</span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onToggleStatus(product)}
          isLoading={isToggling}
          className={`h-7 px-2 text-xs rounded-full border ${
            product.enabled
              ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800"
              : "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800"
          }`}
        >
          {product.enabled ? "Activo" : "Oculto"}
        </Button>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(product)}
            title="Editar"
          >
            <Edit className="w-4 h-4 text-[var(--color-primary)]" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(product)}
            isLoading={isDeleting}
            title="Eliminar"
            className="text-[var(--color-error)] hover:bg-[var(--color-error-bg)]"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
}

function ProductCard({
  product,
  index,
  onEdit,
  onDelete,
  onToggleStatus,
  isActionLoading,
  actionType,
}) {
  const imageUrl = product.imageFileId
    ? getProductImageUrl(product.imageFileId)
    : null;

  const isToggling = isActionLoading && actionType === "toggle";
  const isDeleting = isActionLoading && actionType === "delete";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={`bg-[var(--color-card)] border border-[var(--color-card-border)] rounded-2xl overflow-hidden hover:shadow-md transition-all group flex flex-col ${!product.enabled ? "opacity-75 grayscale-[0.5]" : ""}`}
    >
      {/* Image */}
      <div className="aspect-square bg-[var(--color-bg-secondary)] relative overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="w-16 h-16 text-[var(--color-fg-muted)]" />
          </div>
        )}

        {/* Quick Actions Overlay */}
        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="sm"
            variant="secondary"
            className="h-8 w-8 p-0 rounded-full shadow-lg"
            onClick={() => onEdit(product)}
          >
            <Edit className="w-4 h-4" />
          </Button>
        </div>

        {/* Status Badge */}
        {!product.enabled && (
          <div className="absolute top-2 left-2 px-2 py-1 bg-black/50 backdrop-blur-sm text-white text-xs font-bold rounded-md flex items-center gap-1">
            <EyeOff className="w-3 h-3" /> Oculto
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2 gap-2">
          <h3
            className="font-semibold text-[var(--color-fg)] truncate flex-1"
            title={product.name}
          >
            {product.name}
          </h3>
        </div>

        <div className="flex items-center gap-1 mb-2">
          <DollarSign className="w-4 h-4 text-[var(--color-fg-secondary)]" />
          <span className="text-xl font-bold text-[var(--color-primary)]">
            {product.price.toLocaleString("es-MX", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
          <span className="text-xs text-[var(--color-fg-secondary)] font-medium mt-1">
            {product.currency || "MXN"}
          </span>
        </div>

        <div className="flex items-center gap-2 mb-4 text-sm text-[var(--color-fg-secondary)]">
          <Package className="w-4 h-4" />
          <span>
            Stock: <b>{product.stock || 0}</b>
          </span>
        </div>

        {product.description && (
          <p className="text-sm text-[var(--color-fg-secondary)] line-clamp-2 mb-4 flex-1">
            {product.description}
          </p>
        )}

        {/* Footer Actions */}
        <div className="pt-4 border-t border-[var(--color-border)] flex items-center justify-between gap-2 mt-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleStatus(product)}
            isLoading={isToggling}
            className={
              product.enabled
                ? "text-[var(--color-fg-secondary)] hover:text-[var(--color-fg)]"
                : "text-[var(--color-primary)]"
            }
          >
            {product.enabled ? (
              <EyeOff className="w-4 h-4 mr-2" />
            ) : (
              <Eye className="w-4 h-4 mr-2" />
            )}
            {product.enabled ? "Ocultar" : "Mostrar"}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(product)}
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

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 bg-[var(--color-card)] border border-[var(--color-card-border)] rounded-2xl border-dashed">
      <div className="w-16 h-16 bg-[var(--color-bg-tertiary)] rounded-full flex items-center justify-center mb-4">
        <Package className="w-8 h-8 text-[var(--color-fg-secondary)]" />
      </div>
      <h3 className="text-lg font-semibold text-[var(--color-fg)] mb-1">
        No hay productos
      </h3>
      <p className="text-[var(--color-fg-secondary)] text-center text-sm mb-0">
        Agrega productos para comenzar a vender.
      </p>
    </div>
  );
}
