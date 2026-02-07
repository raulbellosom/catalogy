import { Package, Store, ExternalLink } from "lucide-react";
import { useAuth } from "@/app/providers";
import { StoreOnboardingWizard } from "@/features/onboarding/components/StoreOnboardingWizard";
import { useUserStore } from "@/shared/hooks";
import { appConfig } from "@/shared/lib/env";
import { QuickActionCard } from "../components/QuickActionCard";
import { StatsGrid } from "../components/StatsGrid";

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
        <h1 className="text-2xl font-bold text-(--color-fg)">
          Hola, {user?.name?.split(" ")[0] || "Usuario"}
        </h1>
        <p className="text-(--color-fg-secondary)">
          Bienvenido a tu panel de control de{" "}
          <span className="font-semibold text-(--color-primary)">
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

      {/* Real stats */}
      <StatsGrid store={store} />
    </div>
  );
}
