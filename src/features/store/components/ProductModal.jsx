import { useState, useEffect } from "react";
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

  // Image state
  // imageFileId is what we save to DB
  const [imageFileId, setImageFileId] = useState("");
  // imageUrl is for preview
  const [imageUrl, setImageUrl] = useState(null);
  // pendingImageFile is logic if we wanted to defer upload,
  // but existing logic uploads immediately, so we keep that pattern or improve it.
  // Existing pattern in ProductFormPage uploads immediately. Let's stick to that for consistency,
  // or we can try to be smarter.
  // Note: ProductFormPage uploads immediately. Let's reuse that simplicity for now.

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
        setPrice(product.price !== undefined ? product.price.toString() : "");
        setStock(product.stock !== undefined ? product.stock.toString() : "0");
        setCurrency(product.currency || "MXN");
        setImageFileId(product.imageFileId || "");
        if (product.imageFileId) {
          setImageUrl(getProductImageUrl(product.imageFileId));
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
        setImageUrl(null);
      }
    }
  }, [isOpen, product]);

  const handleImageUpload = async (file) => {
    try {
      setError("");
      // Ideally show loading state on image component
      const response = await uploadImage.mutateAsync(file);

      // If there was an old image and we replaced it
      if (imageFileId && imageFileId !== response.$id) {
        // Optionally delete old image, though ideally we do this only on Save?
        // ProductFormPage deletes immediately.
        try {
          await deleteProductImage(imageFileId);
        } catch (e) {
          console.warn("Failed to delete replacing image", e);
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
    // If we remove the image, we might want to delete from storage immediately
    // or wait until save? ProductFormPage deletes immediately.
    if (imageFileId) {
      try {
        await deleteProductImage(imageFileId);
      } catch (err) {
        console.warn("Failed to delete image", err);
      }
    }
    setImageFileId("");
    setImageUrl(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      } else {
        await createProduct.mutateAsync(data);
      }

      onClose();
    } catch (err) {
      console.error("Procut save error:", err);
      setError(err.message || "Error al guardar el producto");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={isEditMode ? "Editar Producto" : "Nuevo Producto"}
      description={
        isEditMode
          ? "Modifica los detalles de tu producto."
          : "Agrega un nuevo producto a tu inventario."
      }
      size="lg"
    >
      <form id="product-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Error message */}
        {error && (
          <div className="p-3 bg-[var(--color-error-bg)] border border-[var(--color-error)] rounded-lg text-[var(--color-error)] text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6">
          {/* Image Column */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--color-fg)]">
              Imagen
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
              />
            </div>
            <p className="text-xs text-[var(--color-fg-secondary)] text-center">
              JPG, PNG, WEBP. Max 10MB.
            </p>
          </div>

          {/* Fields Column */}
          <div className="space-y-4">
            <Input
              label="Nombre"
              placeholder="Ej. Camiseta Básica"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={3}
              maxLength={150}
            />

            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <Input
                  type="number"
                  label="Precio"
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  min="0"
                  step="0.01"
                />
                <DollarSign className="absolute right-3 top-[38px] w-4 h-4 text-[var(--color-fg-muted)]" />
              </div>
              <div className="relative">
                <Input
                  type="number"
                  label="Stock"
                  placeholder="0"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  required
                  min="0"
                  step="1"
                />
                <Package className="absolute right-3 top-[38px] w-4 h-4 text-[var(--color-fg-muted)]" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-fg)] mb-1.5">
                Descripción
              </label>
              <textarea
                placeholder="Detalles sobre materiales, tallas, cuidados..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={2000}
                rows={4}
                className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-[var(--color-fg)] placeholder:text-[var(--color-fg-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] resize-none text-sm"
              />
            </div>
          </div>
        </div>
      </form>

      <ModalFooter className="mt-6">
        <Button
          type="button"
          variant="ghost"
          onClick={onClose}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button type="submit" form="product-form" isLoading={isSubmitting}>
          <Save className="w-4 h-4 mr-2" />
          {isEditMode ? "Guardar Cambios" : "Crear Producto"}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
