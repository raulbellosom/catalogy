import { useState, useEffect, useMemo, useRef } from "react";
import { Globe, LayoutTemplate, Droplets, Filter, Image } from "lucide-react";
import { StickySaveButton } from "./StickySaveButton";
import { useToast } from "@/shared/ui/molecules";
import { featureFlags } from "@/shared/lib/env";
import { TEMPLATES, resolveThemeSettings } from "@/templates/registry";
import { useUpdateStore, useUploadStoreLogo } from "@/shared/hooks";
import {
  getStoreLogoUrl,
  deleteStoreLogo,
} from "@/shared/services/storeService";
import {
  normalizeCatalogSettings,
  resolveCatalogSettings,
  resolveStoreSettings,
} from "@/shared/utils/storeSettings";
import { SettingsSectionLayout } from "./layout/SettingsSectionLayout";
import { useSectionScrollSpy } from "./layout/useSectionScrollSpy";
import { AppearanceRenderSection } from "./appearance/AppearanceRenderSection";
import { AppearanceTemplateSection } from "./appearance/AppearanceTemplateSection";
import { AppearanceStyleSection } from "./appearance/AppearanceStyleSection";
import { AppearanceLogoSection } from "./appearance/AppearanceLogoSection";
import { AppearanceCatalogControlsSection } from "./appearance/AppearanceCatalogControlsSection";

const FONTS = [
  { id: "inter", name: "Inter (Modern Sans)", class: "font-sans" },
  {
    id: "merriweather",
    name: "Merriweather (Classic Serif)",
    class: "font-serif",
  },
  { id: "jetbrains", name: "JetBrains (Tech Mono)", class: "font-mono" },
  {
    id: "roboto",
    name: "Roboto (Neutral)",
    style: { fontFamily: "'Roboto', sans-serif" },
  },
  {
    id: "playfair",
    name: "Playfair Display (Elegant)",
    style: { fontFamily: "'Playfair Display', serif" },
  },
  {
    id: "montserrat",
    name: "Montserrat (Geometric)",
    style: { fontFamily: "'Montserrat', sans-serif" },
  },
];

const COLOR_PRESETS = [
  { primary: "#6366f1", secondary: "#4f46e5", name: "Original" },
  { primary: "#3b82f6", secondary: "#1e40af", name: "Ocean" },
  { primary: "#22c55e", secondary: "#15803d", name: "Forest" },
  { primary: "#a855f7", secondary: "#7e22ce", name: "Royal" },
  { primary: "#f97316", secondary: "#c2410c", name: "Sunset" },
  { primary: "#171717", secondary: "#404040", name: "Minimal" },
  { primary: "#ec4899", secondary: "#be185d", name: "Berry" },
];

export function AppearanceTab({ store }) {
  const puckEnabled = featureFlags.enablePuck;
  const toast = useToast();
  const updateStore = useUpdateStore();
  const uploadLogo = useUploadStoreLogo();
  const sectionScrollRef = useRef(null);

  const [activeRenderer, setActiveRenderer] = useState("template");
  const [templateId, setTemplateId] = useState("minimal");

  const [primaryColor, setPrimaryColor] = useState(COLOR_PRESETS[0].primary);
  const [secondaryColor, setSecondaryColor] = useState(
    COLOR_PRESETS[0].secondary,
  );
  const [selectedFont, setSelectedFont] = useState(FONTS[0].id);
  const [useTemplateStyles, setUseTemplateStyles] = useState(false);
  const [catalogSettings, setCatalogSettings] = useState(
    resolveCatalogSettings(store),
  );

  const [currentLogoId, setCurrentLogoId] = useState("");
  const [logoPreviewUrl, setLogoPreviewUrl] = useState(null);
  const [pendingLogoFile, setPendingLogoFile] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (store) {
      setTemplateId(store.templateId || "minimal");
      setActiveRenderer(
        puckEnabled ? store.activeRenderer || "template" : "template",
      );
      setCurrentLogoId(store.logoFileId || "");
      setLogoPreviewUrl(
        store.logoFileId ? getStoreLogoUrl(store.logoFileId) : null,
      );

      const settings = resolveStoreSettings(store);
      const theme = resolveThemeSettings(store);

      setPrimaryColor(theme.colors.primary);
      setSecondaryColor(theme.colors.secondary);
      setSelectedFont(theme.font);
      setUseTemplateStyles(!!settings.useTemplateStyles);
      setCatalogSettings(normalizeCatalogSettings(settings.catalog));
    }
  }, [store, puckEnabled]);

  useEffect(() => {
    if (useTemplateStyles && templateId) {
      const template = TEMPLATES[templateId];
      if (template?.defaultSettings) {
        setPrimaryColor(template.defaultSettings.colors.primary);
        setSecondaryColor(template.defaultSettings.colors.secondary);
        setSelectedFont(template.defaultSettings.font);
      }
    }
  }, [templateId, useTemplateStyles]);

  const sections = useMemo(
    () => [
      {
        id: "appearance-render",
        label: "Render publico",
        icon: Globe,
        hint: puckEnabled ? "Template o editor" : "Solo template",
      },
      {
        id: "appearance-template",
        label: "Plantilla",
        icon: LayoutTemplate,
        hint: "Estructura base",
      },
      {
        id: "appearance-style",
        label: "Estilo",
        icon: Droplets,
        hint: "Colores y tipografia",
      },
      {
        id: "appearance-catalog",
        label: "Controles",
        icon: Filter,
        hint: "Busqueda y filtros",
      },
      {
        id: "appearance-logo",
        label: "Logo",
        icon: Image,
        hint: "Identidad visual",
      },
    ],
    [puckEnabled],
  );

  const { activeSection } = useSectionScrollSpy(
    sections.map((section) => section.id),
    sectionScrollRef,
  );

  const handleLogoUpload = (file) => {
    setPendingLogoFile(file);
    const objectUrl = URL.createObjectURL(file);
    setLogoPreviewUrl(objectUrl);
  };

  const handleLogoRemove = () => {
    setPendingLogoFile(null);
    setCurrentLogoId("");
    setLogoPreviewUrl(null);
  };

  const handleCatalogChange = (partial) => {
    setCatalogSettings((prev) => ({ ...prev, ...partial }));
  };

  const initialSettings = resolveStoreSettings(store);
  const initialTheme = resolveThemeSettings(store);
  const initialCatalogSettings = normalizeCatalogSettings(initialSettings.catalog);

  const hasCatalogChanges =
    JSON.stringify(catalogSettings) !== JSON.stringify(initialCatalogSettings);

  const expectedRenderer =
    puckEnabled ? store?.activeRenderer || "template" : "template";

  const hasChanges =
    templateId !== (store?.templateId || "minimal") ||
    activeRenderer !== expectedRenderer ||
    !!pendingLogoFile ||
    currentLogoId !== (store?.logoFileId || "") ||
    primaryColor !== initialTheme.colors?.primary ||
    secondaryColor !== initialTheme.colors?.secondary ||
    selectedFont !== initialTheme.font ||
    useTemplateStyles !== !!initialSettings.useTemplateStyles ||
    hasCatalogChanges;

  const effectiveRenderer = puckEnabled ? activeRenderer : "template";

  const rendererLabel =
    effectiveRenderer === "puck"
      ? "Editor (Puck)"
      : `Template (${templateId || "minimal"})`;

  const handleSave = async (event) => {
    if (event?.preventDefault) event.preventDefault();
    if (!hasChanges) return;

    setIsSubmitting(true);
    try {
      let finalLogoId = currentLogoId;

      if (pendingLogoFile) {
        const response = await uploadLogo.mutateAsync(pendingLogoFile);
        finalLogoId = response.$id;
      }

      const data = {
        activeRenderer: effectiveRenderer,
        templateId,
        logoFileId: finalLogoId || null,
        settings: {
          colors: {
            primary: primaryColor,
            secondary: secondaryColor,
          },
          font: selectedFont,
          useTemplateStyles,
          catalog: catalogSettings,
        },
      };

      await updateStore.mutateAsync({ storeId: store.$id, data });

      const oldId = store.logoFileId;
      if (oldId && oldId !== finalLogoId) {
        try {
          await deleteStoreLogo(oldId);
        } catch (e) {
          console.warn(e);
        }
      }

      setPendingLogoFile(null);
      toast.success("Apariencia actualizada correctamente");
    } catch (err) {
      console.error(err);
      toast.error("Error al guardar la apariencia");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSectionSelect = (id) => {
    const root = sectionScrollRef.current;
    const element = root?.querySelector(`#${id}`) || document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <SettingsSectionLayout
        sections={sections}
        activeSection={activeSection}
        onSectionSelect={handleSectionSelect}
        containerRef={sectionScrollRef}
        sidebarTitle="Apariencia"
        sidebarSubtitle="Define el estilo y los controles visibles."
        sidebarFooter={
          <StickySaveButton isSubmitting={isSubmitting} hasChanges={hasChanges} />
        }
      >
        <AppearanceRenderSection
          activeRenderer={effectiveRenderer}
          onRendererChange={setActiveRenderer}
          rendererLabel={rendererLabel}
          puckEnabled={puckEnabled}
        />
        <AppearanceTemplateSection
          templateId={templateId}
          onChange={setTemplateId}
        />
        <AppearanceStyleSection
          useTemplateStyles={useTemplateStyles}
          onToggleUseTemplateStyles={setUseTemplateStyles}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          onPrimaryChange={setPrimaryColor}
          onSecondaryChange={setSecondaryColor}
          colorPresets={COLOR_PRESETS}
          fonts={FONTS}
          selectedFont={selectedFont}
          onFontChange={setSelectedFont}
        />
        <AppearanceCatalogControlsSection
          catalogSettings={catalogSettings}
          onChange={handleCatalogChange}
        />
        <AppearanceLogoSection
          logoPreviewUrl={logoPreviewUrl}
          onUpload={handleLogoUpload}
          onRemove={handleLogoRemove}
          isUploading={isSubmitting && !!pendingLogoFile}
        />
      </SettingsSectionLayout>
    </form>
  );
}
