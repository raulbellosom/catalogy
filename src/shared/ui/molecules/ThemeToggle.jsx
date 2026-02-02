import { Sun, Moon, Monitor } from "lucide-react";
import {
  ThemeAnimationType,
  useModeAnimation,
} from "react-theme-switch-animation";
import { useTheme } from "@/app/providers";

/**
 * Theme toggle button
 * Cycles through: system -> light -> dark -> system
 */
export function ThemeToggle() {
  const { preference, setPreference } = useTheme();
  const { ref, toggleSwitchTheme } = useModeAnimation({
    animationType: ThemeAnimationType.CIRCLE,
    duration: 500,
    easing: "ease-in-out",
  });

  const cycleTheme = () => {
    const nextTheme = {
      system: "light",
      light: "dark",
      dark: "system",
    };

    // Trigger animation
    toggleSwitchTheme();

    // Update preference after a brief delay to sync with animation
    setTimeout(() => {
      setPreference(nextTheme[preference]);
    }, 50);
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
      ref={ref}
      onClick={cycleTheme}
      className="p-2 rounded-lg text-[var(--color-fg-secondary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-fg)] transition-colors"
      aria-label={label}
      title={label}
    >
      <Icon className="w-5 h-5" />
    </button>
  );
}
