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
  ExternalLink,
  Check,
  X,
  LayoutTemplate,
  MonitorPlay,
  Share2,
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
import { appConfig } from "@/shared/lib/env";
import { motion, AnimatePresence } from "motion/react";

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

  // Logo state
  const [currentLogoId, setCurrentLogoId] = useState(""); // The ID currently saved in DB
  const [pendingLogoFile, setPendingLogoFile] = useState(null); // New file waiting to be uploaded
  const [logoPreviewUrl, setLogoPreviewUrl] = useState(null); // URL for display

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // View/Edit mode state
  const [isEditing, setIsEditing] = useState(false);

  // Populate form when store loads
  useEffect(() => {
    if (store) {
      setName(store.name || "");
      setSlug(store.slug || "");
      setDescription(store.description || "");
      setTemplateId(store.templateId || "minimal");

      setCurrentLogoId(store.logoFileId || "");
      if (store.logoFileId) {
        setLogoPreviewUrl(getStoreLogoUrl(store.logoFileId));
      } else {
        setLogoPreviewUrl(null);
      }

      setPendingLogoFile(null); // Reset pending

      // If store exists, start in view mode
      setIsEditing(false);
    } else if (!loadingStore) {
      // If no store (and finished loading), must create one -> edit mode
      setIsEditing(true);
    }
  }, [store, loadingStore]);

  const handleLogoUpload = (file) => {
    // Just store the file, don't upload yet
    setPendingLogoFile(file);
    setError("");
    // We don't set logoPreviewUrl here because ImageUpload component handles its own preview
    // when a file is selected. However, if we wanted to update the "View Mode" preview or
    // keep state consistent, we could:
    // const url = URL.createObjectURL(file);
    // setLogoPreviewUrl(url);
    // But ImageUpload creates its own. Let's trust ImageUpload for the form.
  };

  const handleLogoRemove = () => {
    setPendingLogoFile(null);
    setCurrentLogoId(""); // Mark as removed
    setLogoPreviewUrl(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      let finalLogoId = currentLogoId;

      // 1. Upload new logo if pending
      if (pendingLogoFile) {
        const response = await uploadLogo.mutateAsync(pendingLogoFile);
        finalLogoId = response.$id;
      }

      // 2. Prepare data
      const data = {
        name: name.trim(),
        slug: slug.trim().toLowerCase(),
        description: description.trim(),
        templateId,
        logoFileId: finalLogoId || null, // Ensure we send null if empty
      };

      if (store) {
        // 3. Update existing store
        await updateStore.mutateAsync({ storeId: store.$id, data });

        // 4. CLEANUP: If successful, delete old logo if it was replaced
        // Condition: We had an old ID (store.logoFileId), and we have a new ID (finalLogoId),
        // AND they are different. OR we now have NO ID (removed) and we had one before.
        const oldId = store.logoFileId;
        if (oldId && oldId !== finalLogoId) {
          console.log("Auto-replacing logo: deleting old file", oldId);
          try {
            await deleteStoreLogo(oldId);
          } catch (cleanupErr) {
            console.warn("Failed to delete old logo:", cleanupErr);
            // Non-blocking error
          }
        }

        setSuccess("¡Tienda actualizada exitosamente!");
        setIsEditing(false);
      } else {
        // Create new store
        await createStore.mutateAsync(data);
        setSuccess("¡Tienda creada exitosamente!");
        setIsEditing(false);
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

  const handlePreview = () => {
    if (store?.slug) {
      navigate(`/app/store/${store.slug}/preview`);
    }
  };

  if (loadingStore) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-[var(--color-primary)] animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-fg)] flex items-center gap-3">
            <Store className="w-8 h-8 text-[var(--color-primary)]" />
            Mi Tienda
          </h1>
          <p className="text-[var(--color-fg-secondary)] mt-1 ml-11">
            Administra la apariencia y configuración de tu tienda online
          </p>
        </div>

        {store && (
          <div className="flex items-center gap-3 ml-11 md:ml-0">
            {!isEditing ? (
              <>
                <Button
                  variant="outline"
                  onClick={handleOpenEditor}
                  className="hidden sm:flex"
                >
                  <LayoutTemplate className="w-4 h-4 mr-2" />
                  Editor Visual
                </Button>
                <Button onClick={() => setIsEditing(true)}>
                  <Pencil className="w-4 h-4 mr-2" />
                  Editar Información
                </Button>
              </>
            ) : (
              <Button variant="ghost" onClick={() => setIsEditing(false)}>
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Messages */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 px-4 py-3 rounded-xl flex items-center gap-3"
          >
            <Check className="w-5 h-5" />
            {success}
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-xl"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {!isEditing && store ? (
        /* ================= VIEW MODE ================= */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info Card */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[var(--color-card)] border border-[var(--color-card-border)] rounded-2xl overflow-hidden shadow-sm">
              {/* Cover / Header of Card */}
              <div className="h-32 bg-gradient-to-r from-[var(--color-primary)]/10 to-[var(--color-primary)]/5 border-b border-[var(--color-card-border)] relative">
                {store.published && (
                  <div className="absolute top-4 right-4 bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 backdrop-blur-sm">
                    <Globe className="w-3 h-3" />
                    Publicada
                  </div>
                )}
                {!store.published && (
                  <div className="absolute top-4 right-4 bg-[var(--color-bg-tertiary)] text-[var(--color-fg-muted)] border border-[var(--color-border)] px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 backdrop-blur-sm">
                    <EyeOff className="w-3 h-3" />
                    Privada
                  </div>
                )}
              </div>

              <div className="px-8 pb-8">
                <div className="relative -mt-12 mb-6">
                  <div className="w-24 h-24 rounded-2xl bg-[var(--color-card)] border-4 border-[var(--color-card)] shadow-md overflow-hidden flex items-center justify-center">
                    {logoPreviewUrl ? (
                      <img
                        src={logoPreviewUrl}
                        alt="Logo"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Store className="w-10 h-10 text-[var(--color-fg-muted)]" />
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-[var(--color-fg)]">
                      {store.name}
                    </h2>
                    <a
                      href={`https://${store.slug}.${appConfig.baseDomain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--color-primary)] hover:underline text-sm font-medium flex items-center gap-1 mt-1"
                    >
                      {store.slug}.{appConfig.baseDomain}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={store.published ? "outline" : "primary"}
                      onClick={handleTogglePublish}
                      isLoading={togglePublished.isPending}
                      size="sm"
                    >
                      {store.published ? "Despublicar" : "Publicar Tienda"}
                    </Button>
                  </div>
                </div>

                {store.description && (
                  <div className="mt-6 pt-6 border-t border-[var(--color-border)]">
                    <h3 className="text-sm font-medium text-[var(--color-fg-secondary)] uppercase tracking-wider mb-2">
                      Descripción
                    </h3>
                    <p className="text-[var(--color-fg)] leading-relaxed">
                      {store.description}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Cards */}
          <div className="lg:col-span-1 space-y-6">
            {/* Preview Card */}
            <div className="bg-[var(--color-card)] border border-[var(--color-card-border)] rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-[var(--color-fg)] mb-4 flex items-center gap-2">
                <MonitorPlay className="w-5 h-5 text-[var(--color-primary)]" />
                Vista Previa
              </h3>
              <p className="text-sm text-[var(--color-fg-secondary)] mb-6">
                Visualiza cómo verán tus clientes tu tienda antes de hacerla
                pública.
              </p>
              <Button
                onClick={handlePreview}
                className="w-full"
                variant="secondary"
              >
                <Eye className="w-4 h-4 mr-2" />
                Ver Vista Previa
              </Button>
            </div>

            {/* Template Card */}
            <div className="bg-[var(--color-card)] border border-[var(--color-card-border)] rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-[var(--color-fg)] mb-4 flex items-center gap-2">
                <Palette className="w-5 h-5 text-[var(--color-primary)]" />
                Apariencia
              </h3>
              <div className="p-3 bg-[var(--color-bg-secondary)] rounded-xl border border-[var(--color-border)] mb-4">
                <div className="text-sm font-medium text-[var(--color-fg)]">
                  Plantilla Actual
                </div>
                <div className="text-xs text-[var(--color-fg-secondary)] capitalize">
                  {store.templateId || "Minimal"}
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleOpenEditor}
              >
                <LayoutTemplate className="w-4 h-4 mr-2" />
                Personalizar Diseño
              </Button>
            </div>
          </div>
        </div>
      ) : (
        /* ================= EDIT MODE ================= */
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Info */}
            <section className="bg-[var(--color-card)] border border-[var(--color-card-border)] rounded-2xl p-6 lg:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[var(--color-border)]">
                <div className="p-2 bg-[var(--color-primary)]/10 rounded-lg">
                  <Store className="w-5 h-5 text-[var(--color-primary)]" />
                </div>
                <div>
                  <h2 className="font-bold text-lg text-[var(--color-fg)]">
                    Información Básica
                  </h2>
                  <p className="text-xs text-[var(--color-fg-secondary)]">
                    Datos principales de tu comercio
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <Input
                  label="Nombre de la tienda"
                  placeholder="Ej. Moda Urbana"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  minLength={3}
                  maxLength={120}
                  description="El nombre público que verán tus clientes."
                />

                <div>
                  <label className="block text-sm font-medium text-[var(--color-fg)] mb-2">
                    Descripción
                  </label>
                  <textarea
                    placeholder="Describe tu tienda, qué vendes y tu propuesta de valor..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    maxLength={500}
                    rows={4}
                    className="w-full px-4 py-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-[var(--color-fg)] placeholder:text-[var(--color-fg-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all resize-none"
                  />
                  <p className="mt-2 text-xs text-[var(--color-fg-secondary)] text-right">
                    {description.length}/500 caracteres
                  </p>
                </div>
              </div>
            </section>

            {/* Domain */}
            <section className="bg-[var(--color-card)] border border-[var(--color-card-border)] rounded-2xl p-6 lg:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[var(--color-border)]">
                <div className="p-2 bg-[var(--color-primary)]/10 rounded-lg">
                  <Globe className="w-5 h-5 text-[var(--color-primary)]" />
                </div>
                <div>
                  <h2 className="font-bold text-lg text-[var(--color-fg)]">
                    Dirección Web
                  </h2>
                  <p className="text-xs text-[var(--color-fg-secondary)]">
                    Cómo te encontrarán tus clientes
                  </p>
                </div>
              </div>

              <SlugInput
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                excludeStoreId={store?.$id}
              />
              <p className="text-sm text-[var(--color-fg-secondary)] mt-4 p-3 bg-[var(--color-bg-secondary)] rounded-lg border border-[var(--color-border)]">
                ℹ️ Tu tienda será accesible en:{" "}
                <span className="font-mono text-[var(--color-primary)]">
                  {slug || "tu-tienda"}.{appConfig.baseDomain}
                </span>
              </p>
            </section>

            {/* Template Selector - Moved to main column for better visibility */}
            <section className="bg-[var(--color-card)] border border-[var(--color-card-border)] rounded-2xl p-6 lg:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[var(--color-border)]">
                <div className="p-2 bg-[var(--color-primary)]/10 rounded-lg">
                  <Palette className="w-5 h-5 text-[var(--color-primary)]" />
                </div>
                <div>
                  <h2 className="font-bold text-lg text-[var(--color-fg)]">
                    Diseño Visual
                  </h2>
                  <p className="text-xs text-[var(--color-fg-secondary)]">
                    Elige la apariencia base de tu tienda
                  </p>
                </div>
              </div>
              <TemplateSelector value={templateId} onChange={setTemplateId} />
            </section>

            {/* Buttons mobile */}
            <div className="flex flex-col gap-3 lg:hidden">
              <Button
                type="submit"
                isLoading={isSubmitting}
                size="lg"
                className="w-full"
              >
                <Save className="w-5 h-5 mr-2" />
                {store ? "Guardar Cambios" : "Crear Tienda"}
              </Button>
              {store && (
                <Button
                  variant="ghost"
                  onClick={() => setIsEditing(false)}
                  type="button"
                >
                  Cancelar
                </Button>
              )}
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            {/* Branding */}
            <section className="bg-[var(--color-card)] border border-[var(--color-card-border)] rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-[var(--color-fg)] mb-4">
                Branding
              </h3>
              <ImageUpload
                label="Logo de la tienda"
                currentImageUrl={logoPreviewUrl}
                onUpload={handleLogoUpload}
                onRemove={handleLogoRemove}
                isUploading={isSubmitting && !!pendingLogoFile}
                maxSizeMB={5}
                aspectRatio="square"
                className="aspect-square w-full"
              />
            </section>

            {/* Sticky Actions Desktop */}
            <div className="hidden lg:flex flex-col gap-3 sticky top-6">
              <Button
                type="submit"
                isLoading={isSubmitting}
                size="lg"
                className="w-full shadow-lg shadow-[var(--color-primary)]/20"
              >
                <Save className="w-5 h-5 mr-2" />
                {store ? "Guardar Cambios" : "Crear Tienda"}
              </Button>
              {store && (
                <Button
                  variant="secondary"
                  onClick={() => setIsEditing(false)}
                  type="button"
                >
                  Cancelar
                </Button>
              )}
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
