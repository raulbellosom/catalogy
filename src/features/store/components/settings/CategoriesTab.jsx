import { useState, useEffect, useMemo, useRef } from "react";
import { Tag, Plus, Check, X, Edit3 } from "lucide-react";
import { Button } from "@/shared/ui/atoms/Button";
import { Input } from "@/shared/ui/atoms/Input";
import { StickySaveButton } from "./StickySaveButton";
import { useToast } from "@/shared/ui/molecules";
import { useUpdateStore, useUpdateProduct } from "@/shared/hooks";
import { SettingsSectionLayout } from "./layout/SettingsSectionLayout";
import { useSectionScrollSpy } from "./layout/useSectionScrollSpy";
import { SettingsSection } from "./layout/SettingsSection";

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

const slugifyCategory = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);

export function CategoriesTab({ store, products }) {
  const toast = useToast();
  const updateStore = useUpdateStore();
  const updateProduct = useUpdateProduct(store?.$id);
  const sectionScrollRef = useRef(null);

  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState("");

  // Editing state
  const [editingCategory, setEditingCategory] = useState(null); // { id, originalId, name }
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (store) {
      setCategories(safeParseCategories(store.categoriesJson));
    }
  }, [store]);

  // Check for unsaved changes?
  // Actually, category operations in the original code were saving IMMEDIATELY to DB.
  // Wait, let's re-read the original code.
  // Lines 279+: handleSaveEditCategory calls updateStore.mutateAsync AND updateProduct.mutateAsync.
  // So changes here are immediate, not deferred to a "Save" button at the bottom.
  // But there IS a StickySaveButton in the UI for this tab?
  // Let's check line 1386 in original code:
  // <StickySaveButton isSubmitting={isSubmitting} hasChanges={hasChanges} />
  // But hasChanges (line 663) included `currentCategoriesJson !== storedCategoriesJson`.
  // Wait, if I add a category, `handleAddCategory` (line 365) calls `updateStore` immediately.
  // So `store` prop updates, `storedCategoriesJson` updates, ensuring `hasChanges` is false?
  // The original code:
  // 1. handleAddCategory -> updates DB -> updates local state categories.
  // 2. store prop from React Query refetches automatically or we wait for it?
  // The original code: `await updateStore.mutateAsync(...)` then `setCategories(updatedCategories)`.
  // Effectively, the changes are saved immediately.
  // The `StickySaveButton` in Categories tab might have been redundant or for other fields if mixed?
  // But `hasChanges` logic included categories.
  // If we save immediately, `hasChanges` logic for categories is:
  // `currentCategoriesJson !== storedCategoriesJson`
  // Since we update DB immediately, and then update local state, provided `store` prop updates (invalidation), they should sync.
  // If `store` prop lags behind local state, `hasChanges` would be true briefly.
  // But since we are saving immediately, the button is not needed for specific category actions.
  // However, the "Save" button form submission `handleSaveStore` sends `categoriesJson`.
  // If I add a category via button, it saves.
  // If I click "Save Changes" button, it also saves.
  // In `CategoriesTab`, operations are atomic and immediate.
  // So `StickySaveButton` might just be there for consistency or if I edit something else?
  // In the original Categories Tab, ONLY category operations are present.
  // So `StickySaveButton` is technically not needed if all operations are immediate.
  // BUT, let's look at `handleSaveEditCategory` again.
  // It calls `updateStore` and `updateProduct`.
  // So yes, immediate.
  // I'll keep `StickySaveButton` but it might never be enabled if I manage `hasChanges` correctly?
  // Or better, I remove it from this tab if it's confusing, but the design might expect it.
  // Actually, checking `hasChanges` in original:
  // `currentCategoriesJson !== storedCategoriesJson`
  // If I update DB, `store` updates (React Query invalidation).
  // `categories` state updates locally.
  // They should match.
  // So `hasChanges` is false.
  // I will include `StickySaveButton` but disable it if no changes (which should be always true after operation).
  // Wait, does `handleAddCategory` use `isSubmitting`? No.
  // Does `handleSaveEditCategory`? No.
  // So `isSubmitting` is unused effectively in Categories tab for general save.

  // I will implement `hasChanges` simply by comparing current categories with store.categoriesJson.

  const storedCategoriesJson = JSON.stringify(
    safeParseCategories(store?.categoriesJson),
  );
  const currentCategoriesJson = JSON.stringify(categories);
  const hasChanges = currentCategoriesJson !== storedCategoriesJson;

  const sections = useMemo(
    () => [
      {
        id: "categories-manage",
        label: "Gestionar categorías",
        icon: Tag,
        hint: "Crear y editar",
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
    const element =
      root?.querySelector(`#${id}`) || document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // However, since we save immediately, `hasChanges` will likely be false most of the time.
  // Unless we decide NOT to save immediately in this refactor?
  // No, if we change behavior, we deviate from original. The original saved immediately.
  // "Primero actualizar la tienda..." (line 401).
  // OK, I'll stick to immediate saves.

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

    if (
      newId !== editingCategory.originalId &&
      categories.some((cat) => cat.id === newId)
    ) {
      toast.error("Ya existe una categoría con ese nombre");
      return;
    }

    try {
      setIsSubmitting(true); // Show loading on button if we wanted, but button is for global save.

      const updatedCategories = categories.map((cat) =>
        cat.id === editingCategory.originalId
          ? { id: newId, name: newName }
          : cat,
      );

      const storeData = {
        categoriesJson: JSON.stringify(updatedCategories),
      };

      await updateStore.mutateAsync({ storeId: store.$id, data: storeData });
      setCategories(updatedCategories);

      if (newId !== editingCategory.originalId) {
        // Find products with this category
        // Note: products prop should be passed from parent
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
    } finally {
      setIsSubmitting(false);
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
      setIsSubmitting(true);
      const newCategory = { id, name };
      const updatedCategories = [...categories, newCategory];

      const storeData = {
        categoriesJson: JSON.stringify(updatedCategories),
      };

      await updateStore.mutateAsync({ storeId: store.$id, data: storeData });
      setCategories(updatedCategories);
      setNewCategoryName("");
      toast.success("Categoría creada correctamente");
    } catch (error) {
      console.error("Error adding category:", error);
      toast.error("Error al crear categoría");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveCategory = async (categoryId) => {
    try {
      setIsSubmitting(true);
      const updatedCategories = categories.filter(
        (item) => item.id !== categoryId,
      );

      const storeData = {
        categoriesJson: JSON.stringify(updatedCategories),
      };

      await updateStore.mutateAsync({ storeId: store.$id, data: storeData });
      setCategories(updatedCategories);

      const productsWithCategory = products.filter(
        (product) =>
          product.categoryIds && product.categoryIds.includes(categoryId),
      );

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
    } finally {
      setIsSubmitting(false);
    }
  };

  // Form submission handler (not used for immediate saves but for consistency)
  const handleSave = async (e) => {
    if (e?.preventDefault) e.preventDefault();
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <SettingsSectionLayout
        sections={sections}
        activeSection={activeSection}
        onSectionSelect={handleSectionSelect}
        containerRef={sectionScrollRef}
        sidebarTitle="Categorías"
        sidebarSubtitle="Organiza tus productos por categorías."
        sidebarFooter={
          <StickySaveButton
            isSubmitting={isSubmitting}
            hasChanges={hasChanges}
          />
        }
      >
        <SettingsSection
          id="categories-manage"
          title="Categorías de productos"
          description="Crea hasta 10 categorías propias para filtrar tu catálogo."
          icon={Tag}
        >
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-(--color-fg)">
                Nueva categoría
              </label>
              <span
                className={`text-xs font-medium ${categories.length >= 10 ? "text-(--color-error)" : "text-(--color-fg-muted)"}`}
              >
                {categories.length}/10
              </span>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                placeholder={
                  categories.length >= 10
                    ? "Límite de 10 categorías alcanzado"
                    : "Ej. Plantas de interior"
                }
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (categories.length < 10) handleAddCategory();
                  }
                }}
                maxLength={50}
                disabled={categories.length >= 10}
                className="w-full"
              />
              {categories.length < 10 && (
                <Button
                  type="button"
                  className="mt-auto"
                  onClick={handleAddCategory}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar
                </Button>
              )}
            </div>
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
                        aria-label="Editar categoría"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveCategory(category.id)}
                        className="text-(--color-fg-muted) hover:text-(--color-error)"
                        aria-label="Eliminar categoría"
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
              Aún no tienes categorías creadas.
            </p>
          )}
        </SettingsSection>
      </SettingsSectionLayout>
    </form>
  );
}
