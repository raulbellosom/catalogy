/**
 * Utilities for Puck data lifecycle.
 *
 * Responsibilities:
 * - Parse and normalize persisted JSON
 * - Migrate legacy block types
 * - Strip runtime-only props before saving
 * - Inject runtime context for editor/public render
 */

const LEGACY_COMPONENT_TYPE_MAP = {
  ProductGrid: "ProductCatalog",
  ProductList: "ProductCatalog",
  HeaderStore: "StoreHeader",
  StoreInfoHeader: "StoreHeader",
  CatalogGrid: "ProductCatalog",
};

const RUNTIME_ROOT_PROPS = [
  "store",
  "products",
  "isPreview",
  "isEditor",
  "previewOffset",
];

const isPlainObject = (value) => {
  return value && typeof value === "object" && !Array.isArray(value);
};

const cloneData = (value) => JSON.parse(JSON.stringify(value));

const normalizeContentItem = (item, allowedTypes) => {
  if (!isPlainObject(item) || !item.type) return null;

  const mappedType = LEGACY_COMPONENT_TYPE_MAP[item.type] || item.type;
  if (allowedTypes?.size && !allowedTypes.has(mappedType)) return null;

  const safeProps = isPlainObject(item.props) ? item.props : {};
  const migratedProps = { ...safeProps };

  // Legacy migration: navbar block used "sticky", new schema uses "fixed"
  if (mappedType === "StoreNavbar") {
    if (typeof migratedProps.fixed !== "boolean") {
      migratedProps.fixed =
        typeof migratedProps.sticky === "boolean" ? migratedProps.sticky : true;
    }
    if (typeof migratedProps.reserveSpace !== "boolean") {
      migratedProps.reserveSpace = true;
    }
    delete migratedProps.sticky;
  }

  return {
    ...item,
    type: mappedType,
    props: migratedProps,
  };
};

const ensureUniqueItemIds = (content = [], zones = {}) => {
  const usedIds = new Set();
  let counter = 1;

  const createId = (type = "block") => {
    const safeType = String(type).toLowerCase().replace(/[^a-z0-9-]/g, "-");
    let nextId = `puck-${safeType}-${counter}`;
    while (usedIds.has(nextId)) {
      counter += 1;
      nextId = `puck-${safeType}-${counter}`;
    }
    usedIds.add(nextId);
    counter += 1;
    return nextId;
  };

  const normalizeIdForItem = (item) => {
    const safeProps = isPlainObject(item.props) ? { ...item.props } : {};
    const rawId =
      typeof safeProps.id === "string" ? safeProps.id.trim() : String(safeProps.id || "").trim();

    if (rawId && !usedIds.has(rawId)) {
      usedIds.add(rawId);
      return {
        ...item,
        props: {
          ...safeProps,
          id: rawId,
        },
      };
    }

    return {
      ...item,
      props: {
        ...safeProps,
        id: createId(item.type),
      },
    };
  };

  const normalizedContent = Array.isArray(content)
    ? content.map(normalizeIdForItem)
    : [];

  const normalizedZones = Object.entries(isPlainObject(zones) ? zones : {}).reduce(
    (acc, [zoneKey, items]) => {
      acc[zoneKey] = Array.isArray(items) ? items.map(normalizeIdForItem) : [];
      return acc;
    },
    {},
  );

  return {
    content: normalizedContent,
    zones: normalizedZones,
  };
};

const normalizeZones = (zones, allowedTypes) => {
  if (!isPlainObject(zones)) return {};

  return Object.entries(zones).reduce((acc, [zoneKey, items]) => {
    if (!Array.isArray(items)) {
      acc[zoneKey] = [];
      return acc;
    }

    acc[zoneKey] = items
      .map((item) => normalizeContentItem(item, allowedTypes))
      .filter(Boolean);

    return acc;
  }, {});
};

const stripRuntimeRootProps = (root) => {
  const safeRoot = isPlainObject(root) ? { ...root } : {};
  const safeProps = isPlainObject(safeRoot.props) ? { ...safeRoot.props } : {};

  for (const propKey of RUNTIME_ROOT_PROPS) {
    delete safeProps[propKey];
  }

  return {
    ...safeRoot,
    props: safeProps,
  };
};

const hasRenderableBlocks = (content = [], zones = {}) => {
  if (Array.isArray(content) && content.length > 0) return true;
  return Object.values(zones).some(
    (items) => Array.isArray(items) && items.length > 0,
  );
};

export const normalizePuckData = ({
  rawData,
  defaultData,
  allowedComponentTypes = [],
}) => {
  if (!defaultData) {
    throw new Error("normalizePuckData requires defaultData");
  }

  const allowedTypes =
    Array.isArray(allowedComponentTypes) && allowedComponentTypes.length > 0
      ? new Set(allowedComponentTypes)
      : null;

  let parsed = rawData;
  if (typeof rawData === "string") {
    try {
      parsed = JSON.parse(rawData);
    } catch (error) {
      console.error("Error parsing puckData:", error);
      return cloneData(defaultData);
    }
  }

  if (!isPlainObject(parsed)) {
    return cloneData(defaultData);
  }

  const content = Array.isArray(parsed.content)
    ? parsed.content
        .map((item) => normalizeContentItem(item, allowedTypes))
        .filter(Boolean)
    : [];

  const zones = normalizeZones(parsed.zones, allowedTypes);
  const root = stripRuntimeRootProps(parsed.root);

  const withUniqueIds = ensureUniqueItemIds(content, zones);

  const normalized = {
    ...parsed,
    content: withUniqueIds.content,
    zones: withUniqueIds.zones,
    root,
  };

  if (!hasRenderableBlocks(normalized.content, normalized.zones)) {
    return cloneData(defaultData);
  }

  return normalized;
};

export const sanitizePuckDataForStorage = ({
  data,
  defaultData,
  allowedComponentTypes = [],
}) => {
  return normalizePuckData({
    rawData: data,
    defaultData,
    allowedComponentTypes,
  });
};

export const injectPuckRuntimeContext = ({
  data,
  defaultData,
  allowedComponentTypes = [],
  store,
  products,
  isPreview = false,
  isEditor = false,
  previewOffset = 0,
}) => {
  const normalized = normalizePuckData({
    rawData: data,
    defaultData,
    allowedComponentTypes,
  });

  return {
    ...normalized,
    root: {
      ...(normalized.root || {}),
      props: {
        ...(normalized.root?.props || {}),
        store: store || null,
        products: Array.isArray(products) ? products : [],
        isPreview: !!isPreview,
        isEditor: !!isEditor,
        previewOffset: Number.isFinite(previewOffset) ? previewOffset : 0,
      },
    },
  };
};
