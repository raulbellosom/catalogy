import { useState } from "react";
import {
  Search,
  ShoppingCart,
  Menu,
  X,
  Store,
  ExternalLink,
} from "lucide-react";
import { getStoreLogoUrl } from "@/shared/services/storeService";
import { Logo } from "@/shared/ui/atoms/Logo";

/**
 * Shared Navbar Component for Stores
 * @param {Object} props
 * @param {Object} props.store - Store data
 * @param {Object} props.config - Styling configuration
 * @param {string} props.config.bg - Background color (e.g., 'bg-white', 'bg-(--noir-bg)')
 * @param {string} props.config.text - Text color
 * @param {string} props.config.border - Border color
 * @param {boolean} [props.isPreview=false]
 * @param {Object} [props.search] - Search functionality
 * @param {string} props.search.query
 * @param {Function} props.search.onQueryChange
 * @param {Function} [props.onMobileMenuToggle] - If provided, shows menu trigger
 */
export function StoreNavbar({
  store,
  config = {},
  isPreview = false,
  search,
  actions = null,
  onMobileMenuToggle,
}) {
  const logoUrl = store?.logoFileId ? getStoreLogoUrl(store.logoFileId) : null;
  const {
    bg = "bg-white",
    text = "text-slate-900",
    border = "border-slate-200",
    accent = "text-blue-600",
    glass = false,
  } = config;

  return (
    <nav
      className={`fixed ${isPreview ? "top-10" : "top-0"} left-0 right-0 z-50 
        ${bg} ${text} border-b ${border} 
        ${glass ? "backdrop-blur-md bg-opacity-80" : ""} 
        transition-all duration-300`}
    >
      <div className="mx-auto max-w-7xl px-4 h-16 flex items-center justify-between gap-4">
        {/* Left: Logo & Name */}
        <div className="flex items-center gap-3 shrink-0">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={store?.name}
              className={`h-8 w-8 rounded-lg object-cover border ${border}`}
            />
          ) : (
            <Logo className={`h-6 w-auto ${accent}`} variant="icon" />
          )}
          <span className="font-bold tracking-tight truncate max-w-[200px] md:max-w-none">
            {store?.name || "Store"}
          </span>
        </div>

        {/* Center: Search (Optional) */}
        {search && (
          <div className="hidden md:flex flex-1 max-w-sm lg:max-w-md mx-4">
            <div
              className={`relative w-full flex items-center border ${border} rounded-lg overflow-hidden bg-opacity-10 bg-black/5 focus-within:ring-2 ring-current`}
            >
              <Search className={`w-4 h-4 absolute left-3 opacity-50`} />
              <input
                type="text"
                placeholder="Buscar productos..."
                className={`w-full py-2 pl-9 pr-4 bg-transparent outline-none text-sm placeholder-current placeholder-opacity-50`}
                value={search.query}
                onChange={(e) => search.onQueryChange(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Right: Actions */}
        <div className="flex items-center gap-3 md:gap-4 shrink-0">
          {/* Custom Actions Slot (e.g. Payment Link inside template logic passed here, or hardcoded checks) */}
          {actions}

          {/* Fallback standard actions if desired, or leave empty to be filled by 'actions' prop */}
          {store?.paymentLink && !actions && (
            <a
              href={store.paymentLink}
              target="_blank"
              rel="noopener noreferrer"
              className={`hidden sm:flex items-center gap-2 text-sm font-medium ${accent} hover:opacity-80 transition-opacity`}
            >
              <ExternalLink className="w-4 h-4" />
              <span className="hidden lg:inline">Pagar</span>
            </a>
          )}

          {/* Mobile Menu Trigger */}
          {onMobileMenuToggle && (
            <button
              onClick={onMobileMenuToggle}
              className={`md:hidden p-2 -mr-2 ${config.text || "text-current"} hover:opacity-70`}
            >
              <Menu className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
