import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { getProductImageUrl } from "@/shared/services/productService";
import {
  booleanField,
  getFeaturedProducts,
  resolveRuntimeContext,
} from "./runtimeContext";

const HEIGHT_CLASS_MAP = {
  sm: "h-[300px] md:h-[360px]",
  md: "h-[360px] md:h-[440px]",
  lg: "h-[420px] md:h-[520px]",
};

function FeaturedHeroCarouselPreview({
  puck,
  title,
  subtitle,
  showPrice,
  showDescription,
  autoPlay,
  intervalSeconds,
  height,
  darkOverlay,
}) {
  const { store, products } = resolveRuntimeContext(puck);
  const items = useMemo(() => getFeaturedProducts(store, products, 5), [store, products]);
  const [index, setIndex] = useState(0);
  const safeInterval = Math.max(2, Number(intervalSeconds) || 5);

  useEffect(() => {
    if (!autoPlay || items.length <= 1) return undefined;
    const timer = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length);
    }, safeInterval * 1000);
    return () => window.clearInterval(timer);
  }, [autoPlay, items.length, safeInterval]);

  useEffect(() => {
    if (index >= items.length) setIndex(0);
  }, [items.length, index]);

  if (!items.length) return null;

  const active = items[index];
  const imageId = Array.isArray(active.imageFileIds) ? active.imageFileIds[0] : null;
  const imageUrl = imageId ? getProductImageUrl(imageId) : null;

  const next = () => setIndex((prev) => (prev + 1) % items.length);
  const prev = () => setIndex((prev) => (prev - 1 + items.length) % items.length);

  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      {(title || subtitle) && (
        <div className="mb-4 space-y-1">
          {title && <p className="text-xs uppercase tracking-[0.22em] text-(--muted-foreground)">{title}</p>}
          {subtitle && <h2 className="text-2xl font-bold text-(--foreground)">{subtitle}</h2>}
        </div>
      )}

      <div
        className={`relative overflow-hidden rounded-3xl border border-(--border) bg-(--muted) ${HEIGHT_CLASS_MAP[height] || HEIGHT_CLASS_MAP.md}`}
      >
        {imageUrl ? (
          <img
            key={active.$id || active.id}
            src={imageUrl}
            alt={active.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-(--muted) to-(--background)" />
        )}

        <div
          className={`absolute inset-0 ${darkOverlay ? "bg-black/45" : "bg-black/20"}`}
        />

        <div className="relative z-10 h-full flex items-end p-6 md:p-10">
          <div className="max-w-2xl text-white space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5" />
              Producto destacado
            </div>
            <h3 className="text-2xl md:text-4xl font-black leading-tight">
              {active.name}
            </h3>
            {showDescription && active.description && (
              <p className="text-sm md:text-base text-white/90 line-clamp-2">
                {active.description}
              </p>
            )}
            {showPrice && typeof active.price === "number" && (
              <p className="text-xl md:text-2xl font-bold">
                {active.price.toLocaleString("es-MX", {
                  style: "currency",
                  currency: active.currency || "MXN",
                })}
              </p>
            )}
          </div>
        </div>

        {items.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 h-9 w-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 h-9 w-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <div className="absolute bottom-4 right-4 z-20 flex items-center gap-1.5">
              {items.map((item, dotIndex) => (
                <button
                  key={item.$id || item.id || dotIndex}
                  type="button"
                  onClick={() => setIndex(dotIndex)}
                  className={`h-2 rounded-full transition-all ${
                    dotIndex === index ? "w-6 bg-white" : "w-2 bg-white/45"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export const FeaturedHeroCarouselBlock = {
  label: "Hero carousel destacado",
  fields: {
    title: {
      type: "text",
      label: "Eyebrow",
      placeholder: "Coleccion destacada",
    },
    subtitle: {
      type: "text",
      label: "Titulo",
      placeholder: "Los mas vendidos de la tienda",
    },
    showPrice: booleanField("Mostrar precio"),
    showDescription: booleanField("Mostrar descripcion"),
    autoPlay: booleanField("Auto rotacion"),
    intervalSeconds: {
      type: "number",
      label: "Intervalo en segundos",
      min: 2,
      max: 20,
      step: 1,
    },
    height: {
      type: "select",
      label: "Altura del hero",
      options: [
        { label: "Media", value: "sm" },
        { label: "Grande", value: "md" },
        { label: "Extra grande", value: "lg" },
      ],
    },
    darkOverlay: booleanField("Overlay oscuro fuerte"),
  },
  defaultProps: {
    title: "Coleccion destacada",
    subtitle: "Productos destacados",
    showPrice: true,
    showDescription: true,
    autoPlay: true,
    intervalSeconds: 6,
    height: "md",
    darkOverlay: true,
  },
  render: (props) => <FeaturedHeroCarouselPreview {...props} />,
};

