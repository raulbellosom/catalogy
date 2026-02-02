import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Package } from "lucide-react";
import { LoadingSpinner } from "@/shared/ui/atoms/LoadingSpinner";

/**
 * Product detail page for public catalog
 */
export function ProductDetailPage() {
  const { productId } = useParams();

  // TODO: Fetch product data
  // Placeholder for now

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-[var(--color-card)] border-b border-[var(--color-card-border)] safe-top">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center">
          <Link
            to="/"
            className="flex items-center gap-2 text-[var(--color-fg-secondary)] hover:text-[var(--color-fg)] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Volver al catalogo</span>
          </Link>
        </div>
      </header>

      {/* Product detail */}
      <main className="max-w-4xl mx-auto px-4 py-8 safe-bottom">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Image */}
          <div className="aspect-square bg-[var(--color-bg-tertiary)] rounded-2xl flex items-center justify-center">
            <Package className="w-20 h-20 text-[var(--color-fg-muted)]" />
          </div>

          {/* Info */}
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-fg)] mb-2">
              Producto de ejemplo
            </h1>
            <p className="text-3xl font-bold text-[var(--color-primary)] mb-4">
              $99.00 <span className="text-lg font-normal">MXN</span>
            </p>
            <p className="text-[var(--color-fg-secondary)]">
              Descripcion del producto...
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
