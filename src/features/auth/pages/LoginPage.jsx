import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/shared/ui/atoms/Button";
import { Input } from "@/shared/ui/atoms/Input";
import { useAuth } from "@/app/providers";
import { account } from "@/shared/lib/appwrite";

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
  const [error, setError] = useState("");

  // Get redirect destination from state or default to /app
  const from = location.state?.from?.pathname || "/app";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await account.createEmailPasswordSession(email, password);
      await refreshUser();
      navigate(from, { replace: true });
    } catch (err) {
      console.error("Login error:", err);
      setError("Credenciales invalidas. Verifica tu correo y contrasena.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Header con gradiente y efecto brillante */}
      <div className="mb-5 sm:mb-6 relative">
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-[var(--color-primary)] opacity-20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div
          className="absolute -top-10 -right-20 w-32 h-32 bg-[var(--color-accent)] opacity-20 rounded-full blur-3xl animate-pulse-slow"
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

      {/* Error con animación */}
      {error && (
        <div className="mb-4 p-3 bg-gradient-to-r from-red-500/10 to-red-600/10 border border-red-500/30 rounded-xl text-red-600 dark:text-red-400 text-sm backdrop-blur-sm animate-shake">
          <div className="flex items-start gap-2">
            <span className="text-lg">⚠️</span>
            <p>{error}</p>
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
