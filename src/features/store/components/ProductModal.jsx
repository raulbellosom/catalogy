import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Save, Loader2, DollarSign, Package } from "lucide-react";
import { Button } from "@/shared/ui/atoms/Button";
import { Input } from "@/shared/ui/atoms/Input";
import { ImageUpload } from "@/shared/ui/molecules/ImageUpload";
import { Modal, ModalFooter } from "@/shared/ui/molecules/Modal";
import {
  useCreateProduct,
  useUpdateProduct,
  useUploadProductImage,
} from "@/shared/hooks";
import {
  getProductImageUrl,
  deleteProductImage,
} from "@/shared/services/productService";

/**
 * Modal to create or edit a product
 */
export function ProductModal({ isOpen, onClose, storeId, product }) {
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

  // Image management
  const [initialImageFileId, setInitialImageFileId] = useState("");
  const [imageFileId, setImageFileId] = useState("");
  const [imageUrl, setImageUrl] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Reset/Populate form on open
  useEffect(() => {
    if (isOpen) {
      setError("");
      setIsSubmitting(false);

      if (product) {
        setName(product.name || "");
        setDescription(product.description || "");
        setPrice(product.price != null ? product.price.toString() : "");
        setStock(product.stock != null ? product.stock.toString() : "0");
        setCurrency(product.currency || "MXN");

        const fileId = product.imageFileId || "";
        setImageFileId(fileId);
        setInitialImageFileId(fileId);

        if (fileId) {
          setImageUrl(getProductImageUrl(fileId));
        } else {
          setImageUrl(null);
        }
      } else {
        // Reset for new product
        setName("");
        setDescription("");
        setPrice("");
        setStock("0");
        setCurrency("MXN");
        setImageFileId("");
        setInitialImageFileId("");
        setImageUrl(null);
      }
    }
  }, [isOpen, product]);

  const handleImageUpload = async (file) => {
    try {
      setError("");
      const response = await uploadImage.mutateAsync(file);

      // If we already uploaded a new image in this session without saving yet,
      // we should delete THAT temporary one before replacing it with another new one.
      // But if imageFileId is the initial one from the DB, we don't delete it yet (wait for Save).
      if (
        imageFileId &&
        imageFileId !== initialImageFileId &&
        imageFileId !== response.$id
      ) {
        try {
          await deleteProductImage(imageFileId);
        } catch (e) {
          console.warn("Failed to delete temporary image", e);
        }
      }

      setImageFileId(response.$id);
      setImageUrl(getProductImageUrl(response.$id));
    } catch (err) {
      console.error("Image upload error:", err);
      setError("Error al subir la imagen");
    }
  };

  const handleImageRemove = async () => {
    // If we remove an image that was just uploaded in this session (temporary), delete it.
    if (imageFileId && imageFileId !== initialImageFileId) {
      try {
        await deleteProductImage(imageFileId);
      } catch (err) {
        console.warn("Failed to delete temporary image", err);
      }
    }
    setImageFileId("");
    setImageUrl(null);
  };

  const handleClose = async () => {
    // Cleanup: If the user cancels and we uploaded a new image, delete it.
    if (imageFileId && imageFileId !== initialImageFileId) {
      try {
        await deleteProductImage(imageFileId);
      } catch (err) {
        console.warn("Cleanup failed on cancel", err);
      }
    }
    onClose();
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError("");

    // Validations
    if (name.trim().length < 3) {
      setError("El nombre debe tener al menos 3 caracteres");
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum < 0) {
      setError("El precio debe ser un número válido mayor o igual a 0");
      return;
    }

    const stockNum = parseInt(stock);
    if (isNaN(stockNum) || stockNum < 0) {
      setError("El stock debe ser un número entero mayor o igual a 0");
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
        imageFileId: imageFileId || null,
      };

      if (isEditMode) {
        await updateProduct.mutateAsync({ productId: product.$id, data });

        // Success: If we changed the image, delete the OLD initial one from DB
        if (initialImageFileId && imageFileId !== initialImageFileId) {
          try {
            await deleteProductImage(initialImageFileId);
          } catch (e) {
            console.warn("Failed to cleanup old database image", e);
          }
        }
      } else {
        await createProduct.mutateAsync(data);
      }

      onClose();
    } catch (err) {
      console.error("Product save error:", err);
      setError(err.message || "Error al guardar el producto");
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
        {/* Error message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 bg-(--color-error-bg) border border-(--color-error) rounded-2xl text-(--color-error) text-sm flex items-start gap-3 overflow-hidden"
            >
              <span className="shrink-0 mt-0.5">⚠️</span>
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
          {/* Top Left: Image Section */}
          <div className="space-y-4">
            <label className="block text-sm font-bold text-(--color-fg) tracking-tight uppercase">
              Imagen de Portada
            </label>
            <div className="aspect-square w-full">
              <ImageUpload
                currentImageUrl={imageUrl}
                onUpload={handleImageUpload}
                onRemove={handleImageRemove}
                isUploading={uploadImage.isPending}
                maxSizeMB={10}
                aspectRatio="square"
                className="h-full w-full"
                label=""
              />
            </div>
          </div>

          {/* Top Right: Core Details */}
          <div className="flex flex-col justify-between space-y-6">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                  <div className="absolute right-4 bottom-3.5 text-(--color-fg-muted) transition-colors group-focus-within:text-(--color-primary)">
                    <DollarSign className="w-4 h-4" />
                  </div>
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
                  <div className="absolute right-4 bottom-3.5 text-(--color-fg-muted) transition-colors group-focus-within:text-(--color-primary)">
                    <Package className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 bg-(--color-bg-secondary) rounded-2xl border border-(--color-border) border-dashed space-y-2">
              <h4 className="text-xs font-bold text-(--color-fg) uppercase tracking-widest">
                Tip de Diseño
              </h4>
              <p className="text-xs text-(--color-fg-secondary) leading-relaxed">
                Usa fondos limpios y buena iluminación. Las fotos consistentes
                aumentan la confianza del comprador hasta en un 40%.
              </p>
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
