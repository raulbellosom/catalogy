import { User, Palette, Bell } from "lucide-react";
import { useAuth, useTheme } from "@/app/providers";
import { Button } from "@/shared/ui/atoms/Button";
import { Input } from "@/shared/ui/atoms/Input";

/**
 * User settings page
 */
export function UserSettingsPage() {
  const { user } = useAuth();
  const { preference, setPreference } = useTheme();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--color-fg)]">
          Configuracion
        </h1>
        <p className="text-[var(--color-fg-secondary)]">
          Personaliza tu experiencia
        </p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Profile */}
        <div className="p-6 bg-[var(--color-card)] border border-[var(--color-card-border)] rounded-2xl">
          <div className="flex items-center gap-3 mb-6">
            <User className="w-5 h-5 text-[var(--color-primary)]" />
            <h2 className="font-semibold text-[var(--color-fg)]">Perfil</h2>
          </div>

          <div className="space-y-4">
            <Input
              label="Nombre"
              defaultValue={user?.name || ""}
              placeholder="Tu nombre"
            />
            <Input
              label="Correo electronico"
              type="email"
              defaultValue={user?.email || ""}
              disabled
              hint="El correo no se puede cambiar"
            />
          </div>
        </div>

        {/* Theme */}
        <div className="p-6 bg-[var(--color-card)] border border-[var(--color-card-border)] rounded-2xl">
          <div className="flex items-center gap-3 mb-6">
            <Palette className="w-5 h-5 text-[var(--color-primary)]" />
            <h2 className="font-semibold text-[var(--color-fg)]">Apariencia</h2>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-fg)] mb-3">
              Tema de la aplicacion
            </label>
            <div className="grid grid-cols-3 gap-3">
              <ThemeOption
                value="system"
                label="Sistema"
                active={preference === "system"}
                onClick={() => setPreference("system")}
              />
              <ThemeOption
                value="light"
                label="Claro"
                active={preference === "light"}
                onClick={() => setPreference("light")}
              />
              <ThemeOption
                value="dark"
                label="Oscuro"
                active={preference === "dark"}
                onClick={() => setPreference("dark")}
              />
            </div>
          </div>
        </div>

        {/* Notifications placeholder */}
        <div className="p-6 bg-[var(--color-card)] border border-[var(--color-card-border)] rounded-2xl opacity-50">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="w-5 h-5 text-[var(--color-primary)]" />
            <h2 className="font-semibold text-[var(--color-fg)]">
              Notificaciones
            </h2>
          </div>
          <p className="text-sm text-[var(--color-fg-muted)]">
            Proximamente...
          </p>
        </div>

        {/* Save button */}
        <Button className="w-full">Guardar cambios</Button>
      </div>
    </div>
  );
}

/**
 * Theme option button
 */
function ThemeOption({ value, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`
        p-4 rounded-xl border-2 transition-all
        ${
          active
            ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10"
            : "border-[var(--color-border)] hover:border-[var(--color-fg-muted)]"
        }
      `}
    >
      <div
        className={`
        w-8 h-8 rounded-lg mx-auto mb-2
        ${value === "light" ? "bg-white border border-gray-200" : ""}
        ${value === "dark" ? "bg-gray-900" : ""}
        ${value === "system" ? "bg-gradient-to-r from-white to-gray-900" : ""}
      `}
      />
      <span
        className={`text-sm font-medium ${active ? "text-[var(--color-primary)]" : "text-[var(--color-fg-secondary)]"}`}
      >
        {label}
      </span>
    </button>
  );
}
