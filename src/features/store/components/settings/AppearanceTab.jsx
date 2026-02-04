import { useState, useEffect } from "react";
import { Droplets, Type } from "lucide-react";
import { ImageUpload } from "@/shared/ui/molecules/ImageUpload";
import { TemplateSelector } from "../../components/TemplateSelector";
import { StickySaveButton } from "./StickySaveButton";
import { useToast } from "@/shared/ui/molecules";
import { TEMPLATES } from "@/templates/registry";
import { useUpdateStore, useUploadStoreLogo } from "@/shared/hooks";
import {
  getStoreLogoUrl,
  deleteStoreLogo,
} from "@/shared/services/storeService";

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
  const toast = useToast();
  const updateStore = useUpdateStore();
  const uploadLogo = useUploadStoreLogo();

  const [activeRenderer, setActiveRenderer] = useState("template");
  const [templateId, setTemplateId] = useState("minimal");

  // Style State
  const [primaryColor, setPrimaryColor] = useState(COLOR_PRESETS[0].primary);
  const [secondaryColor, setSecondaryColor] = useState(
    COLOR_PRESETS[0].secondary,
  );
  const [selectedFont, setSelectedFont] = useState(FONTS[0].id);
  const [useTemplateStyles, setUseTemplateStyles] = useState(false);

  // Logo State
  const [currentLogoId, setCurrentLogoId] = useState("");
  const [logoPreviewUrl, setLogoPreviewUrl] = useState(null);
  const [pendingLogoFile, setPendingLogoFile] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (store) {
      setTemplateId(store.templateId || "minimal");
      setActiveRenderer(store.activeRenderer || "template");
      setCurrentLogoId(store.logoFileId || "");
      setLogoPreviewUrl(
        store.logoFileId ? getStoreLogoUrl(store.logoFileId) : null,
      );

      const settings =
        typeof store.settings === "string"
          ? JSON.parse(store.settings || "{}")
          : store.settings || {};

      if (settings.colors?.primary) setPrimaryColor(settings.colors.primary);
      if (settings.colors?.secondary)
        setSecondaryColor(settings.colors.secondary);
      if (settings.font) setSelectedFont(settings.font);
      if (settings.useTemplateStyles !== undefined)
        setUseTemplateStyles(settings.useTemplateStyles);
    }
  }, [store]);

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

  const handleLogoUpload = (file) => {
    setPendingLogoFile(file);
    // Create local preview
    const objectUrl = URL.createObjectURL(file);
    setLogoPreviewUrl(objectUrl);
  };

  const handleLogoRemove = () => {
    setPendingLogoFile(null);
    setCurrentLogoId("");
    setLogoPreviewUrl(null);
  };

  const getInitialSettings = () => {
    if (typeof store?.settings === "string") {
      try {
        return JSON.parse(store.settings || "{}");
      } catch (e) {
        return {};
      }
    }
    return store?.settings || {};
  };

  const initialSettings = getInitialSettings();

  const hasChanges =
    templateId !== (store?.templateId || "minimal") ||
    activeRenderer !== (store?.activeRenderer || "template") ||
    !!pendingLogoFile ||
    currentLogoId !== (store?.logoFileId || "") ||
    primaryColor !== initialSettings.colors?.primary ||
    secondaryColor !== initialSettings.colors?.secondary ||
    selectedFont !== initialSettings.font ||
    useTemplateStyles !== !!initialSettings.useTemplateStyles;

  const rendererLabel =
    activeRenderer === "puck"
      ? "Editor (Puck)"
      : `Template (${templateId || "minimal"})`;

  const handleSave = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (!hasChanges) return;

    setIsSubmitting(true);
    try {
      let finalLogoId = currentLogoId;

      if (pendingLogoFile) {
        const response = await uploadLogo.mutateAsync(pendingLogoFile);
        finalLogoId = response.$id;
      }

      // If we removed the logo and didn't upload a new one, finalLogoId should be null (or empty string if we want to clear)
      // Original code used `finalLogoId || null`

      const data = {
        activeRenderer,
        templateId,
        logoFileId: finalLogoId || null,
        settings: {
          colors: {
            primary: primaryColor,
            secondary: secondaryColor,
          },
          font: selectedFont,
          useTemplateStyles,
        },
      };

      await updateStore.mutateAsync({ storeId: store.$id, data });

      // Cleanup old logo if replaced
      const oldId = store.logoFileId;
      if (oldId && oldId !== finalLogoId) {
        try {
          await deleteStoreLogo(oldId);
        } catch (e) {
          console.warn(e);
        }
      }

      setPendingLogoFile(null);
      // Update local state is handled by store update re-triggering useEffect,
      // but pendingLogoFile needs strictly manual reset which we did.

      toast.success("Apariencia actualizada correctamente");
    } catch (err) {
      console.error(err);
      toast.error("Error al guardar la apariencia");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSave}
      className="grid grid-cols-1 lg:grid-cols-3 gap-8"
    >
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-(--color-card) border border-(--color-card-border) rounded-2xl p-6 shadow-sm space-y-4">
          <div>
            <h3 className="text-lg font-bold text-(--color-fg) mb-1">
              Render público
            </h3>
            <p className="text-sm text-(--color-fg-secondary)">
              Decide qué se muestra en tu catálogo público. Cambiar esta opción
              no borra ni sobrescribe datos.
            </p>
          </div>

          <div className="grid gap-3">
            <label
              className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
                activeRenderer === "template"
                  ? "border-(--color-primary) bg-(--color-primary)/5"
                  : "border-(--color-border) hover:border-(--color-border-hover)"
              }`}
            >
              <input
                type="radio"
                name="activeRenderer"
                value="template"
                checked={activeRenderer === "template"}
                onChange={() => setActiveRenderer("template")}
                className="mt-1"
              />
              <div>
                <p className="font-semibold text-(--color-fg)">
                  Mostrar template
                </p>
                <p className="text-xs text-(--color-fg-secondary) mt-1">
                  Usa el template seleccionado para la vista pública.
                </p>
              </div>
            </label>

            <label
              className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
                activeRenderer === "puck"
                  ? "border-(--color-primary) bg-(--color-primary)/5"
                  : "border-(--color-border) hover:border-(--color-border-hover)"
              }`}
            >
              <input
                type="radio"
                name="activeRenderer"
                value="puck"
                checked={activeRenderer === "puck"}
                onChange={() => setActiveRenderer("puck")}
                className="mt-1"
              />
              <div>
                <p className="font-semibold text-(--color-fg)">
                  Mostrar página del editor
                </p>
                <p className="text-xs text-(--color-fg-secondary) mt-1">
                  Publica el layout creado en el editor Puck.
                </p>
              </div>
            </label>
          </div>

          <div className="text-xs text-(--color-fg-secondary)">
            Actualmente visible:{" "}
            <span className="font-semibold text-(--color-fg)">
              {rendererLabel}
            </span>
          </div>
        </div>
        <div className="bg-(--color-card) border border-(--color-card-border) rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-(--color-fg) mb-4">
            Plantilla
          </h3>
          <TemplateSelector value={templateId} onChange={setTemplateId} />
        </div>

        <div className="bg-(--color-card) border border-(--color-card-border) rounded-2xl p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-lg font-bold text-(--color-fg) mb-1">Estilo</h3>
            <p className="text-sm text-(--color-fg-secondary)">
              Personaliza los colores y la tipografía de tu tienda.
            </p>
          </div>

          <div className="p-4 bg-(--color-primary)/5 border border-(--color-primary)/20 rounded-xl flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-(--color-fg)">
                Usar estilos predeterminados del tema
              </p>
              <p className="text-xs text-(--color-fg-secondary)">
                Aplica automáticamente la fuente y colores recomendados para el
                tema seleccionado.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={useTemplateStyles}
                onChange={(e) => setUseTemplateStyles(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-(--color-primary)"></div>
            </label>
          </div>

          <div
            className={`space-y-6 transition-all duration-300 ${useTemplateStyles ? "opacity-40 grayscale pointer-events-none" : ""}`}
          >
            {/* Colors Section */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold flex items-center gap-2">
                <Droplets className="w-4 h-4 text-(--color-primary)" />
                Colores
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Primary Color Input */}
                <div className="p-3 border border-(--color-border) rounded-xl bg-(--color-bg) flex items-center gap-3">
                  <div className="relative w-10 h-10 shrink-0">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="absolute inset-0 w-full h-full p-0 border-0 rounded-full overflow-hidden cursor-pointer"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-medium text-(--color-fg-secondary) block">
                      Color Primario
                    </label>
                    <span className="text-sm font-mono uppercase text-(--color-fg)">
                      {primaryColor}
                    </span>
                  </div>
                </div>

                {/* Secondary Color Input */}
                <div className="p-3 border border-(--color-border) rounded-xl bg-(--color-bg) flex items-center gap-3">
                  <div className="relative w-10 h-10 shrink-0">
                    <input
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="absolute inset-0 w-full h-full p-0 border-0 rounded-full overflow-hidden cursor-pointer"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-medium text-(--color-fg-secondary) block">
                      Color de Fondo
                    </label>
                    <span className="text-sm font-mono uppercase text-(--color-fg)">
                      {secondaryColor}
                    </span>
                  </div>
                </div>
              </div>

              {/* Presets */}
              <div>
                <span className="text-xs text-(--color-fg-muted) block mb-2 font-medium">
                  Presets sugeridos
                </span>
                <div className="flex flex-wrap gap-2">
                  {COLOR_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setPrimaryColor(preset.primary);
                        setSecondaryColor(preset.secondary);
                      }}
                      className="w-10 h-10 rounded-full border border-(--color-border) overflow-hidden relative group hover:scale-110 transition-transform"
                      title={preset.name}
                    >
                      <div className="absolute inset-0 flex">
                        <div
                          className="w-1/2 h-full"
                          style={{ backgroundColor: preset.primary }}
                        />
                        <div
                          className="w-1/2 h-full"
                          style={{ backgroundColor: preset.secondary }}
                        />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="h-px bg-(--color-border)" />

            {/* Fonts Section */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold flex items-center gap-2">
                <Type className="w-4 h-4 text-(--color-primary)" />
                Tipografía
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {FONTS.map((font) => (
                  <button
                    key={font.id}
                    type="button"
                    onClick={() => setSelectedFont(font.id)}
                    className={`p-4 rounded-xl border text-left transition-all ${selectedFont === font.id ? "border-(--color-primary) bg-(--color-primary)/5 ring-1 ring-(--color-primary)" : "border-(--color-border) hover:border-(--color-border-hover) bg-(--color-bg)"}`}
                  >
                    <div
                      className={`text-xl font-medium mb-1 ${font.class}`}
                      style={font.style}
                    >
                      Agc
                    </div>
                    <div className="text-xs text-(--color-fg-secondary)">
                      {font.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="lg:col-span-1 space-y-6 h-full">
        <div className="bg-(--color-card) border border-(--color-card-border) rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-(--color-fg) mb-4">Logo</h3>
          <ImageUpload
            currentImageUrl={logoPreviewUrl}
            onUpload={handleLogoUpload}
            onRemove={handleLogoRemove}
            isUploading={isSubmitting && !!pendingLogoFile}
          />
        </div>
        <StickySaveButton isSubmitting={isSubmitting} hasChanges={hasChanges} />
      </div>
    </form>
  );
}
