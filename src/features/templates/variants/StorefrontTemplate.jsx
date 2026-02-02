/**
 * StorefrontTemplate
 *
 * Template estilo tienda clasica.
 * - Header prominente con descripcion
 * - Banner de hero
 * - Grid de productos organizado
 */

import { Render } from "@puckeditor/core";
import { StoreHeader, ProductGrid } from "../components";
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
    <div className="min-h-screen bg-[var(--background)]">
      {/* Hero Banner */}
      <StoreHeader store={store} variant="banner" showDescription={true} />

      {/* Seccion de bienvenida */}
      <section className="bg-[var(--muted)] py-8">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">
            Bienvenido a nuestra tienda
          </h2>
          <p className="mt-2 text-[var(--muted-foreground)] max-w-2xl mx-auto">
            Explora nuestra coleccion de productos seleccionados especialmente
            para ti
          </p>
        </div>
      </section>

      {/* Productos */}
      <main className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[var(--foreground)]">
            Nuestros productos
          </h2>
          <p className="text-[var(--muted-foreground)] mt-1">
            {products?.length || 0} productos disponibles
          </p>
        </div>

        <ProductGrid
          products={products}
          variant="standard"
          showDescription={true}
        />
      </main>

      {/* Footer con mas info */}
      <footer className="bg-[var(--card)] border-t border-[var(--border)] py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h3 className="font-semibold text-[var(--foreground)]">
              {store.name}
            </h3>
            {store.description && (
              <p className="text-sm text-[var(--muted-foreground)] mt-1 max-w-md mx-auto">
                {store.description}
              </p>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
