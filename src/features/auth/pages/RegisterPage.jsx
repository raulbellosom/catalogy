import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Shield,
} from "lucide-react";
import { Button } from "@/shared/ui/atoms/Button";
import { Input } from "@/shared/ui/atoms/Input";
import { useAuth } from "@/app/providers";
import { account } from "@/shared/lib/appwrite";
import { ID } from "appwrite";

/**
 * Validate email format
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Check password strength
 */
function getPasswordStrength(password) {
  if (!password) return { score: 0, text: "", color: "" };

  let score = 0;
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  if (checks.length) score++;
  if (checks.lowercase) score++;
  if (checks.uppercase) score++;
  if (checks.number) score++;
  if (checks.special) score++;

  if (score <= 2)
    return {
      score,
      text: "Debil",
      color: "text-red-500",
      bgColor: "bg-red-500",
    };
  if (score === 3)
    return {
      score,
      text: "Media",
      color: "text-yellow-500",
      bgColor: "bg-yellow-500",
    };
  if (score === 4)
    return {
      score,
      text: "Buena",
      color: "text-blue-500",
      bgColor: "bg-blue-500",
    };
  return {
    score,
    text: "Excelente",
    color: "text-green-500",
    bgColor: "bg-green-500",
  };
}

/**
 * Register page with enhanced validation and modern design
 */
export function RegisterPage() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);

  const passwordStrength = getPasswordStrength(password);
  const isEmailValid = isValidEmail(email);
  const passwordsMatch =
    password === confirmPassword && confirmPassword.length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validations
    if (firstName.trim().length < 2) {
      setError("El nombre debe tener al menos 2 caracteres.");
      return;
    }
    if (lastName.trim().length < 2) {
      setError("El apellido debe tener al menos 2 caracteres.");
      return;
    }
    if (!isEmailValid) {
      setError("Por favor ingresa un correo electronico valido.");
      return;
    }
    if (password.length < 8) {
      setError("La contrasena debe tener al menos 8 caracteres.");
      return;
    }
    if (passwordStrength.score < 3) {
      setError(
        "La contrasena es muy debil. Incluye mayusculas, numeros y caracteres especiales.",
      );
      return;
    }
    if (password !== confirmPassword) {
      setError("Las contrasenas no coinciden.");
      return;
    }
    if (!acceptTerms) {
      setError("Debes aceptar los terminos y condiciones para continuar.");
      return;
    }

    setIsLoading(true);

    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`;
      // Create account
      await account.create(ID.unique(), email, password, fullName);
      // Create session
      await account.createEmailPasswordSession(email, password);
      await refreshUser();
      navigate("/app", { replace: true });
    } catch (err) {
      console.error("Register error:", err);
      if (err.code === 409) {
        setError("Ya existe una cuenta con este correo electronico.");
      } else {
        setError("Error al crear la cuenta. Intenta de nuevo.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Header con gradiente y efecto brillante */}
      <div className="mb-4 sm:mb-5 relative">
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-[var(--color-primary)] opacity-20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div
          className="absolute -top-10 -right-20 w-32 h-32 bg-[var(--color-accent)] opacity-20 rounded-full blur-3xl animate-pulse-slow"
          style={{ animationDelay: "1s" }}
        ></div>

        <div className="relative">
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--color-primary)] animate-pulse" />
            <span className="text-xs sm:text-sm font-medium text-[var(--color-primary)] uppercase tracking-wide">
              Registro
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-fg)] mb-2 bg-gradient-to-r from-[var(--color-fg)] to-[var(--color-fg-secondary)] bg-clip-text">
            Crea tu cuenta
          </h1>
          <p className="text-[var(--color-fg-secondary)] text-sm sm:text-base">
            Empieza a crear tu catalogo hoy
          </p>
        </div>
      </div>

      {/* Error con animación */}
      {error && (
        <div className="mb-4 p-3 bg-gradient-to-r from-red-500/10 to-red-600/10 border border-red-500/30 rounded-xl text-red-600 dark:text-red-400 text-sm backdrop-blur-sm animate-shake">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Nombre y Apellido */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative group">
            <Input
              type="text"
              label="Nombre"
              placeholder="Juan"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              minLength={2}
              autoComplete="given-name"
              className="transition-all duration-300 group-hover:border-[var(--color-primary)]/50"
            />
            <User className="absolute right-4 top-[38px] w-5 h-5 text-[var(--color-fg-muted)] transition-colors group-hover:text-[var(--color-primary)]" />
          </div>

          <div className="relative group">
            <Input
              type="text"
              label="Apellido"
              placeholder="Perez"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              minLength={2}
              autoComplete="family-name"
              className="transition-all duration-300 group-hover:border-[var(--color-primary)]/50"
            />
            <User className="absolute right-4 top-[38px] w-5 h-5 text-[var(--color-fg-muted)] transition-colors group-hover:text-[var(--color-primary)]" />
          </div>
        </div>

        {/* Email con validación visual */}
        <div className="relative group">
          <Input
            type="email"
            label="Correo electronico"
            placeholder="tu@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setEmailTouched(true)}
            required
            autoComplete="email"
            className={`transition-all duration-300 ${
              emailTouched && email
                ? isEmailValid
                  ? "border-green-500/50"
                  : "border-red-500/50"
                : "group-hover:border-[var(--color-primary)]/50"
            }`}
          />
          <div className="absolute right-4 top-[38px]">
            {emailTouched && email ? (
              isEmailValid ? (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-500" />
              )
            ) : (
              <Mail className="w-5 h-5 text-[var(--color-fg-muted)] transition-colors group-hover:text-[var(--color-primary)]" />
            )}
          </div>
        </div>

        {/* Password con indicador de fortaleza */}
        <div className="relative group">
          <Input
            type={showPassword ? "text" : "password"}
            label="Contrasena"
            placeholder="Minimo 8 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
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

          {/* Password strength indicator */}
          {password && (
            <div className="mt-2 space-y-2">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((level) => (
                  <div
                    key={level}
                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      level <= passwordStrength.score
                        ? passwordStrength.bgColor
                        : "bg-gray-200 dark:bg-gray-700"
                    }`}
                  />
                ))}
              </div>
              <p className={`text-xs font-medium ${passwordStrength.color}`}>
                Fortaleza: {passwordStrength.text}
              </p>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div className="relative group">
          <Input
            type={showConfirmPassword ? "text" : "password"}
            label="Confirmar contrasena"
            placeholder="Repite tu contrasena"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
            className={`transition-all duration-300 ${
              confirmPassword
                ? passwordsMatch
                  ? "border-green-500/50"
                  : "border-red-500/50"
                : "group-hover:border-[var(--color-primary)]/50"
            }`}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-4 top-[38px] text-[var(--color-fg-muted)] hover:text-[var(--color-primary)] transition-all duration-300 hover:scale-110"
            aria-label={
              showConfirmPassword ? "Ocultar contrasena" : "Mostrar contrasena"
            }
          >
            {showConfirmPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>

          {confirmPassword && (
            <p
              className={`mt-2 text-xs font-medium ${passwordsMatch ? "text-green-500" : "text-red-500"}`}
            >
              {passwordsMatch ? (
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Las contrasenas coinciden
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Las contrasenas no
                  coinciden
                </span>
              )}
            </p>
          )}
        </div>

        {/* Términos y condiciones */}
        <div className="relative">
          <label className="flex items-start gap-2.5 p-3 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-primary)]/50 transition-all duration-300 cursor-pointer group bg-[var(--color-bg)]/50">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              required
              className="mt-0.5 w-4 h-4 rounded border-gray-300 text-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/50 cursor-pointer flex-shrink-0"
            />
            <span className="text-xs sm:text-sm text-[var(--color-fg-secondary)] flex-1 leading-relaxed">
              <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 inline mr-1 text-[var(--color-primary)]" />
              Acepto los{" "}
              <Link
                to="/legal/terms"
                target="_blank"
                className="text-[var(--color-primary)] hover:underline font-medium"
                onClick={(e) => e.stopPropagation()}
              >
                Terminos y Condiciones
              </Link>{" "}
              y el{" "}
              <Link
                to="/legal/privacy"
                target="_blank"
                className="text-[var(--color-primary)] hover:underline font-medium"
                onClick={(e) => e.stopPropagation()}
              >
                Aviso de Privacidad
              </Link>
            </span>
          </label>
        </div>

        {/* Botón con gradiente y animación */}
        <Button
          type="submit"
          isLoading={isLoading}
          disabled={!acceptTerms}
          className="w-full mt-4 relative overflow-hidden group bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-hover)] hover:shadow-lg hover:shadow-[var(--color-primary)]/30 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {!isLoading && "Crear cuenta"}
            {!isLoading && (
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            )}
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
        </Button>
      </form>

      {/* Footer con separador decorativo */}
      <div className="mt-4 sm:mt-5">
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
          Ya tienes cuenta?{" "}
          <Link
            to="/auth/login"
            className="text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] font-semibold hover:underline transition-all inline-flex items-center gap-1 group"
          >
            Inicia sesion
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
