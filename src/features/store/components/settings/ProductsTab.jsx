import { useState, useEffect, useMemo, useRef } from "react";
import { Search, Filter, Grid, List, Plus, Loader2, Package } from "lucide-react";
import { Button } from "@/shared/ui/atoms/Button";
import { ProductList } from "../../components/ProductList";
import { ProductModal } from "../../components/ProductModal";
import { useToast } from "@/shared/ui/molecules";
import {
  useDeleteProduct,
  useUpdateProduct,
  useReorderProducts,
} from "@/shared/hooks";
import { SettingsSectionLayout } from "./layout/SettingsSectionLayout";
import { useSectionScrollSpy } from "./layout/useSectionScrollSpy";
import { SettingsSection } from "./layout/SettingsSection";
import { StickySaveButton } from "./StickySaveButton";

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

export function ProductsTab({ store, products, isLoading }) {
  const toast = useToast();
  const deleteProduct = useDeleteProduct(store?.$id);
  const updateProduct = useUpdateProduct(store?.$id);
  const reorderProductsMutation = useReorderProducts(store?.$id);
  const sectionScrollRef = useRef(null);

  const [productViewMode, setProductViewMode] = useState("grid"); // 'grid' | 'table'
  const [productSearch, setProductSearch] = useState("");
  const [filterEnabled, setFilterEnabled] = useState("all"); // 'all' | 'active' | 'hidden'
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productActionLoadingId, setProductActionLoadingId] = useState(null);
  const [productActionType, setProductActionType] = useState(null); // 'delete' | 'toggle'
  const [localProducts, setLocalProducts] = useState([]);

  const categories = safeParseCategories(store?.categoriesJson);

  // Sync localProducts with products prop
  useEffect(() => {
    if (products) {
      setLocalProducts(products);
    }
  }, [products]);

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
    let sortOrders = filteredProducts
      .map((p) => p.sortOrder ?? 0)
      .sort((a, b) => a - b);

    // 2. Determine if the current sequence is "invalid" for reordering
    const isBrokenSequence =
      sortOrders.length > 0 &&
      (sortOrders.every((s) => s === 0) ||
        new Set(sortOrders).size < sortOrders.length);

    if (isBrokenSequence) {
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
          // Keep original logic if any
        }
      });

      const filteredIds = filteredProducts.map((p) => p.$id);
      const nonFilteredProducts = next.filter(
        (p) => !filteredIds.includes(p.$id),
      );

      // Reinsertamos los filtrados en su nuevo orden entre los no filtrados
      return [...newOrderedList, ...nonFilteredProducts];
    });
  };

  const handleOpenProductModal = (product = null) => {
    setEditingProduct(product);
    setIsProductModalOpen(true);
  };

  const sections = useMemo(
    () => [
      {
        id: "products-manage",
        label: "Gestionar productos",
        icon: Package,
        hint: "Ver y editar",
      },
    ],
    [],
  );

  const { activeSection } = useSectionScrollSpy(
    sections.map((section) => section.id),
    sectionScrollRef,
  );

  const handleSectionSelect = (id) => {
    const root = sectionScrollRef.current;
    const element = root?.querySelector(`#${id}`) || document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // No form submission needed for products (operations are immediate)
  const handleSave = (e) => {
    if (e?.preventDefault) e.preventDefault();
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <SettingsSectionLayout
        sections={sections}
        activeSection={activeSection}
        onSectionSelect={handleSectionSelect}
        containerRef={sectionScrollRef}
        sidebarTitle="Productos"
        sidebarSubtitle="Administra tu catálogo de productos."
        sidebarFooter={
          <StickySaveButton isSubmitting={false} hasChanges={false} />
        }
      >
        <SettingsSection
          id="products-manage"
          title="Catálogo de productos"
          description="Crea, edita y organiza los productos de tu tienda."
          icon={Package}
        >
          {/* Toolbar */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between pb-4 border-b border-(--color-border)">
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
                  type="button"
                  onClick={() => setProductViewMode("grid")}
                  className={`p-1.5 rounded-md transition-all ${ productViewMode === "grid" ? "bg-(--color-card) shadow text-(--color-fg)" : "text-(--color-fg-muted)"}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setProductViewMode("table")}
                  className={`p-1.5 rounded-md transition-all ${ productViewMode === "table" ? "bg-(--color-card) shadow text-(--color-fg)" : "text-(--color-fg-muted)"}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
              <Button type="button" onClick={() => handleOpenProductModal()}>
                <Plus className="w-5 h-5 mr-2" /> Nuevo
              </Button>
            </div>
          </div>

          {/* List */}
          {isLoading ? (
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
        </SettingsSection>
      </SettingsSectionLayout>

      {/* Modal */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        storeId={store?.$id}
        product={editingProduct}
        categories={categories}
      />
    </form>
  );
}
