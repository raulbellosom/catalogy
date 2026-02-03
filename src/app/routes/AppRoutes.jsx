import { Routes, Route, Navigate } from "react-router-dom";
import { useSubdomainContext } from "@/app/providers";
import { useDynamicHead } from "@/shared/hooks/useDynamicHead";
import { ScrollToTop } from "@/shared/utils/ScrollToTop";

// Layouts
import { AppLayout } from "@/app/layouts/AppLayout";
import { AuthLayout } from "@/app/layouts/AuthLayout";
import { PublicLayout } from "@/app/layouts/PublicLayout";
import { LegalLayout } from "@/app/layouts/LegalLayout";

// Public pages
import { LandingPage } from "@/features/landing/pages/LandingPage";
import { CatalogPage } from "@/features/catalog/pages/CatalogPage";
import { ProductDetailPage } from "@/features/catalog/pages/ProductDetailPage";
import { NotFoundPage } from "@/shared/ui/organisms/NotFoundPage";
import { CatalogNotAvailablePage } from "@/features/catalog/pages/CatalogNotAvailablePage";

// Legal pages
import {
  PrivacyPolicyPage,
  TermsOfServicePage,
  DisclaimerPage,
} from "@/features/legal";

// Auth pages
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { RegisterPage } from "@/features/auth/pages/RegisterPage";
import { ForgotPasswordPage } from "@/features/auth/pages/ForgotPasswordPage";
import { VerifyEmailPage } from "@/features/auth/pages/VerifyEmailPage";

// App pages (protected)
import { DashboardPage } from "@/features/dashboard/pages/DashboardPage";
import { StoreSettingsPage } from "@/features/store/pages/StoreSettingsPage";
import { StorePreviewPage } from "@/features/store/pages/StorePreviewPage";
import { UserSettingsPage } from "@/features/settings/pages/UserSettingsPage";
import { PuckEditorPage } from "@/features/editor/pages/PuckEditorPage";

// Admin pages
import { UsersAdminPage } from "@/features/admin";

// Guards
import { ProtectedRoute } from "./ProtectedRoute";
import { GuestRoute } from "./GuestRoute";

/**
 * Main application routes
 * Routes are determined based on subdomain context
 */
export function AppRoutes() {
  const { isRootDomain, isStoreDomain, isLoading } = useSubdomainContext();
  useDynamicHead();

  // Show loading while determining domain context
  if (isLoading) {
    return null; // Or a loading spinner
  }

  // Store subdomain routes ({slug}.catalog.racoondevs.com)
  if (isStoreDomain) {
    const { store, user } = useSubdomainContext();

    // If store doesn't exist, show Not Found
    if (!store) {
      return (
        <Routes>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      );
    }

    // If store is not published, check if user is the owner
    const isOwner = user?.$id === store.profileId;

    if (!store.published && !isOwner) {
      return (
        <Routes>
          <Route path="*" element={<CatalogNotAvailablePage />} />
        </Routes>
      );
    }

    return (
      <>
        <ScrollToTop />
        <Routes>
          <Route element={<PublicLayout />}>
            <Route index element={<CatalogPage />} />
            <Route path="product/:productId" element={<ProductDetailPage />} />
            <Route path="not-available" element={<CatalogNotAvailablePage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </>
    );
  }

  // Root domain routes (catalog.racoondevs.com)
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Public routes - redirect to /app if authenticated */}
        <Route
          element={
            <GuestRoute>
              <PublicLayout />
            </GuestRoute>
          }
        >
          <Route index element={<LandingPage />} />
        </Route>

        {/* Auth routes - redirect to /app if authenticated */}
        <Route
          element={
            <GuestRoute>
              <AuthLayout />
            </GuestRoute>
          }
        >
          <Route path="auth/login" element={<LoginPage />} />
          <Route path="auth/register" element={<RegisterPage />} />
          <Route path="auth/forgot-password" element={<ForgotPasswordPage />} />
        </Route>

        {/* Email verification route - public, no layout */}
        <Route path="verify-email" element={<VerifyEmailPage />} />

        {/* Legal routes - accessible to everyone */}
        <Route path="legal" element={<LegalLayout />}>
          <Route path="privacy" element={<PrivacyPolicyPage />} />
          <Route path="terms" element={<TermsOfServicePage />} />
          <Route path="disclaimer" element={<DisclaimerPage />} />
        </Route>

        {/* Protected app routes */}
        <Route
          path="app"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="store" element={<StoreSettingsPage />} />
          <Route path="settings" element={<UserSettingsPage />} />

          {/* Admin routes */}
          <Route path="admin/users" element={<UsersAdminPage />} />
        </Route>

        {/* Editor route - full screen, outside AppLayout */}
        <Route
          path="app/editor"
          element={
            <ProtectedRoute>
              <PuckEditorPage />
            </ProtectedRoute>
          }
        />

        {/* Store Preview */}
        <Route
          path="app/store/:slug/preview"
          element={
            <ProtectedRoute>
              <StorePreviewPage />
            </ProtectedRoute>
          }
        />

        {/* Catch all */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}
