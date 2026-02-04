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
import { NatureTemplate } from "./variants/NatureTemplate";
import { PrismTemplate } from "./variants/PrismTemplate";
import { EtherealTemplate } from "./variants/EtherealTemplate";
import { VelocityTemplate } from "./variants/VelocityTemplate";
import { RibbonTemplate } from "./variants/RibbonTemplate";
import { SketchyTemplate } from "./variants/SketchyTemplate";
import { CoastalTemplate } from "./variants/CoastalTemplate";

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
    defaultSettings: {
      colors: { primary: "#000000", secondary: "#ffffff" },
      font: "inter",
    },
  },
  storefront: {
    id: "storefront",
    name: "Storefront",
    description: "Header prominente con descripcion, estilo tienda clasica",
    component: StorefrontTemplate,
    thumbnail: "/templates/storefront-thumb.png",
    defaultSettings: {
      colors: { primary: "#4f46e5", secondary: "#f8fafc" },
      font: "montserrat",
    },
  },
  gallery: {
    id: "gallery",
    name: "Gallery",
    description:
      "Grid visual, ideal para productos con fuerte componente visual",
    component: GalleryTemplate,
    thumbnail: "/templates/gallery-thumb.png",
    defaultSettings: {
      colors: { primary: "#1a1a1a", secondary: "#fafaf9" },
      font: "montserrat",
    },
  },
  noir: {
    id: "noir",
    name: "Noir Grid",
    description: "Estetica oscura con cards premium y enfoque editorial",
    component: NoirGridTemplate,
    thumbnail: "/templates/noir-thumb.png",
    defaultSettings: {
      colors: { primary: "#ffffff", secondary: "#0d0f10" },
      font: "jetbrains",
    },
  },
  nature: {
    id: "nature",
    name: "Nature",
    description: "Diseño orgánico y sereno con tonos tierra y verdes",
    component: NatureTemplate,
    thumbnail: "/templates/nature-thumb.png",
    defaultSettings: {
      colors: { primary: "#15803d", secondary: "#fdfbf7" },
      font: "merriweather",
    },
  },
  prism: {
    id: "prism",
    name: "Prism",
    description:
      "Diseño futurista con glassmorphism, gradientes y estética tech",
    component: PrismTemplate,
    thumbnail: "/templates/prism-thumb.png",
    defaultSettings: {
      colors: { primary: "#8b5cf6", secondary: "#0f172a" },
      font: "montserrat",
    },
  },
  ethereal: {
    id: "ethereal",
    name: "Ethereal",
    description:
      "Lujo minimalista, tipografía serif y elegancia para perfumes y joyería",
    component: EtherealTemplate,
    thumbnail: "/templates/ethereal-thumb.png",
    defaultSettings: {
      colors: { primary: "#BFA181", secondary: "#FAFAF9" },
      font: "playfair",
    },
  },
  velocity: {
    id: "velocity",
    name: "Velocity",
    description:
      "Diseño automotriz de alto impacto, grids amplios y estética técnica",
    component: VelocityTemplate,
    thumbnail: "/templates/velocity-thumb.png",
    defaultSettings: {
      colors: { primary: "#DC2626", secondary: "#F8FAFC" },
      font: "inter",
    },
  },
  ribbon: {
    id: "ribbon",
    name: "Ribbon",
    description: "Editorial limpio con cintas suaves y grid aireado",
    component: RibbonTemplate,
    thumbnail: "/templates/ribbon-thumb.png",
    defaultSettings: {
      colors: { primary: "#1f7a5f", secondary: "#fbfaf7" },
      font: "playfair",
    },
  },
  sketchy: {
    id: "sketchy",
    name: "Sketchy",
    description:
      "Estilo dibujado a mano con bordes irregulares y aspecto artesanal",
    component: SketchyTemplate,
    thumbnail: "/templates/sketchy-thumb.png",
    defaultSettings: {
      colors: { primary: "#333333", secondary: "#ffffff" },
      font: "inter",
    },
  },
  coastal: {
    id: "coastal",
    name: "Coastal",
    description:
      "Tropical moderno con gradientes suaves, cards redondeadas y estética vacacional",
    component: CoastalTemplate,
    thumbnail: "/templates/coastal-thumb.png",
    defaultSettings: {
      colors: { primary: "#0d9488", secondary: "#f0fdfa" },
      font: "montserrat",
    },
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

/**
 * Resuelve la configuración efectiva de temas (colores y fuentes)
 * basándose en el flag useTemplateStyles.
 *
 * @param {Object} store - Objeto de la tienda
 * @returns {Object} Settings resueltos { colors: {primary, secondary}, font }
 */
export const resolveThemeSettings = (store) => {
  const settings = (() => {
    if (!store?.settings) return {};
    if (typeof store.settings === "string") {
      try {
        return JSON.parse(store.settings);
      } catch (e) {
        return {};
      }
    }
    return store.settings;
  })();

  const template = getTemplate(store?.templateId);
  const defaults = template?.defaultSettings || {};

  if (settings.useTemplateStyles) {
    return {
      colors: defaults.colors || { primary: "#000000", secondary: "#4b5563" },
      font: defaults.font || "inter",
      useTemplateStyles: true,
    };
  }

  return {
    colors: {
      primary:
        settings?.colors?.primary || defaults.colors?.primary || "#000000",
      secondary:
        settings?.colors?.secondary || defaults.colors?.secondary || "#4b5563",
    },
    font: settings?.font || defaults.font || "inter",
    useTemplateStyles: false,
  };
};
