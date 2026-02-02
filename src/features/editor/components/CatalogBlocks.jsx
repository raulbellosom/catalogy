/**
 * Puck Editor - Componentes de Catalogo
 *
 * Bloques especificos para mostrar datos del catalogo:
 * header de tienda, grid de productos, producto individual.
 */

import {
  StoreHeader,
  ProductGrid,
  ProductCard,
} from "../../templates/components";

/**
 * Componente: StoreHeaderBlock
 * Renderiza el header de la tienda con datos reales
 */
export const StoreHeaderBlock = {
  label: "Header de Tienda",
  fields: {
    variant: {
      type: "select",
      label: "Estilo",
      options: [
        { label: "Minimal", value: "minimal" },
        { label: "Banner", value: "banner" },
        { label: "Hero", value: "hero" },
      ],
    },
    showDescription: {
      type: "radio",
      label: "Mostrar descripcion",
      options: [
        { label: "Si", value: true },
        { label: "No", value: false },
      ],
    },
  },
  defaultProps: {
    variant: "minimal",
    showDescription: true,
  },
  // Los datos de store se inyectan via context
  render: ({ variant, showDescription, puck }) => {
    const store = puck.appState?.data?.root?.props?.store || {
      name: "Nombre de la tienda",
      description: "Descripcion de ejemplo",
    };

    return (
      <StoreHeader
        store={store}
        variant={variant}
        showDescription={showDescription}
      />
    );
  },
};

/**
 * Componente: ProductGridBlock
 * Renderiza el grid de productos con datos reales
 */
export const ProductGridBlock = {
  label: "Grid de Productos",
  fields: {
    variant: {
      type: "select",
      label: "Layout",
      options: [
        { label: "Lista", value: "list" },
        { label: "Compacto", value: "compact" },
        { label: "Estandar", value: "standard" },
        { label: "Amplio", value: "wide" },
      ],
    },
    showDescription: {
      type: "radio",
      label: "Mostrar descripcion",
      options: [
        { label: "Si", value: true },
        { label: "No", value: false },
      ],
    },
    limit: {
      type: "number",
      label: "Limite de productos (0 = todos)",
      min: 0,
    },
  },
  defaultProps: {
    variant: "standard",
    showDescription: true,
    limit: 0,
  },
  render: ({ variant, showDescription, limit, puck }) => {
    let products = puck.appState?.data?.root?.props?.products || [];

    // Aplicar limite si es mayor a 0
    if (limit > 0) {
      products = products.slice(0, limit);
    }

    // Datos de ejemplo para el editor
    if (products.length === 0) {
      products = [
        {
          $id: "1",
          name: "Producto ejemplo",
          price: 99.99,
          description: "Descripcion de ejemplo",
        },
        {
          $id: "2",
          name: "Otro producto",
          price: 149.99,
          description: "Otra descripcion",
        },
        {
          $id: "3",
          name: "Tercer producto",
          price: 199.99,
          description: "Mas descripcion",
        },
      ];
    }

    return (
      <ProductGrid
        products={products}
        variant={variant}
        showDescription={showDescription}
      />
    );
  },
};

/**
 * Componente: FeaturedProductBlock
 * Muestra un producto destacado individual
 */
export const FeaturedProductBlock = {
  label: "Producto Destacado",
  fields: {
    productIndex: {
      type: "number",
      label: "Indice del producto (0 = primero)",
      min: 0,
    },
    size: {
      type: "select",
      label: "Tamano",
      options: [
        { label: "Pequeno", value: "small" },
        { label: "Mediano", value: "medium" },
        { label: "Grande", value: "large" },
      ],
    },
  },
  defaultProps: {
    productIndex: 0,
    size: "large",
  },
  render: ({ productIndex, size, puck }) => {
    const products = puck.appState?.data?.root?.props?.products || [];
    const product = products[productIndex] || {
      $id: "featured",
      name: "Producto destacado",
      price: 299.99,
      description: "Este es el producto estrella de tu tienda",
    };

    return (
      <div className="flex justify-center">
        <ProductCard product={product} size={size} showDescription={true} />
      </div>
    );
  },
};
