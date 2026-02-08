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

// --- Cart System ---

export const useShoppingCart = (storeId, products = []) => {
  const storageKey = `catalogy_cart_${storeId}`;

  const [cart, setCart] = useState(() => {
    if (typeof window === "undefined") return [];
    try {
      // Check for shared cart in URL first
      const params = new URLSearchParams(window.location.search);
      const sharedCart = params.get("cart");
      if (sharedCart) {
        // Format: ID:QTY;ID:QTY
        const items = sharedCart.split(";").map((item) => {
          const [id, qty] = item.split(":");
          const product = products.find((p) => (p.id || p.$id) === id);
          return { id, quantity: Number(qty) || 1, product };
        });
        // Clear param to clean URL but keep items in memory to save them
        window.history.replaceState({}, "", window.location.pathname);
        return items;
      }

      const item = window.localStorage.getItem(storageKey);
      return item ? JSON.parse(item) : [];
    } catch (error) {
      console.error("Error loading cart:", error);
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  // Auto-open cart if it was shared via URL
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("cart")) {
        setIsCartOpen(true);
      }
    }
  }, []);

  // Reconcile cart items with full product details when products load
  useEffect(() => {
    if (products?.length > 0 && cart.length > 0) {
      setCart((prev) =>
        prev.map((item) => {
          if (!item.product) {
            const found = products.find((p) => (p.id || p.$id) === item.id);
            if (found) return { ...item, product: found };
          }
          return item;
        }),
      );
    }
  }, [products, cart.length]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(storageKey, JSON.stringify(cart));
    }
  }, [cart, storageKey]);

  const addToCart = (product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find(
        (item) => item.id === (product.id || product.$id),
      );
      if (existing) {
        return prev.map((item) =>
          item.id === (product.id || product.$id)
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        );
      }
      return [
        ...prev,
        { id: product.id || product.$id, quantity, product }, // Store product data for display if needed
      ];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId, delta) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === productId) {
          const newQty = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      }),
    );
  };

  const clearCart = () => setCart([]);

  const getCartShareUrl = () => {
    if (typeof window === "undefined" || cart.length === 0) return "";
    const cartString = cart
      .map((item) => `${item.id}:${item.quantity}`)
      .join(";");
    const url = new URL(window.location.href);
    url.searchParams.set("cart", cartString);
    return url.toString();
  };

  const getCartWhatsAppMessage = (storeName) => {
    if (cart.length === 0) return "";
    let message = `Hola! Me interesa comprar lo siguiente de ${storeName}:\n\n`;
    cart.forEach((item) => {
      // We might not have full product details if loaded from URL, handle gracefully
      const name = item.product?.name || `Producto ID: ${item.id}`;
      const price = item.product?.price ? `$${item.product.price}` : "";
      message += `• ${item.quantity}x ${name} ${price}\n`;
    });
    return encodeURIComponent(message);
  };

  return {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    updateQty: updateQuantity, // Alias for templates
    clearCart,
    isCartOpen,
    setIsCartOpen,
    getCartShareUrl,
    getCartWhatsAppMessage,
    handleWhatsAppCheckout: getCartWhatsAppMessage, // Alias for templates
  };
};

export const useProductDeepLink = (products) => {
  const [initialProductId, setInitialProductId] = useState(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const productId = params.get("product");
    if (productId && products?.length) {
      const exists = products.find((p) => (p.id || p.$id) === productId);
      if (exists) {
        setInitialProductId(productId);
        // Optional: Clean URL
        // window.history.replaceState({}, "", window.location.pathname);
      }
    }
  }, [products]);

  return initialProductId;
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
    } catch (error) {
      return "failed";
    }
  }

  return "failed";
};

export const useProductShare = () => {
  const [sharedProductId, setSharedProductId] = useState(null);

  const handleShare = async (product) => {
    const result = await shareProduct(product);
    if (result === "copied") {
      setSharedProductId(product.id || product.$id);
      setTimeout(() => setSharedProductId(null), 2000);
    }
  };

  return { handleShare, sharedProductId };
};
