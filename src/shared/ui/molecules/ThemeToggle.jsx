import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "@/app/providers";

/**
 * Theme toggle button
 * Cycles through: system -> light -> dark -> system
 */
export function ThemeToggle() {
  const { preference, setPreference } = useTheme();

  const cycleTheme = () => {
    const nextTheme = {
      system: "light",
      light: "dark",
      dark: "system",
    };
    setPreference(nextTheme[preference]);
  };

  const Icon = {
    system: Monitor,
    light: Sun,
    dark: Moon,
  }[preference];

  const label = {
    system: "Tema del sistema",
    light: "Tema claro",
    dark: "Tema oscuro",
  }[preference];

  return (
    <button
      onClick={cycleTheme}
      className="p-2 rounded-lg text-[var(--color-fg-secondary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-fg)] transition-colors"
      aria-label={label}
      title={label}
    >
      <Icon className="w-5 h-5" />
    </button>
  );
}
