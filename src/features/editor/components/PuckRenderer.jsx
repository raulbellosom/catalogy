/**
 * PuckRenderer
 *
 * Renderiza una pagina Puck con datos de tienda/productos.
 * Usado tanto en vista publica como en previews.
 */

import { Render } from "@puckeditor/core";
import { catalogPuckConfig, catalogDefaultData } from "../configs/catalogConfig";

const resolvePuckData = (raw) => {
  if (!raw) return catalogDefaultData;
  try {
    return typeof raw === "string" ? JSON.parse(raw) : raw;
  } catch (error) {
    console.error("Error parsing puckData:", error);
    return catalogDefaultData;
  }
};

export function PuckRenderer({ store, products }) {
  const parsed = resolvePuckData(store?.puckData);

  return (
    <Render
      config={catalogPuckConfig}
      data={{
        ...parsed,
        root: {
          ...(parsed?.root || {}),
          props: {
            ...(parsed?.root?.props || {}),
            store,
            products,
          },
        },
      }}
    />
  );
}
