import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import {
  booleanField,
  getFeaturedProducts,
  resolveRuntimeContext,
} from "./runtimeContext";
import { PuckProductCard, PuckProductDetailModal } from "./PuckCatalogUI";
import { shareProduct } from "./puckCatalogUtils";

const GRID_VARIANTS = {
  two: "grid grid-cols-1 sm:grid-cols-2 gap-4",
  three: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4",
  four: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4",
};

function FeaturedProductsPreview({
  puck,
  title,
  subtitle,
  mode,
  maxProducts,
  tone,
  showDescription,
  showCategoryTags,
  showShareButton,
  showPaymentButton,
  enableDetailModal,
  layout,
}) {
  const { store, products } = resolveRuntimeContext(puck);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const panelTone = tone === "noir" ? "noir" : "light";

  const selectedProducts = useMemo(() => {
    const featured = getFeaturedProducts(store, products, 8);
    const source = mode === "featured-only" ? featured : products;
    const limit = Number(maxProducts) || 0;
    if (limit > 0) return source.slice(0, limit);
    return source;
  }, [maxProducts, mode, products, store]);

  const [startIndex, setStartIndex] = useState(0);
  const pageSize = 3;

  if (!selectedProducts.length) return null;

  const canUseCarousel = layout === "carousel";
  const visibleCarousel = canUseCarousel
    ? selectedProducts.slice(startIndex, startIndex + pageSize)
    : selectedProducts;

  const goPrev = () => {
    setStartIndex((prev) => Math.max(0, prev - pageSize));
  };
  const goNext = () => {
    setStartIndex((prev) =>
      Math.min(selectedProducts.length - pageSize, prev + pageSize),
    );
  };

  return (
    <section className="max-w-7xl mx-auto px-4 py-10 space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.22em] text-(--muted-foreground) inline-flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5" />
            {title || "Destacados"}
          </p>
          {subtitle && <h2 className="text-2xl font-bold text-(--foreground)">{subtitle}</h2>}
        </div>
        {canUseCarousel && selectedProducts.length > pageSize && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={goPrev}
              disabled={startIndex <= 0}
              className="h-9 w-9 rounded-full border border-(--border) flex items-center justify-center disabled:opacity-40"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={startIndex + pageSize >= selectedProducts.length}
              className="h-9 w-9 rounded-full border border-(--border) flex items-center justify-center disabled:opacity-40"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      <div className={canUseCarousel ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" : GRID_VARIANTS[layout] || GRID_VARIANTS.three}>
        {visibleCarousel.map((product) => (
          <PuckProductCard
            key={product.$id || product.id}
            product={product}
            tone={panelTone}
            showDescription={showDescription}
            showShareButton={showShareButton}
            showCategories={showCategoryTags}
            showWhatsAppButton={true}
            whatsappNumber={store.whatsapp}
            onShare={showShareButton ? shareProduct : null}
            onClick={
              enableDetailModal ? () => setSelectedProduct(product) : undefined
            }
          />
        ))}
      </div>

      {enableDetailModal && (
        <PuckProductDetailModal
          product={selectedProduct}
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          store={store}
          tone={panelTone}
          showShareButton={showShareButton}
          showPaymentButton={showPaymentButton}
          onShare={showShareButton ? shareProduct : null}
        />
      )}
    </section>
  );
}

export const FeaturedProductsBlock = {
  label: "Productos destacados",
  fields: {
    title: {
      type: "text",
      label: "Eyebrow",
      placeholder: "Seleccion curada",
    },
    subtitle: {
      type: "text",
      label: "Titulo",
      placeholder: "Te puede interesar",
    },
    mode: {
      type: "select",
      label: "Fuente de productos",
      options: [
        { label: "Solo destacados", value: "featured-only" },
        { label: "Todos los productos", value: "all-products" },
      ],
    },
    maxProducts: {
      type: "number",
      label: "Maximo de productos (0 = todos)",
      min: 0,
      max: 50,
      step: 1,
    },
    layout: {
      type: "select",
      label: "Presentacion",
      options: [
        { label: "Grid de 3", value: "three" },
        { label: "Grid de 4", value: "four" },
        { label: "Grid de 2", value: "two" },
        { label: "Carrusel", value: "carousel" },
      ],
    },
    tone: {
      type: "select",
      label: "Tema visual",
      options: [
        { label: "Claro", value: "light" },
        { label: "Noir", value: "noir" },
      ],
    },
    showDescription: booleanField("Mostrar descripcion"),
    showCategoryTags: booleanField("Mostrar tags de categoria"),
    showShareButton: booleanField("Mostrar boton de compartir"),
    showPaymentButton: booleanField("Mostrar boton de pago"),
    enableDetailModal: booleanField("Habilitar modal de detalle"),
  },
  defaultProps: {
    title: "Seleccion curada",
    subtitle: "Productos destacados",
    mode: "featured-only",
    maxProducts: 8,
    layout: "three",
    tone: "light",
    showDescription: true,
    showCategoryTags: true,
    showShareButton: true,
    showPaymentButton: true,
    enableDetailModal: true,
  },
  render: (props) => <FeaturedProductsPreview {...props} />,
};
