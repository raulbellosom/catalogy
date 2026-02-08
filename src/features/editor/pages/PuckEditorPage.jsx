/**
 * PuckEditorPage
 *
 * Pagina del editor visual Puck para personalizar el catalogo.
 * Permite arrastrar y soltar bloques para construir el layout.
 */

import { useState, useEffect, useCallback, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { Puck } from "@puckeditor/core";
import "@puckeditor/core/puck.css";
import { Loader2, AlertCircle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  databases,
  DATABASE_ID,
  COLLECTIONS,
  Query,
} from "../../../shared/lib/appwrite";
import { useAuth } from "../../../app/providers/AuthProvider";
import { Button } from "../../../shared/ui/atoms/Button";
import {
  PUCK_COMPONENT_TYPES,
  catalogDefaultData,
  catalogPuckConfig,
} from "../configs/catalogConfig";
import { EditorHeader, SAVE_STATES } from "../components/EditorHeader";
import {
  injectPuckRuntimeContext,
  normalizePuckData,
  sanitizePuckDataForStorage,
} from "../utils/puckData";

/**
 * @returns {JSX.Element}
 */
export function PuckEditorPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [saveState, setSaveState] = useState(SAVE_STATES.IDLE);
  const [editorData, setEditorData] = useState(null);

  // Query para obtener la tienda del usuario
  const { data: store, isLoading: isLoadingStore } = useQuery({
    queryKey: ["my-store", user?.$id],
    queryFn: async () => {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.STORES,
        [Query.equal("profileId", user.$id), Query.equal("enabled", true)],
      );
      return response.documents[0] || null;
    },
    enabled: !!user,
  });

  // Query para obtener productos de la tienda
  const { data: products = [] } = useQuery({
    queryKey: ["store-products", store?.$id],
    queryFn: async () => {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.PRODUCTS,
        [
          Query.equal("storeId", store.$id),
          Query.equal("enabled", true),
          Query.equal("status", true),
        ],
      );
      return response.documents;
    },
    enabled: !!store,
  });

  // Inicializar datos del editor
  useEffect(() => {
    if (!store) return;

    const normalized = normalizePuckData({
      rawData: store.puckData,
      defaultData: catalogDefaultData,
      allowedComponentTypes: PUCK_COMPONENT_TYPES,
    });

    setEditorData(normalized);
  }, [store]);

  // Mutation para guardar cambios
  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const sanitized = sanitizePuckDataForStorage({
        data,
        defaultData: catalogDefaultData,
        allowedComponentTypes: PUCK_COMPONENT_TYPES,
      });

      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.STORES,
        store.$id,
        {
          puckData: JSON.stringify(sanitized),
        },
      );
    },
    onSuccess: () => {
      setSaveState(SAVE_STATES.SAVED);
      queryClient.invalidateQueries({ queryKey: ["my-store", user?.$id] });
      queryClient.invalidateQueries({ queryKey: ["store", "user", user?.$id] });
      setTimeout(() => setSaveState(SAVE_STATES.IDLE), 2000);
    },
    onError: (error) => {
      console.error("Error saving:", error);
      setSaveState(SAVE_STATES.ERROR);
      setTimeout(() => setSaveState(SAVE_STATES.IDLE), 3000);
    },
  });

  // Handler de cambios en el editor
  const handleChange = useCallback((data) => {
    setEditorData(
      sanitizePuckDataForStorage({
        data,
        defaultData: catalogDefaultData,
        allowedComponentTypes: PUCK_COMPONENT_TYPES,
      }),
    );
  }, []);

  // Guardar
  const handleSave = useCallback(() => {
    if (!editorData) return;
    setSaveState(SAVE_STATES.SAVING);
    saveMutation.mutate(editorData);
  }, [editorData, saveMutation]);

  // Preview en nueva ventana
  const handlePreview = useCallback(() => {
    if (store?.slug) {
      const previewUrl = `/app/store/${store.slug}/preview?renderer=puck`;
      window.open(previewUrl, "_blank");
    }
  }, [store]);

  // Loading state
  if (isLoadingStore) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-(--background)">
        <Loader2 className="w-8 h-8 animate-spin text-(--primary)" />
      </div>
    );
  }

  // Sin tienda
  if (!store) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-(--background) p-4">
        <AlertCircle className="w-16 h-16 text-(--destructive) mb-4" />
        <h1 className="text-xl font-semibold text-(--foreground)">
          No tienes una tienda
        </h1>
        <p className="text-(--muted-foreground) mt-2 text-center">
          Primero debes crear una tienda para poder personalizarla
        </p>
        <Button className="mt-6" onClick={() => navigate("/app/store")}>
          Crear tienda
        </Button>
      </div>
    );
  }

  // Sin config de puck
  if (!editorData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-(--background)">
        <Loader2 className="w-8 h-8 animate-spin text-(--primary)" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-(--background)">
      <EditorHeader
        storeName={store.name}
        saveState={saveState}
        onBack={() => navigate("/app/store")}
        onSave={handleSave}
        onPreview={handlePreview}
      />

      {/* Puck Editor */}
      <div className="flex-1 min-h-0 overflow-hidden puck-editor-theme-fix">
        <Puck
          config={catalogPuckConfig}
          height="100%"
          data={injectPuckRuntimeContext({
            data: editorData,
            defaultData: catalogDefaultData,
            allowedComponentTypes: PUCK_COMPONENT_TYPES,
            store,
            products,
            isPreview: false,
            isEditor: true,
            previewOffset: 0,
          })}
          metadata={{
            store,
            products,
            isPreview: false,
            isEditor: true,
            previewOffset: 0,
          }}
          onChange={handleChange}
          overrides={{
            header: () => <Fragment />,
          }}
        />
      </div>
    </div>
  );
}
