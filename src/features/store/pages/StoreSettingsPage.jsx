import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Store,
  Globe,
  Palette,
  Loader2,
  LayoutTemplate,
  Package,
  Tag,
  Eye,
} from "lucide-react";
import { Button } from "@/shared/ui/atoms/Button";
import { useUserStore, useProducts } from "@/shared/hooks";
import { appConfig, featureFlags } from "@/shared/lib/env";
import { GeneralTab } from "../components/settings/GeneralTab";
import { AppearanceTab } from "../components/settings/AppearanceTab";
import { CategoriesTab } from "../components/settings/CategoriesTab";
import { ProductsTab } from "../components/settings/ProductsTab";

export function StoreSettingsPage() {
  const navigate = useNavigate();

  const { data: store, isLoading: loadingStore } = useUserStore();

  const { data: productsData, isLoading: loadingProducts } = useProducts(
    store?.$id,
    { includeDisabled: true, includeInactive: true },
  );
  const products = productsData?.documents || [];

  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(
    () => searchParams.get("tab") || "general",
  );

  useEffect(() => {
    const tabFromUrl = searchParams.get("tab");
    if (
      tabFromUrl &&
      ["general", "appearance", "categories", "products"].includes(tabFromUrl)
    ) {
      setActiveTab(tabFromUrl);
    } else if (!tabFromUrl) {
      navigate("/app/store?tab=general", { replace: true });
    }
  }, [searchParams, navigate]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate(`/app/store?tab=${tab}`, { replace: true });
  };

  if (loadingStore) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-(--color-primary)" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-3xl border border-(--color-card-border) bg-(--color-card) shadow-sm">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--color-primary)_0%,_transparent_55%)] opacity-[0.08]" />
        <div className="absolute -top-24 -right-20 w-72 h-72 bg-(--color-primary)/10 blur-3xl rounded-full" />
        <div className="relative p-6 md:p-8 flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-(--color-fg) flex items-center gap-3">
                <Store className="w-8 h-8 text-(--color-primary)" />
                Mi Tienda
              </h1>
              <p className="text-(--color-fg-secondary) mt-1 md:ml-11">
                Configuración general y gestión de productos
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              {store && (
                <>
                  <a
                    href={`https://${store.slug}.${appConfig.baseDomain}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 md:flex-none"
                  >
                    <Button
                      variant="outline"
                      className="w-full md:w-auto border-(--color-primary)/20 hover:bg-(--color-primary)/5"
                    >
                      <Globe className="w-4 h-4 mr-2" />
                      Ver Tienda
                    </Button>
                  </a>
                  <Button
                    variant="outline"
                    className="flex-1 md:flex-none border-(--color-primary)/20 hover:bg-(--color-primary)/5"
                    onClick={() => navigate(`/app/store/${store.slug}/preview`)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Vista Previa
                  </Button>
                </>
              )}
              {featureFlags.enablePuck && (
                <Button
                  variant="primary"
                  className="flex-1 md:flex-none w-full md:w-auto"
                  onClick={() => navigate("/app/editor")}
                >
                  <LayoutTemplate className="w-4 h-4 mr-2" />
                  Editor Visual
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-(--color-card) border border-(--color-card-border) rounded-2xl p-2 flex gap-2 items-center overflow-x-auto shadow-sm">
        <TabButton
          active={activeTab === "general"}
          onClick={() => handleTabChange("general")}
          icon={Store}
          label="General"
        />
        <TabButton
          active={activeTab === "appearance"}
          onClick={() => handleTabChange("appearance")}
          icon={Palette}
          label="Apariencia"
        />
        <TabButton
          active={activeTab === "categories"}
          onClick={() => handleTabChange("categories")}
          icon={Tag}
          label="Categorías"
        />
        <TabButton
          active={activeTab === "products"}
          onClick={() => handleTabChange("products")}
          icon={Package}
          label="Productos"
        />
      </div>

      {/* Content */}
      <div>
        {activeTab === "general" && <GeneralTab store={store} />}
        {activeTab === "appearance" && <AppearanceTab store={store} />}
        {activeTab === "categories" && (
          <CategoriesTab store={store} products={products} />
        )}
        {activeTab === "products" && (
          <ProductsTab
            store={store}
            products={products}
            isLoading={loadingProducts}
          />
        )}
      </div>

      {/* Mobile spacer */}
      <div className="h-40 lg:hidden" aria-hidden="true" />
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all whitespace-nowrap border ${
        active
          ? "border-(--color-primary) bg-(--color-primary)/10 text-(--color-primary)"
          : "border-transparent text-(--color-fg-secondary) hover:text-(--color-fg) hover:bg-(--color-bg-secondary)"
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}
