import { Search, SlidersHorizontal } from "lucide-react";

const toneStyles = {
  light: {
    panel: "bg-[var(--color-card)] border border-(--color-border)",
    input:
      "bg-[var(--color-bg-secondary)] border border-(--color-border) text-(--color-fg) placeholder:text-(--color-fg-muted)",
    chip:
      "border border-(--color-border) text-(--color-fg-secondary) hover:border-(--color-primary)",
    chipActive: "bg-(--color-primary) text-white border-(--color-primary)",
    label: "text-(--color-fg-secondary)",
  },
  noir: {
    panel: "bg-[var(--noir-surface)] border border-[var(--noir-border)]",
    input:
      "bg-[var(--noir-surface-2)] border border-[var(--noir-border)] text-[var(--noir-strong)] placeholder:text-[var(--noir-muted)]",
    chip:
      "border border-[var(--noir-border)] text-[var(--noir-muted)] hover:border-[var(--noir-accent)]",
    chipActive:
      "bg-[var(--noir-accent)] text-black border-[var(--noir-accent)]",
    label: "text-[var(--noir-muted)]",
  },
};

export function CatalogControls({
  tone = "light",
  searchQuery,
  onSearchChange,
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
  priceBounds,
  categories,
  activeCategoryIds,
  onToggleCategory,
}) {
  const styles = toneStyles[tone] || toneStyles.light;

  return (
    <div className={`rounded-2xl p-4 space-y-4 ${styles.panel}`}>
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em]">
        <SlidersHorizontal className={`h-3.5 w-3.5 ${styles.label}`} />
        <span className={styles.label}>Filtros locales</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-3">
        <div className="relative">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${styles.label}`} />
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Buscar productos"
            className={`w-full pl-9 pr-3 py-2 rounded-xl text-sm outline-none ${styles.input}`}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className={`text-[10px] uppercase tracking-[0.2em] ${styles.label}`}>
              Min
            </label>
            <input
              type="number"
              value={minPrice}
              min={priceBounds.min}
              max={priceBounds.max}
              onChange={(event) => onMinPriceChange(event.target.value)}
              className={`mt-1 w-full px-3 py-2 rounded-xl text-sm outline-none ${styles.input}`}
            />
          </div>
          <div>
            <label className={`text-[10px] uppercase tracking-[0.2em] ${styles.label}`}>
              Max
            </label>
            <input
              type="number"
              value={maxPrice}
              min={priceBounds.min}
              max={priceBounds.max}
              onChange={(event) => onMaxPriceChange(event.target.value)}
              className={`mt-1 w-full px-3 py-2 rounded-xl text-sm outline-none ${styles.input}`}
            />
          </div>
        </div>
      </div>

      {categories?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => {
            const isActive = activeCategoryIds.includes(category.id);
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => onToggleCategory(category.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  isActive ? styles.chipActive : styles.chip
                }`}
              >
                {category.name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
