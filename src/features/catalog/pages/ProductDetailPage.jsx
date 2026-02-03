import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Package } from "lucide-react";
import { Logo } from "@/shared/ui/atoms/Logo";
import { LoadingSpinner } from "@/shared/ui/atoms/LoadingSpinner";
import { ThemeToggle } from "@/shared/ui/molecules/ThemeToggle";

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
      <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--color-card)]/90 backdrop-blur-md border-b border-[var(--color-card-border)]">
        <div className="max-w-6xl mx-auto px-4 h-14 sm:h-16 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-[var(--color-fg-secondary)] hover:text-[var(--color-fg)] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Volver al catalogo</span>
            <span className="sm:hidden">Volver</span>
          </Link>

          <div className="flex items-center gap-3">
            <Logo />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Product detail */}
      <main className="max-w-4xl mx-auto px-4 py-8 pt-20 sm:pt-24 safe-bottom">
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
