import { useState, useEffect } from "react";
import { Globe, Copy, Share2, Link as LinkIcon } from "lucide-react";
import { Button } from "@/shared/ui/atoms/Button";
import { Input } from "@/shared/ui/atoms/Input";
import { SlugInput } from "@/shared/ui/molecules/SlugInput";
import { Modal, ModalFooter } from "@/shared/ui/molecules/Modal";
import { ShareStoreModal } from "../../components/ShareStoreModal";
import { useToast } from "@/shared/ui/molecules";
import { useUpdateStore, useToggleStorePublished } from "@/shared/hooks";
import { appConfig } from "@/shared/lib/env";
import { StickySaveButton } from "./StickySaveButton";

const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

export function GeneralTab({ store }) {
  const toast = useToast();
  const updateStore = useUpdateStore();
  const togglePublished = useToggleStorePublished();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [purchaseInstructions, setPurchaseInstructions] = useState("");
  const [paymentLink, setPaymentLink] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  useEffect(() => {
    if (store) {
      setName(store.name || "");
      setSlug(store.slug || "");
      setDescription(store.description || "");
      setPurchaseInstructions(store.purchaseInstructions || "");
      setPaymentLink(store.paymentLink || "");
    }
  }, [store]);

  const hasChanges =
    name.trim() !== (store?.name || "") ||
    slug.trim() !== (store?.slug || "") ||
    description.trim() !== (store?.description || "") ||
    purchaseInstructions.trim() !== (store?.purchaseInstructions || "") ||
    paymentLink.trim() !== (store?.paymentLink || "");

  const handleSave = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (!hasChanges) return;

    setIsSubmitting(true);
    try {
      const data = {
        name: name.trim(),
        slug: slug.trim().toLowerCase(),
        description: description.trim(),
        purchaseInstructions: purchaseInstructions.trim(),
      };

      if (paymentLink.trim()) {
        data.paymentLink = paymentLink.trim();
      } else {
        // Handle clearing payment link if supported by backend/Appwrite.
        // If Appwrite doesn't support setting URL to empty string, we might need a workaround or check requirements.
        // Assuming undefined/null works if configured.
        data.paymentLink = null;
      }

      await updateStore.mutateAsync({ storeId: store.$id, data });
      toast.success("Información general actualizada");
    } catch (err) {
      console.error(err);
      toast.error("Error al guardar los cambios");
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

  return (
    <form
      onSubmit={handleSave}
      className="grid grid-cols-1 lg:grid-cols-3 gap-8"
    >
      <div className="lg:col-span-2 space-y-6">
        {/* Basic Info */}
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

        {/* Store Link */}
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

        {/* Purchase Instructions */}
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
              className="w-full mt-1 px-3 py-2 bg-(--color-bg) border border-(--color-border) rounded-xl text-(--color-fg) focus:ring-2 focus:ring-(--color-primary) outline-none resize-none"
              rows={4}
              value={purchaseInstructions}
              onChange={(e) => setPurchaseInstructions(e.target.value)}
              maxLength={2000}
              placeholder="Ej. Haz tu pedido por WhatsApp y completa el pago con el link de arriba."
            />
          </div>
        </div>
      </div>

      {/* Right Column: Status & Save */}
      <div className="lg:col-span-1 space-y-6 h-full">
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
              {store?.published ? "Despublicar Tienda" : "Publicar Tienda"}
            </Button>
          </div>
        </div>

        <Modal
          open={isPublishModalOpen}
          onClose={() => setIsPublishModalOpen(false)}
          title={
            store?.published ? "¿Despublicar tienda?" : "¿Publicar tienda?"
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
                {store?.published ? "Sí, despublicar" : "Sí, publicar ahora"}
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

        <ShareStoreModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          storeName={store?.name}
          storeUrl={`https://${store?.slug}.${appConfig.baseDomain}`}
        />

        <StickySaveButton isSubmitting={isSubmitting} hasChanges={hasChanges} />
      </div>
    </form>
  );
}
