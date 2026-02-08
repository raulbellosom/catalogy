/**
 * Catalog Puck Config
 *
 * Configuracion unica para el editor y el render publico de Puck.
 * Incluye bloques funcionales para construir un catalogo completo.
 */

import {
  FeaturedHeroCarouselBlock,
  FeaturedProductsBlock,
  ProductCatalogBlock,
  StoreFeaturesBlock,
  StoreFooterBlock,
  StoreHeaderBlock,
  StoreNavbarBlock,
  StorePurchaseInfoBlock,
} from "../components/CatalogBlocks";
import { PuckColorField } from "../components/fields/PuckColorField";

const FONT_FAMILY_MAP = {
  inter: '"Inter", sans-serif',
  merriweather: '"Merriweather", serif',
  jetbrains: '"JetBrains Mono", monospace',
  roboto: '"Roboto", sans-serif',
  playfair: '"Playfair Display", serif',
  montserrat: '"Montserrat", sans-serif',
};

const pickFirstString = (...values) => {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return "";
};

const parseStoreSettings = (store) => {
  const raw = store?.settings;
  if (!raw) return {};
  if (typeof raw === "object") return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
};

const resolveSettingsFont = (settings) => {
  const rawFont = settings?.font;
  if (typeof rawFont === "string") return rawFont;
  if (rawFont && typeof rawFont === "object") {
    return pickFirstString(rawFont.id, rawFont.value, rawFont.family, rawFont.name);
  }
  return "";
};

const resolvePuckTheme = (props) => {
  const settings = parseStoreSettings(props.store);
  const settingsColors =
    settings?.colors && typeof settings.colors === "object"
      ? settings.colors
      : {};

  const primary = pickFirstString(
    props.themePrimary,
    settingsColors.primary,
    "#2563eb",
  );
  const background = pickFirstString(
    props.themeBackground,
    settingsColors.background,
    settingsColors.secondary,
    "#f8fafc",
  );
  const foreground = pickFirstString(props.themeForeground, "#0f172a");
  const card = pickFirstString(props.themeCard, "#ffffff");
  const border = pickFirstString(props.themeBorder, "#d0d7e2");
  const muted = pickFirstString(props.themeMuted, "#eef2f7");
  const mutedForeground = pickFirstString(props.themeMutedForeground, "#64748b");

  const fontId = pickFirstString(props.themeFont, resolveSettingsFont(settings), "inter");
  const fontFamily = FONT_FAMILY_MAP[fontId] || FONT_FAMILY_MAP.inter;

  return {
    primary,
    background,
    foreground,
    card,
    border,
    muted,
    mutedForeground,
    fontFamily,
  };
};

const createColorField = (label, placeholder) => ({
  type: "custom",
  label,
  placeholder,
  render: (props) => <PuckColorField {...props} />,
});

export const PUCK_COMPONENT_TYPES = [
  "StoreNavbar",
  "StoreHeader",
  "FeaturedHeroCarousel",
  "StoreFeatures",
  "FeaturedProducts",
  "ProductCatalog",
  "StorePurchaseInfo",
  "StoreFooter",
];

export const catalogPuckConfig = {
  components: {
    StoreNavbar: StoreNavbarBlock,
    StoreHeader: StoreHeaderBlock,
    FeaturedHeroCarousel: FeaturedHeroCarouselBlock,
    StoreFeatures: StoreFeaturesBlock,
    FeaturedProducts: FeaturedProductsBlock,
    ProductCatalog: ProductCatalogBlock,
    StorePurchaseInfo: StorePurchaseInfoBlock,
    StoreFooter: StoreFooterBlock,
  },
  categories: {
    structure: {
      title: "Estructura",
      components: [
        "StoreNavbar",
        "StoreHeader",
        "FeaturedHeroCarousel",
        "StoreFeatures",
        "FeaturedProducts",
        "StorePurchaseInfo",
        "StoreFooter",
      ],
    },
    catalog: {
      title: "Catalogo",
      components: ["ProductCatalog"],
    },
    other: {
      visible: false,
    },
  },
  root: {
    fields: {
      themePrimary: createColorField("Color primario", "#2563eb"),
      themeBackground: createColorField("Color de fondo", "#f8fafc"),
      themeForeground: createColorField("Color de texto", "#0f172a"),
      themeCard: createColorField("Color de cards", "#ffffff"),
      themeBorder: createColorField("Color de bordes", "#d0d7e2"),
      themeMuted: createColorField("Color superficie suave", "#eef2f7"),
      themeMutedForeground: createColorField(
        "Color texto secundario",
        "#64748b",
      ),
      themeFont: {
        type: "select",
        label: "Tipografia global Puck",
        options: [
          { label: "Usar fuente de tienda", value: "" },
          { label: "Inter", value: "inter" },
          { label: "Merriweather", value: "merriweather" },
          { label: "JetBrains Mono", value: "jetbrains" },
          { label: "Roboto", value: "roboto" },
          { label: "Playfair Display", value: "playfair" },
          { label: "Montserrat", value: "montserrat" },
        ],
      },
    },
    defaultProps: {
      store: null,
      products: [],
      isPreview: false,
      isEditor: false,
      previewOffset: 0,
      themePrimary: "",
      themeBackground: "",
      themeForeground: "",
      themeCard: "",
      themeBorder: "",
      themeMuted: "",
      themeMutedForeground: "",
      themeFont: "",
    },
    render: ({ children, isPreview, previewOffset, ...props }) => {
      const theme = resolvePuckTheme(props);

      return (
        <div
          className="min-h-screen bg-[var(--background)] text-[var(--foreground)]"
          style={{
            "--primary": theme.primary,
            "--background": theme.background,
            "--foreground": theme.foreground,
            "--card": theme.card,
            "--border": theme.border,
            "--muted": theme.muted,
            "--muted-foreground": theme.mutedForeground,
            "--color-primary": theme.primary,
            "--color-primary-hover": theme.primary,
            "--color-bg": theme.background,
            "--color-bg-secondary": theme.muted,
            "--color-bg-tertiary": theme.muted,
            "--color-fg": theme.foreground,
            "--color-fg-secondary": theme.mutedForeground,
            "--color-fg-muted": theme.mutedForeground,
            "--color-card": theme.card,
            "--color-border": theme.border,
            "--color-card-border": theme.border,
            fontFamily: theme.fontFamily,
            colorScheme: "light",
            paddingTop:
              isPreview && previewOffset > 0 ? `${previewOffset}px` : undefined,
          }}
        >
          {children}
        </div>
      );
    },
  },
};

export const catalogDefaultData = {
  content: [
    {
      type: "StoreNavbar",
      props: {},
    },
    {
      type: "StoreHeader",
      props: {},
    },
    {
      type: "FeaturedHeroCarousel",
      props: {},
    },
    {
      type: "StoreFeatures",
      props: {},
    },
    {
      type: "FeaturedProducts",
      props: {},
    },
    {
      type: "ProductCatalog",
      props: {},
    },
    {
      type: "StorePurchaseInfo",
      props: {},
    },
    {
      type: "StoreFooter",
      props: {},
    },
  ],
  root: {
    props: {},
  },
  zones: {},
};
