import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Store,
  Palette,
  LayoutTemplate,
  Check,
  ChevronRight,
  ChevronLeft,
  Upload,
  Sparkles,
  Droplets,
  Type,
} from "lucide-react";
import { Button } from "@/shared/ui/atoms/Button";
import { Input } from "@/shared/ui/atoms/Input";
import { Logo } from "@/shared/ui/atoms/Logo";
import { SlugInput } from "@/shared/ui/molecules/SlugInput";
import { ImageUpload } from "@/shared/ui/molecules/ImageUpload";
import { useCreateStore, useUploadStoreLogo } from "@/shared/hooks";
import { extractColorsFromImage } from "@/shared/utils/colorExtraction";
import { appConfig } from "@/shared/lib/env";

const STEPS = [
  { id: "welcome", title: "Bienvenida", icon: Store },
  { id: "branding", title: "Marca", icon: Upload },
  { id: "style", title: "Estilo", icon: Palette },
  { id: "template", title: "Diseño", icon: LayoutTemplate },
  { id: "review", title: "Revisión", icon: Check },
];

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

// Presets for quick selection
const COLOR_PRESETS = [
  { primary: "#3b82f6", secondary: "#1e40af", name: "Ocean" },
  { primary: "#22c55e", secondary: "#15803d", name: "Forest" },
  { primary: "#a855f7", secondary: "#7e22ce", name: "Royal" },
  { primary: "#f97316", secondary: "#c2410c", name: "Sunset" },
  { primary: "#171717", secondary: "#404040", name: "Minimal" },
  { primary: "#ec4899", secondary: "#be185d", name: "Berry" },
];

const TemplatePreview = ({ type }) => {
  if (type === "minimal") {
    return (
      <div className="aspect-video bg-gray-100 dark:bg-gray-800 relative w-full h-full">
        <div className="absolute inset-4 bg-white dark:bg-gray-900 shadow-sm rounded-lg flex flex-col overflow-hidden">
          <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-t-lg"></div>
          <div className="p-2 space-y-2">
            <div className="h-2 w-1/3 bg-gray-200 dark:bg-gray-700 rounded full" />
            <div className="grid grid-cols-2 gap-2">
              <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (type === "grid") {
    return (
      <div className="aspect-video bg-gray-100 dark:bg-gray-800 relative w-full h-full">
        <div className="absolute inset-4 bg-white dark:bg-gray-900 shadow-sm rounded-lg flex flex-col overflow-hidden">
          <div className="h-8 w-full bg-gray-200 dark:bg-gray-700 rounded-t-lg mb-2"></div>
          <div className="p-2 grid grid-cols-3 gap-1">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-sm"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export function StoreOnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);

  // Form State
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [slugSuggestions, setSlugSuggestions] = useState([]);

  // Generate slug suggestions when name changes
  // Generate slug suggestions when name changes
  useEffect(() => {
    if (!name) {
      setSlugSuggestions([]);
      return;
    }

    const base = name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    if (!base) return;

    const hasStore = base.includes("store") || base.includes("tienda");
    const suggestions = [base];

    if (!hasStore) {
      suggestions.push(`tienda-${base}`);
      suggestions.push(`${base}-tienda`);
      suggestions.push(`${base}-store`); // Keep one English option as it's common
    }

    suggestions.push(`${base}-mx`);
    suggestions.push(`${base}-oficial`);
    suggestions.push(`${base}-online`);

    // Unique and limit
    setSlugSuggestions([...new Set(suggestions)].slice(0, 4));
  }, [name]);

  // Style State
  const [primaryColor, setPrimaryColor] = useState(COLOR_PRESETS[0].primary);
  const [secondaryColor, setSecondaryColor] = useState(
    COLOR_PRESETS[0].secondary,
  );
  const [extractedColors, setExtractedColors] = useState([]);
  const [selectedFont, setSelectedFont] = useState(FONTS[0].id);
  const [selectedTemplate, setSelectedTemplate] = useState("minimal");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Mutations
  const createStore = useCreateStore();
  const uploadLogo = useUploadStoreLogo();

  // Handlers
  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setDirection(1);
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleLogoUpload = async (file) => {
    setLogoFile(file);
    const colors = await extractColorsFromImage(file);
    setExtractedColors(colors);
    // Auto-select first two distinct colors if available
    if (colors.length > 0) {
      setPrimaryColor(colors[0]);
      if (colors.length > 1) {
        setSecondaryColor(colors[1]);
      } else {
        // If only one color found, make secondary a darker/lighter variant or just generic
        setSecondaryColor("#000000"); // Simple fallback
      }
    }
  };

  const handleCreateStore = async () => {
    setIsSubmitting(true);
    setError("");

    try {
      let logoId = null;

      // 1. Upload Logo if exists
      if (logoFile) {
        const uploadRes = await uploadLogo.mutateAsync(logoFile);
        logoId = uploadRes.$id;
      }

      // 2. Create Store
      await createStore.mutateAsync({
        name,
        slug,
        description,
        templateId: selectedTemplate,
        logoFileId: logoId,
        settings: {
          colors: {
            primary: primaryColor,
            secondary: secondaryColor,
          },
          font: selectedFont,
        },
      });

      // Redirect handled by parent component or effect on success (store created -> access granted)
    } catch (err) {
      console.error("Error creating store:", err);
      setError("Hubo un error al crear tu tienda. Por favor intenta de nuevo.");
      setIsSubmitting(false);
    }
  };

  // Step Renders
  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Welcome & Name
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-24 h-24 flex items-center justify-center">
                  <Logo
                    variant="icon"
                    className="w-full h-full justify-center flex items-center"
                    imgClass="h-full w-auto max-w-full object-contain block mx-auto"
                    asLink={false}
                  />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold">¡Bienvenido a Catalogy!</h2>
                <p className="text-[var(--color-fg-secondary)]">
                  Vamos a configurar tu primera tienda en pocos pasos.
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <Input
                label="Nombre de tu tienda"
                placeholder="Ej. Mi Tienda Increíble"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
              <SlugInput
                value={slug}
                onChange={(e) => {
                  if (e.target.value.length <= 50) {
                    setSlug(e.target.value);
                  }
                }}
              />

              {/* Slug Suggestions */}
              {slugSuggestions.length > 0 && !slug && (
                <div className="flex flex-wrap gap-2 animate-fadeIn">
                  <span className="text-xs text-[var(--color-fg-muted)] flex items-center">
                    Sugerencias:
                  </span>
                  {slugSuggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSlug(s)}
                      className="text-xs px-2 py-1 rounded-md bg-[var(--color-bg-secondary)] border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors text-[var(--color-fg-secondary)]"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-[var(--color-fg)] mb-2">
                  Descripción corta (Opcional)
                </label>
                <textarea
                  className="w-full px-4 py-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-[var(--color-fg)] placeholder:text-[var(--color-fg-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all resize-none"
                  rows={4}
                  placeholder="Lo que vendes y lo que te hace único..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>
          </div>
        );

      case 1: // Branding / Logo
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Sube tu Logo</h2>
              <p className="text-[var(--color-fg-secondary)]">
                Esto nos ayudará a personalizar los colores de tu tienda
                automáticamente.
              </p>
            </div>

            <div className="flex justify-center">
              <div className="w-full max-w-sm">
                <ImageUpload
                  label="Logo (Opcional)"
                  currentImageUrl={logoPreview}
                  onUpload={handleLogoUpload}
                  onRemove={() => {
                    setLogoFile(null);
                    setExtractedColors([]);
                  }}
                  aspectRatio="square"
                  className="aspect-square"
                />
              </div>
            </div>
          </div>
        );

      case 2: // Style / Colors
        return (
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Define tu Estilo</h2>
              <p className="text-[var(--color-fg-secondary)]">
                Elige los colores y tipografía que representen tu marca.
              </p>
            </div>

            {/* Colors Section */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold flex items-center gap-2 mb-4">
                  <Droplets className="w-4 h-4" />
                  Colores Principales
                </h3>

                {/* Extracted Colors Suggestions - Moved to be reusable logic */}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Primary Color Input */}
                  <div className="flex flex-col gap-2">
                    <div className="p-3 border border-[var(--color-border)] rounded-xl bg-[var(--color-card)] flex items-center gap-3">
                      <div className="relative w-10 h-10 shrink-0">
                        <input
                          type="color"
                          value={primaryColor}
                          onChange={(e) => setPrimaryColor(e.target.value)}
                          className="absolute inset-0 w-full h-full p-0 border-0 rounded-full overflow-hidden cursor-pointer"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-xs font-medium text-[var(--color-fg-secondary)] block">
                          Color Primario
                        </label>
                        <span className="text-sm font-mono uppercase">
                          {primaryColor}
                        </span>
                      </div>
                    </div>

                    {/* Quick Select for Primary */}
                    {extractedColors.length > 0 && (
                      <div className="flex gap-1.5 flex-wrap">
                        {extractedColors.map((color) => (
                          <button
                            key={`p-${color}`}
                            onClick={() => setPrimaryColor(color)}
                            className="w-6 h-6 rounded-full border border-[var(--color-border)] hover:scale-110 transition-transform"
                            style={{ backgroundColor: color }}
                            title={`Usar ${color} como primario`}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Secondary Color Input */}
                  <div className="flex flex-col gap-2">
                    <div className="p-3 border border-[var(--color-border)] rounded-xl bg-[var(--color-card)] flex items-center gap-3">
                      <div className="relative w-10 h-10 shrink-0">
                        <input
                          type="color"
                          value={secondaryColor}
                          onChange={(e) => setSecondaryColor(e.target.value)}
                          className="absolute inset-0 w-full h-full p-0 border-0 rounded-full overflow-hidden cursor-pointer"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-xs font-medium text-[var(--color-fg-secondary)] block">
                          Color Secundario
                        </label>
                        <span className="text-sm font-mono uppercase">
                          {secondaryColor}
                        </span>
                      </div>
                    </div>

                    {/* Quick Select for Secondary */}
                    {extractedColors.length > 0 && (
                      <div className="flex gap-1.5 flex-wrap">
                        {extractedColors.map((color) => (
                          <button
                            key={`s-${color}`}
                            onClick={() => setSecondaryColor(color)}
                            className="w-6 h-6 rounded-full border border-[var(--color-border)] hover:scale-110 transition-transform"
                            style={{ backgroundColor: color }}
                            title={`Usar ${color} como secundario`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Presets */}
                <div className="mt-4">
                  <span className="text-xs text-[var(--color-fg-muted)] block mb-2">
                    O elige un preset:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {COLOR_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setPrimaryColor(preset.primary);
                          setSecondaryColor(preset.secondary);
                        }}
                        className="w-8 h-8 rounded-full border border-[var(--color-border)] overflow-hidden relative group hover:scale-110 transition-transform"
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
            </div>

            <div className="h-px bg-[var(--color-border)]" />

            {/* Fonts */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold flex items-center gap-2 mb-2">
                <Type className="w-4 h-4" />
                Tipografía
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {FONTS.map((font) => (
                  <button
                    key={font.id}
                    onClick={() => setSelectedFont(font.id)}
                    className={`p-4 rounded-xl border text-left transition-all ${selectedFont === font.id ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5 ring-1 ring-[var(--color-primary)]" : "border-[var(--color-border)] hover:border-[var(--color-border-hover)] bg-[var(--color-card)]"}`}
                  >
                    <div
                      className={`text-xl font-medium mb-1 ${font.class}`}
                      style={font.style}
                    >
                      Agc
                    </div>
                    <div className="text-xs text-[var(--color-fg-secondary)]">
                      {font.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 3: // Template
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Elige un Diseño Inicial</h2>
              <p className="text-[var(--color-fg-secondary)]">
                Podrás cambiarlo o personalizarlo completamente después.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Minimal Template */}
              <button
                onClick={() => setSelectedTemplate("minimal")}
                className={`group relative overflow-hidden rounded-2xl border-2 transition-all text-left ${selectedTemplate === "minimal" ? "border-[var(--color-primary)]" : "border-[var(--color-border)] hover:border-[var(--color-border-hover)]"}`}
              >
                <TemplatePreview type="minimal" />
                <div className="p-4">
                  <h3 className="font-bold">Minimalista</h3>
                  <p className="text-xs text-[var(--color-fg-secondary)]">
                    Limpio y directo al grano.
                  </p>
                </div>
                {selectedTemplate === "minimal" && (
                  <div className="absolute top-2 right-2 bg-[var(--color-primary)] text-white p-1 rounded-full">
                    <Check className="w-4 h-4" />
                  </div>
                )}
              </button>

              {/* Grid Template - Placeholder */}
              <button
                onClick={() => setSelectedTemplate("grid")}
                className={`group relative overflow-hidden rounded-2xl border-2 transition-all text-left ${selectedTemplate === "grid" ? "border-[var(--color-primary)]" : "border-[var(--color-border)] hover:border-[var(--color-border-hover)]"}`}
              >
                <TemplatePreview type="grid" />
                <div className="p-4">
                  <h3 className="font-bold">Galería</h3>
                  <p className="text-xs text-[var(--color-fg-secondary)]">
                    Perfecto para mostrar muchos productos.
                  </p>
                </div>
                {selectedTemplate === "grid" && (
                  <div className="absolute top-2 right-2 bg-[var(--color-primary)] text-white p-1 rounded-full">
                    <Check className="w-4 h-4" />
                  </div>
                )}
              </button>
            </div>
          </div>
        );

      case 4: // Review
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">¡Todo listo!</h2>
              <p className="text-[var(--color-fg-secondary)]">
                Revisa que todo esté correcto antes de lanzar tu tienda.
              </p>
            </div>

            <div className="bg-[var(--color-card)] border border-[var(--color-card-border)] rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-[var(--color-bg-secondary)] flex items-center justify-center border border-[var(--color-border)] overflow-hidden">
                  {logoFile ? (
                    <img
                      src={URL.createObjectURL(logoFile)}
                      alt="Logo"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Store className="w-8 h-8 text-[var(--color-fg-muted)]" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{name}</h3>
                  <p className="text-sm text-[var(--color-primary)]">
                    {slug}.{appConfig.baseDomain}
                  </p>
                </div>
              </div>

              <div className="h-px bg-[var(--color-border)]" />

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-[var(--color-fg-muted)]">Colores:</span>
                  <div className="flex items-center gap-2 mt-1">
                    <div
                      className="w-6 h-6 rounded-full border border-[var(--color-border)]"
                      style={{ backgroundColor: primaryColor }}
                    />
                    <div
                      className="w-6 h-6 rounded-full border border-[var(--color-border)]"
                      style={{ backgroundColor: secondaryColor }}
                    />
                  </div>
                </div>
                <div>
                  <span className="text-[var(--color-fg-muted)]">
                    Tipografía:
                  </span>
                  <p className="font-medium">
                    {FONTS.find((f) => f.id === selectedFont)?.name}
                  </p>
                </div>
                <div className="col-span-2">
                  <span className="text-[var(--color-fg-muted)]">
                    Plantilla:
                  </span>
                  <div className="mt-2 border border-[var(--color-border)] rounded-lg overflow-hidden w-full max-w-sm mx-auto">
                    <TemplatePreview type={selectedTemplate} />
                  </div>
                  <p className="font-medium capitalize mt-1 text-sm text-center">
                    {selectedTemplate}
                  </p>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-xl text-sm text-center">
                {error}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 md:p-8">
      {/* Progress Bar */}
      <div className="mb-8 relative">
        {/* Line behind steps - Absolute Positioned */}
        <div
          className="absolute top-5 left-4 right-4 h-0.5 bg-[var(--color-bg-tertiary)] -translate-y-1/2 z-0"
          aria-hidden="true"
        >
          <div
            className="absolute top-0 left-0 h-full bg-[var(--color-primary)] transition-all duration-500 ease-out"
            style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
          />
        </div>

        {/* Steps */}
        <div className="flex justify-between relative z-10 px-0">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const active = idx === currentStep;
            const completed = idx < currentStep;

            return (
              <div key={step.id} className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 z-10 border-4 border-[var(--color-bg-secondary)] relative
                      ${
                        active
                          ? "bg-[var(--color-primary)] text-white scale-110 shadow-lg shadow-[var(--color-primary)]/25"
                          : completed
                            ? "bg-[var(--color-card)] text-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/20"
                            : "bg-[var(--color-bg-tertiary)] text-[var(--color-fg-muted)]"
                      }`}
                >
                  {completed ? (
                    <Check className="w-6 h-6" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                <span
                  className={`text-xs mt-2 font-medium transition-colors ${active ? "text-[var(--color-fg)]" : "text-[var(--color-fg-muted)]"}`}
                >
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="mt-8 min-h-[400px]">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            initial={{ opacity: 0, x: direction * 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -50 }}
            transition={{ duration: 0.3 }}
            className="pt-6"
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Actions */}
      <div className="flex justify-between mt-8 pt-6 border-t border-[var(--color-border)]">
        <Button
          variant="ghost"
          onClick={prevStep}
          disabled={currentStep === 0 || isSubmitting}
          className={`${currentStep === 0 ? "invisible" : ""}`}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Anterior
        </Button>

        {currentStep < STEPS.length - 1 ? (
          <Button
            onClick={nextStep}
            disabled={currentStep === 0 && (!name || !slug)}
          >
            Siguiente
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={handleCreateStore}
            isLoading={isSubmitting}
            className="shadow-lg shadow-[var(--color-primary)]/25"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Crear mi Tienda
          </Button>
        )}
      </div>
    </div>
  );
}
