# PROMPT: AI Template Generator - Catalogy

Este documento es el **PROMPT DEFINITIVO** para que un agente de IA genere nuevos templates JSX para Catalogy. Cuando se te pida crear un template, debes usar este documento como tu biblia técnica.

## 1. Contexto y Objetivo

Catalogy es una plataforma de catálogos digitales personalizables. Ya contamos con 4 templates base (`Minimal`, `Gallery`, `Storefront`, `NoirGrid`).
**Tu objetivo:** Crear un nuevo template JSX que sea visualmente innovador, premium y único, basándote en una imagen de referencia, una descripción de texto, o ambas.

## 2. Pila Tecnológica

- **Framework:** React (JSX).
- **Estilos:** TailwindCSS (Obligatorio). No uses CSS plano a menos que sea estrictamente necesario para animaciones complejas.
- **Iconos:** `lucide-react`.
- **Componentes Compartidos:** DEBES reutilizar los componentes en `src/templates/components/` para mantener la lógica de filtros y modales consistente.

## 3. Fuente de Verdad: Schema de Datos

Los datos vienen de Appwrite y se pasan al template como props: `{ store, products }`.

### 3.1 Prop `store`

```typescript
interface Store {
  name: string;
  description?: string;
  logoFileId?: string;
  categoriesJson: string; // Parsear: Array<{id: string, name: string}>
  purchaseInstructions?: string; // Instrucciones de pago/entrega
  paymentLink?: string; // Link externo de pago
  settings: string; // JSON con: { colors: { primary, secondary }, font: { id, family }, ... }. Nota: secondary se usa como color de fondo.
  published: boolean;
  enabled: boolean;
}
```

### 3.2 Prop `products`

```typescript
interface Product {
  $id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  imageFileIds: string[]; // Hasta 4 imágenes
  categoryIds: string[];
  stock: number;
  status: boolean; // Si es false, no mostrar (ya llega filtrado usualmente)
  sortOrder: number;
}
```

## 4. Requerimientos de UI Obligatorios

### 4.1 Layout General

- **Responsive:** Diseño Mobile-First impecable. La cuadrícula de productos debe mostrar **mínimo 2 productos por fila** en móviles.
- **Sticky Navbar:** Logo, nombre de la tienda, y acceso rápido a búsqueda. En móviles, debe incluir un menú de hamburguesa que abra un lateral con filtros y buscador integrado.
- **Sticky Footer:** Información de contacto, links de pago (`paymentLink`) e instrucciones (`purchaseInstructions`).

### 4.2 Privacidad de Datos y Fidelidad

- **Dato Crítico:** NO agregues textos, etiquetas o descripciones que el usuario no haya proporcionado. No inventes slogans, no pongas etiquetas de "Premium", "Oferta" o descripciones de relleno.
- **Fidelidad:** Si un campo opcional (como `description` en productos o tienda) está vacío, deja el área vacía o no la renderices.
- **Sin Inventar:** La UI debe ser hermosa por su estructura y diseño, no por contenido ficticio.

### 4.3 Controles de Catálogo (Local)

Debes implementar los siguientes filtros de manera **LOCAL** (ya están resueltos en `useCatalog` o `CatalogControls`):

- **Buscador:** Texto libre sobre nombre/descripción.
- **Categorías:** Basado en `store.categoriesJson`.
- **Ordenamiento:** Precio (Mayor a menor), Precio (Menor a mayor) y Orden Normal.
- **Rango de Precios:** Slider o inputs min/max.
- **Reiniciar Filtros:** DEBES incluir un botón de "Reiniciar Filtros" o "Limpiar" que resteé todos los estados de búsqueda y filtrado.

### 4.3 Visualización de Productos

- **Product Card:** Diseño innovador con estados hover, visualización clara del precio y **píldoras/tags de categoría**.
  - **Interacción:** Al hacer clic en un tag de categoría dentro de la card, se debe activar el filtro correspondiente en el catálogo.
- **Product Detail Modal:** Al hacer click, abrir el modal que incluya:
  - **Título y Precio:** Con **ALTO CONTRASTE**. Asegúrate de que el texto sea perfectamente legible sobre el fondo del modal (ej: blanco sobre fondo oscuro, negro sobre fondo claro). **ESTO ES UNA REGLA CRÍTICA DE ACCESIBILIDAD.**
  - Visualizador de imágenes (Carousel si hay > 1).
  - Descripción extendida.
  - Stock disponible ("Disponibles").
  - Botón de compartir.

## 5. Diseño y Estética Premium

- **Innovación:** No te limites a una grid simple. Juega con layouts asimétricos, bento grids, o sliders laterales cuando sea apropiado.
- **Branding:** Usa `store.settings.colors.primary` para todos los acentos (botones, bordes, hovers) y `store.settings.colors.secondary` para el COLOR DE FONDO principal del template y del navbar (aplicando efectos como glassmorphism o bordes sutiles para distinguirlos).
- **Tipografía:** Respeta el font de `store.settings.font.family` (ej: Inter, Montserrat, Playfair Display).
- **Micro-interacciones:** Agrega transiciones suaves (`transition-all duration-300`), efectos de blur (glassmorphism), y sombras profundas.

## 6. Componentes Reutilizables

Importa y usa estos componentes para asegurar que la funcionalidad sea robusta:

- `StoreNavbar`, `StoreFooter`: Para la estructura base.
- `CatalogControls`: Para la barra de búsqueda y filtros.
- `ProductGrid`: Para el listado responsivo.
- `ProductCard`: El contenedor individual de producto.
- `ProductDetailModal`: El modal con toda la info.
- `useCatalog`: Hook especializado para la lógica de búsqueda, filtrado y ordenamiento local.

## 7. Instrucciones para la Generación

1. **Analiza la Entrada:** Si hay imagen, extrae la jerarquía visual y paleta de colores. Si hay texto, interpreta el "vibe" (ej: "lujo", "industrial", "artesanal").
2. **Estructura el Archivo:** Crea un único componente funcional que reciba `{ store, products }`.
3. **Lógica Local:** Inicializa `useCatalog(products)` para manejar los filtros.
4. **Exportación y Registro:**
   - El archivo debe guardarse en `src/templates/variants/NombreNuevoTemplate.jsx`.
   - DEBES registrarlo en `src/templates/registry.js`.
   - Al registrarlo, es OBLIGATORIO definir `defaultSettings` con una paleta de colores (primario y secundario) y una fuente coherente con el diseño generado.
     ```javascript
     defaultSettings: {
       colors: {
         primary: "#...", // Color de acento
         secondary: "#..." // Color de fondo (background)
       },
       font: "inter" // o merriweather, montserrat, jetbrains, playfair, roboto
     }
     ```
5. **Persistencia:** El template debe estar preparado para leer `store.settings.useTemplateStyles`. Si es `true`, debe usar sus propios estilos internos o los `defaultSettings` del registry. Si es `false`, debe usar los colores elegidos por el usuario en `store.settings.colors`.

---

**Nota:** El diseño debe ser tan impactante que el usuario se sienta orgulloso de compartir su link de Catalogy.
