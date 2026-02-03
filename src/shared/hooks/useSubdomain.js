import { useState, useEffect, useMemo } from "react";
import { APP_CONFIG } from "@/shared/lib/appwrite";

/**
 * @typedef {Object} SubdomainResult
 * @property {boolean} isRootDomain - True if on the main domain
 * @property {string | null} slug - The store slug extracted from subdomain
 * @property {boolean} isLoading - True while determining subdomain
 */

/**
 * Extract slug from hostname
 * @param {string} hostname - Current hostname (e.g., 'mystore.catalog.racoondevs.com')
 * @param {string} baseDomain - Base domain (e.g., 'catalog.racoondevs.com')
 * @returns {string | null} - Extracted slug or null if root domain
 */
function extractSlugFromHostname(hostname, baseDomain) {
  // Guard against undefined/null values
  if (!hostname || !baseDomain) {
    return null;
  }

  // Normalize both to lowercase
  const normalizedHostname = hostname.toLowerCase();
  const normalizedBaseDomain = baseDomain.toLowerCase();

  // If hostname equals base domain, it's root
  if (normalizedHostname === normalizedBaseDomain) {
    return null;
  }

  // If hostname ends with .baseDomain, extract the subdomain
  const suffix = `.${normalizedBaseDomain}`;
  if (normalizedHostname.endsWith(suffix)) {
    const slug = normalizedHostname.slice(0, -suffix.length);
    // Validate slug format (no dots, alphanumeric + hyphens)
    if (slug && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      return slug;
    }
  }

  return null;
}

/**
 * Hook to detect and extract subdomain slug
 * Supports local development with ?slug=xxx query parameter
 * @returns {SubdomainResult}
 */
export function useSubdomain() {
  const [isLoading, setIsLoading] = useState(true);
  const [slug, setSlug] = useState(/** @type {string | null} */ (null));

  useEffect(() => {
    const hostname = window.location.hostname;
    const baseDomain = APP_CONFIG?.baseDomain || APP_CONFIG?.BASE_DOMAIN;

    // Guard against missing base domain
    if (!baseDomain) {
      console.error("BASE_DOMAIN not configured in environment variables");
      setSlug(null);
      setIsLoading(false);
      return;
    }

    // Check for local development override via query param
    const urlParams = new URLSearchParams(window.location.search);
    const devSlug = urlParams.get("slug");

    // Local development detection
    const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1";

    if (isLocalhost && devSlug) {
      // Use query param slug for local development
      setSlug(devSlug.toLowerCase());
    } else if (isLocalhost) {
      // Localhost without slug param = root domain
      setSlug(null);
    } else {
      // Production: extract from hostname
      const extractedSlug = extractSlugFromHostname(hostname, baseDomain);
      setSlug(extractedSlug);
    }

    setIsLoading(false);
  }, []);

  const result = useMemo(
    () => ({
      isRootDomain: slug === null,
      slug,
      isLoading,
    }),
    [slug, isLoading],
  );

  return result;
}
