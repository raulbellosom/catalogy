/**
 * Template Registry
 *
 * Registro central de todos los templates disponibles para el catalogo.
 * Cada template define su componente JSX y metadata.
 */

import { MinimalTemplate } from "./variants/MinimalTemplate";
import { StorefrontTemplate } from "./variants/StorefrontTemplate";
import { GalleryTemplate } from "./variants/GalleryTemplate";
import { NoirGridTemplate } from "./variants/NoirGridTemplate";

/**
 * @typedef {Object} TemplateConfig
 * @property {string} id - Identificador unico del template
 * @property {string} name - Nombre para mostrar
 * @property {string} description - Descripcion breve del template
 * @property {React.ComponentType} component - Componente React del template
 * @property {string} thumbnail - URL del thumbnail para preview
 */

/**
 * Registro de templates disponibles
 * @type {Record<string, TemplateConfig>}
 */
export const TEMPLATES = {
  minimal: {
    id: "minimal",
    name: "Minimal",
    description: "Tipografia simple, fondo limpio, lista directa de productos",
    component: MinimalTemplate,
    thumbnail: "/templates/minimal-thumb.png",
  },
  storefront: {
    id: "storefront",
    name: "Storefront",
    description: "Header prominente con descripcion, estilo tienda clasica",
    component: StorefrontTemplate,
    thumbnail: "/templates/storefront-thumb.png",
  },
  gallery: {
    id: "gallery",
    name: "Gallery",
    description:
      "Grid visual, ideal para productos con fuerte componente visual",
    component: GalleryTemplate,
    thumbnail: "/templates/gallery-thumb.png",
  },
  noir: {
    id: "noir",
    name: "Noir Grid",
    description: "Estetica oscura con cards premium y enfoque editorial",
    component: NoirGridTemplate,
    thumbnail: "/templates/noir-thumb.png",
  },
};

/**
 * Obtiene un template por su ID
 * @param {string} templateId - ID del template
 * @returns {TemplateConfig} El template solicitado o minimal como fallback
 */
export const getTemplate = (templateId) => {
  return TEMPLATES[templateId] || TEMPLATES.minimal;
};

/**
 * Lista de templates para mostrar en selector
 * @returns {TemplateConfig[]}
 */
export const getTemplateList = () => {
  return Object.values(TEMPLATES);
};

/**
 * IDs de templates validos
 */
export const TEMPLATE_IDS = Object.keys(TEMPLATES);
