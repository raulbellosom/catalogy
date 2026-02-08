import { useEffect, useMemo, useState } from "react";

const parseCategories = (raw) => {
  if (!raw) return [];
  const data = typeof raw === "string" ? safeParse(raw) : raw;
  if (!Array.isArray(data)) return [];
  return data
    .map((item) => ({
      id: String(item?.id || "").trim(),
      name: String(item?.name || "").trim(),
    }))
    .filter((item) => item.id && item.name);
};

const safeParse = (value) => {
  try {
    return JSON.parse(value);
  } catch (error) {
    console.warn("Error parsing categoriesJson:", error);
    return [];
  }
};

const clampNumber = (value, fallback) => {
  if (value === "" || value === null || value === undefined) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const useCatalogFilters = ({ store, products }) => {
  const categories = useMemo(
    () => parseCategories(store?.categoriesJson || store?.categories),
    [store?.categoriesJson, store?.categories],
  );

  const categoryMap = useMemo(() => {
    return new Map(categories.map((category) => [category.id, category]));
  }, [categories]);

  const productList = Array.isArray(products) ? products : [];

  // Parse featured product IDs
  const featuredProductIds = useMemo(() => {
    try {
      const settings =
        typeof store?.settings === "string"
          ? JSON.parse(store.settings)
          : store?.settings || {};
      const catalog = settings.catalog || {};
      return Array.isArray(catalog.featuredProductIds)
        ? catalog.featuredProductIds
        : [];
    } catch (e) {
      return [];
    }
  }, [store?.settings]);

  const hasFeaturedProducts = useMemo(() => {
    if (!featuredProductIds.length) return false;
    return productList.some((p) => featuredProductIds.includes(p.id || p.$id));
  }, [featuredProductIds, productList]);

  const priceBounds = useMemo(() => {
    if (!productList.length) return { min: 0, max: 0 };
    const prices = productList
      .map((product) => product?.price)
      .filter((price) => typeof price === "number");
    if (!prices.length) return { min: 0, max: 0 };
    return {
      min: 0, // Allow 0 based on DB schema
      max: prices.length ? Math.max(...prices) : 0,
    };
  }, [productList]);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategoryIds, setActiveCategoryIds] = useState([]);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(priceBounds.max);
  const [sortOrder, setSortOrder] = useState("none"); // 'asc', 'desc', 'none'
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);

  useEffect(() => {
    setMinPrice(0);
    setMaxPrice(priceBounds.max);
    setSortOrder("none");
    setShowFeaturedOnly(false);
  }, [priceBounds.max]);

  const toggleCategory = (categoryId) => {
    setActiveCategoryIds((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId],
    );
  };

  const toggleFeaturedOnly = () => setShowFeaturedOnly((prev) => !prev);

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const min = clampNumber(minPrice, priceBounds.min);
    const max = clampNumber(maxPrice, priceBounds.max);

    const filtered = productList.filter((product) => {
      // 1. Filter by featured if enabled
      if (showFeaturedOnly) {
        const isFeatured = featuredProductIds.includes(
          product.id || product.$id,
        );
        if (!isFeatured) return false;
      }

      const price = typeof product.price === "number" ? product.price : 0;
      if (price < min || price > max) return false;

      const matchesQuery = !query
        ? true
        : [product.name, product.description]
            .filter(Boolean)
            .some((value) => value.toLowerCase().includes(query));

      if (!matchesQuery) return false;

      if (!activeCategoryIds.length) return true;
      const ids = Array.isArray(product.categoryIds) ? product.categoryIds : [];
      return ids.some((id) => activeCategoryIds.includes(id));
    });

    const withCategories = filtered.map((product) => {
      // Mark formatted product as featured for UI usage
      const isFeatured = featuredProductIds.includes(product.id || product.$id);

      let finalProduct = product;

      if (!product?.categories?.length) {
        const ids = Array.isArray(product?.categoryIds)
          ? product.categoryIds
          : [];
        const resolvedCategories = ids
          .map((id) => categoryMap.get(id))
          .filter(Boolean);

        if (resolvedCategories.length) {
          finalProduct = { ...product, categories: resolvedCategories };
        }
      }

      // Append isFeatured flag
      return { ...finalProduct, isFeatured };
    });

    // Sorting
    if (sortOrder === "asc") {
      return [...withCategories].sort(
        (a, b) => (a.price || 0) - (b.price || 0),
      );
    } else if (sortOrder === "desc") {
      return [...withCategories].sort(
        (a, b) => (b.price || 0) - (a.price || 0),
      );
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
    categoryMap,
    showFeaturedOnly,
    featuredProductIds,
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

export const useCatalog = useCatalogFilters;

export const getProductShareUrl = (productId) => {
  if (!productId) return "";
  if (typeof window === "undefined") return `/product/${productId}`;
  return new URL(`/product/${productId}`, window.location.origin).toString();
};

export const shareProduct = async (product) => {
  if (!product?.$id) return "noop";
  const url = getProductShareUrl(product.$id);
  const payload = {
    title: product.name,
    text: product.description || "",
    url,
  };

  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share(payload);
      return "shared";
    } catch (error) {
      // Fallback to clipboard
    }
  }

  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(url);
      return "copied";
    } catch (error) {
      return "failed";
    }
  }

  if (typeof window !== "undefined") {
    window.open(url, "_blank", "noopener,noreferrer");
    return "opened";
  }

  return "failed";
};

export const useProductShare = () => {
  const [sharedProductId, setSharedProductId] = useState(null);

  const handleShare = async (product) => {
    const result = await shareProduct(product);
    if (result === "copied") {
      setSharedProductId(product.$id);
      setTimeout(() => setSharedProductId(null), 1500);
    }
  };

  return { handleShare, sharedProductId };
};
