import { createContext, useContext, useMemo } from "react";
import { useSubdomain } from "@/shared/hooks/useSubdomain";
import { useStoreBySlug } from "@/shared/hooks/useStore";
import { useAuth } from "@/app/providers/AuthProvider";

/**
 * @typedef {Object} SubdomainContextValue
 * @property {boolean} isRootDomain - True if on the main domain (catalogy.racoondevs.com)
 * @property {boolean} isStoreDomain - True if on a store subdomain ({slug}.catalogy.racoondevs.com)
 * @property {string | null} slug - The store slug from subdomain, or null if root domain
 * @property {boolean} isLoading - True while determining domain context
 */

// Default value to prevent null context errors
const defaultValue = {
  isRootDomain: true,
  isStoreDomain: false,
  slug: null,
  isLoading: true,
};

const SubdomainContext = createContext(
  /** @type {SubdomainContextValue} */ (defaultValue),
);

/**
 * Subdomain provider component
 * Determines the current domain context (root vs store subdomain)
 * @param {{ children: React.ReactNode }} props
 */
export function SubdomainProvider({ children }) {
  try {
    const { isRootDomain, slug, isLoading: loadingSubdomain } = useSubdomain();
    const { user, isAuthenticated } = useAuth();
    const {
      data: store,
      isLoading: loadingStore,
      error,
    } = useStoreBySlug(slug);

    const isLoading = loadingSubdomain || (!!slug && loadingStore);

    const value = useMemo(
      () => ({
        isRootDomain,
        isStoreDomain: !isRootDomain && !!slug,
        slug,
        store,
        user,
        isAuthenticated,
        error,
        isLoading,
      }),
      [isRootDomain, slug, store, user, isAuthenticated, error, isLoading],
    );

    return (
      <SubdomainContext.Provider value={value}>
        {children}
      </SubdomainContext.Provider>
    );
  } catch (error) {
    console.error("SubdomainProvider error:", error);
    // Provide fallback context if initialization fails
    return (
      <SubdomainContext.Provider value={defaultValue}>
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
  return context;
}
