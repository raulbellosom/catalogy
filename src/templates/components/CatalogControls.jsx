import { Search, SlidersHorizontal } from "lucide-react";

const toneStyles = {
  light: {
    panel: "bg-[var(--color-card)] border border-(--color-border)",
    input:
      "bg-[var(--color-bg-secondary)] border border-(--color-border) text-(--color-fg) placeholder:text-(--color-fg-muted)",
    chip: "border border-(--color-border) text-(--color-fg-secondary) hover:border-(--color-primary)",
    chipActive: "bg-(--color-primary) text-white border-(--color-primary)",
    label: "text-(--color-fg-secondary)",
  },
  noir: {
    panel: "bg-[var(--noir-surface)] border border-[var(--noir-border)]",
    input:
      "bg-[var(--noir-surface-2)] border border-[var(--noir-border)] text-[var(--noir-strong)] placeholder:text-[var(--noir-muted)]",
    chip: "border border-[var(--noir-border)] text-[var(--noir-muted)] hover:border-[var(--noir-accent)]",
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
    <div className={`rounded-2xl p-6 space-y-6 ${styles.panel}`}>
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em]">
        <SlidersHorizontal className={`h-3.5 w-3.5 ${styles.label}`} />
        <span className={styles.label}>Filtros</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="relative flex-1">
          <Search
            className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${styles.label}`}
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="¿Qué estás buscando?"
            className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all ${styles.input}`}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-6 min-w-[300px]">
          <div className="flex-1 space-y-2">
            <div className="flex justify-between items-center text-[10px] uppercase tracking-widest">
              <span className={styles.label}>Precio Min</span>
              <span className="font-bold">{formatPrice(minPrice)}</span>
            </div>
            <input
              type="range"
              min={priceBounds.min}
              max={priceBounds.max}
              step="1"
              value={minPrice}
              onChange={(event) => onMinPriceChange(Number(event.target.value))}
              className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-gray-700 accent-[var(--noir-accent)]"
            />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex justify-between items-center text-[10px] uppercase tracking-widest">
              <span className={styles.label}>Precio Max</span>
              <span className="font-bold">{formatPrice(maxPrice)}</span>
            </div>
            <input
              type="range"
              min={priceBounds.min}
              max={priceBounds.max}
              step="1"
              value={maxPrice}
              onChange={(event) => onMaxPriceChange(Number(event.target.value))}
              className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-gray-700 accent-[var(--noir-accent)]"
            />
          </div>
        </div>
      </div>

      {categories?.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-[var(--noir-border)] transition-all">
          {categories.map((category) => {
            const isActive = activeCategoryIds.includes(category.id);
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => onToggleCategory(category.id)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 ${
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

const formatPrice = (price) => {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(price);
};
