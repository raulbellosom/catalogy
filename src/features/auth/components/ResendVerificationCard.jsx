import { Mail } from "lucide-react";
import { Button } from "@/shared/ui/atoms/Button";

export function ResendVerificationCard({
  email,
  onResend,
  countdown,
  isResending,
}) {
  if (!email) return null;

  return (
    <div className="mb-4 relative overflow-hidden p-4 bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent border border-blue-500/30 rounded-xl backdrop-blur-sm">
      {/* Decorative element */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>

      <div className="relative space-y-3">
        <div className="flex items-start gap-3">
          <Mail className="w-5 h-5 shrink-0 text-blue-500 dark:text-blue-400 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-(--color-fg) mb-1">
              ¿No recibiste el correo de verificación?
            </p>
            <p className="text-xs text-(--color-fg-secondary)">
              Revisa tu carpeta de spam o solicita un nuevo correo
            </p>
          </div>
        </div>

        <Button
          type="button"
          onClick={onResend}
          disabled={countdown > 0 || isResending}
          variant="outline"
          size="sm"
          className="w-full relative overflow-hidden group transition-all hover:border-blue-500/50"
        >
          {isResending ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              Enviando...
            </span>
          ) : countdown > 0 ? (
            <span className="flex items-center gap-2">
              <span className="text-xs opacity-70">Disponible en</span>
              <span className="font-mono font-semibold text-blue-500">
                {Math.floor(countdown / 60)}:
                {String(countdown % 60).padStart(2, "0")}
              </span>
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Reenviar correo de verificación
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
