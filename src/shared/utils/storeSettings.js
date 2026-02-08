/**
 * Store settings utilities
 * Centraliza defaults y parseo seguro del campo settings de stores.
 */

export const DEFAULT_CATALOG_SETTINGS = {
  showSearch: true,
  showFilters: true,
  showSort: true,
  showProductCount: true,
  showShareButton: true,
  showPurchaseInfo: true,
  showPaymentButton: true,
  showCart: true,
  featuredProductIds: [],
};

export const resolveStoreSettings = (store) => {
  if (!store?.settings) return {};
  if (typeof store.settings === "string") {
    try {
      return JSON.parse(store.settings || "{}");
    } catch (error) {
      console.warn("Error parsing store settings:", error);
      return {};
    }
  }
  return store.settings || {};
};

export const resolveCatalogSettings = (store) => {
  const settings = resolveStoreSettings(store);
  const catalog =
    settings?.catalog && typeof settings.catalog === "object"
      ? settings.catalog
      : {};
  return { ...DEFAULT_CATALOG_SETTINGS, ...catalog };
};

export const normalizeCatalogSettings = (catalog) => {
  const safeCatalog = catalog && typeof catalog === "object" ? catalog : {};
  return { ...DEFAULT_CATALOG_SETTINGS, ...safeCatalog };
};
