import { CreditCard, ExternalLink, Info } from "lucide-react";
import { booleanField, resolveRuntimeContext } from "./runtimeContext";

const TONE_MAP = {
  light: {
    panel: "bg-(--card) border-(--border) text-(--foreground)",
    muted: "text-(--muted-foreground)",
    icon: "bg-(--muted) text-(--primary)",
    cta: "bg-(--primary) text-white hover:opacity-90",
  },
  noir: {
    panel: "bg-slate-900 border-slate-700 text-slate-100",
    muted: "text-slate-400",
    icon: "bg-slate-800 text-slate-200",
    cta: "bg-slate-100 text-slate-950 hover:bg-white",
  },
};

function StorePurchaseInfoPreview({
  puck,
  title,
  description,
  tone,
  showPaymentButton,
  showSectionHeading,
}) {
  const { store } = resolveRuntimeContext(puck);
  const styles = TONE_MAP[tone] || TONE_MAP.light;
  const instructions = store?.purchaseInstructions?.trim();
  const paymentLink = showPaymentButton ? store?.paymentLink?.trim() : "";
  const hasContent = Boolean(instructions || paymentLink);

  if (!hasContent) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 py-10 space-y-4">
      {showSectionHeading && (
        <div className="space-y-2">
          {title && <h2 className="text-2xl font-bold text-(--foreground)">{title}</h2>}
          {description && <p className="text-sm text-(--muted-foreground)">{description}</p>}
        </div>
      )}

      <div className={`rounded-3xl border p-6 md:p-8 ${styles.panel}`}>
        <div className="grid grid-cols-1 md:grid-cols-[1.2fr_0.8fr] gap-6">
          {instructions && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${styles.icon}`}>
                  <Info className="h-4 w-4" />
                </div>
                <h3 className="text-lg font-semibold">Instrucciones de compra</h3>
              </div>
              <p className={`text-sm leading-relaxed whitespace-pre-line ${styles.muted}`}>
                {instructions}
              </p>
            </div>
          )}

          {paymentLink && (
            <div className="space-y-3 md:justify-self-end w-full md:max-w-[260px]">
              <div className="flex items-center gap-2">
                <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${styles.icon}`}>
                  <CreditCard className="h-4 w-4" />
                </div>
                <h3 className="text-lg font-semibold">Pago</h3>
              </div>
              <a
                href={paymentLink}
                target="_blank"
                rel="noreferrer"
                className={`w-full inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold transition-colors ${styles.cta}`}
              >
                Pagar ahora
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export const StorePurchaseInfoBlock = {
  label: "Instrucciones de compra",
  fields: {
    showSectionHeading: booleanField("Mostrar titulo de seccion"),
    title: {
      type: "text",
      label: "Titulo de seccion",
      placeholder: "Informacion de compra",
    },
    description: {
      type: "textarea",
      label: "Descripcion de seccion",
      placeholder: "Texto breve opcional",
    },
    tone: {
      type: "select",
      label: "Tema",
      options: [
        { label: "Claro", value: "light" },
        { label: "Contraste", value: "noir" },
      ],
    },
    showPaymentButton: booleanField("Mostrar boton de pago"),
  },
  defaultProps: {
    showSectionHeading: true,
    title: "Informacion de compra",
    description: "",
    tone: "light",
    showPaymentButton: true,
  },
  render: (props) => <StorePurchaseInfoPreview {...props} />,
};
