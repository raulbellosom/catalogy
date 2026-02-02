/**
 * Puck Editor - Componentes Base
 *
 * Componentes reutilizables para todos los templates de Puck.
 * Estos son los bloques que el usuario puede arrastrar y soltar.
 */

import {
  ProductCard,
  StoreHeader,
  ProductGrid,
} from "../../templates/components";

/**
 * Componente: Heading
 * Titulo configurable
 */
export const HeadingBlock = {
  label: "Titulo",
  fields: {
    text: {
      type: "text",
      label: "Texto",
    },
    level: {
      type: "select",
      label: "Nivel",
      options: [
        { label: "H1", value: "h1" },
        { label: "H2", value: "h2" },
        { label: "H3", value: "h3" },
      ],
    },
    align: {
      type: "select",
      label: "Alineacion",
      options: [
        { label: "Izquierda", value: "left" },
        { label: "Centro", value: "center" },
        { label: "Derecha", value: "right" },
      ],
    },
  },
  defaultProps: {
    text: "Titulo",
    level: "h2",
    align: "left",
  },
  render: ({ text, level, align }) => {
    const Tag = level;
    const alignClass = {
      left: "text-left",
      center: "text-center",
      right: "text-right",
    }[align];

    const sizeClass = {
      h1: "text-4xl font-bold",
      h2: "text-2xl font-semibold",
      h3: "text-xl font-medium",
    }[level];

    return (
      <Tag className={`${sizeClass} ${alignClass} text-[var(--foreground)]`}>
        {text}
      </Tag>
    );
  },
};

/**
 * Componente: Paragraph
 * Texto de parrafo configurable
 */
export const ParagraphBlock = {
  label: "Parrafo",
  fields: {
    text: {
      type: "textarea",
      label: "Texto",
    },
    align: {
      type: "select",
      label: "Alineacion",
      options: [
        { label: "Izquierda", value: "left" },
        { label: "Centro", value: "center" },
        { label: "Derecha", value: "right" },
      ],
    },
  },
  defaultProps: {
    text: "Tu texto aqui...",
    align: "left",
  },
  render: ({ text, align }) => {
    const alignClass = {
      left: "text-left",
      center: "text-center",
      right: "text-right",
    }[align];

    return (
      <p className={`${alignClass} text-[var(--muted-foreground)]`}>{text}</p>
    );
  },
};

/**
 * Componente: Spacer
 * Espaciado vertical
 */
export const SpacerBlock = {
  label: "Espaciador",
  fields: {
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
    size: "medium",
  },
  render: ({ size }) => {
    const sizeClass = {
      small: "h-4",
      medium: "h-8",
      large: "h-16",
    }[size];

    return <div className={sizeClass} />;
  },
};

/**
 * Componente: Divider
 * Linea separadora
 */
export const DividerBlock = {
  label: "Separador",
  fields: {
    style: {
      type: "select",
      label: "Estilo",
      options: [
        { label: "Solido", value: "solid" },
        { label: "Punteado", value: "dashed" },
        { label: "Sutil", value: "subtle" },
      ],
    },
  },
  defaultProps: {
    style: "solid",
  },
  render: ({ style }) => {
    const styleClass = {
      solid: "border-[var(--border)]",
      dashed: "border-dashed border-[var(--border)]",
      subtle: "border-[var(--muted)]",
    }[style];

    return <hr className={`border-t ${styleClass} my-4`} />;
  },
};

/**
 * Componente: Container
 * Contenedor con padding y ancho maximo
 */
export const ContainerBlock = {
  label: "Contenedor",
  fields: {
    maxWidth: {
      type: "select",
      label: "Ancho maximo",
      options: [
        { label: "Completo", value: "full" },
        { label: "Ancho", value: "wide" },
        { label: "Normal", value: "normal" },
        { label: "Angosto", value: "narrow" },
      ],
    },
    padding: {
      type: "select",
      label: "Padding",
      options: [
        { label: "Ninguno", value: "none" },
        { label: "Pequeno", value: "small" },
        { label: "Normal", value: "normal" },
        { label: "Grande", value: "large" },
      ],
    },
  },
  defaultProps: {
    maxWidth: "normal",
    padding: "normal",
  },
  render: ({ maxWidth, padding, puck }) => {
    const maxWidthClass = {
      full: "max-w-full",
      wide: "max-w-6xl",
      normal: "max-w-4xl",
      narrow: "max-w-2xl",
    }[maxWidth];

    const paddingClass = {
      none: "",
      small: "px-4 py-2",
      normal: "px-6 py-4",
      large: "px-8 py-8",
    }[padding];

    return (
      <div className={`mx-auto ${maxWidthClass} ${paddingClass}`}>
        {puck.renderDropZone({ zone: "content" })}
      </div>
    );
  },
};

/**
 * Componente: Section
 * Seccion con fondo configurable
 */
export const SectionBlock = {
  label: "Seccion",
  fields: {
    background: {
      type: "select",
      label: "Fondo",
      options: [
        { label: "Transparente", value: "transparent" },
        { label: "Card", value: "card" },
        { label: "Muted", value: "muted" },
        { label: "Primary", value: "primary" },
      ],
    },
    padding: {
      type: "select",
      label: "Padding",
      options: [
        { label: "Pequeno", value: "small" },
        { label: "Normal", value: "normal" },
        { label: "Grande", value: "large" },
      ],
    },
  },
  defaultProps: {
    background: "transparent",
    padding: "normal",
  },
  render: ({ background, padding, puck }) => {
    const bgClass = {
      transparent: "",
      card: "bg-[var(--card)]",
      muted: "bg-[var(--muted)]",
      primary: "bg-[var(--primary)] text-white",
    }[background];

    const paddingClass = {
      small: "py-6",
      normal: "py-12",
      large: "py-20",
    }[padding];

    return (
      <section className={`${bgClass} ${paddingClass}`}>
        {puck.renderDropZone({ zone: "content" })}
      </section>
    );
  },
};
