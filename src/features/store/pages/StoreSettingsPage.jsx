import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Store,
  Globe,
  Palette,
  Save,
  Loader2,
  ExternalLink,
  Check,
  LayoutTemplate,
  Package,
  Plus,
  Search,
  Grid,
  List,
  Filter,
} from "lucide-react";
import { Button } from "@/shared/ui/atoms/Button";
import { Input } from "@/shared/ui/atoms/Input";
import { SlugInput } from "@/shared/ui/molecules/SlugInput";
import { ImageUpload } from "@/shared/ui/molecules/ImageUpload";
import { Modal, ModalFooter } from "@/shared/ui/molecules/Modal";
import { TemplateSelector } from "../components/TemplateSelector";
import { ProductList } from "../components/ProductList";
import { ProductModal } from "../components/ProductModal";
import {
  useUserStore,
  useCreateStore,
  useUpdateStore,
  useUploadStoreLogo,
  useToggleStorePublished,
  useProducts,
  useDeleteProduct,
  useUpdateProduct,
} from "@/shared/hooks";
import {
  getStoreLogoUrl,
  deleteStoreLogo,
} from "@/shared/services/storeService";
import { appConfig } from "@/shared/lib/env";
import { motion, AnimatePresence } from "motion/react";

export function StoreSettingsPage() {
  const navigate = useNavigate();

  // Fetch user's store
  const { data: store, isLoading: loadingStore } = useUserStore();

  // Products Data
  const { data: productsData, isLoading: loadingProducts } = useProducts(
    store?.$id,
  );
  const products = productsData?.documents || [];

  // Mutations
  const createStore = useCreateStore();
  const updateStore = useUpdateStore();
  const uploadLogo = useUploadStoreLogo();
  const togglePublished = useToggleStorePublished();
  const deleteProduct = useDeleteProduct(store?.$id);
  const updateProduct = useUpdateProduct(store?.$id);

  // UI State
  const [activeTab, setActiveTab] = useState("general"); // 'general' | 'appearance' | 'products'
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Product Management State
  const [productViewMode, setProductViewMode] = useState("grid"); // 'grid' | 'table'
  const [productSearch, setProductSearch] = useState("");
  const [filterEnabled, setFilterEnabled] = useState("all"); // 'all' | 'active' | 'hidden'
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productActionLoadingId, setProductActionLoadingId] = useState(null);
  const [productActionType, setProductActionType] = useState(null); // 'delete' | 'toggle'

  // General Form State
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");

  // Appearance Form State
  const [templateId, setTemplateId] = useState("minimal");
  const [currentLogoId, setCurrentLogoId] = useState("");
  const [logoPreviewUrl, setLogoPreviewUrl] = useState(null);
  const [pendingLogoFile, setPendingLogoFile] = useState(null);

  // Load Store Data
  useEffect(() => {
    if (store) {
      setName(store.name || "");
      setSlug(store.slug || "");
      setDescription(store.description || "");
      setTemplateId(store.templateId || "minimal");
      setCurrentLogoId(store.logoFileId || "");
      setLogoPreviewUrl(
        store.logoFileId ? getStoreLogoUrl(store.logoFileId) : null,
      );
    }
  }, [store]);

  // --- Handlers: General & Appearance ---

  const handleLogoUpload = (file) => {
    setPendingLogoFile(file);
  };

  const handleLogoRemove = () => {
    setPendingLogoFile(null);
    setCurrentLogoId("");
    setLogoPreviewUrl(null);
  };

  const handleSaveStore = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      let finalLogoId = currentLogoId;

      if (pendingLogoFile) {
        const response = await uploadLogo.mutateAsync(pendingLogoFile);
        finalLogoId = response.$id;
      }

      const data = {
        name: name.trim(),
        slug: slug.trim().toLowerCase(),
        description: description.trim(),
        templateId,
        logoFileId: finalLogoId || null,
      };

      if (store) {
        await updateStore.mutateAsync({ storeId: store.$id, data });

        // Cleanup old logo if replaced
        const oldId = store.logoFileId;
        if (oldId && oldId !== finalLogoId) {
          try {
            await deleteStoreLogo(oldId);
          } catch (e) {
            console.warn(e);
          }
        }

        setSuccess("Tienda actualizada correctamente");
      } else {
        await createStore.mutateAsync(data);
        setSuccess("Tienda creada correctamente");
      }

      setPendingLogoFile(null);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error(err);
      setError("Error al guardar la tienda");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmPublish = async () => {
    if (!store) return;
    try {
      await togglePublished.mutateAsync({
        storeId: store.$id,
        published: !store.published,
      });
      setSuccess(store.published ? "Tienda despublicada" : "Tienda publicada");
      setTimeout(() => setSuccess(""), 3000);
      setIsPublishModalOpen(false);
    } catch (e) {
      setError("Error al cambiar estado de publicación");
    }
  };

  // --- Handlers: Products ---

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name
      .toLowerCase()
      .includes(productSearch.toLowerCase());
    const matchesFilter =
      filterEnabled === "all"
        ? true
        : filterEnabled === "active"
          ? p.enabled
          : !p.enabled;
    return matchesSearch && matchesFilter;
  });

  const handleProductDelete = async (product) => {
    if (!confirm("¿Eliminar este producto?")) return;
    setProductActionLoadingId(product.$id);
    setProductActionType("delete");
    try {
      await deleteProduct.mutateAsync(product.$id);
    } catch (e) {
      console.error(e);
      alert("Error al eliminar");
    } finally {
      setProductActionLoadingId(null);
      setProductActionType(null);
    }
  };

  const handleProductToggle = async (product) => {
    setProductActionLoadingId(product.$id);
    setProductActionType("toggle");
    try {
      await updateProduct.mutateAsync({
        productId: product.$id,
        data: { enabled: !product.enabled },
      });
    } catch (e) {
      console.error(e);
    } finally {
      setProductActionLoadingId(null);
      setProductActionType(null);
    }
  };

  const handleOpenProductModal = (product = null) => {
    setEditingProduct(product);
    setIsProductModalOpen(true);
  };

  // Check for changes
  const hasChanges =
    name.trim() !== (store?.name || "") ||
    slug.trim() !== (store?.slug || "") ||
    description.trim() !== (store?.description || "") ||
    templateId !== (store?.templateId || "minimal") ||
    !!pendingLogoFile ||
    currentLogoId !== (store?.logoFileId || "");

  if (loadingStore) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-fg)] flex items-center gap-3">
            <Store className="w-8 h-8 text-[var(--color-primary)]" />
            Mi Tienda
          </h1>
          <p className="text-[var(--color-fg-secondary)] mt-1 ml-11">
            Configuración general y gestión de productos
          </p>
        </div>
        <div className="flex items-center gap-3 ml-11 md:ml-0">
          {store && (
            <a
              href={`https://${store.slug}.${appConfig.baseDomain}`}
              target="_blank"
              rel="noreferrer"
            >
              <Button variant="outline">
                <ExternalLink className="w-4 h-4 mr-2" />
                Ver Tienda
              </Button>
            </a>
          )}
          <Button variant="primary" onClick={() => navigate("/app/editor")}>
            <LayoutTemplate className="w-4 h-4 mr-2" />
            Editor Visual
          </Button>
        </div>
      </div>

      {/* Notifications */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-4 py-3 rounded-xl flex items-center gap-2"
          >
            <Check className="w-4 h-4" /> {success}
          </motion.div>
        )}
        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 px-4 py-3 rounded-xl">
            {error}
          </div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="border-b border-[var(--color-border)] flex gap-1 items-end overflow-x-auto">
        <TabButton
          active={activeTab === "general"}
          onClick={() => setActiveTab("general")}
          icon={Store}
          label="General"
        />
        <TabButton
          active={activeTab === "appearance"}
          onClick={() => setActiveTab("appearance")}
          icon={Palette}
          label="Apariencia"
        />
        <TabButton
          active={activeTab === "products"}
          onClick={() => setActiveTab("products")}
          icon={Package}
          label="Productos"
        />
      </div>

      {/* Content */}
      <div className="animate-in fade-in duration-300">
        {/* GENERAL TAB */}
        {activeTab === "general" && (
          <form
            onSubmit={handleSaveStore}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-[var(--color-card)] border border-[var(--color-card-border)] rounded-2xl p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-[var(--color-fg)] mb-1">
                    Información Básica
                  </h3>
                  <p className="text-sm text-[var(--color-fg-secondary)] mb-4">
                    Detalles principales de tu comercio.
                  </p>

                  <div className="space-y-4">
                    <Input
                      label="Nombre de la tienda"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                    <div>
                      <label className="text-sm font-medium text-[var(--color-fg)]">
                        Descripción
                      </label>
                      <textarea
                        className="w-full mt-1 px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-[var(--color-fg)] focus:ring-2 focus:ring-[var(--color-primary)] outline-none resize-none"
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        maxLength={500}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[var(--color-card)] border border-[var(--color-card-border)] rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-[var(--color-fg)] mb-1">
                  Dominio
                </h3>
                <p className="text-sm text-[var(--color-fg-secondary)] mb-4">
                  Define la URL de tu tienda.
                </p>
                <SlugInput
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  excludeStoreId={store?.$id}
                />
              </div>
            </div>

            <div className="lg:col-span-1 space-y-6">
              <div className="bg-[var(--color-card)] border border-[var(--color-card-border)] rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-[var(--color-fg)] mb-4">
                  Estado de la tienda
                </h3>
                <div
                  className={`flex flex-col gap-4 p-4 rounded-xl border ${
                    store?.published
                      ? "bg-green-500/5 border-green-500/20"
                      : "bg-[var(--color-bg-secondary)] border-[var(--color-border)]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        store?.published
                          ? "bg-green-500/10 text-green-600"
                          : "bg-[var(--color-bg-tertiary)] text-[var(--color-fg-muted)]"
                      }`}
                    >
                      <Globe className="w-6 h-6" />
                    </div>
                    <div>
                      <span
                        className={`font-semibold text-lg block ${
                          store?.published
                            ? "text-green-700 dark:text-green-400"
                            : "text-[var(--color-fg)]"
                        }`}
                      >
                        {store?.published ? "Tienda Pública" : "Tienda Privada"}
                      </span>
                      <p className="text-sm text-[var(--color-fg-secondary)]">
                        {store?.published
                          ? "Cualquiera con el link puede ver tu tienda."
                          : "Solo tú puedes ver tu tienda."}
                      </p>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant={store?.published ? "outline" : "primary"}
                    className={`w-full ${
                      store?.published
                        ? "hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-900/10"
                        : "bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20"
                    }`}
                    onClick={() => setIsPublishModalOpen(true)}
                  >
                    {store?.published
                      ? "Despublicar Tienda"
                      : "Publicar Tienda"}
                  </Button>
                </div>
              </div>

              <Modal
                open={isPublishModalOpen}
                onClose={() => setIsPublishModalOpen(false)}
                title={
                  store?.published
                    ? "¿Despublicar tienda?"
                    : "¿Publicar tienda?"
                }
                description={
                  store?.published
                    ? "Tu tienda dejará de ser visible para los clientes. Podrás volver a publicarla cuando quieras."
                    : "Tu tienda será visible para todo el mundo. Asegúrate de haber configurado todo correctamente."
                }
                footer={
                  <ModalFooter>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setIsPublishModalOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="button"
                      variant={store?.published ? "destructive" : "primary"}
                      onClick={handleConfirmPublish}
                      isLoading={togglePublished.isPending}
                    >
                      {store?.published
                        ? "Sí, despublicar"
                        : "Sí, publicar ahora"}
                    </Button>
                  </ModalFooter>
                }
              >
                <div className="p-4 bg-[var(--color-bg-secondary)] rounded-lg text-sm text-[var(--color-fg-secondary)]">
                  <p className="font-medium text-[var(--color-fg)] mb-1">
                    Link de tu tienda:
                  </p>
                  <code className="block bg-[var(--color-bg)] p-2 rounded border border-[var(--color-border)] select-all">
                    https://{store?.slug}.{appConfig.baseDomain}
                  </code>
                </div>
              </Modal>

              <Button
                type="submit"
                size="lg"
                className="w-full"
                isLoading={isSubmitting}
                disabled={!hasChanges}
              >
                <Save className="w-5 h-5 mr-2" /> Guardar Cambios
              </Button>
            </div>
          </form>
        )}

        {/* APPEARANCE TAB */}
        {activeTab === "appearance" && (
          <form
            onSubmit={handleSaveStore}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-[var(--color-card)] border border-[var(--color-card-border)] rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-[var(--color-fg)] mb-4">
                  Plantilla
                </h3>
                <TemplateSelector value={templateId} onChange={setTemplateId} />
              </div>
            </div>
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-[var(--color-card)] border border-[var(--color-card-border)] rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-[var(--color-fg)] mb-4">
                  Logo
                </h3>
                <ImageUpload
                  currentImageUrl={logoPreviewUrl}
                  onUpload={handleLogoUpload}
                  onRemove={handleLogoRemove}
                  isUploading={isSubmitting && !!pendingLogoFile}
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="w-full"
                isLoading={isSubmitting}
                disabled={!hasChanges}
              >
                <Save className="w-5 h-5 mr-2" /> Guardar Cambios
              </Button>
            </div>
          </form>
        )}

        {/* PRODUCTS TAB */}
        {activeTab === "products" && (
          <div className="space-y-6">
            {/* Toolbar */}
            <div className="bg-[var(--color-card)] border border-[var(--color-card-border)] rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-fg-muted)]" />
                  <input
                    type="text"
                    placeholder="Buscar productos..."
                    className="w-full pl-9 pr-4 py-2 bg-[var(--color-bg-secondary)] border-none rounded-lg text-sm text-[var(--color-fg)] focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                  />
                </div>
                <div className="relative">
                  <select
                    value={filterEnabled}
                    onChange={(e) => setFilterEnabled(e.target.value)}
                    className="appearance-none pl-9 pr-8 py-2 bg-[var(--color-bg-secondary)] rounded-lg text-sm font-medium text-[var(--color-fg)] outline-none cursor-pointer focus:ring-2 focus:ring-[var(--color-primary)]"
                  >
                    <option value="all">Todos</option>
                    <option value="active">Activos</option>
                    <option value="hidden">Ocultos</option>
                  </select>
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-fg-muted)]" />
                </div>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                <div className="flex bg-[var(--color-bg-secondary)] p-1 rounded-lg">
                  <button
                    onClick={() => setProductViewMode("grid")}
                    className={`p-1.5 rounded-md transition-all ${productViewMode === "grid" ? "bg-[var(--color-card)] shadow text-[var(--color-fg)]" : "text-[var(--color-fg-muted)]"}`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setProductViewMode("table")}
                    className={`p-1.5 rounded-md transition-all ${productViewMode === "table" ? "bg-[var(--color-card)] shadow text-[var(--color-fg)]" : "text-[var(--color-fg-muted)]"}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
                <Button onClick={() => handleOpenProductModal()}>
                  <Plus className="w-5 h-5 mr-2" /> Nuevo
                </Button>
              </div>
            </div>

            {/* List */}
            {loadingProducts ? (
              <div className="py-12 flex justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
              </div>
            ) : (
              <ProductList
                products={filteredProducts}
                viewMode={productViewMode}
                onEdit={handleOpenProductModal}
                onDelete={handleProductDelete}
                onToggleStatus={handleProductToggle}
                actionLoadingId={productActionLoadingId}
                actionType={productActionType}
              />
            )}

            {/* Modal */}
            <ProductModal
              isOpen={isProductModalOpen}
              onClose={() => setIsProductModalOpen(false)}
              storeId={store?.$id}
              product={editingProduct}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`
                flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors
                ${
                  active
                    ? "border-[var(--color-primary)] text-[var(--color-primary)]"
                    : "border-transparent text-[var(--color-fg-secondary)] hover:text-[var(--color-fg)] hover:border-[var(--color-fg-muted)]"
                }
            `}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}
