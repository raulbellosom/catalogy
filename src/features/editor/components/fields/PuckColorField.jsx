import { useEffect, useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";
import { HexColorPicker } from "react-colorful";

const HEX_COLOR_REGEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;
const FIELD_HELPERS = {
  themePrimary: {
    impact: "Afecta botones, enlaces y acentos principales del catalogo.",
    variable: "--primary / --color-primary",
  },
  themeBackground: {
    impact: "Afecta el fondo general de toda la pagina en modo Puck.",
    variable: "--background / --color-bg",
  },
  themeForeground: {
    impact: "Afecta el color base de texto y titulos.",
    variable: "--foreground / --color-fg",
  },
  themeCard: {
    impact: "Afecta paneles, tarjetas y superficies elevadas.",
    variable: "--card / --color-card",
  },
  themeBorder: {
    impact: "Afecta lineas y bordes de componentes.",
    variable: "--border / --color-border",
  },
  themeMuted: {
    impact: "Afecta fondos secundarios y secciones suaves.",
    variable: "--muted / --color-bg-secondary",
  },
  themeMutedForeground: {
    impact: "Afecta textos secundarios y descripciones.",
    variable: "--muted-foreground / --color-fg-secondary",
  },
};

const normalizeHex = (value) => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  const withHash = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
  if (!HEX_COLOR_REGEX.test(withHash)) return null;

  if (withHash.length === 4) {
    const r = withHash[1];
    const g = withHash[2];
    const b = withHash[3];
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }

  return withHash.toLowerCase();
};

export function PuckColorField({ field, name, id, value, onChange, readOnly }) {
  const helper = FIELD_HELPERS[name] || null;
  const placeholderColor = useMemo(
    () => normalizeHex(field?.placeholder) || "#2563eb",
    [field?.placeholder],
  );
  const savedColor = normalizeHex(value);
  const pickerColor = savedColor || placeholderColor;
  const [inputValue, setInputValue] = useState(value || "");

  useEffect(() => {
    setInputValue(value || "");
  }, [value]);

  const handlePickerChange = (nextColor) => {
    if (readOnly) return;
    const normalized = normalizeHex(nextColor);
    if (!normalized) return;
    setInputValue(normalized);
    onChange(normalized);
  };

  const handleInputChange = (event) => {
    if (readOnly) return;
    const nextValue = event.target.value;
    setInputValue(nextValue);

    const normalized = normalizeHex(nextValue);
    if (normalized) {
      onChange(normalized);
    }
  };

  const handleInputBlur = () => {
    if (readOnly) return;
    const normalized = normalizeHex(inputValue);

    if (!inputValue.trim()) {
      setInputValue("");
      onChange("");
      return;
    }

    if (normalized) {
      setInputValue(normalized);
      if (normalized !== value) onChange(normalized);
      return;
    }

    setInputValue(value || "");
  };

  const clearValue = () => {
    if (readOnly) return;
    setInputValue("");
    onChange("");
  };

  return (
    <div className="puck-color-field space-y-3">
      <div className="space-y-1">
        <p className="text-sm font-semibold text-slate-900">
          {field?.label || "Color"}
        </p>
        <p className="text-xs text-slate-500">
          {helper?.impact || "Afecta el tema visual global del catalogo Puck."}
        </p>
        {helper?.variable && (
          <p className="text-[11px] text-slate-400">
            Variable:{" "}
            <code className="rounded bg-slate-100 px-1 py-0.5">
              {helper.variable}
            </code>
          </p>
        )}
      </div>

      <HexColorPicker
        color={pickerColor}
        onChange={handlePickerChange}
        style={{
          width: "100%",
          height: "172px",
          borderRadius: "12px",
          maxWidth: "100%",
        }}
      />

      <div className="space-y-2">
        <label htmlFor={id} className="text-xs font-semibold text-slate-600">
          HEX
        </label>
        <input
          id={id}
          name={name}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          placeholder={field?.placeholder || "#000000"}
          readOnly={readOnly}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
        />
      </div>

      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-slate-500">
          Deja vacio para usar el color por defecto.
        </p>
        <button
          type="button"
          onClick={clearValue}
          disabled={readOnly}
          className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </button>
      </div>
    </div>
  );
}
