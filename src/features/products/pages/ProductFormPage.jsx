import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Save, ArrowLeft, Loader2, DollarSign } from "lucide-react";
import { Button } from "@/shared/ui/atoms/Button";
import { Input } from "@/shared/ui/atoms/Input";
import { ImageUpload } from "@/shared/ui/molecules/ImageUpload";
import {
  useUserStore,
  useProduct,
  useCreateProduct,
  useUpdateProduct,
  useUploadProductImage,
} from "@/shared/hooks";
import {
  getProductImageUrl,
  deleteProductImage,
} from "@/shared/services/productService";
import { motion } from "motion/react";

/**
 * Product form page (create/edit)
 */
export function ProductFormPage() {
  const navigate = useNavigate();
  const { productId } = useParams();
  const isEditMode = !!productId;

  // Fetch user's store
  const { data: store, isLoading: loadingStore } = useUserStore();

  // Fetch product if editing
  const { data: product, isLoading: loadingProduct } = useProduct(productId);

  // Mutations
  const createProduct = useCreateProduct(store?.$id);
  const updateProduct = useUpdateProduct(store?.$id);
  const uploadImage = useUploadProductImage();

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("MXN");
  const [imageFileId, setImageFileId] = useState("");
  const [imageUrl, setImageUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Populate form when product loads (edit mode)
  useEffect(() => {
    if (product) {
      setName(product.name || "");
      setDescription(product.description || "");
      setPrice(product.price?.toString() || "");
      setCurrency(product.currency || "MXN");
      setImageFileId(product.imageFileId || "");
      if (product.imageFileId) {
        setImageUrl(getProductImageUrl(product.imageFileId));
      }
    }
  }, [product]);

  const handleImageUpload = async (file) => {
    try {
      setError("");
      const response = await uploadImage.mutateAsync(file);

      // Delete old image if exists
      if (imageFileId) {
        await deleteProductImage(imageFileId);
      }

      setImageFileId(response.$id);
      setImageUrl(getProductImageUrl(response.$id));
    } catch (err) {
      console.error("Image upload error:", err);
      setError("Error al subir la imagen");
    }
  };

  const handleImageRemove = async () => {
    if (imageFileId) {
      await deleteProductImage(imageFileId);
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

    setIsSubmitting(true);

    try {
      const data = {
        name: name.trim(),
        description: description.trim(),
        price: priceNum,
        currency,
      };

      if (imageFileId) {
        data.imageFileId = imageFileId;
      }

      if (isEditMode) {
        // Update existing product
        await updateProduct.mutateAsync({ productId, data });
      } else {
        // Create new product
        await createProduct.mutateAsync(data);
      }

      navigate("/app/products");
    } catch (err) {
      console.error("Product save error:", err);
      setError(err.message || "Error al guardar el producto");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/app/products");
  };

  if (loadingStore || (isEditMode && loadingProduct)) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-[var(--color-primary)] animate-spin" />
      </div>
    );
  }

  if (!store) {
    return (
      <div className="text-center py-12">
        <p className="text-[var(--color-fg-secondary)] mb-4">
          Primero debes configurar tu tienda
        </p>
        <Button onClick={() => navigate("/app/store")}>Ir a Mi tienda</Button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCancel}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a productos
        </Button>
        <h1 className="text-2xl font-bold text-[var(--color-fg)]">
          {isEditMode ? "Editar producto" : "Nuevo producto"}
        </h1>
        <p className="text-[var(--color-fg-secondary)]">
          {isEditMode
            ? "Actualiza la información del producto"
            : "Agrega un nuevo producto a tu catálogo"}
        </p>
      </div>

      {/* Error message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-[var(--color-error-bg)] border border-[var(--color-error)] rounded-lg text-[var(--color-error)] text-sm"
        >
          {error}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        {/* Basic info */}
        <div className="p-6 bg-[var(--color-card)] border border-[var(--color-card-border)] rounded-2xl">
          <h2 className="font-semibold text-[var(--color-fg)] mb-6">
            Información del producto
          </h2>

          <div className="space-y-4">
            <Input
              label="Nombre del producto"
              placeholder="Ejemplo: Camisa azul"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={3}
              maxLength={150}
            />

            <div>
              <label className="block text-sm font-medium text-[var(--color-fg)] mb-1.5">
                Descripción
              </label>
              <textarea
                placeholder="Describe tu producto..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={2000}
                rows={4}
                className="w-full px-4 py-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-[var(--color-fg)] placeholder:text-[var(--color-fg-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] resize-none"
              />
              <p className="mt-1.5 text-sm text-[var(--color-fg-secondary)]">
                Incluye detalles importantes del producto (opcional)
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
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
                <DollarSign className="absolute right-4 top-[38px] w-5 h-5 text-[var(--color-fg-muted)]" />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-fg)] mb-1.5">
                  Moneda
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-4 py-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-[var(--color-fg)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                >
                  <option value="MXN">MXN (Peso mexicano)</option>
                  <option value="USD">USD (Dólar)</option>
                  <option value="EUR">EUR (Euro)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Image */}
        <div className="p-6 bg-[var(--color-card)] border border-[var(--color-card-border)] rounded-2xl">
          <h2 className="font-semibold text-[var(--color-fg)] mb-6">
            Imagen del producto
          </h2>

          <ImageUpload
            currentImageUrl={imageUrl}
            onUpload={handleImageUpload}
            onRemove={handleImageRemove}
            isUploading={uploadImage.isPending}
            maxSizeMB={10}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button type="submit" isLoading={isSubmitting} className="flex-1">
            <Save className="w-4 h-4 mr-2" />
            {isEditMode ? "Guardar cambios" : "Crear producto"}
          </Button>
        </div>
      </form>
    </div>
  );
}
