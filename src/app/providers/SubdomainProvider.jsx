import { createContext, useContext, useMemo } from "react";
import { useSubdomain } from "@/shared/hooks/useSubdomain";

/**
 * @typedef {Object} SubdomainContextValue
 * @property {boolean} isRootDomain - True if on the main domain (catalog.racoondevs.com)
 * @property {boolean} isStoreDomain - True if on a store subdomain ({slug}.catalog.racoondevs.com)
 * @property {string | null} slug - The store slug from subdomain, or null if root domain
 * @property {boolean} isLoading - True while determining domain context
 */

const SubdomainContext = createContext(
  /** @type {SubdomainContextValue | null} */ (null),
);

/**
 * Subdomain provider component
 * Determines the current domain context (root vs store subdomain)
 * @param {{ children: React.ReactNode }} props
 */
export function SubdomainProvider({ children }) {
  try {
    const { isRootDomain, slug, isLoading } = useSubdomain();

    const value = useMemo(
      () => ({
        isRootDomain,
        isStoreDomain: !isRootDomain && !!slug,
        slug,
        isLoading,
      }),
      [isRootDomain, slug, isLoading],
    );

    return (
      <SubdomainContext.Provider value={value}>
        {children}
      </SubdomainContext.Provider>
    );
  } catch (error) {
    console.error("SubdomainProvider error:", error);
    // Provide fallback context if initialization fails
    const fallbackValue = {
      isRootDomain: true,
      isStoreDomain: false,
      slug: null,
      isLoading: false,
    };
    return (
      <SubdomainContext.Provider value={fallbackValue}>
        {children}
      </SubdomainContext.Provider>
    );
  }
}

/**
 * Hook to access subdomain context
 * @returns {SubdomainContextValue}
 */
export function useSubdomainContext() {
  const context = useContext(SubdomainContext);
  if (!context) {
    throw new Error(
      "useSubdomainContext must be used within SubdomainProvider",
    );
  }
  return context;
}
