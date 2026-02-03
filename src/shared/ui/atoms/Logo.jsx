import { Link } from "react-router-dom";
import { Store } from "lucide-react";
import { useSubdomainContext } from "@/app/providers/SubdomainProvider";
import { useStoreBySlug } from "@/shared/hooks/useStore";
import { getStoreLogoUrl } from "@/shared/services/storeService";

/**
 * Logo component
 * Displays platform logo or store logo based on context
 * @param {Object} props
 * @param {"full" | "icon"} [props.variant="full"] - Display variant
 * @param {string} [props.className] - Additional classes
 */
export function Logo({
  variant = "full",
  className = "",
  asLink = true,
  imgClass = "w-8 h-8 object-contain",
  forcePlatform = false,
}) {
  const { isStoreDomain, slug } = useSubdomainContext();
  const isActualStoreDomain = isStoreDomain && !forcePlatform;

  // Try to get store data if we are in store domain
  const { data: storeBySlug } = useStoreBySlug(
    isActualStoreDomain ? slug : null,
  );

  // Logic for Logo Source
  const logoSrc =
    isActualStoreDomain && storeBySlug?.logoFileId
      ? getStoreLogoUrl(storeBySlug.logoFileId)
      : "/icon.png"; // Default platform logo

  const showText = variant === "full";
  const brandName =
    isActualStoreDomain && storeBySlug ? storeBySlug.name : "Catalogy";

  const Component = asLink ? Link : "div";
  const linkProps = asLink ? { to: isStoreDomain ? "/" : "/" } : {};

  return (
    <Component
      {...linkProps}
      className={`flex items-center ${showText ? "gap-2" : "justify-center"} ${className}`}
    >
      {/* If logo image exists */}
      <img
        src={logoSrc}
        alt={`${brandName} Logo`}
        className={`${imgClass}`}
        onError={(e) => {
          // Fallback to icon if image fails
          e.target.style.display = "none";
          e.target.nextSibling.style.display = "block";
        }}
      />
      {/* Fallback Icon - Hidden by default if image loads */}
      <Store
        className={`${imgClass} text-[var(--color-primary)] hidden`}
        style={{ display: "none" }} // Controlled by onError above for robustness
      />

      {showText && (
        <span className="text-xl font-bold text-[var(--color-fg)]">
          {brandName}
        </span>
      )}
    </Component>
  );
}
