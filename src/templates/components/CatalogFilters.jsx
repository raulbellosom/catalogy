import { useState, useEffect } from "react";
import { ArrowDownAZ, ArrowUpAZ, Check, Filter } from "lucide-react";

export function CatalogFilters({
  categories = [],
  activeCategoryIds = [],
  onToggleCategory,
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
  priceBounds,
  sortOrder,
  setSortOrder,
  primaryColor = "#000000",
}) {
  const formatPrice = (price) => {
    return (price || 0).toLocaleString("es-MX", {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  return (
    <div className="space-y-8">
      {/* Sort Section */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
          Ordenar Por
        </h3>
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all cursor-pointer"
        >
          <option value="none">Relevancia</option>
          <option value="asc">Menor precio</option>
          <option value="desc">Mayor precio</option>
        </select>
      </div>

      {/* Categories */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
          Categorías
        </h3>
        <ul className="space-y-2.5">
          {categories.map((cat) => {
            const isActive = activeCategoryIds.includes(cat.id);
            return (
              <li key={cat.id}>
                <button
                  onClick={() => onToggleCategory(cat.id)}
                  className="flex items-center gap-3 w-full text-left group"
                >
                  <div
                    className={`shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-all ${
                      isActive
                        ? "bg-black border-black text-white"
                        : "bg-white border-gray-300 group-hover:border-gray-400"
                    }`}
                    style={
                      isActive
                        ? {
                            backgroundColor: primaryColor,
                            borderColor: primaryColor,
                          }
                        : {}
                    }
                  >
                    {isActive && <Check size={12} strokeWidth={3} />}
                  </div>
                  <span
                    className={`text-sm transition-colors ${
                      isActive
                        ? "font-medium text-gray-900"
                        : "text-gray-600 group-hover:text-gray-900"
                    }`}
                  >
                    {cat.name}
                  </span>
                </button>
              </li>
            );
          })}
          {categories.length === 0 && (
            <li className="text-sm text-gray-400 italic">Sin categorías</li>
          )}
        </ul>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
          Rango de Precio
        </h3>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
              $
            </span>
            <PriceInput
              min={0}
              max={maxPrice}
              value={minPrice}
              onChange={onMinPriceChange}
              className="w-full pl-6 pr-2 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:border-black focus:ring-0 outline-none"
              placeholder="Min"
            />
          </div>
          <span className="text-gray-400">-</span>
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
              $
            </span>
            <PriceInput
              min={minPrice}
              max={priceBounds.max}
              value={maxPrice}
              onChange={onMaxPriceChange}
              className="w-full pl-6 pr-2 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:border-black focus:ring-0 outline-none"
              placeholder="Max"
            />
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-400 flex justify-between">
          <span>Min: {formatPrice(0)}</span>
          <span>Max: {formatPrice(priceBounds.max)}</span>
        </div>
      </div>
    </div>
  );
}

function PriceInput({ value, onChange, min, max, placeholder, className }) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e) => {
    setLocalValue(e.target.value);
  };

  const handleBlur = () => {
    if (localValue === "" || localValue === null) {
      setLocalValue(value);
      return;
    }
    const parsed = Number(localValue);
    if (!isNaN(parsed)) {
      onChange(parsed);
      setLocalValue(parsed);
    } else {
      setLocalValue(value);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.currentTarget.blur();
    }
  };

  return (
    <input
      type="number"
      min={min}
      max={max}
      value={localValue}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className={className}
      placeholder={placeholder}
    />
  );
}
