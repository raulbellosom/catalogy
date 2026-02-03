import { useEffect } from "react";
import { useSubdomainContext } from "@/app/providers/SubdomainProvider";
import { useStoreBySlug } from "@/shared/hooks/useStore";

/**
 * Hook to manage document head (title, favicon, meta) dynamically
 * based on the store context.
 */
export function useDynamicHead() {
  const { isStoreDomain, slug } = useSubdomainContext();
  const { data: store } = useStoreBySlug(isStoreDomain ? slug : null);

  useEffect(() => {
    // 1. Dynamic Title
    if (isStoreDomain && store) {
      document.title = `${store.name} - Catalogy`; // Or just store.name
    } else if (isStoreDomain && !store) {
      // Loading or not found
      // Keep default or set to 'Store not found'
    } else {
      // Platform / Dashboard
      // Default is in index.html, but we can reset it here if needed
      document.title = "Catalogy - Crea tu catálogo online";
    }

    // 2. Dynamic Favicon (if store has a logo, ideally we'd mask it or use a specific icon)
    // Changing favicon dynamically is a bit tricker to get right across browsers but <link rel="icon"> update works.
    const link =
      document.querySelector("link[rel*='icon']") ||
      document.createElement("link");
    link.type = "image/png"; // Assuming png for specific logos
    link.rel = "icon";
    document.getElementsByTagName("head")[0].appendChild(link);

    if (isStoreDomain && store?.logoUrl) {
      link.href = store.logoUrl;
    } else {
      link.href = "/favicon.svg"; // Default platform favicon
      link.type = "image/svg+xml";
    }
  }, [isStoreDomain, store]);
}
