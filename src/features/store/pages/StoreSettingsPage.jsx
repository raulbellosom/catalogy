import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Store,
  Globe,
  Palette,
  Pencil,
  Save,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import { Button } from "@/shared/ui/atoms/Button";
import { Input } from "@/shared/ui/atoms/Input";
import { SlugInput } from "@/shared/ui/molecules/SlugInput";
import { ImageUpload } from "@/shared/ui/molecules/ImageUpload";
import { TemplateSelector } from "../components/TemplateSelector";
import {
  useUserStore,
  useCreateStore,
  useUpdateStore,
  useUploadStoreLogo,
  useToggleStorePublished,
} from "@/shared/hooks";
import {
  getStoreLogoUrl,
  deleteStoreLogo,
} from "@/shared/services/storeService";
import { motion } from "motion/react";

/**
 * Store settings page
 * Configure store name, slug, logo, template, etc.
 */
export function StoreSettingsPage() {
  const navigate = useNavigate();

  // Fetch user's store
  const { data: store, isLoading: loadingStore } = useUserStore();

  // Mutations
  const createStore = useCreateStore();
  const updateStore = useUpdateStore();
  const uploadLogo = useUploadStoreLogo();
  const togglePublished = useToggleStorePublished();

  // Form state
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [templateId, setTemplateId] = useState("minimal");
  const [logoFileId, setLogoFileId] = useState("");
  const [logoUrl, setLogoUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Populate form when store loads
  useEffect(() => {
    if (store) {
      setName(store.name || "");
      setSlug(store.slug || "");
      setDescription(store.description || "");
      setTemplateId(store.templateId || "minimal");
      setLogoFileId(store.logoFileId || "");
      if (store.logoFileId) {
        setLogoUrl(getStoreLogoUrl(store.logoFileId));
      }
    }
  }, [store]);

  const handleLogoUpload = async (file) => {
    try {
      setError("");
      const response = await uploadLogo.mutateAsync(file);

      // Delete old logo if exists
      if (logoFileId) {
        await deleteStoreLogo(logoFileId);
      }

      setLogoFileId(response.$id);
      setLogoUrl(getStoreLogoUrl(response.$id));

      // Update store if it exists
      if (store) {
        await updateStore.mutateAsync({
          storeId: store.$id,
          data: { logoFileId: response.$id },
        });
      }
    } catch (err) {
      console.error("Logo upload error:", err);
      setError("Error al subir el logo");
    }
  };

  const handleLogoRemove = async () => {
    if (logoFileId) {
      await deleteStoreLogo(logoFileId);
    }
    setLogoFileId("");
    setLogoUrl(null);

    if (store) {
      await updateStore.mutateAsync({
        storeId: store.$id,
        data: { logoFileId: "" },
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      const data = {
        name: name.trim(),
        slug: slug.trim().toLowerCase(),
        description: description.trim(),
        templateId,
      };

      if (logoFileId) {
        data.logoFileId = logoFileId;
      }

      if (store) {
        // Update existing store
        await updateStore.mutateAsync({ storeId: store.$id, data });
        setSuccess("¡Tienda actualizada exitosamente!");
      } else {
        // Create new store
        await createStore.mutateAsync(data);
        setSuccess("¡Tienda creada exitosamente!");
      }

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Store save error:", err);
      setError(err.message || "Error al guardar la tienda");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePublish = async () => {
    if (!store) return;

    try {
      setError("");
      await togglePublished.mutateAsync({
        storeId: store.$id,
        published: !store.published,
      });
      setSuccess(
        store.published
          ? "Catálogo despublicado"
          : "¡Catálogo publicado! Ya es visible públicamente",
      );
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Toggle publish error:", err);
      setError("Error al cambiar el estado de publicación");
    }
  };

  const handleOpenEditor = () => {
    navigate("/app/editor");
  };

  if (loadingStore) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-[var(--color-primary)] animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-fg)]">Mi tienda</h1>
        <p className="text-[var(--color-fg-secondary)]">
          Configura la información de tu catálogo
        </p>
      </div>

      {/* Success/Error messages */}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 border border-green-600 rounded-lg text-green-800 dark:text-green-300 text-sm"
        >
          {success}
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-[var(--color-error-bg)] border border-[var(--color-error)] rounded-lg text-[var(--color-error)] text-sm"
        >
          {error}
        </motion.div>
      )}

      {/* Publish status */}
      {store && (
        <div className="mb-6 p-4 bg-[var(--color-card)] border border-[var(--color-card-border)] rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            {store.published ? (
              <Eye className="w-5 h-5 text-green-600" />
            ) : (
              <EyeOff className="w-5 h-5 text-[var(--color-fg-muted)]" />
            )}
            <div>
              <p className="font-medium text-[var(--color-fg)]">
                {store.published ? "Catálogo público" : "Catálogo privado"}
              </p>
              <p className="text-sm text-[var(--color-fg-secondary)]">
                {store.published
                  ? `Visible en ${store.slug}.catalog.racoondevs.com`
                  : "No es visible para el público"}
              </p>
            </div>
          </div>
          <Button
            variant={store.published ? "outline" : "primary"}
            onClick={handleTogglePublish}
            isLoading={togglePublished.isPending}
          >
            {store.published ? "Despublicar" : "Publicar"}
          </Button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        {/* Store info card */}
        <div className="p-6 bg-[var(--color-card)] border border-[var(--color-card-border)] rounded-2xl">
          <div className="flex items-center gap-3 mb-6">
            <Store className="w-5 h-5 text-[var(--color-primary)]" />
            <h2 className="font-semibold text-[var(--color-fg)]">
              Información básica
            </h2>
          </div>

          <div className="space-y-4">
            <Input
              label="Nombre de la tienda"
              placeholder="Mi Tienda Increíble"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={3}
              maxLength={120}
            />

            <div>
              <label className="block text-sm font-medium text-[var(--color-fg)] mb-1.5">
                Descripción
              </label>
              <textarea
                placeholder="Vendemos los mejores productos..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={500}
                rows={3}
                className="w-full px-4 py-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-[var(--color-fg)] placeholder:text-[var(--color-fg-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] resize-none"
              />
              <p className="mt-1.5 text-sm text-[var(--color-fg-secondary)]">
                Descripción corta de tu tienda (opcional)
              </p>
            </div>

            <ImageUpload
              label="Logo de la tienda"
              currentImageUrl={logoUrl}
              onUpload={handleLogoUpload}
              onRemove={handleLogoRemove}
              isUploading={uploadLogo.isPending}
              maxSizeMB={5}
            />
          </div>
        </div>

        {/* Slug card */}
        <div className="p-6 bg-[var(--color-card)] border border-[var(--color-card-border)] rounded-2xl">
          <div className="flex items-center gap-3 mb-6">
            <Globe className="w-5 h-5 text-[var(--color-primary)]" />
            <h2 className="font-semibold text-[var(--color-fg)]">
              Dirección web
            </h2>
          </div>

          <SlugInput
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            excludeStoreId={store?.$id}
          />
        </div>

        {/* Template card */}
        <div className="p-6 bg-[var(--color-card)] border border-[var(--color-card-border)] rounded-2xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Palette className="w-5 h-5 text-[var(--color-primary)]" />
              <h2 className="font-semibold text-[var(--color-fg)]">
                Apariencia
              </h2>
            </div>
            {store && (
              <Button variant="outline" size="sm" onClick={handleOpenEditor}>
                <Pencil className="w-4 h-4 mr-2" />
                Editor avanzado
              </Button>
            )}
          </div>

          <TemplateSelector value={templateId} onChange={setTemplateId} />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button type="submit" isLoading={isSubmitting} className="flex-1">
            <Save className="w-4 h-4 mr-2" />
            {store ? "Guardar cambios" : "Crear tienda"}
          </Button>
        </div>
      </form>
    </div>
  );
}
