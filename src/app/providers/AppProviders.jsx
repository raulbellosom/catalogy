import { ThemeProvider } from "./ThemeProvider";
import { AuthProvider } from "./AuthProvider";
import { SubdomainProvider } from "./SubdomainProvider";
import { ToastProvider } from "@/shared/ui/molecules";

/**
 * Combines all app-level providers
 * @param {{ children: React.ReactNode }} props
 */
export function AppProviders({ children }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SubdomainProvider>
          <ToastProvider>{children}</ToastProvider>
        </SubdomainProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
