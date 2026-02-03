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

  const productList = Array.isArray(products) ? products : [];

  const priceBounds = useMemo(() => {
    if (!productList.length) return { min: 0, max: 0 };
    const prices = productList
      .map((product) => product?.price)
      .filter((price) => typeof price === "number");
    if (!prices.length) return { min: 0, max: 0 };
    return {
      min: 1, // Siempre permitir filtrar desde 1 como base mínima
      max: prices.length ? Math.max(...prices) : 0,
    };
  }, [productList]);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategoryIds, setActiveCategoryIds] = useState([]);
  const [minPrice, setMinPrice] = useState(1);
  const [maxPrice, setMaxPrice] = useState(priceBounds.max);

  useEffect(() => {
    setMinPrice(1);
    setMaxPrice(priceBounds.max);
  }, [priceBounds.max]);

  const toggleCategory = (categoryId) => {
    setActiveCategoryIds((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId],
    );
  };

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const min = clampNumber(minPrice, priceBounds.min);
    const max = clampNumber(maxPrice, priceBounds.max);

    return productList.filter((product) => {
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
  }, [
    productList,
    searchQuery,
    activeCategoryIds,
    minPrice,
    maxPrice,
    priceBounds.min,
    priceBounds.max,
  ]);

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
  };
};

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
