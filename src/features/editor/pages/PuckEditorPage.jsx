/**
 * PuckEditorPage
 *
 * Pagina del editor visual Puck para personalizar el catalogo.
 * Permite arrastrar y soltar bloques para construir el layout.
 */

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Puck } from "@puckeditor/core";
import "@puckeditor/core/puck.css";
import { motion } from "motion/react";
import {
  Save,
  Eye,
  ArrowLeft,
  Loader2,
  Check,
  AlertCircle,
} from "lucide-react";
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
  catalogPuckConfig,
  catalogDefaultData,
} from "../configs/catalogConfig";

/**
 * Estados posibles del guardado
 */
const SAVE_STATES = {
  IDLE: "idle",
  SAVING: "saving",
  SAVED: "saved",
  ERROR: "error",
};

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
        [Query.equal("profileId", user.$id)],
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
        [Query.equal("storeId", store.$id), Query.equal("enabled", true)],
      );
      return response.documents;
    },
    enabled: !!store,
  });

  // Inicializar datos del editor
  useEffect(() => {
    if (!store) return;
    if (store.puckData) {
      try {
        const data =
          typeof store.puckData === "string"
            ? JSON.parse(store.puckData)
            : store.puckData;
        setEditorData(data);
      } catch (error) {
        console.error("Error parsing puckData:", error);
        setEditorData(catalogDefaultData);
      }
    } else {
      setEditorData(catalogDefaultData);
    }
  }, [store]);

  // Mutation para guardar cambios
  const saveMutation = useMutation({
    mutationFn: async (data) => {
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.STORES,
        store.$id,
        {
          puckData: JSON.stringify(data),
        },
      );
    },
    onSuccess: () => {
      setSaveState(SAVE_STATES.SAVED);
      queryClient.invalidateQueries(["my-store"]);
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
    setEditorData(data);
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
      const previewUrl = `https://${store.slug}.catalogy.racoondevs.com`;
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
      {/* Header del editor */}
      <header className="h-14 border-b border-(--border) bg-(--card) flex items-center justify-between px-4">
        {/* Left: Back */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/app/store")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <div className="h-6 w-px bg-(--border)" />
          <span className="text-sm font-medium text-(--foreground)">
            Editando: {store.name}
          </span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePreview}>
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>

          <Button
            size="sm"
            onClick={handleSave}
            disabled={saveState === SAVE_STATES.SAVING}
          >
            {saveState === SAVE_STATES.SAVING ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : saveState === SAVE_STATES.SAVED ? (
              <Check className="w-4 h-4 mr-2" />
            ) : saveState === SAVE_STATES.ERROR ? (
              <AlertCircle className="w-4 h-4 mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {saveState === SAVE_STATES.SAVING
              ? "Guardando..."
              : saveState === SAVE_STATES.SAVED
                ? "Guardado"
                : saveState === SAVE_STATES.ERROR
                  ? "Error"
                  : "Guardar"}
          </Button>
        </div>
      </header>

      {/* Puck Editor */}
      <div className="flex-1 overflow-hidden puck-editor-theme-fix">
        <Puck
          config={catalogPuckConfig}
          data={{
            ...editorData,
            root: {
              ...editorData.root,
              props: {
                ...editorData.root?.props,
                store,
                products,
              },
            },
          }}
          onChange={handleChange}
        />
      </div>
    </div>
  );
}
