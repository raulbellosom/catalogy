import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
  Copy,
  Share2,
  Eye,
  Tag,
  X,
  Link as LinkIcon,
  Edit3,
  Droplets,
  Type,
} from "lucide-react";
import { Button } from "@/shared/ui/atoms/Button";
import { Input } from "@/shared/ui/atoms/Input";
import { SlugInput } from "@/shared/ui/molecules/SlugInput";
import { ImageUpload } from "@/shared/ui/molecules/ImageUpload";
import { Modal, ModalFooter } from "@/shared/ui/molecules/Modal";
import { TemplateSelector } from "../components/TemplateSelector";
import { ProductList } from "../components/ProductList";
import { ProductModal } from "../components/ProductModal";
import { ShareStoreModal } from "../components/ShareStoreModal";
import { useToast } from "@/shared/ui/molecules";
import {
  useUserStore,
  useCreateStore,
  useUpdateStore,
  useUploadStoreLogo,
  useToggleStorePublished,
  useProducts,
  useDeleteProduct,
  useUpdateProduct,
  useReorderProducts,
} from "@/shared/hooks";
import {
  getStoreLogoUrl,
  deleteStoreLogo,
} from "@/shared/services/storeService";
import { appConfig } from "@/shared/lib/env";
import { motion, AnimatePresence } from "motion/react";

const safeParseCategories = (raw) => {
  if (!raw) return [];
  const parsed =
    typeof raw === "string"
      ? (() => {
          try {
            return JSON.parse(raw);
          } catch (error) {
            console.warn("Error parsing categoriesJson:", error);
            return [];
          }
        })()
      : raw;

  if (!Array.isArray(parsed)) return [];

  return parsed
    .map((item) => ({
      id: String(item?.id || "").trim(),
      name: String(item?.name || "").trim(),
    }))
    .filter((item) => item.id && item.name);
};

const FONTS = [
  { id: "inter", name: "Inter (Modern Sans)", class: "font-sans" },
  {
    id: "merriweather",
    name: "Merriweather (Classic Serif)",
    class: "font-serif",
  },
  { id: "jetbrains", name: "JetBrains (Tech Mono)", class: "font-mono" },
  {
    id: "roboto",
    name: "Roboto (Neutral)",
    style: { fontFamily: "'Roboto', sans-serif" },
  },
  {
    id: "playfair",
    name: "Playfair Display (Elegant)",
    style: { fontFamily: "'Playfair Display', serif" },
  },
  {
    id: "montserrat",
    name: "Montserrat (Geometric)",
    style: { fontFamily: "'Montserrat', sans-serif" },
  },
];

const COLOR_PRESETS = [
  { primary: "#6366f1", secondary: "#4f46e5", name: "Original" },
  { primary: "#3b82f6", secondary: "#1e40af", name: "Ocean" },
  { primary: "#22c55e", secondary: "#15803d", name: "Forest" },
  { primary: "#a855f7", secondary: "#7e22ce", name: "Royal" },
  { primary: "#f97316", secondary: "#c2410c", name: "Sunset" },
  { primary: "#171717", secondary: "#404040", name: "Minimal" },
  { primary: "#ec4899", secondary: "#be185d", name: "Berry" },
];

const slugifyCategory = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);

const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

export function StoreSettingsPage() {
  const navigate = useNavigate();

  // Fetch user's store
  const { data: store, isLoading: loadingStore } = useUserStore();

  // Products Data
  const { data: productsData, isLoading: loadingProducts } = useProducts(
    store?.$id,
    { includeDisabled: true, includeInactive: true },
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
  const [searchParams] = useSearchParams();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState(
    () => searchParams.get("tab") || "general",
  );
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync tab with URL
  useEffect(() => {
    const tabFromUrl = searchParams.get("tab");
    if (
      tabFromUrl &&
      ["general", "appearance", "categories", "products"].includes(tabFromUrl)
    ) {
      setActiveTab(tabFromUrl);
    } else if (!tabFromUrl) {
      // If no tab is specified, redirect to general tab
      navigate("/app/store?tab=general", { replace: true });
    }
  }, [searchParams, navigate]);

  // Update URL on tab change (optional, but good for navigation)
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate(`/app/store?tab=${tab}`, { replace: true });
  };

  // Product Management State
  const [productViewMode, setProductViewMode] = useState("grid"); // 'grid' | 'table'
  const [productSearch, setProductSearch] = useState("");
  const [filterEnabled, setFilterEnabled] = useState("all"); // 'all' | 'active' | 'hidden'
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productActionLoadingId, setProductActionLoadingId] = useState(null);
  const [productActionType, setProductActionType] = useState(null); // 'delete' | 'toggle'
  const [localProducts, setLocalProducts] = useState([]);

  // Sync localProducts with productsData
  useEffect(() => {
    if (productsData?.documents) {
      setLocalProducts(productsData.documents);
    }
  }, [productsData]);

  const reorderProductsMutation = useReorderProducts(store?.$id);

  // General Form State
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [purchaseInstructions, setPurchaseInstructions] = useState("");
  const [paymentLink, setPaymentLink] = useState("");

  // Appearance Form State
  const [templateId, setTemplateId] = useState("minimal");
  const [activeRenderer, setActiveRenderer] = useState("template");
  const [currentLogoId, setCurrentLogoId] = useState("");
  const [logoPreviewUrl, setLogoPreviewUrl] = useState(null);
  const [pendingLogoFile, setPendingLogoFile] = useState(null);

  // Style State
  const [primaryColor, setPrimaryColor] = useState(COLOR_PRESETS[0].primary);
  const [secondaryColor, setSecondaryColor] = useState(
    COLOR_PRESETS[0].secondary,
  );
  const [selectedFont, setSelectedFont] = useState(FONTS[0].id);

  // Categories State
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategory, setEditingCategory] = useState(null); // { id, originalId, name }
  const [isEditingCategory, setIsEditingCategory] = useState(false);

  // Load Store Data
  useEffect(() => {
    if (store) {
      setName(store.name || "");
      setSlug(store.slug || "");
      setDescription(store.description || "");
      setPurchaseInstructions(store.purchaseInstructions || "");
      setPaymentLink(store.paymentLink || "");
      setTemplateId(store.templateId || "minimal");
      setActiveRenderer(store.activeRenderer || "template");
      setCategories(safeParseCategories(store.categoriesJson));
      setCurrentLogoId(store.logoFileId || "");
      setLogoPreviewUrl(
        store.logoFileId ? getStoreLogoUrl(store.logoFileId) : null,
      );

      // Setup Style settings
      const settings =
        typeof store.settings === "string"
          ? JSON.parse(store.settings || "{}")
          : store.settings || {};

      if (settings.colors?.primary) setPrimaryColor(settings.colors.primary);
      if (settings.colors?.secondary)
        setSecondaryColor(settings.colors.secondary);
      if (settings.font) setSelectedFont(settings.font);
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

  const handleEditCategory = (category) => {
    setEditingCategory({
      id: category.id,
      originalId: category.id,
      name: category.name,
    });
    setIsEditingCategory(true);
  };

  const handleSaveEditCategory = async () => {
    if (!editingCategory) return;

    const newName = editingCategory.name.trim();
    if (!newName) {
      toast.error("El nombre no puede estar vacío");
      return;
    }

    const newId = slugifyCategory(newName);
    if (!newId) {
      toast.error("Nombre de categoría inválido");
      return;
    }

    // Verificar que el nuevo ID no exista (excepto si es el mismo)
    if (
      newId !== editingCategory.originalId &&
      categories.some((cat) => cat.id === newId)
    ) {
      toast.error("Ya existe una categoría con ese nombre");
      return;
    }

    try {
      // Primero actualizar la tienda con las nuevas categorías
      const updatedCategories = categories.map((cat) =>
        cat.id === editingCategory.originalId
          ? { id: newId, name: newName }
          : cat,
      );

      const storeData = {
        categoriesJson: JSON.stringify(updatedCategories),
      };

      await updateStore.mutateAsync({ storeId: store.$id, data: storeData });

      // Actualizar estado local después de confirmar que se guardó en DB
      setCategories(updatedCategories);

      // Si el ID cambió, actualizar productos
      if (newId !== editingCategory.originalId) {
        const productsWithCategory = products.filter(
          (product) =>
            product.categoryIds &&
            product.categoryIds.includes(editingCategory.originalId),
        );

        for (const product of productsWithCategory) {
          const updatedCategoryIds = product.categoryIds.map((id) =>
            id === editingCategory.originalId ? newId : id,
          );
          await updateProduct.mutateAsync({
            productId: product.$id,
            data: { categoryIds: updatedCategoryIds },
          });
        }

        if (productsWithCategory.length > 0) {
          toast.success(
            `Categoría actualizada en ${productsWithCategory.length} producto(s)`,
          );
        } else {
          toast.success("Categoría actualizada correctamente");
        }
      } else {
        toast.success("Categoría actualizada correctamente");
      }

      setIsEditingCategory(false);
      setEditingCategory(null);
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error("Error al actualizar categoría");
      // Revertir cambios locales en caso de error
      setIsEditingCategory(false);
      setEditingCategory(null);
    }
  };

  const handleCancelEditCategory = () => {
    setIsEditingCategory(false);
    setEditingCategory(null);
  };

  const handleAddCategory = async () => {
    const name = newCategoryName.trim();
    if (!name) return;
    const id = slugifyCategory(name);
    if (!id) {
      toast.error("Nombre de categoria invalido");
      return;
    }
    if (categories.some((category) => category.id === id)) {
      toast.error("Esa categoria ya existe");
      return;
    }

    try {
      // Crear nueva categoría
      const newCategory = { id, name };
      const updatedCategories = [...categories, newCategory];

      const storeData = {
        categoriesJson: JSON.stringify(updatedCategories),
      };

      await updateStore.mutateAsync({ storeId: store.$id, data: storeData });

      // Actualizar estado local después de confirmar que se guardó en DB
      setCategories(updatedCategories);
      setNewCategoryName("");
      toast.success("Categoría creada correctamente");
    } catch (error) {
      console.error("Error adding category:", error);
      toast.error("Error al crear categoría");
    }
  };

  const handleRemoveCategory = async (categoryId) => {
    try {
      // Primero actualizar la tienda removiendo la categoría
      const updatedCategories = categories.filter(
        (item) => item.id !== categoryId,
      );

      const storeData = {
        categoriesJson: JSON.stringify(updatedCategories),
      };

      await updateStore.mutateAsync({ storeId: store.$id, data: storeData });

      // Actualizar estado local después de confirmar que se guardó en DB
      setCategories(updatedCategories);

      // Actualizar todos los productos que tengan esta categoría
      const productsWithCategory = products.filter(
        (product) =>
          product.categoryIds && product.categoryIds.includes(categoryId),
      );

      // Actualizar cada producto removiendo la categoría
      for (const product of productsWithCategory) {
        const updatedCategoryIds = product.categoryIds.filter(
          (id) => id !== categoryId,
        );
        await updateProduct.mutateAsync({
          productId: product.$id,
          data: { categoryIds: updatedCategoryIds },
        });
      }

      if (productsWithCategory.length > 0) {
        toast.success(
          `Categoría eliminada y removida de ${productsWithCategory.length} producto(s)`,
        );
      } else {
        toast.success("Categoría eliminada correctamente");
      }
    } catch (error) {
      console.error("Error removing category:", error);
      toast.error("Error al eliminar categoría");
    }
  };

  const handleSaveStore = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    setIsSubmitting(true);

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
        purchaseInstructions: purchaseInstructions.trim(),
        activeRenderer,
        templateId,
        categoriesJson: JSON.stringify(categories),
        logoFileId: finalLogoId || null,
        settings: {
          colors: {
            primary: primaryColor,
            secondary: secondaryColor,
          },
          font: selectedFont,
        },
      };

      // Solo incluir paymentLink si tiene un valor válido (campos URL en Appwrite no aceptan cadenas vacías)
      if (paymentLink.trim()) {
        data.paymentLink = paymentLink.trim();
      }

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

        toast.success("Tienda actualizada correctamente");
      } else {
        await createStore.mutateAsync(data);
        toast.success("Tienda creada correctamente");
      }

      setPendingLogoFile(null);
    } catch (err) {
      console.error(err);
      toast.error("Error al guardar la tienda");
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
      toast.success(
        store.published ? "Tienda despublicada" : "Tienda publicada",
      );
      setIsPublishModalOpen(false);
    } catch (e) {
      toast.error("Error al cambiar estado de publicación");
    }
  };

  // --- Handlers: Products ---

  const filteredProducts = localProducts.filter((p) => {
    const matchesSearch = p.name
      .toLowerCase()
      .includes(productSearch.toLowerCase());
    const matchesFilter =
      filterEnabled === "all"
        ? true
        : filterEnabled === "active"
          ? p.status
          : !p.status;
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
        data: { status: !product.status },
      });
    } catch (e) {
      console.error(e);
    } finally {
      setProductActionLoadingId(null);
      setProductActionType(null);
    }
  };

  const handleProductReorder = async (product, direction) => {
    const currentIndex = filteredProducts.findIndex(
      (p) => p.$id === product.$id,
    );
    if (currentIndex === -1) return;

    const swapIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (swapIndex < 0 || swapIndex >= filteredProducts.length) return;

    const newFiltered = [...filteredProducts];
    const [moved] = newFiltered.splice(currentIndex, 1);
    newFiltered.splice(swapIndex, 0, moved);

    // Actualizar localmente primero para feedback instantáneo
    handleProductReorderList(newFiltered);

    // Al ser reordenamiento por flechas, sincronizamos inmediatamente
    handleProductReorderSync(newFiltered);
  };

  const handleProductReorderSync = async (newOrderedList = null) => {
    const listToSync = newOrderedList || filteredProducts;

    // 1. Get existing sortOrder values from the visible products
    // We filter out nulls and default to 0
    let sortOrders = filteredProducts
      .map((p) => p.sortOrder ?? 0)
      .sort((a, b) => a - b);

    // 2. Determine if the current sequence is "invalid" for reordering
    // If all are 0 or there are duplicates, we can't meaningfully redistribute them
    const isBrokenSequence =
      sortOrders.length > 0 &&
      (sortOrders.every((s) => s === 0) ||
        new Set(sortOrders).size < sortOrders.length);

    if (isBrokenSequence) {
      // Generate a fresh sequence: 10, 20, 30... to ensure they are distinct
      // and provide buffer for future insertions if needed
      sortOrders = listToSync.map((_, i) => (i + 1) * 10);
    }

    // 3. Assign the sorted values to the new order
    const productsToUpdate = listToSync.map((prod, index) => ({
      id: prod.$id,
      sortOrder: sortOrders[index],
    }));

    if (productsToUpdate.length === 0) return;

    try {
      await reorderProductsMutation.mutateAsync(productsToUpdate);
      toast.success("Orden actualizado");
    } catch (e) {
      console.error(e);
      toast.error("Error al guardar el nuevo orden");
    }
  };

  const handleProductReorderList = (newOrderedList) => {
    // Solo actualizamos el estado local para feedback visual fluido
    setLocalProducts((prev) => {
      const next = [...prev];
      // Mapear los ids a sus nuevos objetos para preservar el estado completo
      newOrderedList.forEach((prod, newIndex) => {
        const foundIdx = next.findIndex((p) => p.$id === prod.$id);
        if (foundIdx !== -1) {
          // No necesitamos cambiar el sortOrder aquí todavía si solo es para Framer Motion,
          // pero Reorder.Group de Framer Motion funciona mejor si el estado local
          // refleja exactamente el orden de los componentes.
        }
      });

      // La clave aquí es que filteredProducts se deriva de localProducts.
      // Si reordenamos localProducts para que los elementos filtrados estén en el nuevo orden...

      const filteredIds = filteredProducts.map((p) => p.$id);
      const nonFilteredProducts = next.filter(
        (p) => !filteredIds.includes(p.$id),
      );

      // Reinsertamos los filtrados en su nuevo orden entre los no filtrados
      // Para simplificar: solo actualizamos el orden de localProducts basado en la visualización
      return [...newOrderedList, ...nonFilteredProducts];
    });
  };

  const handleOpenProductModal = (product = null) => {
    setEditingProduct(product);
    setIsProductModalOpen(true);
  };

  // Check for changes
  const storedCategoriesJson = JSON.stringify(
    safeParseCategories(store?.categoriesJson),
  );
  const currentCategoriesJson = JSON.stringify(categories);

  const hasChanges =
    name.trim() !== (store?.name || "") ||
    slug.trim() !== (store?.slug || "") ||
    description.trim() !== (store?.description || "") ||
    purchaseInstructions.trim() !== (store?.purchaseInstructions || "") ||
    paymentLink.trim() !== (store?.paymentLink || "") ||
    templateId !== (store?.templateId || "minimal") ||
    activeRenderer !== (store?.activeRenderer || "template") ||
    currentCategoriesJson !== storedCategoriesJson ||
    !!pendingLogoFile ||
    currentLogoId !== (store?.logoFileId || "") ||
    primaryColor !==
      (typeof store?.settings === "string"
        ? JSON.parse(store?.settings || "{}")
        : store?.settings || {}
      ).colors?.primary ||
    secondaryColor !==
      (typeof store?.settings === "string"
        ? JSON.parse(store?.settings || "{}")
        : store?.settings || {}
      ).colors?.secondary ||
    selectedFont !==
      (typeof store?.settings === "string"
        ? JSON.parse(store?.settings || "{}")
        : store?.settings || {}
      ).font;

  const rendererLabel =
    activeRenderer === "puck"
      ? "Editor (Puck)"
      : `Template (${templateId || "minimal"})`;

  if (loadingStore) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-(--color-primary)" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-(--color-fg) flex items-center gap-3">
            <Store className="w-8 h-8 text-(--color-primary)" />
            Mi Tienda
          </h1>
          <p className="text-(--color-fg-secondary) mt-1 ml-11">
            Configuración general y gestión de productos
          </p>
        </div>
        <div className="flex items-center gap-3 ml-11 md:ml-0">
          {store && (
            <>
              <a
                href={`https://${store.slug}.${appConfig.baseDomain}`}
                target="_blank"
                rel="noreferrer"
              >
                <Button
                  variant="outline"
                  className="border-(--color-primary)/20 hover:bg-(--color-primary)/5"
                >
                  <Globe className="w-4 h-4 mr-2" />
                  Ver Tienda
                </Button>
              </a>
              <Button
                variant="outline"
                className="border-(--color-primary)/20 hover:bg-(--color-primary)/5"
                onClick={() => navigate(`/app/store/${store.slug}/preview`)}
              >
                <Eye className="w-4 h-4 mr-2" />
                Vista Previa
              </Button>
            </>
          )}
          <Button variant="primary" onClick={() => navigate("/app/editor")}>
            <LayoutTemplate className="w-4 h-4 mr-2" />
            Editor Visual
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-(--color-border) flex gap-1 items-end overflow-x-auto">
        <TabButton
          active={activeTab === "general"}
          onClick={() => handleTabChange("general")}
          icon={Store}
          label="General"
        />
        <TabButton
          active={activeTab === "appearance"}
          onClick={() => handleTabChange("appearance")}
          icon={Palette}
          label="Apariencia"
        />
        <TabButton
          active={activeTab === "categories"}
          onClick={() => handleTabChange("categories")}
          icon={Tag}
          label="Categorías"
        />
        <TabButton
          active={activeTab === "products"}
          onClick={() => handleTabChange("products")}
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
              <div className="bg-(--color-card) border border-(--color-card-border) rounded-2xl p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-(--color-fg) mb-1">
                    Información Básica
                  </h3>
                  <p className="text-sm text-(--color-fg-secondary) mb-4">
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
                      <label className="text-sm font-medium text-(--color-fg)">
                        Descripción
                      </label>
                      <textarea
                        className="w-full mt-1 px-3 py-2 bg-(--color-bg) border border-(--color-border) rounded-xl text-(--color-fg) focus:ring-2 focus:ring-(--color-primary) outline-none resize-none"
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        maxLength={500}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-(--color-card) border border-(--color-card-border) rounded-2xl p-6 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-(--color-fg) mb-1">
                      Link de tu tienda
                    </h3>
                    <p className="text-sm text-(--color-fg-secondary)">
                      Esta es la dirección pública de tu catálogo.
                    </p>
                  </div>
                  <Globe className="w-6 h-6 text-(--color-primary) opacity-50" />
                </div>

                <div className="space-y-6">
                  <SlugInput
                    value={slug}
                    initialValue={store?.slug || ""}
                    onChange={(e) => setSlug(e.target.value)}
                    excludeStoreId={store?.$id}
                  />

                  <div className="flex items-center gap-2 p-3 bg-(--color-bg-secondary) border border-(--color-border) rounded-xl group hover:border-(--color-primary)/30 transition-colors">
                    <div className="flex-1 overflow-hidden">
                      <p className="text-xs text-(--color-fg-muted) font-medium uppercase tracking-wider mb-0.5">
                        URL de la tienda
                      </p>
                      <p className="text-(--color-fg) font-semibold truncate">
                        {slug}.{appConfig.baseDomain}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-10 px-4 rounded-lg bg-(--color-card) shadow-sm hover:text-(--color-primary)"
                        onClick={() => {
                          const url = `https://${slug}.${appConfig.baseDomain}`;
                          navigator.clipboard.writeText(url);
                          toast.success("Link copiado al portapapeles");
                        }}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copiar
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-10 px-4 rounded-lg bg-(--color-card) shadow-sm hover:text-(--color-primary)"
                        onClick={() => setIsShareModalOpen(true)}
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Compartir
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-(--color-card) border border-(--color-card-border) rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-(--color-fg) mb-1">
                      Instrucciones de compra
                    </h3>
                    <p className="text-sm text-(--color-fg-secondary)">
                      Explica como comprar y agrega un link de pago si aplica.
                    </p>
                  </div>
                  <LinkIcon className="w-5 h-5 text-(--color-primary) opacity-60" />
                </div>

                <Input
                  label="Link de pago (opcional)"
                  placeholder="https://..."
                  value={paymentLink}
                  onChange={(e) => setPaymentLink(e.target.value)}
                  error={
                    paymentLink.trim() && !isValidUrl(paymentLink.trim())
                      ? "Debe ser una URL válida (ej. https://ejemplo.com)"
                      : undefined
                  }
                />

                <div>
                  <label className="text-sm font-medium text-(--color-fg)">
                    Instrucciones (opcional)
                  </label>
                  <textarea
                    className="w-full mt-1 px-3 py-2 bg-[var(--color-bg)] border border-(--color-border) rounded-xl text-(--color-fg) focus:ring-2 focus:ring-(--color-primary) outline-none resize-none"
                    rows={4}
                    value={purchaseInstructions}
                    onChange={(e) => setPurchaseInstructions(e.target.value)}
                    maxLength={2000}
                    placeholder="Ej. Haz tu pedido por WhatsApp y completa el pago con el link de arriba."
                  />
                </div>
              </div>
            </div>

            <div className="lg:col-span-1 space-y-6">
              <div className="bg-(--color-card) border border-(--color-card-border) rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-(--color-fg) mb-4">
                  Estado de la tienda
                </h3>
                <div
                  className={`flex flex-col gap-4 p-4 rounded-xl border ${
                    store?.published
                      ? "bg-green-500/5 border-green-500/20"
                      : "bg-(--color-bg-secondary) border-(--color-border)"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        store?.published
                          ? "bg-green-500/10 text-green-600"
                          : "bg-(--color-bg-tertiary) text-(--color-fg-muted)"
                      }`}
                    >
                      <Globe className="w-6 h-6" />
                    </div>
                    <div>
                      <span
                        className={`font-semibold text-lg block ${
                          store?.published
                            ? "text-green-700 dark:text-green-400"
                            : "text-(--color-fg)"
                        }`}
                      >
                        {store?.published ? "Tienda Pública" : "Tienda Privada"}
                      </span>
                      <p className="text-sm text-(--color-fg-secondary)">
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
                <div className="p-4 bg-(--color-bg-secondary) rounded-lg text-sm text-(--color-fg-secondary)">
                  <p className="font-medium text-(--color-fg) mb-1">
                    Link de tu tienda:
                  </p>
                  <code className="block bg-(--color-bg) p-2 rounded border border-(--color-border) select-all">
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
              <div className="bg-(--color-card) border border-(--color-card-border) rounded-2xl p-6 shadow-sm space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-(--color-fg) mb-1">
                    Render público
                  </h3>
                  <p className="text-sm text-(--color-fg-secondary)">
                    Decide qué se muestra en tu catálogo público. Cambiar esta
                    opción no borra ni sobrescribe datos.
                  </p>
                </div>

                <div className="grid gap-3">
                  <label
                    className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
                      activeRenderer === "template"
                        ? "border-(--color-primary) bg-(--color-primary)/5"
                        : "border-(--color-border) hover:border-(--color-border-hover)"
                    }`}
                  >
                    <input
                      type="radio"
                      name="activeRenderer"
                      value="template"
                      checked={activeRenderer === "template"}
                      onChange={() => setActiveRenderer("template")}
                      className="mt-1"
                    />
                    <div>
                      <p className="font-semibold text-(--color-fg)">
                        Mostrar template
                      </p>
                      <p className="text-xs text-(--color-fg-secondary) mt-1">
                        Usa el template seleccionado para la vista pública.
                      </p>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
                      activeRenderer === "puck"
                        ? "border-(--color-primary) bg-(--color-primary)/5"
                        : "border-(--color-border) hover:border-(--color-border-hover)"
                    }`}
                  >
                    <input
                      type="radio"
                      name="activeRenderer"
                      value="puck"
                      checked={activeRenderer === "puck"}
                      onChange={() => setActiveRenderer("puck")}
                      className="mt-1"
                    />
                    <div>
                      <p className="font-semibold text-(--color-fg)">
                        Mostrar página del editor
                      </p>
                      <p className="text-xs text-(--color-fg-secondary) mt-1">
                        Publica el layout creado en el editor Puck.
                      </p>
                    </div>
                  </label>
                </div>

                <div className="text-xs text-(--color-fg-secondary)">
                  Actualmente visible:{" "}
                  <span className="font-semibold text-(--color-fg)">
                    {rendererLabel}
                  </span>
                </div>
              </div>
              <div className="bg-(--color-card) border border-(--color-card-border) rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-(--color-fg) mb-4">
                  Plantilla
                </h3>
                <TemplateSelector value={templateId} onChange={setTemplateId} />
              </div>

              <div className="bg-(--color-card) border border-(--color-card-border) rounded-2xl p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-(--color-fg) mb-1">
                    Estilo
                  </h3>
                  <p className="text-sm text-(--color-fg-secondary)">
                    Personaliza los colores y la tipografía de tu tienda.
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Colors Section */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold flex items-center gap-2">
                      <Droplets className="w-4 h-4 text-(--color-primary)" />
                      Colores
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Primary Color Input */}
                      <div className="p-3 border border-(--color-border) rounded-xl bg-(--color-bg) flex items-center gap-3">
                        <div className="relative w-10 h-10 shrink-0">
                          <input
                            type="color"
                            value={primaryColor}
                            onChange={(e) => setPrimaryColor(e.target.value)}
                            className="absolute inset-0 w-full h-full p-0 border-0 rounded-full overflow-hidden cursor-pointer"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="text-xs font-medium text-(--color-fg-secondary) block">
                            Color Primario
                          </label>
                          <span className="text-sm font-mono uppercase text-(--color-fg)">
                            {primaryColor}
                          </span>
                        </div>
                      </div>

                      {/* Secondary Color Input */}
                      <div className="p-3 border border-(--color-border) rounded-xl bg-(--color-bg) flex items-center gap-3">
                        <div className="relative w-10 h-10 shrink-0">
                          <input
                            type="color"
                            value={secondaryColor}
                            onChange={(e) => setSecondaryColor(e.target.value)}
                            className="absolute inset-0 w-full h-full p-0 border-0 rounded-full overflow-hidden cursor-pointer"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="text-xs font-medium text-(--color-fg-secondary) block">
                            Color Secundario
                          </label>
                          <span className="text-sm font-mono uppercase text-(--color-fg)">
                            {secondaryColor}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Presets */}
                    <div>
                      <span className="text-xs text-(--color-fg-muted) block mb-2 font-medium">
                        Presets sugeridos
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {COLOR_PRESETS.map((preset, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setPrimaryColor(preset.primary);
                              setSecondaryColor(preset.secondary);
                            }}
                            className="w-10 h-10 rounded-full border border-(--color-border) overflow-hidden relative group hover:scale-110 transition-transform"
                            title={preset.name}
                          >
                            <div className="absolute inset-0 flex">
                              <div
                                className="w-1/2 h-full"
                                style={{ backgroundColor: preset.primary }}
                              />
                              <div
                                className="w-1/2 h-full"
                                style={{ backgroundColor: preset.secondary }}
                              />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="h-px bg-(--color-border)" />

                  {/* Fonts Section */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold flex items-center gap-2">
                      <Type className="w-4 h-4 text-(--color-primary)" />
                      Tipografía
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {FONTS.map((font) => (
                        <button
                          key={font.id}
                          type="button"
                          onClick={() => setSelectedFont(font.id)}
                          className={`p-4 rounded-xl border text-left transition-all ${selectedFont === font.id ? "border-(--color-primary) bg-(--color-primary)/5 ring-1 ring-(--color-primary)" : "border-(--color-border) hover:border-(--color-border-hover) bg-(--color-bg)"}`}
                        >
                          <div
                            className={`text-xl font-medium mb-1 ${font.class}`}
                            style={font.style}
                          >
                            Agc
                          </div>
                          <div className="text-xs text-(--color-fg-secondary)">
                            {font.name}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-(--color-card) border border-(--color-card-border) rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-(--color-fg) mb-4">
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

        {/* CATEGORIES TAB */}
        {activeTab === "categories" && (
          <form
            onSubmit={handleSaveStore}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-(--color-card) border border-(--color-card-border) rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-(--color-fg) mb-1">
                      Categorias de productos
                    </h3>
                    <p className="text-sm text-(--color-fg-secondary)">
                      Crea categorias propias para filtrar tu catalogo.
                    </p>
                  </div>
                  <Tag className="w-5 h-5 text-(--color-primary) opacity-60" />
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Input
                    label="Nueva categoria"
                    placeholder="Ej. Plantas de interior"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddCategory();
                      }
                    }}
                    maxLength={50}
                  />
                  <Button
                    type="button"
                    className="mt-auto"
                    onClick={handleAddCategory}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar
                  </Button>
                </div>

                {categories.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <div
                        key={category.id}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-(--color-bg-secondary) border border-(--color-border) text-sm text-(--color-fg)"
                      >
                        {isEditingCategory &&
                        editingCategory?.originalId === category.id ? (
                          <>
                            <input
                              type="text"
                              value={editingCategory.name}
                              onChange={(e) =>
                                setEditingCategory((prev) => ({
                                  ...prev,
                                  name: e.target.value,
                                }))
                              }
                              className="bg-(--color-bg) border border-(--color-border) rounded px-2 py-0.5 text-xs min-w-24 max-w-32"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  handleSaveEditCategory();
                                } else if (e.key === "Escape") {
                                  handleCancelEditCategory();
                                }
                              }}
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={handleSaveEditCategory}
                              className="text-(--color-success) hover:text-(--color-success-hover)"
                              aria-label="Guardar edición"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={handleCancelEditCategory}
                              className="text-(--color-fg-muted) hover:text-(--color-error)"
                              aria-label="Cancelar edición"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <>
                            <span>{category.name}</span>
                            <button
                              type="button"
                              onClick={() => handleEditCategory(category)}
                              className="text-(--color-fg-muted) hover:text-(--color-primary)"
                              aria-label="Editar categoria"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveCategory(category.id)}
                              className="text-(--color-fg-muted) hover:text-(--color-error)"
                              aria-label="Eliminar categoria"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-(--color-fg-secondary)">
                    Aun no tienes categorias creadas.
                  </p>
                )}
              </div>
            </div>

            <div className="lg:col-span-1 space-y-6">
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
            <div className="bg-(--color-card) border border-(--color-card-border) rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--color-fg-muted)" />
                  <input
                    type="text"
                    placeholder="Buscar productos..."
                    className="w-full pl-9 pr-4 py-2 bg-(--color-bg-secondary) border-none rounded-lg text-sm text-(--color-fg) focus:ring-2 focus:ring-(--color-primary) outline-none"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                  />
                </div>
                <div className="relative">
                  <select
                    value={filterEnabled}
                    onChange={(e) => setFilterEnabled(e.target.value)}
                    className="appearance-none pl-9 pr-8 py-2 bg-(--color-bg-secondary) rounded-lg text-sm font-medium text-(--color-fg) outline-none cursor-pointer focus:ring-2 focus:ring-(--color-primary)"
                  >
                    <option value="all">Todos</option>
                    <option value="active">Activos</option>
                    <option value="hidden">Inactivos</option>
                  </select>
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--color-fg-muted)" />
                </div>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                <div className="flex bg-(--color-bg-secondary) p-1 rounded-lg">
                  <button
                    onClick={() => setProductViewMode("grid")}
                    className={`p-1.5 rounded-md transition-all ${productViewMode === "grid" ? "bg-(--color-card) shadow text-(--color-fg)" : "text-(--color-fg-muted)"}`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setProductViewMode("table")}
                    className={`p-1.5 rounded-md transition-all ${productViewMode === "table" ? "bg-(--color-card) shadow text-(--color-fg)" : "text-(--color-fg-muted)"}`}
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
                <Loader2 className="w-8 h-8 animate-spin text-(--color-primary)" />
              </div>
            ) : (
              <ProductList
                products={filteredProducts}
                categories={categories}
                viewMode={productViewMode}
                onEdit={handleOpenProductModal}
                onDelete={handleProductDelete}
                onToggleStatus={handleProductToggle}
                onReorder={handleProductReorder}
                onReorderList={handleProductReorderList}
                onReorderEnd={handleProductReorderSync}
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
              categories={categories}
            />
          </div>
        )}
      </div>

      {store && (
        <ShareStoreModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          storeName={store.name}
          storeUrl={`https://${store.slug}.${appConfig.baseDomain}`}
        />
      )}
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
                    ? "border-(--color-primary) text-(--color-primary)"
                    : "border-transparent text-(--color-fg-secondary) hover:text-(--color-fg) hover:border-(--color-fg-muted)"
                }
            `}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}
