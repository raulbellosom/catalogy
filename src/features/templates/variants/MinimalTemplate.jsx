/**
 * MinimalTemplate
 *
 * Template minimalista para catalogos.
 * - Tipografia simple
 * - Fondo limpio
 * - Lista directa de productos
 *
 * Es el template default para nuevas tiendas.
 */

import { Render } from "@puckeditor/core";
import { StoreHeader, ProductGrid } from "../components";
import { minimalPuckConfig } from "../../editor/configs/minimalConfig";

/**
 * @param {Object} props
 * @param {Object} props.store - Datos de la tienda
 * @param {Array} props.products - Lista de productos
 * @param {Object|null} props.puckData - Configuracion de Puck (si existe)
 */
export function MinimalTemplate({ store, products, puckData }) {
  // Si hay puckData, renderizar con Puck
  if (puckData) {
    try {
      const data =
        typeof puckData === "string" ? JSON.parse(puckData) : puckData;
      return <Render config={minimalPuckConfig} data={data} />;
    } catch (error) {
      console.error("Error parsing puckData:", error);
      // Fallback al layout default si hay error
    }
  }

  // Layout default sin personalizacion
  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header minimalista */}
      <StoreHeader store={store} variant="minimal" showDescription={true} />

      {/* Separador sutil */}
      <div className="border-b border-[var(--border)]" />

      {/* Productos */}
      <main className="container mx-auto px-4 py-8">
        <ProductGrid
          products={products}
          variant="standard"
          showDescription={true}
        />
      </main>

      {/* Footer minimo */}
      <footer className="py-6 text-center text-sm text-[var(--muted-foreground)]">
        <p>{store.name}</p>
      </footer>
    </div>
  );
}
