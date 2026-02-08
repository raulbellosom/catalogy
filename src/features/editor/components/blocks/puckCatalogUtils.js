import { useEffect, useMemo, useState } from "react";
import { parseStoreCategories } from "./runtimeContext";

const clampNumber = (value, fallback) => {
  if (value === "" || value === null || value === undefined) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const parseSettings = (store) => {
  const raw = store?.settings;
  if (!raw) return {};
  if (typeof raw === "object") return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
};

const normalizeProducts = (products) => {
  if (!Array.isArray(products)) return [];
  return products.filter(Boolean);
};

export const usePuckCatalogFilters = ({ store, products }) => {
  const categories = useMemo(() => parseStoreCategories(store), [store]);

  const categoryMap = useMemo(
    () => new Map(categories.map((category) => [category.id, category])),
    [categories],
  );

  const productList = useMemo(() => normalizeProducts(products), [products]);

  const featuredProductIds = useMemo(() => {
    const settings = parseSettings(store);
    const catalog = settings?.catalog || {};
    return Array.isArray(catalog.featuredProductIds)
      ? catalog.featuredProductIds
      : [];
  }, [store]);

  const hasFeaturedProducts = useMemo(() => {
    if (!featuredProductIds.length) return false;
    return productList.some((product) =>
      featuredProductIds.includes(product.id || product.$id),
    );
  }, [featuredProductIds, productList]);

  const priceBounds = useMemo(() => {
    if (!productList.length) return { min: 0, max: 0 };
    const prices = productList
      .map((product) => product?.price)
      .filter((price) => typeof price === "number");
    if (!prices.length) return { min: 0, max: 0 };
    return {
      min: 0,
      max: Math.max(...prices),
    };
  }, [productList]);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategoryIds, setActiveCategoryIds] = useState([]);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(priceBounds.max);
  const [sortOrder, setSortOrder] = useState("none");
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);

  useEffect(() => {
    setMinPrice(0);
    setMaxPrice(priceBounds.max);
    setSortOrder("none");
    setShowFeaturedOnly(false);
  }, [priceBounds.max]);

  const toggleCategory = (categoryId) => {
    setActiveCategoryIds((previous) =>
      previous.includes(categoryId)
        ? previous.filter((id) => id !== categoryId)
        : [...previous, categoryId],
    );
  };

  const toggleFeaturedOnly = () => setShowFeaturedOnly((previous) => !previous);

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const min = clampNumber(minPrice, priceBounds.min);
    const max = clampNumber(maxPrice, priceBounds.max);

    const filtered = productList.filter((product) => {
      if (showFeaturedOnly) {
        const isFeatured = featuredProductIds.includes(product.id || product.$id);
        if (!isFeatured) return false;
      }

      const price = typeof product.price === "number" ? product.price : 0;
      if (price < min || price > max) return false;

      const matchesQuery = !query
        ? true
        : [product.name, product.description]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(query));

      if (!matchesQuery) return false;

      if (!activeCategoryIds.length) return true;
      const ids = Array.isArray(product.categoryIds) ? product.categoryIds : [];
      return ids.some((id) => activeCategoryIds.includes(id));
    });

    const withCategories = filtered.map((product) => {
      const isFeatured = featuredProductIds.includes(product.id || product.$id);
      let finalProduct = product;

      if (!product?.categories?.length) {
        const ids = Array.isArray(product?.categoryIds) ? product.categoryIds : [];
        const resolvedCategories = ids
          .map((id) => categoryMap.get(id))
          .filter(Boolean);

        if (resolvedCategories.length) {
          finalProduct = { ...product, categories: resolvedCategories };
        }
      }

      return { ...finalProduct, isFeatured };
    });

    if (sortOrder === "asc") {
      return [...withCategories].sort((a, b) => (a.price || 0) - (b.price || 0));
    }

    if (sortOrder === "desc") {
      return [...withCategories].sort((a, b) => (b.price || 0) - (a.price || 0));
    }

    return withCategories;
  }, [
    productList,
    searchQuery,
    activeCategoryIds,
    minPrice,
    maxPrice,
    priceBounds.min,
    priceBounds.max,
    sortOrder,
    showFeaturedOnly,
    featuredProductIds,
    categoryMap,
  ]);

  const resetFilters = () => {
    setSearchQuery("");
    setActiveCategoryIds([]);
    setMinPrice(0);
    setMaxPrice(priceBounds.max);
    setSortOrder("none");
    setShowFeaturedOnly(false);
  };

  return {
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
  };
};

export const getProductShareUrl = (productId) => {
  if (!productId) return "";
  if (typeof window === "undefined") return `?product=${productId}`;

  const url = new URL(window.location.href);
  url.searchParams.set("product", productId);
  return url.toString();
};

export const shareProduct = async (product) => {
  if (!product?.$id && !product?.id) return "noop";

  const id = product.$id || product.id;
  const url = getProductShareUrl(id);
  const payload = {
    title: product.name,
    text: product.description || `Mira este producto: ${product.name}`,
    url,
  };

  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share(payload);
      return "shared";
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Share failed:", error);
      }
    }
  }

  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(url);
      return "copied";
    } catch {
      return "failed";
    }
  }

  return "failed";
};
