/**
 * StorefrontTemplate
 *
 * Template estilo tienda clasica.
 * - Header prominente con descripcion
 * - Banner de hero
 * - Grid de productos organizado
 */

import { Render } from "@puckeditor/core";
import { StoreHeader, ProductGrid, StoreFooter } from "../components";
import { storefrontPuckConfig } from "../../editor/configs/storefrontConfig";

/**
 * @param {Object} props
 * @param {Object} props.store - Datos de la tienda
 * @param {Array} props.products - Lista de productos
 * @param {Object|null} props.puckData - Configuracion de Puck (si existe)
 */
export function StorefrontTemplate({ store, products, puckData }) {
  // Si hay puckData, renderizar con Puck
  if (puckData) {
    try {
      const data =
        typeof puckData === "string" ? JSON.parse(puckData) : puckData;
      return <Render config={storefrontPuckConfig} data={data} />;
    } catch (error) {
      console.error("Error parsing puckData:", error);
    }
  }

  // Layout default estilo storefront
  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)]">
      {/* Hero Banner with Primary Color Background */}
      <StoreHeader store={store} variant="banner" showDescription={true} />

      {/* Seccion de bienvenida / Features */}
      <section className="bg-[var(--muted)]/50 py-12 border-b border-[var(--border)]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-[var(--foreground)] mb-3">
            Bienvenido a {store.name}
          </h2>
          <p className="text-[var(--muted-foreground)] max-w-2xl mx-auto text-lg leading-relaxed">
            Explora nuestra colección de productos seleccionados. Calidad y
            servicio garantizados.
          </p>
        </div>
      </section>

      {/* Productos */}
      <main className="container mx-auto px-4 py-16 flex-1">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-[var(--border)]">
          <h2 className="text-2xl font-bold text-[var(--foreground)]">
            Catálogo
          </h2>
          <span className="text-sm font-medium px-3 py-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)]">
            {products?.length || 0} Productos
          </span>
        </div>

        <ProductGrid
          products={products}
          variant="standard"
          showDescription={true}
        />
      </main>

      {/* Footer promiment */}
      <StoreFooter store={store} variant="prominent" />
    </div>
  );
}
