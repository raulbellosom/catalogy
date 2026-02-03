import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/shared/ui/atoms/Button";
import { Input } from "@/shared/ui/atoms/Input";
import { useAuth } from "@/app/providers";
import { account, databases, functions } from "@/shared/lib/appwrite";
import { DATABASE_ID, COLLECTION_PROFILES_ID } from "@/shared/lib/env";
import { functions as functionIds } from "@/shared/lib/env";
import { useToast } from "@/shared/ui/molecules";

/**
 * Login page with modern design and animations
 */
export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshUser } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState("");
  const [resendCountdown, setResendCountdown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const toast = useToast();

  // Get redirect destination from state or default to /app
  const from = location.state?.from?.pathname || "/app";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // First, create session
      const session = await account.createEmailPasswordSession(email, password);

      // Check if email is verified
      const profile = await databases.getDocument(
        DATABASE_ID,
        COLLECTION_PROFILES_ID,
        session.userId,
      );

      if (!profile.emailVerified) {
        // Logout the session we just created
        await account.deleteSession("current");

        setUnverifiedEmail(email);
        setResendCountdown(120); // 2 minutes
        toast.error(
          "Tu correo aún no está verificado. " +
            "Por favor revisa tu bandeja de entrada.",
          "Verificación requerida",
        );
        setIsLoading(false);
        return;
      }

      // Email is verified, proceed with login
      await refreshUser();
      navigate(from, { replace: true });
    } catch (err) {
      console.error("Login error:", err);
      if (err.code === 401) {
        toast.error("Credenciales invalidas. Verifica tu correo y contrasena.");
      } else {
        toast.error("Error al iniciar sesión. Intenta de nuevo.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Countdown timer for resend email
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => {
        setResendCountdown(resendCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  const handleResendEmail = async () => {
    if (resendCountdown > 0 || !unverifiedEmail) return;

    setIsResending(true);
    try {
      await functions.createExecution(
        functionIds.emailVerification,
        JSON.stringify({
          action: "send",
          email: unverifiedEmail,
        }),
        false,
      );

      toast.success(
        "Correo de verificación reenviado. Revisa tu bandeja de entrada.",
        "Email enviado",
      );
      setResendCountdown(120); // Reset countdown
    } catch (err) {
      console.error("Resend email error:", err);
      toast.error(
        "No se pudo reenviar el correo. Intenta de nuevo más tarde.",
        "Error",
      );
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Header con gradiente y efecto brillante */}
      <div className="mb-5 sm:mb-6 relative overflow-hidden">
        {/* Efectos de fondo decorativos responsivos */}
        <div className="absolute -top-10 left-4 sm:-left-10 w-20 sm:w-40 h-20 sm:h-40 bg-[var(--color-primary)] opacity-20 rounded-full blur-2xl sm:blur-3xl animate-pulse-slow"></div>
        <div
          className="absolute -top-5 right-4 sm:-right-10 w-16 sm:w-32 h-16 sm:h-32 bg-[var(--color-accent)] opacity-20 rounded-full blur-2xl sm:blur-3xl animate-pulse-slow"
          style={{ animationDelay: "1s" }}
        ></div>

        <div className="relative">
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--color-primary)] animate-pulse" />
            <span className="text-xs sm:text-sm font-medium text-[var(--color-primary)] uppercase tracking-wide">
              Acceso
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-fg)] mb-2 bg-gradient-to-r from-[var(--color-fg)] to-[var(--color-fg-secondary)] bg-clip-text">
            Bienvenido de vuelta
          </h1>
          <p className="text-[var(--color-fg-secondary)] text-sm sm:text-base">
            Inicia sesion para acceder a tu catalogo
          </p>
        </div>
      </div>

      {/* Resend email verification card */}
      {unverifiedEmail && (
        <div className="mb-4 relative overflow-hidden p-4 bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent border border-blue-500/30 rounded-xl backdrop-blur-sm">
          {/* Decorative element */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>

          <div className="relative space-y-3">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 shrink-0 text-blue-500 dark:text-blue-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-[var(--color-fg)] mb-1">
                  ¿No recibiste el correo de verificación?
                </p>
                <p className="text-xs text-[var(--color-fg-secondary)]">
                  Revisa tu carpeta de spam o solicita un nuevo correo
                </p>
              </div>
            </div>

            <Button
              type="button"
              onClick={handleResendEmail}
              disabled={resendCountdown > 0 || isResending}
              variant="outline"
              size="sm"
              className="w-full relative overflow-hidden group transition-all hover:border-blue-500/50"
            >
              {isResending ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  Enviando...
                </span>
              ) : resendCountdown > 0 ? (
                <span className="flex items-center gap-2">
                  <span className="text-xs opacity-70">Disponible en</span>
                  <span className="font-mono font-semibold text-blue-500">
                    {Math.floor(resendCountdown / 60)}:
                    {String(resendCountdown % 60).padStart(2, "0")}
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
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email input con efecto hover mejorado */}
        <div className="relative group">
          <Input
            type="email"
            label="Correo electronico"
            placeholder="tu@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="transition-all duration-300 group-hover:border-[var(--color-primary)]/50"
          />
          <Mail className="absolute right-4 top-[38px] w-5 h-5 text-[var(--color-fg-muted)] transition-colors group-hover:text-[var(--color-primary)]" />
        </div>

        {/* Password input con efecto hover mejorado */}
        <div className="relative group">
          <Input
            type={showPassword ? "text" : "password"}
            label="Contrasena"
            placeholder="Tu contrasena"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="transition-all duration-300 group-hover:border-[var(--color-primary)]/50"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-[38px] text-[var(--color-fg-muted)] hover:text-[var(--color-primary)] transition-all duration-300 hover:scale-110"
            aria-label={
              showPassword ? "Ocultar contrasena" : "Mostrar contrasena"
            }
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>

        <div className="text-right">
          <Link
            to="/auth/forgot-password"
            className="text-sm text-[var(--color-primary)] hover:underline hover:text-[var(--color-primary-hover)] transition-all inline-flex items-center gap-1 group"
          >
            Olvidaste tu contrasena?
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Botón con gradiente y animación */}
        <Button
          type="submit"
          isLoading={isLoading}
          className="w-full relative overflow-hidden group bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-hover)] hover:shadow-lg hover:shadow-[var(--color-primary)]/30 transition-all duration-300 hover:scale-[1.02]"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {!isLoading && "Iniciar sesion"}
            {!isLoading && (
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            )}
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
        </Button>
      </form>

      {/* Footer con separador decorativo */}
      <div className="mt-5 sm:mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[var(--color-border)]"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[var(--color-card)] px-3 text-[var(--color-fg-muted)]">
              o
            </span>
          </div>
        </div>

        <p className="mt-4 text-center text-sm text-[var(--color-fg-secondary)]">
          No tienes cuenta?{" "}
          <Link
            to="/auth/register"
            className="text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] font-semibold hover:underline transition-all inline-flex items-center gap-1 group"
          >
            Registrate aqui
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </Link>
        </p>
      </div>

      {/* Estilos para animaciones */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.2;
          }
          50% {
            opacity: 0.3;
          }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}
