/**
 * GalleryTemplate
 *
 * Template estilo galeria visual.
 * - Pensado para productos con fuerte componente visual
 * - Grid grande con imagenes prominentes
 * - Ideal para: ropa, arte, fotografia, diseno
 */

import { Render } from "@puckeditor/core";
import { StoreHeader, ProductGrid, StoreFooter } from "../components";
import { galleryPuckConfig } from "../../editor/configs/galleryConfig";

/**
 * @param {Object} props
 * @param {Object} props.store - Datos de la tienda
 * @param {Array} props.products - Lista de productos
 * @param {Object|null} props.puckData - Configuracion de Puck (si existe)
 */
export function GalleryTemplate({ store, products, puckData }) {
  // Si hay puckData, renderizar con Puck
  if (puckData) {
    try {
      const data =
        typeof puckData === "string" ? JSON.parse(puckData) : puckData;
      return <Render config={galleryPuckConfig} data={data} />;
    } catch (error) {
      console.error("Error parsing puckData:", error);
    }
  }

  // Layout default estilo galeria
  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)]">
      {/* Hero grande y centrado */}
      <StoreHeader store={store} variant="hero" showDescription={true} />

      {/* Galeria de productos */}
      <main className="container mx-auto px-4 py-16 flex-1 max-w-7xl">
        {/* Grid amplio para enfatizar imagenes */}
        <ProductGrid
          products={products}
          variant="wide"
          showDescription={false}
        />
      </main>

      {/* Footer simple */}
      <StoreFooter store={store} variant="simple" />
    </div>
  );
}
