import { useState } from "react";
import { CreditCard, MessageCircle, Search, Store } from "lucide-react";
import {
  booleanField,
  getStoreLogoPreviewUrl,
  resolveRuntimeContext,
} from "./runtimeContext";

function StoreNavbarPreview({
  puck,
  showLogo,
  showSearchInput,
  showPaymentButton,
  showWhatsAppButton,
  fixed,
  reserveSpace,
  size,
  width,
}) {
  const { store, isPreview, previewOffset } = resolveRuntimeContext(puck);
  const logoUrl = getStoreLogoPreviewUrl(store);
  const [searchValue, setSearchValue] = useState("");

  const sizeMap = {
    compact: {
      wrapper: "py-2",
      logo: "h-8 w-8",
      title: "text-sm",
      search: "py-1.5",
      spacer: 56,
    },
    comfortable: {
      wrapper: "py-3",
      logo: "h-10 w-10",
      title: "text-base",
      search: "py-2",
      spacer: 68,
    },
    tall: {
      wrapper: "py-4",
      logo: "h-12 w-12",
      title: "text-lg",
      search: "py-2.5",
      spacer: 80,
    },
  };

  const widthMap = {
    page: "max-w-7xl",
    wide: "max-w-[90rem]",
    full: "max-w-none",
  };

  const selectedSize = sizeMap[size] || sizeMap.comfortable;
  const selectedWidth = widthMap[width] || widthMap.page;
  const fixedTop = isPreview ? `${previewOffset}px` : "0px";

  const HeaderNode = (
    <header
      className={`border-b border-(--border) bg-(--card)/95 backdrop-blur-md z-30 ${fixed ? "fixed left-0 right-0" : "sticky"}`}
      style={fixed ? { top: fixedTop } : { top: fixedTop }}
    >
      <div
        className={`${selectedWidth} mx-auto px-4 ${selectedSize.wrapper} flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between`}
      >
        <div className="flex items-center gap-3 min-w-0">
          {showLogo &&
            (logoUrl ? (
              <img
                src={logoUrl}
                alt={store.name}
                className={`${selectedSize.logo} rounded-lg object-cover border border-(--border)`}
              />
            ) : (
              <div
                className={`${selectedSize.logo} rounded-lg bg-(--muted) border border-(--border) flex items-center justify-center`}
              >
                <Store className="h-5 w-5 text-(--muted-foreground)" />
              </div>
            ))}
          <p
            className={`${selectedSize.title} font-semibold text-(--foreground) truncate`}
          >
            {store.name}
          </p>
        </div>

        <div className="flex items-center gap-2 sm:justify-end">
          {showSearchInput && (
            <div className="relative flex-1 sm:w-64">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-(--muted-foreground)" />
              <input
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Buscar en la tienda..."
                className={`w-full pl-9 pr-3 ${selectedSize.search} rounded-xl border border-(--border) bg-(--background) text-sm text-(--foreground) outline-none`}
              />
            </div>
          )}

          {showPaymentButton && store.paymentLink && (
            <a
              href={store.paymentLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 bg-(--primary) text-white text-xs font-semibold hover:opacity-90 transition-opacity"
            >
              <CreditCard className="h-3.5 w-3.5" />
              Pagar
            </a>
          )}

          {showWhatsAppButton && store.whatsapp && (
            <a
              href={`https://wa.me/${String(store.whatsapp).replace(/\D/g, "")}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 border border-(--border) text-xs font-semibold text-(--foreground) hover:bg-(--muted) transition-colors"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              WhatsApp
            </a>
          )}
        </div>
      </div>
    </header>
  );

  return (
    <>
      {HeaderNode}
      {fixed && reserveSpace && (
        <div
          aria-hidden="true"
          style={{
            height: `${selectedSize.spacer}px`,
          }}
        />
      )}
    </>
  );
}

export const StoreNavbarBlock = {
  label: "Navbar de tienda",
  fields: {
    showLogo: booleanField("Mostrar logo"),
    showSearchInput: booleanField("Mostrar buscador"),
    showPaymentButton: booleanField("Mostrar boton de pago"),
    showWhatsAppButton: booleanField("Mostrar boton WhatsApp"),
    fixed: booleanField("Navbar fijo"),
    reserveSpace: booleanField("Reservar espacio del navbar"),
    size: {
      type: "select",
      label: "Altura del navbar",
      options: [
        { label: "Compacto", value: "compact" },
        { label: "Comodo", value: "comfortable" },
        { label: "Alto", value: "tall" },
      ],
    },
    width: {
      type: "select",
      label: "Ancho del contenido",
      options: [
        { label: "Pagina", value: "page" },
        { label: "Amplio", value: "wide" },
        { label: "Completo", value: "full" },
      ],
    },
  },
  defaultProps: {
    showLogo: true,
    showSearchInput: true,
    showPaymentButton: true,
    showWhatsAppButton: true,
    fixed: true,
    reserveSpace: true,
    size: "comfortable",
    width: "page",
  },
  render: (props) => <StoreNavbarPreview {...props} />,
};
