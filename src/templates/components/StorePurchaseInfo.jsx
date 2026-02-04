import { Info, CreditCard, ExternalLink } from "lucide-react";

export function StorePurchaseInfo({ store, tone = "light" }) {
  const instructions = store?.purchaseInstructions?.trim();
  const paymentLink = store?.paymentLink?.trim();
  if (!instructions && !paymentLink) return null;

  const isNoir = tone === "noir";

  // Noir theme constants
  const panelBase = isNoir
    ? "bg-(--noir-surface) border border-(--noir-border) text-(--noir-strong)"
    : "bg-(--color-card) border border-(--color-border) text-(--color-fg)";

  const iconBg = isNoir ? "bg-(--noir-surface-2)" : "bg-(--color-bg-secondary)";
  const iconColor = isNoir ? "text-(--noir-accent)" : "text-(--color-primary)";
  const mutedText = isNoir
    ? "text-(--noir-muted)"
    : "text-(--color-fg-secondary)";

  return (
    <section className={`rounded-3xl p-6 md:p-8 space-y-6 ${panelBase}`}>
      <div className="flex flex-col md:flex-row gap-6 md:items-start justify-between">
        {instructions && (
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-xl ${iconBg} ${iconColor}`}>
                <Info className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold tracking-tight">
                Instrucciones de Compra
              </h3>
            </div>
            <p className={`text-sm leading-relaxed ${mutedText} max-w-2xl`}>
              {instructions}
            </p>
          </div>
        )}

        {paymentLink && (
          <div className="flex flex-col gap-3 min-w-[240px]">
            <div className="flex items-center gap-2 md:justify-end">
              <div className={`p-2 rounded-xl ${iconBg} ${iconColor}`}>
                <CreditCard className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold tracking-tight">Link de Pago</h3>
            </div>
            <a
              href={paymentLink}
              target="_blank"
              rel="noopener noreferrer"
              className={`group flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1 ${
                isNoir
                  ? "bg-(--noir-accent) text-black hover:bg-white"
                  : "bg-(--color-primary) text-white hover:opacity-90"
              }`}
            >
              Pagar ahora
              <ExternalLink className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
            
          </div>
        )}
      </div>
    </section>
  );
}
