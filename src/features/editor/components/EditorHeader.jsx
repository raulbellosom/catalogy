import {
  Save,
  Eye,
  ArrowLeft,
  Loader2,
  Check,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/shared/ui/atoms/Button";

export const SAVE_STATES = {
  IDLE: "idle",
  SAVING: "saving",
  SAVED: "saved",
  ERROR: "error",
};

export function EditorHeader({
  storeName,
  saveState,
  onBack,
  onSave,
  onPreview,
}) {
  return (
    <header className="h-14 border-b border-(--border) bg-(--card) flex items-center justify-between px-4">
      {/* Left: Back */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
        <div className="h-6 w-px bg-(--border)" />
        <span className="text-sm font-medium text-(--foreground)">
          Editando: {storeName}
        </span>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onPreview}>
          <Eye className="w-4 h-4 mr-2" />
          Preview
        </Button>

        <Button
          size="sm"
          onClick={onSave}
          disabled={saveState === SAVE_STATES.SAVING}
        >
          {saveState === SAVE_STATES.SAVING ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : saveState === SAVE_STATES.SAVED ? (
            <Check className="w-4 h-4 mr-2" />
          ) : saveState === SAVE_STATES.ERROR ? (
            <AlertCircle className="w-4 h-4 mr-2" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          {saveState === SAVE_STATES.SAVING
            ? "Guardando..."
            : saveState === SAVE_STATES.SAVED
              ? "Guardado"
              : saveState === SAVE_STATES.ERROR
                ? "Error"
                : "Guardar"}
        </Button>
      </div>
    </header>
  );
}
