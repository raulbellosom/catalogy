import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Copy, Check, QrCode, Share2, Globe, ExternalLink } from "lucide-react";
import { Modal, ModalFooter } from "@/shared/ui/molecules/Modal";
import { Button } from "@/shared/ui/atoms/Button";
import { useToast } from "@/shared/ui/molecules/Toast";

/**
 * Modal to share the store link and show QR code
 */
export function ShareStoreModal({ isOpen, onClose, storeName, storeUrl = "" }) {
  const [copied, setCopied] = useState(false);
  const toast = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(storeUrl);
    setCopied(true);
    toast.success("Link copiado al portapapeles");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Compartir tu Tienda"
      description={`Comparte el catálogo de ${storeName} con tus clientes.`}
    >
      <div className="space-y-6 pt-2 pb-4">
        {/* QR Code Section */}
        <div className="flex flex-col items-center justify-center p-6 bg-(--color-bg-secondary) rounded-2xl border border-(--color-border)">
          <div className="bg-white p-4 rounded-xl shadow-sm mb-4">
            <QRCodeSVG
              value={storeUrl}
              size={180}
              level="H"
              includeMargin={false}
              className="w-full h-full"
            />
          </div>
          <p className="text-xs text-(--color-fg-secondary) flex items-center gap-1.5">
            <QrCode className="w-3.5 h-3.5" />
            Escanea para ver el catálogo
          </p>
        </div>

        {/* Link Section */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-(--color-fg)">
            Enlace de la tienda
          </label>
          <div className="flex items-center gap-2 p-1.5 bg-(--color-bg) border border-(--color-border) rounded-xl">
            <div className="flex-1 px-3 overflow-hidden">
              <p className="text-sm text-(--color-fg) truncate font-medium">
                {storeUrl.replace(/^https?:\/\//, "")}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className={`h-9 px-4 rounded-lg transition-all ${
                copied ? "text-green-500" : "hover:text-(--color-primary)"
              }`}
              onClick={handleCopy}
            >
              {copied ? (
                <Check className="w-4 h-4 mr-2" />
              ) : (
                <Copy className="w-4 h-4 mr-2" />
              )}
              {copied ? "Copiado" : "Copiar"}
            </Button>
          </div>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-3">
          <a
            href={storeUrl}
            target="_blank"
            rel="noreferrer"
            className="w-full"
          >
            <Button variant="outline" className="w-full h-11">
              <ExternalLink className="w-4 h-4 mr-2" />
              Visitar Página
            </Button>
          </a>
          <Button
            variant="primary"
            className="w-full h-11"
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: storeName,
                  text: `Mira mi catálogo en línea: ${storeName}`,
                  url: storeUrl,
                });
              } else {
                handleCopy();
              }
            }}
          >
            <Share2 className="w-4 h-4 mr-2" />
            Compartir Link
          </Button>
        </div>
      </div>

      <ModalFooter>
        <Button variant="ghost" onClick={onClose} className="w-full">
          Cerrar
        </Button>
      </ModalFooter>
    </Modal>
  );
}
