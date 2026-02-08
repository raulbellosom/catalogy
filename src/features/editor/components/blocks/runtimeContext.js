import { getStoreLogoUrl } from "@/shared/services/storeService";
import { resolveCatalogSettings } from "@/shared/utils/storeSettings";

export const DEFAULT_SECTION_TITLE = "Catalogo de productos";

const FALLBACK_STORE = {
  name: "Nombre de la tienda",
  description: "Descripcion breve de ejemplo",
  categoriesJson: JSON.stringify([
    { id: "categoria-1", name: "Categoria 1" },
    { id: "categoria-2", name: "Categoria 2" },
  ]),
  settings: JSON.stringify({
    catalog: {
      showSearch: true,
      showFilters: true,
      showSort: true,
      showProductCount: true,
      showShareButton: true,
      showPurchaseInfo: true,
      showPaymentButton: true,
    },
  }),
  published: true,
};

const BOOL_OPTIONS = [
  { label: "Si", value: true },
  { label: "No", value: false },
];

export const booleanField = (label) => ({
  type: "radio",
  label,
  options: BOOL_OPTIONS,
});

export const safeJsonParse = (value, fallback) => {
  if (!value) return fallback;
  if (typeof value === "object") return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const normalizeStore = (store) => {
  const merged = {
    ...FALLBACK_STORE,
    ...(store || {}),
  };

  if (!merged.categoriesJson && Array.isArray(merged.categories)) {
    merged.categoriesJson = JSON.stringify(merged.categories);
  }

  if (!merged.categoriesJson) {
    merged.categoriesJson = FALLBACK_STORE.categoriesJson;
  }

  if (!merged.settings) {
    merged.settings = FALLBACK_STORE.settings;
  }

  return merged;
};

const normalizeProducts = (products) => {
  const source = Array.isArray(products) ? products : [];

  return source.map((product, index) => ({
    ...product,
    $id: product?.$id || product?.id || `preview-product-${index + 1}`,
    name: product?.name || `Producto ${index + 1}`,
    price: typeof product?.price === "number" ? product.price : 0,
    currency: product?.currency || "MXN",
    categoryIds: Array.isArray(product?.categoryIds) ? product.categoryIds : [],
  }));
};

export const resolveRuntimeContext = (puck) => {
  const metadata =
    puck && typeof puck.metadata === "object" && puck.metadata
      ? puck.metadata
      : {};
  const rootProps = puck?.appState?.data?.root?.props || {};

  const storeSource = metadata.store || rootProps.store;
  const productsSource = metadata.products || rootProps.products;

  return {
    store: normalizeStore(storeSource),
    products: normalizeProducts(productsSource),
    isPreview: Boolean(metadata.isPreview ?? rootProps.isPreview),
    previewOffset: Number(metadata.previewOffset ?? rootProps.previewOffset) || 0,
  };
};

export const parseStoreCategories = (store) => {
  const raw = store?.categoriesJson || store?.categories;
  const parsed = safeJsonParse(raw, []);
  if (!Array.isArray(parsed)) return [];

  return parsed
    .map((category) => ({
      id: String(category?.id || "").trim(),
      name: String(category?.name || "").trim(),
    }))
    .filter((category) => category.id && category.name);
};

export const clampPositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return parsed;
};

export const getStoreLogoPreviewUrl = (store) => {
  if (!store?.logoFileId) return null;
  return getStoreLogoUrl(store.logoFileId);
};

export const getFeaturedProducts = (store, products, fallbackLimit = 6) => {
  const safeProducts = Array.isArray(products) ? products : [];
  const featuredIds = resolveCatalogSettings(store).featuredProductIds || [];

  const featured = safeProducts.filter((product) =>
    featuredIds.includes(product.id || product.$id),
  );

  if (featured.length > 0) return featured;
  return safeProducts.slice(0, fallbackLimit);
};
