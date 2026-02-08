/**
 * PuckRenderer
 *
 * Renderiza una pagina Puck con datos de tienda/productos.
 * Usado tanto en vista publica como en previews.
 */

import { Render } from "@puckeditor/core";
import {
  PUCK_COMPONENT_TYPES,
  catalogDefaultData,
  catalogPuckConfig,
} from "../configs/catalogConfig";
import { injectPuckRuntimeContext } from "../utils/puckData";

export function PuckRenderer({
  store,
  products,
  isPreview = false,
  previewOffset = 0,
}) {
  const data = injectPuckRuntimeContext({
    data: store?.puckData,
    defaultData: catalogDefaultData,
    allowedComponentTypes: PUCK_COMPONENT_TYPES,
    store,
    products,
    isPreview,
    isEditor: false,
    previewOffset,
  });

  return (
    <Render
      config={catalogPuckConfig}
      data={data}
      metadata={{
        store,
        products,
        isPreview,
        isEditor: false,
        previewOffset,
      }}
    />
  );
}
