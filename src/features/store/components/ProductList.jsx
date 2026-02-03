import { useState } from "react";
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
  Tag,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/shared/ui/atoms/Button";
import { ImageCarousel, ImageViewerModal } from "@/shared/ui/molecules";
import {
  getProductImageUrl,
  getProductImageUrls,
} from "@/shared/services/productService";

/**
 * Product List - Handles Grid and Table views
 */
export function ProductList({
  products,
  categories = [],
  viewMode = "grid", // 'grid' | 'table'
  onEdit,
  onDelete,
  onToggleStatus,
  onReorder,
  actionLoadingId = null, // ID of product currently being modified
  actionType = null, // 'delete' | 'toggle'
}) {
  if (!products || products.length === 0) {
    return <EmptyState />;
  }

  if (viewMode === "table") {
    return (
      <div className="bg-(--color-card) border border-(--color-card-border) rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-(--color-bg-secondary) border-b border-(--color-border)">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-(--color-fg-secondary) uppercase tracking-wider w-[80px]">
                  Imagen
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-(--color-fg-secondary) uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-(--color-fg-secondary) uppercase tracking-wider">
                  Precio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-(--color-fg-secondary) uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-(--color-fg-secondary) uppercase tracking-wider">
                  Categorías
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-(--color-fg-secondary) uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-(--color-fg-secondary) uppercase tracking-wider w-[100px]">
                  Orden
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-(--color-fg-secondary) uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--color-border)">
              {products.map((product, index) => (
                <ProductRow
                  key={product.$id}
                  product={product}
                  categories={categories}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onToggleStatus={onToggleStatus}
                  onReorder={onReorder}
                  isActionLoading={actionLoadingId === product.$id}
                  actionType={actionType}
                  isFirst={index === 0}
                  isLast={index === products.length - 1}
                  totalProducts={products.length}
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
            categories={categories}
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
  categories,
  onEdit,
  onDelete,
  onToggleStatus,
  onReorder,
  isActionLoading,
  actionType,
  isFirst,
  isLast,
  totalProducts,
}) {
  // Handle both new imageFileIds array and legacy imageFileId
  const imageUrls = Array.isArray(product.imageFileIds)
    ? getProductImageUrls(product.imageFileIds)
    : product.imageFileId
      ? [getProductImageUrl(product.imageFileId)]
      : [];

  const firstImageUrl = imageUrls[0] || null;

  const isToggling = isActionLoading && actionType === "toggle";
  const isDeleting = isActionLoading && actionType === "delete";

  // Image viewer state
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const handleImageClick = () => {
    if (imageUrls.length > 0) {
      setIsViewerOpen(true);
    }
  };

  return (
    <>
      <tr
        className={`hover:bg-(--color-bg-secondary) transition-colors ${!product.enabled ? "opacity-60 bg-(--color-bg-secondary)/30" : ""}`}
      >
        <td className="px-6 py-4 whitespace-nowrap">
          <button
            type="button"
            onClick={handleImageClick}
            className="w-12 h-12 rounded-lg bg-(--color-bg-tertiary) overflow-hidden flex items-center justify-center border border-(--color-border) hover:ring-2 hover:ring-(--color-primary) transition-all cursor-pointer"
            disabled={!firstImageUrl}
          >
            {firstImageUrl ? (
              <img
                src={firstImageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <ImageIcon className="w-6 h-6 text-(--color-fg-muted)" />
            )}
          </button>
        </td>
        <td className="px-6 py-4">
          <div className="text-sm font-medium text-(--color-fg)">
            {product.name}
          </div>
          {product.description && (
            <div className="text-xs text-(--color-fg-secondary) truncate max-w-[200px]">
              {product.description}
            </div>
          )}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm font-semibold text-(--color-fg)">
            ${product.price.toFixed(2)} {product.currency}
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center gap-1.5 text-sm text-(--color-fg-secondary)">
            <Package className="w-4 h-4" />
            <span>{product.stock || 0}</span>
          </div>
        </td>
        <td className="px-6 py-4">
          {product.categoryIds && product.categoryIds.length > 0 ? (
            <div className="flex flex-col gap-1 max-w-[200px]">
              {product.categoryIds.slice(0, 2).map((categoryId) => {
                const category = categories.find(
                  (cat) => cat.id === categoryId,
                );
                return category ? (
                  <span
                    key={categoryId}
                    className="inline-block px-2 py-1 bg-(--color-primary)/10 text-(--color-primary) rounded-full text-xs font-medium whitespace-nowrap"
                  >
                    {category.name}
                  </span>
                ) : null;
              })}
              {product.categoryIds.length > 2 && (
                <span className="inline-block px-2 py-1 bg-(--color-bg-secondary) text-(--color-fg-muted) rounded-full text-xs whitespace-nowrap">
                  +{product.categoryIds.length - 2}
                </span>
              )}
            </div>
          ) : (
            <span className="text-xs text-(--color-fg-muted)">
              Sin categorías
            </span>
          )}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <button
            type="button"
            onClick={() => onToggleStatus(product)}
            disabled={isToggling}
            className={`h-7 px-3 text-xs font-semibold rounded-full transition-all ${
              product.status
                ? "bg-emerald-500 text-white hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700"
                : "bg-slate-400 text-white hover:bg-slate-500 dark:bg-slate-600 dark:hover:bg-slate-700"
            } ${isToggling ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          >
            {product.status ? "Activo" : "Inactivo"}
          </button>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center justify-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onReorder(product, "up")}
              disabled={isFirst}
              title="Subir"
              className="h-9 w-9 p-0 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-(--color-bg-secondary)"
            >
              <ChevronUp className="w-6 h-6 text-(--color-fg-secondary)" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onReorder(product, "down")}
              disabled={isLast}
              title="Bajar"
              className="h-9 w-9 p-0 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-(--color-bg-secondary)"
            >
              <ChevronDown className="w-6 h-6 text-(--color-fg-secondary)" />
            </Button>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right">
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(product)}
              title="Editar"
              className="hover:bg-(--color-primary)/10"
            >
              <Edit className="w-4 h-4 text-(--color-primary)" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(product)}
              isLoading={isDeleting}
              title="Eliminar"
              className="text-(--color-error) hover:bg-(--color-error)/10"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </td>
      </tr>

      {/* Image Viewer Modal */}
      <ImageViewerModal
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        images={imageUrls}
        initialIndex={0}
        alt={product.name}
        showDownload={true}
      />
    </>
  );
}

function ProductCard({
  product,
  categories,
  index,
  onEdit,
  onDelete,
  onToggleStatus,
  isActionLoading,
  actionType,
}) {
  // Handle both new imageFileIds array and legacy imageFileId
  const imageUrls = Array.isArray(product.imageFileIds)
    ? getProductImageUrls(product.imageFileIds)
    : product.imageFileId
      ? [getProductImageUrl(product.imageFileId)]
      : [];

  const isToggling = isActionLoading && actionType === "toggle";
  const isDeleting = isActionLoading && actionType === "delete";

  // Image viewer state
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [viewerInitialIndex, setViewerInitialIndex] = useState(0);

  const handleImageClick = (currentIndex) => {
    if (imageUrls.length > 0) {
      setViewerInitialIndex(currentIndex);
      setIsViewerOpen(true);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        className={`bg-(--color-card) border border-(--color-card-border) rounded-2xl overflow-hidden hover:shadow-md transition-all group flex flex-col ${!product.status ? "opacity-60" : ""}`}
      >
        {/* Image */}
        <div className="aspect-square bg-(--color-bg-secondary) relative overflow-hidden">
          <ImageCarousel
            images={imageUrls}
            alt={product.name}
            className="w-full h-full"
            onImageClick={handleImageClick}
          />

          {/* Quick Actions Overlay */}
          <div className="absolute top-2 right-2 flex gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-300 z-10">
            <Button
              size="sm"
              variant="secondary"
              className="h-10 w-10 p-0 rounded-full shadow-lg bg-white/95 hover:bg-white dark:bg-gray-900/95 dark:hover:bg-gray-900 backdrop-blur-md border border-gray-200/50 dark:border-white/10"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(product);
              }}
            >
              <Edit className="w-5 h-5 text-(--color-primary)" />
            </Button>
          </div>

          {/* Status Badge */}
          {!product.status && (
            <div className="absolute top-2 left-2 px-2.5 py-1 bg-slate-900/70 dark:bg-slate-900/80 backdrop-blur-sm text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 z-10">
              <EyeOff className="w-3 h-3" /> Inactivo
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 flex-1 flex flex-col">
          <div className="flex justify-between items-start mb-2 gap-2">
            <h3
              className="font-semibold text-(--color-fg) truncate flex-1"
              title={product.name}
            >
              {product.name}
            </h3>
          </div>

          <div className="flex items-center gap-1 mb-2">
            <DollarSign className="w-4 h-4 text-(--color-fg-secondary)" />
            <span className="text-xl font-bold text-(--color-primary)">
              {product.price.toLocaleString("es-MX", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
            <span className="text-xs text-(--color-fg-secondary) font-medium mt-1">
              {product.currency || "MXN"}
            </span>
          </div>

          <div className="flex items-center gap-2 mb-4 text-sm text-(--color-fg-secondary)">
            <Package className="w-4 h-4" />
            <span>
              Stock: <b>{product.stock || 0}</b>
            </span>
          </div>

          {product.description && (
            <p className="text-sm text-(--color-fg-secondary) line-clamp-2 mb-4 flex-1">
              {product.description}
            </p>
          )}

          {/* Categories */}
          {product.categoryIds && product.categoryIds.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-1 mb-2">
                <Tag className="w-3 h-3 text-(--color-fg-muted)" />
                <span className="text-xs font-medium text-(--color-fg-muted) uppercase tracking-wide">
                  Categorías
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {product.categoryIds.slice(0, 3).map((categoryId) => {
                  const category = categories.find(
                    (cat) => cat.id === categoryId,
                  );
                  return category ? (
                    <span
                      key={categoryId}
                      className="inline-block px-2 py-1 bg-(--color-primary)/10 text-(--color-primary) rounded-full text-xs font-medium"
                    >
                      {category.name}
                    </span>
                  ) : null;
                })}
                {product.categoryIds.length > 3 && (
                  <span className="inline-block px-2 py-1 bg-(--color-bg-secondary) text-(--color-fg-muted) rounded-full text-xs">
                    +{product.categoryIds.length - 3}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-(--color-border) flex items-center justify-between gap-2 mt-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleStatus(product)}
              isLoading={isToggling}
              className={`${
                product.status
                  ? "text-(--color-fg-secondary) hover:text-(--color-fg) hover:bg-(--color-bg-secondary)"
                  : "text-(--color-primary) hover:bg-(--color-primary)/10"
              }`}
            >
              {product.status ? (
                <EyeOff className="w-4 h-4 mr-2" />
              ) : (
                <Eye className="w-4 h-4 mr-2" />
              )}
              {product.status ? "Desactivar" : "Activar"}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(product)}
              isLoading={isDeleting}
              className="text-(--color-error) hover:bg-(--color-error)/10"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Image Viewer Modal */}
      <ImageViewerModal
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        images={imageUrls}
        initialIndex={viewerInitialIndex}
        alt={product.name}
        showDownload={true}
      />
    </>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 bg-(--color-card) border border-(--color-card-border) rounded-2xl border-dashed">
      <div className="w-16 h-16 bg-(--color-bg-tertiary) rounded-full flex items-center justify-center mb-4">
        <Package className="w-8 h-8 text-(--color-fg-secondary)" />
      </div>
      <h3 className="text-lg font-semibold text-(--color-fg) mb-1">
        No hay productos
      </h3>
      <p className="text-(--color-fg-secondary) text-center text-sm mb-0">
        Agrega productos para comenzar a vender.
      </p>
    </div>
  );
}
