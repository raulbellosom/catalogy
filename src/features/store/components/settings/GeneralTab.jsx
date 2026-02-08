import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Store, Globe, Link, ShieldCheck, ShieldAlert } from "lucide-react";
import { Modal, ModalFooter } from "@/shared/ui/molecules/Modal";
import { ShareStoreModal } from "../../components/ShareStoreModal";
import { useToast } from "@/shared/ui/molecules";
import {
  useDeleteStore,
  useUpdateStore,
  useToggleStorePublished,
} from "@/shared/hooks";
import { appConfig } from "@/shared/lib/env";
import { useAuth } from "@/app/providers";
import { StickySaveButton } from "./StickySaveButton";
import { SettingsSectionLayout } from "./layout/SettingsSectionLayout";
import { useSectionScrollSpy } from "./layout/useSectionScrollSpy";
import { GeneralBasicsSection } from "./general/GeneralBasicsSection";
import { GeneralLinkSection } from "./general/GeneralLinkSection";
import { GeneralPurchaseSection } from "./general/GeneralPurchaseSection";
import { GeneralStatusSection } from "./general/GeneralStatusSection";
import { GeneralDangerSection } from "./general/GeneralDangerSection";
import { Button } from "@/shared/ui/atoms/Button";

const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

const isValidPhoneNumber = (string) => {
  // Allows + followed by 10-15 digits (to avoid very short numbers)
  const regex = /^\+?[1-9]\d{9,14}$/;
  return regex.test(string);
};

export function GeneralTab({ store }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const deleteStore = useDeleteStore();
  const updateStore = useUpdateStore();
  const togglePublished = useToggleStorePublished();
  const sectionScrollRef = useRef(null);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [purchaseInstructions, setPurchaseInstructions] = useState("");
  const [paymentLink, setPaymentLink] = useState("");
  const [whatsapp, setWhatsapp] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    if (store) {
      setName(store.name || "");
      setSlug(store.slug || "");
      setDescription(store.description || "");
      setPurchaseInstructions(store.purchaseInstructions || "");
      setPurchaseInstructions(store.purchaseInstructions || "");
      setPaymentLink(store.paymentLink || "");
      setWhatsapp(store.whatsapp || "");
    }
  }, [store]);

  const hasChanges =
    name.trim() !== (store?.name || "") ||
    slug.trim() !== (store?.slug || "") ||
    description.trim() !== (store?.description || "") ||
    purchaseInstructions.trim() !== (store?.purchaseInstructions || "") ||
    paymentLink.trim() !== (store?.paymentLink || "") ||
    whatsapp.trim() !== (store?.whatsapp || "");

  const sections = useMemo(
    () => [
      {
        id: "general-basics",
        label: "Información básica",
        icon: Store,
        hint: "Nombre y descripción",
      },
      {
        id: "general-link",
        label: "Link público",
        icon: Globe,
        hint: "Slug y enlace",
      },
      {
        id: "general-purchase",
        label: "Compra y pago",
        icon: Link,
        hint: "Instrucciones",
      },
      {
        id: "general-status",
        label: "Estado",
        icon: ShieldCheck,
        hint: "Publicación",
      },
      {
        id: "general-danger",
        label: "Eliminar",
        icon: ShieldAlert,
        hint: "Borrar tienda",
      },
    ],
    [],
  );

  const { activeSection } = useSectionScrollSpy(
    sections.map((section) => section.id),
    sectionScrollRef,
  );

  const handleSave = async (event) => {
    if (event?.preventDefault) event.preventDefault();
    if (!hasChanges) return;

    const isWhatsappValid =
      !whatsapp.trim() || isValidPhoneNumber(whatsapp.trim());
    const isPaymentLinkValid =
      !paymentLink.trim() || isValidUrl(paymentLink.trim());

    if (!isWhatsappValid || !isPaymentLinkValid) {
      toast.error("Por favor corrige los errores antes de guardar");
      return;
    }

    setIsSubmitting(true);
    try {
      const data = {
        name: name.trim(),
        slug: slug.trim().toLowerCase(),
        description: description.trim(),
        purchaseInstructions: purchaseInstructions.trim(),
        whatsapp: whatsapp.trim(),
      };

      if (paymentLink.trim()) {
        data.paymentLink = paymentLink.trim();
      } else {
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

  const handleCopyLink = (url) => {
    navigator.clipboard.writeText(url);
    toast.success("Link copiado al portapapeles");
  };

  const handleDeleteStore = async () => {
    if (!store?.$id) return;
    if (!deletePassword.trim()) {
      setDeleteError("Ingresa tu contraseña para continuar");
      return;
    }

    setDeleteError("");

    try {
      await deleteStore.mutateAsync({
        storeId: store.$id,
        email: user?.email,
        password: deletePassword,
      });

      toast.success("Tienda eliminada permanentemente");
      setIsDeleteModalOpen(false);
      navigate("/app");
    } catch (error) {
      if (error?.code === 401 || error?.response?.status === 401) {
        setDeleteError("Contraseña incorrecta");
        return;
      }

      if (error?.message) {
        setDeleteError(error.message);
      } else {
        toast.error("No se pudo eliminar la tienda. Intenta de nuevo.");
      }
    }
  };

  const handleSectionSelect = (id) => {
    const root = sectionScrollRef.current;
    const element =
      root?.querySelector(`#${id}`) || document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <SettingsSectionLayout
        sections={sections}
        activeSection={activeSection}
        onSectionSelect={handleSectionSelect}
        containerRef={sectionScrollRef}
        sidebarTitle="General"
        sidebarSubtitle="Configura los datos esenciales de tu tienda."
        sidebarFooter={
          <StickySaveButton
            isSubmitting={isSubmitting}
            hasChanges={hasChanges}
          />
        }
      >
        <GeneralBasicsSection
          name={name}
          onNameChange={setName}
          description={description}
          onDescriptionChange={setDescription}
          whatsapp={whatsapp}
          onWhatsappChange={setWhatsapp}
          whatsappError={
            whatsapp.trim() && !isValidPhoneNumber(whatsapp.trim())
              ? "Formato inválido. Ej: +521234567890"
              : undefined
          }
        />
        <GeneralLinkSection
          slug={slug}
          initialSlug={store?.slug || ""}
          storeId={store?.$id}
          baseDomain={appConfig.baseDomain}
          onSlugChange={setSlug}
          onCopyLink={handleCopyLink}
          onShare={() => setIsShareModalOpen(true)}
        />
        <GeneralPurchaseSection
          paymentLink={paymentLink}
          onPaymentLinkChange={setPaymentLink}
          paymentLinkError={
            paymentLink.trim() && !isValidUrl(paymentLink.trim())
              ? "Debe ser una URL válida (ej. https://ejemplo.com)"
              : undefined
          }
          purchaseInstructions={purchaseInstructions}
          onPurchaseInstructionsChange={setPurchaseInstructions}
        />
        <GeneralStatusSection
          store={store}
          onPublishClick={() => setIsPublishModalOpen(true)}
        />
        <GeneralDangerSection
          onDeleteClick={() => {
            setDeletePassword("");
            setDeleteError("");
            setIsDeleteModalOpen(true);
          }}
          isDeleting={deleteStore.isPending}
        />
      </SettingsSectionLayout>

      <Modal
        open={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        title={store?.published ? "¿Despublicar tienda?" : "¿Publicar tienda?"}
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

      <Modal
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Eliminar tienda"
        description="Esta acción es irreversible. Ingresa tu contraseña para continuar."
        size="sm"
        footer={
          <ModalFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={deleteStore.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={handleDeleteStore}
              isLoading={deleteStore.isPending}
            >
              Eliminar definitivamente
            </Button>
          </ModalFooter>
        }
      >
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-(--color-bg-secondary) text-sm text-(--color-fg-secondary) border border-(--color-border)">
            <p className="font-semibold text-(--color-fg)">Se eliminará:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Todos los productos y sus imágenes en el storage.</li>
              <li>El documento de la tienda y su configuración.</li>
              <li>Las métricas y analíticas asociadas.</li>
            </ul>
          </div>

          <div className="space-y-2">
            <label
              className="text-sm font-medium text-(--color-fg)"
              htmlFor="store-delete-password"
            >
              Confirma con tu contraseña
            </label>
            <input
              id="store-delete-password"
              type="password"
              className="w-full px-3 py-2 rounded-lg bg-(--color-bg-secondary) border border-(--color-border) text-(--color-fg) focus:ring-2 focus:ring-(--color-primary) focus:outline-none"
              placeholder="Ingresa tu contraseña"
              value={deletePassword}
              onChange={(e) => {
                setDeletePassword(e.target.value);
                if (deleteError) setDeleteError("");
              }}
              disabled={deleteStore.isPending}
            />
            {deleteError ? (
              <p className="text-sm text-(--color-error)">{deleteError}</p>
            ) : null}
          </div>
        </div>
      </Modal>

      <ShareStoreModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        storeName={store?.name}
        storeUrl={`https://${store?.slug}.${appConfig.baseDomain}`}
      />
    </form>
  );
}
