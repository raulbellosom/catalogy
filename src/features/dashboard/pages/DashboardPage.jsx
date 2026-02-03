import { Package, Store, TrendingUp, ExternalLink } from "lucide-react";
import { useAuth } from "@/app/providers";
import { StoreOnboardingWizard } from "@/features/onboarding/components/StoreOnboardingWizard";
import { useUserStore } from "@/shared/hooks";
import { appConfig } from "@/shared/lib/env";
import { QuickActionCard } from "../components/QuickActionCard";
import { StatCard } from "../components/StatCard";

/**
 * Dashboard page - Main app landing after login
 */
export function DashboardPage() {
  const { user } = useAuth();
  const { data: store, isLoading: loadingStore } = useUserStore();

  // If no store exists, show the Onboarding Wizard
  if (!store) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <StoreOnboardingWizard />
      </div>
    );
  }

  // Standard Dashboard View (User has a store)
  return (
    <div>
      {/* Welcome header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--color-fg)]">
          Hola, {user?.name?.split(" ")[0] || "Usuario"}
        </h1>
        <p className="text-[var(--color-fg-secondary)]">
          Bienvenido a tu panel de control de{" "}
          <span className="font-semibold text-[var(--color-primary)]">
            {store.name}
          </span>
        </p>
      </div>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <QuickActionCard
          icon={Store}
          title="Configurar tienda"
          description="Personaliza tu catalogo y elige tu slug"
          to="/app/store"
          delay={0}
        />
        <QuickActionCard
          icon={Package}
          title="Agregar productos"
          description="Agrega productos a tu catalogo"
          to="/app/store?tab=products"
          delay={0.1}
        />
        <QuickActionCard
          icon={ExternalLink}
          title="Ver mi catalogo"
          description="Abre tu catalogo publico"
          to={`https://${store.slug}.${appConfig.baseDomain}`}
          external
          delay={0.2}
        />
      </div>

      {/* Stats placeholder */}
      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard icon={Package} label="Productos" value="0" delay={0.3} />
        <StatCard icon={TrendingUp} label="Visitas hoy" value="0" delay={0.4} />
        <StatCard
          icon={Store}
          label="Estado"
          value={store.published ? "Publicado" : "No publicado"}
          delay={0.5}
        />
      </div>
    </div>
  );
}
