import { ThemeProvider } from "./ThemeProvider";
import { AuthProvider } from "./AuthProvider";
import { SubdomainProvider } from "./SubdomainProvider";

/**
 * Combines all app-level providers
 * @param {{ children: React.ReactNode }} props
 */
export function AppProviders({ children }) {
  return (
    <ThemeProvider>
      <SubdomainProvider>
        <AuthProvider>{children}</AuthProvider>
      </SubdomainProvider>
    </ThemeProvider>
  );
}
