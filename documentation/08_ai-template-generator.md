# AI Template Generator Guide - Catalogy

Este documento define reglas, contexto y limites para generar multiples templates JSX de catalogos en Catalogy.
El objetivo es crear disenos visuales distintos a partir de una imagen de referencia o una descripcion textual, sin romper el schema ni la logica del sistema.

## 1. Objetivo del agente

El agente debe poder:

- Analizar una imagen de referencia ubicada en `/refs/` o un prompt descriptivo.
- Disenar un layout visual unico que se parezca al estilo de referencia, sin copiarlo exactamente.
- Implementar ese layout como un template JSX determinista.
- Renderizar correctamente logo, nombre, descripcion y catalogo de productos.
- Respetar estrictamente el schema de datos existente.
- No agregar edicion, dependencias nuevas ni logica de negocio.

## 2. Que ES un template en Catalogy

Un template en Catalogy es:

- Un archivo JSX puro.
- Solo lectura.
- Sin Puck.
- Sin estado persistente.
- Sin edicion visual.
- Sin fetch internos.

Un template:

- Solo renderiza datos existentes.
- No los modifica.
- No inventa campos.

## 3. Que NO es un template

El agente NO debe:

- Usar Puck Editor.
- Crear bloques editables.
- Agregar formularios o paneles de configuracion.
- Agregar logica de administracion.
- Usar datos que no existan en el schema.
- Suponer categorias, ratings, descuentos, stock visible o carrito.

## 4. Datos disponibles (fuente de verdad)

### 4.1 Store (stores collection)

El template solo puede usar estos campos:

```
store = {
  name: string
  description?: string
  logoFileId?: string
  categoriesJson?: string
  purchaseInstructions?: string
  paymentLink?: string
  settings?: object | string
}
```

Notas:

- `settings` es opcional.
- Si `settings` es string, debe parsearse de forma segura.
- `categoriesJson` contiene un arreglo de categorias `{ id, name }`.
- Si falta un valor, usar un fallback visual (no inventar datos).

### 4.2 Products (products collection)

```
product = {
  name: string
  description?: string
  price: number
  currency: string
  imageFileId?: string
  categoryIds?: string[]
}
```

Notas:

- `enabled` ya viene filtrado.
- El orden llega definido por `sortOrder`.
- `stock` no se muestra salvo requerimiento explicito.

## 5. Reglas de renderizado obligatorias

Todo template DEBE renderizar como minimo:

- Logo de la tienda (o placeholder visual si no existe).
- Nombre de la tienda.
- Descripcion de la tienda (opcional, nunca obligatoria).
- Catalogo de productos con cards consistentes y responsive.
- Controles locales: buscador, filtros por categoria y rango de precios.
- Boton de compartir por producto (link a `/product/:id`).
- Instrucciones de compra si existen en el store.

## 6. Uso de settings (colores y fuentes)

El template debe respetar la personalizacion guardada en `store.settings` cuando exista.

Reglas:

- Usar colores de `settings.colors.primary` y `settings.colors.secondary` si existen.
- Usar `var(--color-primary)` y `var(--color-primary-hover)` como fallback.
- Usar una fuente Google Fonts segun `settings.font.id`.

Font IDs existentes en el sistema:

- `inter` -> `'Inter', sans-serif`
- `merriweather` -> `'Merriweather', serif`
- `jetbrains` -> `'JetBrains Mono', monospace`
- `roboto` -> `'Roboto', sans-serif`
- `playfair` -> `'Playfair Display', serif`
- `montserrat` -> `'Montserrat', sans-serif`

Si no hay fuente seleccionada, usar `'Inter', sans-serif`.

## 7. Uso de imagenes

Todas las imagenes provienen de Appwrite Storage.

- `logoFileId` -> bucket de logos.
- `imageFileId` -> bucket de productos.
- No usar URLs externas.
- No hardcodear imagenes.

## 8. Estilo basado en imagen o prompt

Cuando haya referencia visual:

- No copiar exactamente la imagen.
- Extraer solo estilo, paleta, tipografia y jerarquia.
- Adaptar la composicion a los datos reales.
- Evitar simular categorias o filtros si no existen datos.

Cuando haya solo texto:

- Convertir la descripcion en un layout coherente y unico.
- Priorizar legibilidad y consistencia.

## 9. Estructura esperada de archivos

- Crear el template en `src/templates/variants/`.
- Exportarlo desde `src/templates/variants/index.js`.
- Registrarlo en `src/templates/registry.js`.
- Actualizar preview en `src/features/store/components/TemplateSelector.jsx`.

## 10. Restricciones tecnicas

El agente DEBE respetar:

- React + JSX.
- TailwindCSS.
- Sin librerias externas nuevas.
- Sin fetch internos.
- Sin hooks de edicion.

Los templates deben ser:

- Deterministas.
- Predecibles.
- Reutilizables.

## 11. Entrada esperada para el agente

El agente puede recibir:

- Texto descriptivo.
- Imagen de referencia en `/refs/`.

Ejemplo de prompt:

"Disena un catalogo moderno, minimalista, con mucho espacio en blanco, productos grandes y enfoque en branding."

## 12. Salida esperada del agente

El agente debe entregar:

- Nombre del template.
- Breve explicacion del diseno.
- Archivo JSX completo.
- Registro actualizado en `src/templates/registry.js`.

## 13. Errores comunes a evitar

- Inventar campos.
- Suponer categorias.
- Suponer descuentos o ratings.
- Agregar botones de compra si no existen.
- Simular carrito.

## 14. Principio fundamental

El template solo cambia la forma, nunca el fondo.
Los datos mandan. El diseno se adapta.

## 15. Uso futuro

Este documento sirve como:

- Prompt base para agentes de diseno.
- Contrato para generacion automatica de templates.
- Referencia para validacion de PRs.
- Base para IA con vision (image -> JSX).
