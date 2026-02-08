import { useState, useMemo } from "react";
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
  GripVertical,
  Star,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
  KeyboardSensor,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  rectSortingStrategy,
  useSortable,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  restrictToVerticalAxis,
  restrictToWindowEdges,
} from "@dnd-kit/modifiers";

import { Button } from "@/shared/ui/atoms/Button";
import { ImageCarousel, ImageViewerModal } from "@/shared/ui/molecules";
import {
  getProductImageUrl,
  getProductImageUrls,
} from "@/shared/services/productService";

/**
 * Product List - Handles Grid and Table views using @dnd-kit
 */
export function ProductList({
  products,
  categories = [],
  viewMode = "grid", // 'grid' | 'table'
  onEdit,
  onDelete,
  onToggleStatus,
  onReorder, // For arrows
  onReorderList, // For DND (UI update)
  onReorderEnd, // For DND (Backend sync)
  actionLoadingId = null,
  actionType = null,
  featuredProductIds = [],
  onToggleFeatured,
  dndIdSuffix = "",
}) {
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const productIds = useMemo(
    () => products.map((p) => p.$id + dndIdSuffix),
    [products, dndIdSuffix],
  );

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = productIds.indexOf(active.id);
      const newIndex = productIds.indexOf(over.id);

      const newOrderedList = arrayMove(products, oldIndex, newIndex);
      onReorderList(newOrderedList); // Immediate UI update
      onReorderEnd(newOrderedList); // Backend sync
    }
    setActiveId(null);
  };

  if (!products || products.length === 0) {
    return <EmptyState />;
  }

  const activeProduct = activeId
    ? products.find((p) => p.$id + dndIdSuffix === activeId)
    : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      modifiers={
        viewMode === "table"
          ? [restrictToVerticalAxis, restrictToWindowEdges]
          : [restrictToWindowEdges]
      }
    >
      {viewMode === "table" ? (
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
                <SortableContext
                  items={productIds}
                  strategy={verticalListSortingStrategy}
                >
                  {products.map((product, index) => (
                    <SortableRow
                      key={product.$id + dndIdSuffix}
                      id={product.$id + dndIdSuffix}
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
                      isFeatured={featuredProductIds.includes(product.$id)}
                      onToggleFeatured={onToggleFeatured}
                    />
                  ))}
                </SortableContext>
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
          <SortableContext items={productIds} strategy={rectSortingStrategy}>
            {products.map((product, index) => (
              <SortableCard
                key={product.$id + dndIdSuffix}
                id={product.$id + dndIdSuffix}
                product={product}
                categories={categories}
                index={index}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleStatus={onToggleStatus}
                isActionLoading={actionLoadingId === product.$id}
                actionType={actionType}
                isFeatured={featuredProductIds.includes(product.$id)}
                onToggleFeatured={onToggleFeatured}
              />
            ))}
          </SortableContext>
        </div>
      )}

      {/* Drag Overlay for better UX */}
      <DragOverlay
        dropAnimation={{
          sideEffects: defaultDropAnimationSideEffects({
            styles: {
              active: {
                opacity: "0.5",
              },
            },
          }),
        }}
      >
        {activeId ? (
          viewMode === "table" ? (
            <table className="w-full opacity-80 backdrop-blur-md">
              <tbody>
                <ProductRow
                  product={activeProduct}
                  categories={categories}
                  isFirst={false}
                  isLast={false}
                  isOverlay
                />
              </tbody>
            </table>
          ) : (
            <div className="w-[300px] opacity-80 backdrop-blur-md">
              <ProductCard
                product={activeProduct}
                categories={categories}
                isOverlay
              />
            </div>
          )
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function SortableRow(props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    backgroundColor: isDragging ? "var(--color-bg-secondary)" : undefined,
  };

  return (
    <ProductRow
      ref={setNodeRef}
      style={style}
      dragHandleProps={{ ...attributes, ...listeners }}
      {...props}
    />
  );
}

function SortableCard(props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <ProductCard
      ref={setNodeRef}
      style={style}
      dragHandleProps={{ ...attributes, ...listeners }}
      {...props}
    />
  );
}

import React from "react";

const ProductRow = React.forwardRef(
  (
    {
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
      dragHandleProps,
      style,
      isOverlay = false,
      isFeatured = false,
      onToggleFeatured,
    },
    ref,
  ) => {
    const imageUrls = Array.isArray(product.imageFileIds)
      ? getProductImageUrls(product.imageFileIds)
      : product.imageFileId
        ? [getProductImageUrl(product.imageFileId)]
        : [];

    const firstImageUrl = imageUrls[0] || null;
    const isToggling = isActionLoading && actionType === "toggle";
    const isDeleting = isActionLoading && actionType === "delete";
    const [isViewerOpen, setIsViewerOpen] = useState(false);

    return (
      <React.Fragment>
        <tr
          ref={ref}
          style={style}
          className={`hover:bg-(--color-bg-secondary) transition-colors group/row ${!product.status ? "opacity-60 bg-(--color-bg-secondary)/10" : "bg-(--color-card)"} ${isOverlay ? "shadow-2xl border-2 border-(--color-primary)" : ""}`}
        >
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="flex items-center gap-3">
              <div
                {...dragHandleProps}
                className="cursor-grab active:cursor-grabbing text-(--color-fg-muted) lg:opacity-0 group-hover/row:opacity-100 transition-opacity p-1 hover:bg-(--color-bg-tertiary) rounded"
              >
                <GripVertical className="w-5 h-5" />
              </div>
              <button
                type="button"
                onClick={() => imageUrls.length > 0 && setIsViewerOpen(true)}
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
            </div>
          </td>
          <td className="px-6 py-4">
            <div className="flex items-center gap-2">
              <div className="text-sm font-medium text-(--color-fg)">
                {product.name}
              </div>
              {!isOverlay && onToggleFeatured && (
                <button
                  onClick={() => onToggleFeatured(product)}
                  className={`p-1 rounded-full transition-colors ${isFeatured ? "text-yellow-400 hover:text-yellow-500" : "text-gray-300 hover:text-yellow-400"}`}
                >
                  <Star
                    className={`w-4 h-4 ${isFeatured ? "fill-current" : ""}`}
                  />
                </button>
              )}
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
            <div className="flex flex-col gap-1 max-w-[200px]">
              {product.categoryIds?.slice(0, 2).map((categoryId) => {
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
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <button
              type="button"
              onClick={() => onToggleStatus?.(product)}
              disabled={isToggling}
              className={`h-7 px-3 text-xs font-semibold rounded-full transition-all ${
                product.status
                  ? "bg-emerald-500 text-white"
                  : "bg-slate-400 text-white"
              }`}
            >
              {product.status ? "Activo" : "Inactivo"}
            </button>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            {!isOverlay && (
              <div className="flex items-center justify-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onReorder(product, "up")}
                  disabled={isFirst}
                  className="h-9 w-9 p-0"
                >
                  <ChevronUp className="w-6 h-6 text-(--color-fg-secondary)" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onReorder(product, "down")}
                  disabled={isLast}
                  className="h-9 w-9 p-0"
                >
                  <ChevronDown className="w-6 h-6 text-(--color-fg-secondary)" />
                </Button>
              </div>
            )}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-right">
            {!isOverlay && (
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(product)}
                  className="hover:bg-(--color-primary)/10"
                >
                  <Edit className="w-4 h-4 text-(--color-primary)" />
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
            )}
          </td>
        </tr>
        <ImageViewerModal
          isOpen={isViewerOpen}
          onClose={() => setIsViewerOpen(false)}
          images={imageUrls}
          initialIndex={0}
          alt={product.name}
        />
      </React.Fragment>
    );
  },
);

const ProductCard = React.forwardRef(
  (
    {
      product,
      categories,
      onEdit,
      onDelete,
      onToggleStatus,
      isActionLoading,
      actionType,
      dragHandleProps,
      style,
      isOverlay = false,
      isFeatured = false,
      onToggleFeatured,
    },
    ref,
  ) => {
    const imageUrls = Array.isArray(product.imageFileIds)
      ? getProductImageUrls(product.imageFileIds)
      : product.imageFileId
        ? [getProductImageUrl(product.imageFileId)]
        : [];

    const isToggling = isActionLoading && actionType === "toggle";
    const isDeleting = isActionLoading && actionType === "delete";
    const [isViewerOpen, setIsViewerOpen] = useState(false);
    const [viewerInitialIndex, setViewerInitialIndex] = useState(0);

    return (
      <div
        ref={ref}
        style={style}
        className={`bg-(--color-card) border border-(--color-card-border) rounded-2xl overflow-hidden hover:shadow-md transition-all group flex flex-col relative ${!product.status ? "opacity-60" : ""} ${isOverlay ? "shadow-2xl ring-2 ring-(--color-primary)" : ""}`}
      >
        <div
          {...dragHandleProps}
          className="absolute top-2 left-2 z-20 cursor-grab active:cursor-grabbing p-1.5 bg-black/40 backdrop-blur-md text-white rounded-lg lg:opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <GripVertical className="w-4 h-4" />
        </div>

        <div className="aspect-4/3 bg-(--color-bg-secondary) relative overflow-hidden">
          <ImageCarousel
            images={imageUrls}
            alt={product.name}
            className="w-full h-full"
            onImageClick={(idx) => {
              setViewerInitialIndex(idx);
              setIsViewerOpen(true);
            }}
          />

          {!isOverlay && (
            <div className="absolute top-2 right-2 flex gap-2 lg:opacity-0 group-hover:opacity-100 transition-all duration-300 z-10">
              <Button
                size="sm"
                variant="secondary"
                className="h-10 w-10 p-0 rounded-full shadow-lg bg-(--color-card) border border-(--color-border)"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(product);
                }}
              >
                <Edit className="w-5 h-5 text-(--color-primary)" />
              </Button>
            </div>
          )}
        </div>

        <div className="p-5 flex-1 flex flex-col">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className="font-semibold text-(--color-fg) truncate">
              {product.name}
            </h3>
            {!isOverlay && onToggleFeatured && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFeatured(product);
                }}
                className={`p-2 rounded-lg border transition-colors ${
                  isFeatured
                    ? "bg-yellow-400/15 border-yellow-400/40 text-yellow-500"
                    : "bg-(--color-bg-tertiary) border-(--color-border) text-(--color-fg-muted) hover:text-yellow-500"
                }`}
                aria-pressed={isFeatured}
                aria-label={
                  isFeatured ? "Quitar de destacados" : "Marcar como destacado"
                }
              >
                <Star
                  className={`w-4 h-4 ${isFeatured ? "fill-current" : ""}`}
                />
              </button>
            )}
          </div>
          <div className="flex items-center gap-1 mb-2">
            <DollarSign className="w-4 h-4 text-(--color-fg-secondary)" />
            <span className="text-xl font-bold text-(--color-primary)">
              {product.price.toLocaleString("es-MX", {
                minimumFractionDigits: 2,
              })}
            </span>
            <span className="text-xs text-(--color-fg-secondary) font-medium mt-1">
              {product.currency || "MXN"}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-(--color-fg-secondary)">
            <Package className="w-4 h-4" />
            <span>
              Stock: <b>{product.stock || 0}</b>
            </span>
          </div>

          {/* Categorías */}
          {product.categoryIds?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {product.categoryIds.slice(0, 3).map((categoryId) => {
                const category = categories?.find(
                  (cat) => cat.id === categoryId,
                );
                return category ? (
                  <span
                    key={categoryId}
                    className="inline-block px-2 py-0.5 bg-(--color-primary)/10 text-(--color-primary) rounded-full text-xs font-medium"
                  >
                    {category.name}
                  </span>
                ) : null;
              })}
              {product.categoryIds.length > 3 && (
                <span className="inline-block px-2 py-0.5 bg-(--color-bg-tertiary) text-(--color-fg-muted) rounded-full text-xs font-medium">
                  +{product.categoryIds.length - 3}
                </span>
              )}
            </div>
          )}

          {!isOverlay && (
            <div className="pt-4 mt-4 border-t border-(--color-border) flex items-center justify-between gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggleStatus?.(product)}
                isLoading={isToggling}
                className={
                  product.status
                    ? "text-(--color-fg-secondary)"
                    : "text-(--color-primary)"
                }
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
                onClick={() => onDelete?.(product)}
                isLoading={isDeleting}
                className="text-(--color-error)"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        <ImageViewerModal
          isOpen={isViewerOpen}
          onClose={() => setIsViewerOpen(false)}
          images={imageUrls}
          initialIndex={viewerInitialIndex}
          alt={product.name}
        />
      </div>
    );
  },
);

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
