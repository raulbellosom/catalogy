import { useMemo } from "react";
import { CreditCard, Globe, MessageCircle, Package, Tags } from "lucide-react";
import {
  booleanField,
  clampPositiveInt,
  parseStoreCategories,
  resolveRuntimeContext,
} from "./runtimeContext";

function StoreFeaturesPreview({
  puck,
  title,
  description,
  showCatalogStats,
  showCategoriesPreview,
  maxCategories,
  showContactStatus,
  showPaymentStatus,
  showPublicationStatus,
}) {
  const { store, products } = resolveRuntimeContext(puck);
  const categories = parseStoreCategories(store);
  const visibleCategories = categories.slice(
    0,
    clampPositiveInt(maxCategories, categories.length || 4),
  );

  const cards = useMemo(() => {
    const items = [];

    if (showCatalogStats) {
      items.push({
        key: "catalog",
        icon: Package,
        label: "Inventario",
        value: `${products.length} productos`,
        helper: `${categories.length} categorias`,
      });
    }

    if (showContactStatus) {
      items.push({
        key: "contact",
        icon: MessageCircle,
        label: "Contacto",
        value: store.whatsapp ? "WhatsApp habilitado" : "Sin WhatsApp",
        helper: store.whatsapp ? String(store.whatsapp) : "Configuralo en General",
      });
    }

    if (showPaymentStatus) {
      items.push({
        key: "payments",
        icon: CreditCard,
        label: "Pagos",
        value: store.paymentLink ? "Pago en linea activo" : "Sin link de pago",
        helper: store.paymentLink ? "Boton de pago visible" : "Agrega un paymentLink",
      });
    }

    if (showPublicationStatus) {
      items.push({
        key: "publication",
        icon: Globe,
        label: "Publicacion",
        value: store.published ? "Catalogo publicado" : "Catalogo no publicado",
        helper: store.published
          ? "Visible para clientes"
          : "Solo visible en preview",
      });
    }

    return items;
  }, [
    categories.length,
    products.length,
    showCatalogStats,
    showContactStatus,
    showPaymentStatus,
    showPublicationStatus,
    store.paymentLink,
    store.published,
    store.whatsapp,
  ]);

  if (cards.length === 0 && !showCategoriesPreview) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 py-10 space-y-5">
      {(title || description) && (
        <div>
          {title && (
            <h2 className="text-2xl font-bold text-(--foreground)">{title}</h2>
          )}
          {description && (
            <p className="text-sm text-(--muted-foreground) mt-2">{description}</p>
          )}
        </div>
      )}

      {cards.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <article
                key={card.key}
                className="rounded-2xl border border-(--border) bg-(--card) p-4"
              >
                <div className="h-10 w-10 rounded-xl bg-(--muted) border border-(--border) flex items-center justify-center mb-3">
                  <Icon className="h-5 w-5 text-(--muted-foreground)" />
                </div>
                <p className="text-xs uppercase tracking-wide text-(--muted-foreground)">
                  {card.label}
                </p>
                <p className="text-sm font-semibold text-(--foreground) mt-1">
                  {card.value}
                </p>
                <p className="text-xs text-(--muted-foreground) mt-1">
                  {card.helper}
                </p>
              </article>
            );
          })}
        </div>
      )}

      {showCategoriesPreview && visibleCategories.length > 0 && (
        <div className="rounded-2xl border border-(--border) bg-(--card) p-4">
          <div className="flex items-center gap-2 mb-3">
            <Tags className="h-4 w-4 text-(--muted-foreground)" />
            <p className="text-sm font-semibold text-(--foreground)">
              Categorias visibles
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {visibleCategories.map((category) => (
              <span
                key={category.id}
                className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium border border-(--border) bg-(--muted) text-(--foreground)"
              >
                {category.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export const StoreFeaturesBlock = {
  label: "Caracteristicas de tienda",
  fields: {
    title: {
      type: "text",
      label: "Titulo de seccion",
      placeholder: "Caracteristicas de tu tienda",
    },
    description: {
      type: "textarea",
      label: "Descripcion de seccion",
      placeholder: "Informacion resumida para clientes",
    },
    showCatalogStats: booleanField("Mostrar estadisticas de catalogo"),
    showCategoriesPreview: booleanField("Mostrar categorias visibles"),
    maxCategories: {
      type: "number",
      label: "Maximo de categorias visibles",
      min: 1,
      max: 12,
      step: 1,
    },
    showContactStatus: booleanField("Mostrar estado de contacto"),
    showPaymentStatus: booleanField("Mostrar estado de pagos"),
    showPublicationStatus: booleanField("Mostrar estado de publicacion"),
  },
  defaultProps: {
    title: "Caracteristicas de la tienda",
    description: "Resumen automatico basado en los datos reales configurados.",
    showCatalogStats: true,
    showCategoriesPreview: true,
    maxCategories: 6,
    showContactStatus: true,
    showPaymentStatus: true,
    showPublicationStatus: true,
  },
  render: (props) => <StoreFeaturesPreview {...props} />,
};

