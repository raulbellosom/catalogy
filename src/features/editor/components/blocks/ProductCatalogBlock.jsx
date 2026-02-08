import { useState } from "react";
import { resolveCatalogSettings } from "@/shared/utils/storeSettings";
import {
  DEFAULT_SECTION_TITLE,
  booleanField,
  resolveRuntimeContext,
} from "./runtimeContext";
import {
  PuckCatalogControls,
  PuckEmptyProducts,
  PuckProductCard,
  PuckProductDetailModal,
} from "./PuckCatalogUI";
import { shareProduct, usePuckCatalogFilters } from "./puckCatalogUtils";

const GRID_CLASS_MAP = {
  compact: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3",
  standard: "grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4",
  wide: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5",
  list: "grid grid-cols-1 gap-4",
};

const WIDTH_CLASS_MAP = {
  page: "max-w-7xl",
  wide: "max-w-[90rem]",
  full: "max-w-none",
};

const SECTION_STYLE_MAP = {
  plain: "",
  card: "rounded-3xl border border-(--border) bg-(--card) p-4 md:p-6",
  muted: "rounded-3xl border border-(--border) bg-(--muted) p-4 md:p-6",
  contrast: "rounded-3xl border border-(--border) bg-(--foreground) text-white p-4 md:p-6",
};

const SPACING_MAP = {
  compact: "py-6",
  normal: "py-10",
  relaxed: "py-14",
};

function ProductCatalogPreview({
  puck,
  title,
  description,
  layout,
  maxProducts,
  tone,
  controlsOrientation,
  useStoreCatalogDefaults,
  controlsPreset,
  showSearch,
  showFilters,
  showSort,
  showPrice,
  showCategories,
  showFeaturedToggle,
  showProductCount,
  showShareButton,
  showPaymentButton,
  showCategoryTags,
  showDescriptions,
  enableDetailModal,
  width,
  sectionStyle,
  spacing,
}) {
  const { store, products } = resolveRuntimeContext(puck);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const storeCatalog = resolveCatalogSettings(store);

  const toggles = useStoreCatalogDefaults
    ? {
        showSearch: storeCatalog.showSearch,
        showFilters: storeCatalog.showFilters,
        showSort: storeCatalog.showSort,
        showProductCount: storeCatalog.showProductCount,
        showShareButton: storeCatalog.showShareButton,
        showPaymentButton: storeCatalog.showPaymentButton,
      }
    : {
        showSearch: !!showSearch,
        showFilters: !!showFilters,
        showSort: !!showSort,
        showProductCount: !!showProductCount,
        showShareButton: !!showShareButton,
        showPaymentButton: !!showPaymentButton,
      };

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
    sortOrder,
    setSortOrder,
    resetFilters,
    showFeaturedOnly,
    toggleFeaturedOnly,
    hasFeaturedProducts,
  } = usePuckCatalogFilters({ store, products });

  const limit = Number.parseInt(maxProducts, 10);
  const visibleProducts =
    Number.isFinite(limit) && limit > 0
      ? filteredProducts.slice(0, limit)
      : filteredProducts;

  const gridClassName = GRID_CLASS_MAP[layout] || GRID_CLASS_MAP.standard;
  const sectionClass = SECTION_STYLE_MAP[sectionStyle] || SECTION_STYLE_MAP.plain;
  const widthClass = WIDTH_CLASS_MAP[width] || WIDTH_CLASS_MAP.page;
  const spacingClass = SPACING_MAP[spacing] || SPACING_MAP.normal;

  const resolvedPreset = controlsPreset || "full";
  const isControlsHidden = resolvedPreset === "hidden";
  const useChipsPreset = resolvedPreset === "chips";
  const useMinimalPreset = resolvedPreset === "minimal";

  const allowSearch = toggles.showSearch && !isControlsHidden;
  const allowSort = toggles.showSort && !isControlsHidden && !useChipsPreset;
  const allowFilters = toggles.showFilters && !isControlsHidden && !useMinimalPreset;
  const allowPrice = showPrice && allowFilters && !useChipsPreset;
  const allowCategories = showCategories && allowFilters;
  const showControlsPanel = allowSearch || allowSort || allowFilters;

  const panelTone = tone === "noir" ? "noir" : "light";
  const titleClassName =
    sectionStyle === "contrast" ? "text-white" : "text-(--foreground)";
  const subtitleClassName =
    sectionStyle === "contrast" ? "text-white/75" : "text-(--muted-foreground)";

  return (
    <section className={`${widthClass} mx-auto px-4 ${spacingClass}`}>
      <div className={`space-y-6 ${sectionClass}`}>
        <div className="space-y-2">
          <h2 className={`text-2xl font-bold ${titleClassName}`}>
            {title || DEFAULT_SECTION_TITLE}
          </h2>
          {description && (
            <p className={`text-sm ${subtitleClassName}`}>
              {description}
            </p>
          )}
        </div>

        {showControlsPanel && (
          <PuckCatalogControls
            tone={panelTone}
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
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            onReset={resetFilters}
            showSearch={allowSearch}
            showFilters={allowFilters}
            showSort={allowSort}
            showPrice={allowPrice}
            showCategories={allowCategories}
            orientation={controlsOrientation}
            showFeaturedOnly={showFeaturedToggle && showFeaturedOnly}
            onToggleFeaturedOnly={
              showFeaturedToggle && hasFeaturedProducts ? toggleFeaturedOnly : null
            }
            hasFeaturedProducts={showFeaturedToggle && hasFeaturedProducts}
          />
        )}

        {useChipsPreset && categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const active = activeCategoryIds.includes(category.id);
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => toggleCategory(category.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                    active
                      ? "bg-(--primary) text-white border-(--primary)"
                      : "border-(--border) text-(--foreground) hover:border-(--primary)"
                  }`}
                >
                  {category.name}
                </button>
              );
            })}
          </div>
        )}

        {toggles.showProductCount && (
          <p className={`${sectionStyle === "contrast" ? "text-white/80" : "text-(--muted-foreground)"} text-sm`}>
            {visibleProducts.length} de {filteredProducts.length} productos
          </p>
        )}

        {visibleProducts.length > 0 ? (
          <div className={gridClassName}>
            {visibleProducts.map((product) => (
              <PuckProductCard
                key={product.$id || product.id}
                product={product}
                tone={panelTone}
                showDescription={showDescriptions}
                showShareButton={toggles.showShareButton}
                showCategories={showCategoryTags}
                showWhatsAppButton={true}
                whatsappNumber={store.whatsapp}
                onCategoryClick={toggleCategory}
                onShare={toggles.showShareButton ? shareProduct : null}
                onClick={
                  enableDetailModal ? () => setSelectedProduct(product) : undefined
                }
              />
            ))}
          </div>
        ) : (
          <PuckEmptyProducts tone={panelTone} onReset={resetFilters} />
        )}

        {enableDetailModal && (
          <PuckProductDetailModal
            product={selectedProduct}
            isOpen={!!selectedProduct}
            onClose={() => setSelectedProduct(null)}
            store={store}
            tone={panelTone}
            showShareButton={toggles.showShareButton}
            showPaymentButton={toggles.showPaymentButton}
            onShare={toggles.showShareButton ? shareProduct : null}
          />
        )}
      </div>
    </section>
  );
}

export const ProductCatalogBlock = {
  label: "Catalogo de productos",
  fields: {
    title: {
      type: "text",
      label: "Titulo de catalogo",
      placeholder: DEFAULT_SECTION_TITLE,
    },
    description: {
      type: "textarea",
      label: "Subtitulo",
      placeholder: "Describe esta seccion",
    },
    layout: {
      type: "select",
      label: "Layout de cards",
      options: [
        { label: "Estandar", value: "standard" },
        { label: "Compacto", value: "compact" },
        { label: "Amplio", value: "wide" },
        { label: "Lista", value: "list" },
      ],
    },
    maxProducts: {
      type: "number",
      label: "Maximo de productos (0 = todos)",
      min: 0,
      max: 200,
      step: 1,
    },
    tone: {
      type: "select",
      label: "Tema visual",
      options: [
        { label: "Claro", value: "light" },
        { label: "Noir", value: "noir" },
      ],
    },
    controlsOrientation: {
      type: "select",
      label: "Orientacion de controles",
      options: [
        { label: "Horizontal", value: "horizontal" },
        { label: "Vertical", value: "vertical" },
      ],
    },
    controlsPreset: {
      type: "select",
      label: "Presentacion de filtros",
      options: [
        { label: "Completo", value: "full" },
        { label: "Minimal", value: "minimal" },
        { label: "Solo chips", value: "chips" },
        { label: "Oculto", value: "hidden" },
      ],
    },
    width: {
      type: "select",
      label: "Ancho de seccion",
      options: [
        { label: "Pagina", value: "page" },
        { label: "Amplio", value: "wide" },
        { label: "Completo", value: "full" },
      ],
    },
    sectionStyle: {
      type: "select",
      label: "Estilo de seccion",
      options: [
        { label: "Plano", value: "plain" },
        { label: "Card", value: "card" },
        { label: "Suave", value: "muted" },
        { label: "Contraste", value: "contrast" },
      ],
    },
    spacing: {
      type: "select",
      label: "Espaciado vertical",
      options: [
        { label: "Compacto", value: "compact" },
        { label: "Normal", value: "normal" },
        { label: "Relajado", value: "relaxed" },
      ],
    },
    useStoreCatalogDefaults: booleanField("Usar settings globales de catalogo"),
    showSearch: booleanField("Mostrar buscador"),
    showFilters: booleanField("Mostrar filtros"),
    showSort: booleanField("Mostrar ordenamiento"),
    showPrice: booleanField("Mostrar rango de precios"),
    showCategories: booleanField("Mostrar filtros por categoria"),
    showFeaturedToggle: booleanField("Mostrar filtro de destacados"),
    showProductCount: booleanField("Mostrar contador de productos"),
    showShareButton: booleanField("Mostrar boton de compartir"),
    showPaymentButton: booleanField("Mostrar boton de pago"),
    showCategoryTags: booleanField("Mostrar tags de categoria en card"),
    showDescriptions: booleanField("Mostrar descripcion en card"),
    enableDetailModal: booleanField("Habilitar modal de detalle"),
  },
  defaultProps: {
    title: DEFAULT_SECTION_TITLE,
    description: "",
    layout: "standard",
    maxProducts: 0,
    tone: "light",
    controlsOrientation: "horizontal",
    controlsPreset: "full",
    width: "page",
    sectionStyle: "plain",
    spacing: "normal",
    useStoreCatalogDefaults: true,
    showSearch: true,
    showFilters: true,
    showSort: true,
    showPrice: true,
    showCategories: true,
    showFeaturedToggle: true,
    showProductCount: true,
    showShareButton: true,
    showPaymentButton: true,
    showCategoryTags: true,
    showDescriptions: true,
    enableDetailModal: true,
  },
  render: (props) => <ProductCatalogPreview {...props} />,
};
