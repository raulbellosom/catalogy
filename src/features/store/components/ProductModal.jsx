import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Save,
  Loader2,
  DollarSign,
  Package,
  Tag,
  Plus,
  X,
  Search,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/shared/ui/atoms/Button";
import { Input } from "@/shared/ui/atoms/Input";
import { MultiImageUpload, useToast } from "@/shared/ui/molecules";
import { useAuth } from "@/app/providers";
import { Modal, ModalFooter } from "@/shared/ui/molecules/Modal";
import {
  useCreateProduct,
  useUpdateProduct,
  useUploadProductImage,
} from "@/shared/hooks";
import {
  getProductImageUrl,
  getProductImageUrls,
  deleteProductImage,
  deleteProductImages,
} from "@/shared/services/productService";

/**
 * Modal to create or edit a product
 */
export function ProductModal({
  isOpen,
  onClose,
  storeId,
  product,
  categories,
}) {
  const isEditMode = !!product;

  // Mutations
  const createProduct = useCreateProduct(storeId);
  const updateProduct = useUpdateProduct(storeId);
  const uploadImage = useUploadProductImage();

  // Form state
  // We initialize state when modal opens or product changes
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("0");
  const [currency, setCurrency] = useState("MXN");
  const [categoryIds, setCategoryIds] = useState([]);
  const [status, setStatus] = useState(true);

  // Category combobox state
  const [categorySearch, setCategorySearch] = useState("");
  const [isComboboxOpen, setIsComboboxOpen] = useState(false);
  const [filteredCategories, setFilteredCategories] = useState([]);

  // Filter categories based on search
  useEffect(() => {
    if (!categories) {
      setFilteredCategories([]);
      return;
    }
    const filtered = categories.filter(
      (category) =>
        !categoryIds.includes(category.id) &&
        category.name.toLowerCase().includes(categorySearch.toLowerCase()),
    );
    setFilteredCategories(filtered);
  }, [categories, categoryIds, categorySearch]);

  // Close combobox when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".category-combobox")) {
        setIsComboboxOpen(false);
      }
    };

    if (isComboboxOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isComboboxOpen]);

  // Image management - now handles array of images
  const [initialImageFileIds, setInitialImageFileIds] = useState([]);
  const [imageFileIds, setImageFileIds] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);

  const { user } = useAuth();
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset/Populate form on open
  useEffect(() => {
    if (isOpen) {
      setIsSubmitting(false);

      if (product) {
        setName(product.name || "");
        setDescription(product.description || "");
        setPrice(product.price != null ? product.price.toString() : "");
        setStock(product.stock != null ? product.stock.toString() : "0");
        setCurrency(product.currency || "MXN");
        setCategoryIds(
          Array.isArray(product.categoryIds) ? product.categoryIds : [],
        );
        setStatus(product.status !== undefined ? product.status : true);

        // Handle imageFileIds array (with backwards compatibility for imageFileId)
        const fileIds = Array.isArray(product.imageFileIds)
          ? product.imageFileIds
          : product.imageFileId
            ? [product.imageFileId]
            : [];
        setImageFileIds(fileIds);
        setInitialImageFileIds([...fileIds]);
        setImageUrls(getProductImageUrls(fileIds));
      } else {
        // Reset for new product
        setName("");
        setDescription("");
        setPrice("");
        setStock("0");
        setCurrency("MXN");
        setCategoryIds([]);
        setStatus(true);
        setImageFileIds([]);
        setInitialImageFileIds([]);
        setImageUrls([]);
      }
    }
  }, [isOpen, product]);

  // Filter categories based on search
  useEffect(() => {
    if (!categories) {
      setFilteredCategories([]);
      return;
    }

    const available = categories.filter((cat) => !categoryIds.includes(cat.id));

    if (!categorySearch.trim()) {
      setFilteredCategories(available);
    } else {
      setFilteredCategories(
        available.filter((cat) =>
          cat.name.toLowerCase().includes(categorySearch.toLowerCase()),
        ),
      );
    }
  }, [categories, categoryIds, categorySearch]);

  const handleImageUpload = async (file) => {
    try {
      const response = await uploadImage.mutateAsync(file);
      const newFileId = response.$id;

      // Add new image to the arrays
      setImageFileIds((prev) => [...prev, newFileId]);
      setImageUrls((prev) => [...prev, getProductImageUrl(newFileId)]);
    } catch (err) {
      console.error("Image upload error:", err);
      toast.error("Error al subir la imagen");
    }
  };

  const handleImageRemove = async (index) => {
    const fileIdToRemove = imageFileIds[index];

    // If this is a newly uploaded image (not in initial), delete from storage
    if (fileIdToRemove && !initialImageFileIds.includes(fileIdToRemove)) {
      try {
        await deleteProductImage(fileIdToRemove);
      } catch (err) {
        console.warn("Failed to delete temporary image", err);
      }
    }

    // Remove from state arrays
    setImageFileIds((prev) => prev.filter((_, i) => i !== index));
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleToggleCategory = (categoryId) => {
    setCategoryIds((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId],
    );
  };

  const handleClose = async () => {
    // Cleanup: Delete newly uploaded images that weren't saved
    const newImageIds = imageFileIds.filter(
      (id) => !initialImageFileIds.includes(id),
    );
    if (newImageIds.length > 0) {
      try {
        await deleteProductImages(newImageIds);
      } catch (err) {
        console.warn("Cleanup failed on cancel", err);
      }
    }
    onClose();
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    // Validations
    if (name.trim().length < 3) {
      toast.error("El nombre debe tener al menos 3 caracteres");
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum < 0) {
      toast.error("El precio debe ser un número válido mayor o igual a 0");
      return;
    }

    const stockNum = parseInt(stock);
    if (isNaN(stockNum) || stockNum < 0) {
      toast.error("El stock debe ser un número entero mayor o igual a 0");
      return;
    }

    setIsSubmitting(true);

    try {
      const data = {
        name: name.trim(),
        description: description.trim(),
        price: priceNum,
        stock: stockNum,
        currency,
        imageFileIds: imageFileIds,
        categoryIds,
        status,
      };

      if (isEditMode) {
        await updateProduct.mutateAsync({ productId: product.$id, data });

        // Success: Delete images that were removed (in initialImageFileIds but not in current imageFileIds)
        const removedImageIds = initialImageFileIds.filter(
          (id) => !imageFileIds.includes(id),
        );
        if (removedImageIds.length > 0) {
          try {
            await deleteProductImages(removedImageIds);
          } catch (e) {
            console.warn("Failed to cleanup removed images", e);
          }
        }
      } else {
        await createProduct.mutateAsync(data);
      }

      toast.success(
        isEditMode ? "Producto actualizado" : "Producto creado correctamente",
      );
      onClose();
    } catch (err) {
      console.error("Product save error:", err);
      toast.error(err.message || "Error al guardar el producto");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      title={isEditMode ? "Editar Producto" : "Nuevo Producto"}
      description={
        isEditMode
          ? "Actualiza la información detallada de tu producto para mejorar tus ventas."
          : "Crea una ficha de producto atractiva y completa para tus clientes."
      }
      size="3xl"
      footer={
        <ModalFooter className="w-full">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-8 h-12 rounded-xl"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="product-form"
            isLoading={isSubmitting}
            className="px-10 h-12 rounded-xl shadow-xl shadow-(--color-primary)/20 font-bold"
          >
            <Save className="w-4 h-4 mr-2" />
            {isEditMode ? "Guardar Cambios" : "Crear Producto"}
          </Button>
        </ModalFooter>
      }
    >
      <form
        id="product-form"
        onSubmit={handleSubmit}
        className="space-y-8 py-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
          {/* Top Left: Image Section */}
          <div>
            <MultiImageUpload
              currentImageUrls={imageUrls}
              onUpload={handleImageUpload}
              onRemove={handleImageRemove}
              isUploading={uploadImage.isPending}
              maxSizeMB={10}
              label="Imágenes del Producto"
            />
          </div>

          {/* Top Right: Core Details */}
          <div className="space-y-6">
            <Input
              label="Nombre del Producto"
              placeholder="Ej. Sudadera Oversize Vintage Noir"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={3}
              maxLength={150}
              className="text-lg font-medium"
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="relative group">
                <Input
                  type="number"
                  label="Precio"
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "" || parseFloat(val) >= 0) {
                      setPrice(val);
                    }
                  }}
                  onBlur={() => {
                    if (price) setPrice(parseFloat(price).toFixed(2));
                  }}
                  required
                  min="0"
                  step="0.01"
                  className="pr-12"
                />
                <div className="absolute right-4 top-[38px] text-(--color-fg-muted) transition-colors group-focus-within:text-(--color-primary)">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>

              <div className="flex flex-col">
                <label className="block text-sm font-medium text-(--color-fg) mb-1.5">
                  Moneda
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-4 py-3 bg-(--color-bg-secondary) border border-(--color-border) rounded-xl text-(--color-fg) focus:ring-2 focus:ring-(--color-primary)/20 focus:border-(--color-border-focus) outline-none transition-colors duration-200"
                >
                  <option value="MXN">MXN - Peso Mexicano</option>
                  <option value="USD">USD - Dólar</option>
                  <option value="CAD">CAD - Dólar Canadiense</option>
                </select>
              </div>

              <div className="relative group">
                <Input
                  type="number"
                  label="Stock Disponible"
                  placeholder="0"
                  value={stock}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "" || parseInt(val) >= 0) {
                      setStock(val);
                    }
                  }}
                  required
                  min="0"
                  step="1"
                  className="pr-12"
                />
                <div className="absolute right-4 top-[38px] text-(--color-fg-muted) transition-colors group-focus-within:text-(--color-primary)">
                  <Package className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Status Toggle */}
            <div className="flex items-center justify-between p-4 bg-(--color-bg-secondary) rounded-xl border border-(--color-border)">
              <div className="flex-1">
                <label className="block text-sm font-bold text-(--color-fg) mb-1">
                  Estado de Publicación
                </label>
                <p className="text-xs text-(--color-fg-muted)">
                  {status
                    ? "Producto activo y visible en tu tienda"
                    : "Producto inactivo, oculto para clientes"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStatus(!status)}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                  status ? "bg-(--color-primary)" : "bg-(--color-border)"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                    status ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Categories Section */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-(--color-fg) tracking-tight uppercase">
                Categorías
              </label>

              {/* Combobox */}
              {categories && categories.length > 0 && (
                <div className="relative category-combobox">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-(--color-fg-muted)" />
                    <input
                      type="text"
                      placeholder="Buscar categorías..."
                      value={categorySearch}
                      onChange={(e) => setCategorySearch(e.target.value)}
                      onFocus={() => setIsComboboxOpen(true)}
                      className="w-full pl-10 pr-10 py-3 bg-(--color-bg-secondary) border border-(--color-border) rounded-xl text-(--color-fg) focus:ring-2 focus:ring-(--color-primary)/20 focus:border-(--color-border-focus) outline-none transition-colors duration-200"
                    />
                    <button
                      type="button"
                      onClick={() => setIsComboboxOpen(!isComboboxOpen)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-(--color-fg-muted) hover:text-(--color-fg)"
                    >
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${
                          isComboboxOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  </div>

                  {/* Dropdown */}
                  {isComboboxOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-(--color-card) border border-(--color-card-border) rounded-xl shadow-lg max-h-40 overflow-y-auto">
                      {filteredCategories.length > 0 ? (
                        filteredCategories.map((category) => (
                          <button
                            key={category.id}
                            type="button"
                            onClick={() => {
                              handleToggleCategory(category.id);
                              setCategorySearch("");
                              setIsComboboxOpen(false);
                            }}
                            className="w-full px-4 py-2.5 text-left hover:bg-(--color-bg-secondary) transition-colors text-sm text-(--color-fg) flex items-center gap-2"
                          >
                            <Plus className="w-3 h-3 text-(--color-primary)" />
                            {category.name}
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-2.5 text-sm text-(--color-fg-muted) italic">
                          {categorySearch
                            ? "No se encontraron categorías"
                            : "Todas las categorías ya están seleccionadas"}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Selected Categories */}
              {categoryIds.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {categoryIds.map((categoryId) => {
                    const category = categories?.find(
                      (cat) => cat.id === categoryId,
                    );
                    if (!category) return null;
                    return (
                      <span
                        key={categoryId}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-(--color-primary) text-white rounded-full text-xs font-semibold"
                      >
                        {category.name}
                        <button
                          type="button"
                          onClick={() => handleToggleCategory(categoryId)}
                          className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                          aria-label={`Remover ${category.name}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}

              {/* Empty state */}
              {(!categories || categories.length === 0) && (
                <div className="text-center p-3 bg-(--color-bg-secondary) rounded-xl border border-dashed border-(--color-border)">
                  <Tag className="w-5 h-5 text-(--color-fg-muted) mx-auto mb-1" />
                  <p className="text-xs text-(--color-fg-muted)">
                    Crea categorías en la sección de Tienda
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Bottom: Full Width Description */}
          <div className="md:col-span-2 space-y-4 pt-4 border-t border-(--color-border)">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-bold text-(--color-fg) tracking-tight uppercase">
                Descripción del Producto
              </label>

              {/* Character Count Ring */}
              <div className="flex items-center gap-2">
                <div className="relative w-5 h-5">
                  <svg className="w-full h-full -rotate-90">
                    <circle
                      cx="10"
                      cy="10"
                      r="8"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-(--color-border)"
                    />
                    <circle
                      cx="10"
                      cy="10"
                      r="8"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeDasharray={2 * Math.PI * 8}
                      strokeDashoffset={
                        2 * Math.PI * 8 * (1 - description.length / 2000)
                      }
                      className={`transition-all duration-300 ${
                        description.length > 1800
                          ? "text-(--color-error)"
                          : "text-(--color-primary)"
                      }`}
                    />
                  </svg>
                </div>
                <span
                  className={`text-[10px] font-bold tabular-nums ${
                    description.length > 1800
                      ? "text-(--color-error)"
                      : "text-(--color-fg-muted)"
                  }`}
                >
                  {description.length} / 2000
                </span>
              </div>
            </div>

            <textarea
              placeholder="Detalla qué hace único a tu producto, especificaciones técnicas, materiales, guía de tallas o envío..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={2000}
              rows={5}
              className="w-full px-5 py-4 bg-(--color-bg-secondary) border border-(--color-border) rounded-2xl text-(--color-fg) placeholder:text-(--color-fg-muted) transition-all duration-200 focus:outline-none focus:border-(--color-border-focus) focus:ring-4 focus:ring-(--color-primary)/10 resize-none text-base"
            />
          </div>
        </div>
      </form>
    </Modal>
  );
}
