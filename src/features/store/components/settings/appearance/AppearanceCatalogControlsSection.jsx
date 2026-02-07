import {
  Search,
  Filter,
  ArrowUpDown,
  ListChecks,
  Share2,
  Info,
  CreditCard,
} from "lucide-react";
import { SettingsSection } from "../layout/SettingsSection";
import { SettingsToggle } from "../layout/SettingsToggle";

export function AppearanceCatalogControlsSection({
  catalogSettings,
  onChange,
}) {
  return (
    <SettingsSection
      id="appearance-catalog"
      title="Controles del catálogo"
      description="Activa o desactiva elementos visibles para tus clientes."
      icon={Filter}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SettingsToggle
          id="catalog-show-search"
          label="Mostrar barra de búsqueda"
          description="Permite a los clientes encontrar productos por texto."
          icon={Search}
          checked={catalogSettings.showSearch}
          onChange={(value) => onChange({ showSearch: value })}
        />
        <SettingsToggle
          id="catalog-show-filters"
          label="Mostrar filtros"
          description="Muestra categorías, precio y controles de filtro."
          icon={Filter}
          checked={catalogSettings.showFilters}
          onChange={(value) => onChange({ showFilters: value })}
        />
        <SettingsToggle
          id="catalog-show-sort"
          label="Mostrar ordenamiento"
          description="Permite ordenar por precio ascendente o descendente."
          icon={ArrowUpDown}
          checked={catalogSettings.showSort}
          onChange={(value) => onChange({ showSort: value })}
        />
        <SettingsToggle
          id="catalog-show-count"
          label="Mostrar contador de productos"
          description="Muestra cuántos productos hay en el catálogo."
          icon={ListChecks}
          checked={catalogSettings.showProductCount}
          onChange={(value) => onChange({ showProductCount: value })}
        />
        <SettingsToggle
          id="catalog-show-share"
          label="Mostrar botones de compartir"
          description="Habilita compartir productos en tarjetas y detalle."
          icon={Share2}
          checked={catalogSettings.showShareButton}
          onChange={(value) => onChange({ showShareButton: value })}
        />
        <SettingsToggle
          id="catalog-show-purchase-info"
          label="Mostrar instrucciones de compra"
          description="Muestra la sección de instrucciones y métodos de pago."
          icon={Info}
          checked={catalogSettings.showPurchaseInfo}
          onChange={(value) => onChange({ showPurchaseInfo: value })}
        />
        <SettingsToggle
          id="catalog-show-payment"
          label="Mostrar botones de pago"
          description="Muestra CTA de pago en el header y secciones."
          icon={CreditCard}
          checked={catalogSettings.showPaymentButton}
          onChange={(value) => onChange({ showPaymentButton: value })}
        />
      </div>
    </SettingsSection>
  );
}
