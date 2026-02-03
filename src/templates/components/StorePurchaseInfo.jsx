export function StorePurchaseInfo({ store, tone = "light" }) {
  const instructions = store?.purchaseInstructions?.trim();
  const paymentLink = store?.paymentLink?.trim();
  if (!instructions && !paymentLink) return null;

  const isNoir = tone === "noir";
  const panelClass = isNoir
    ? "bg-[var(--noir-surface)] border border-[var(--noir-border)] text-[var(--noir-strong)]"
    : "bg-[var(--color-card)] border border-(--color-border) text-(--color-fg)";
  const mutedClass = isNoir
    ? "text-[var(--noir-muted)]"
    : "text-(--color-fg-secondary)";
  const linkClass = isNoir
    ? "text-[var(--noir-accent)]"
    : "text-(--color-primary)";

  return (
    <section className={`rounded-2xl p-6 space-y-3 ${panelClass}`}>
      <h3 className="text-lg font-semibold">Instrucciones de compra</h3>
      {instructions && (
        <p className={`text-sm leading-relaxed ${mutedClass}`}>
          {instructions}
        </p>
      )}
      {paymentLink && (
        <a
          href={paymentLink}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-2 text-sm font-semibold ${linkClass}`}
        >
          Abrir link de pago
        </a>
      )}
    </section>
  );
}
