import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
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
import { account, functions } from "@/shared/lib/appwrite";
import { functions as functionIds } from "@/shared/lib/env";
import { useToast } from "@/shared/ui/molecules";
import { ID } from "appwrite";
import {
  PasswordStrengthIndicator,
  getPasswordStrength,
  PasswordMatchIndicator,
} from "../components/PasswordStrengthIndicator";
import { RegisterSuccessModal } from "../components/RegisterSuccessModal";

/**
 * Validate email format
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Register page with enhanced validation and modern design
 */
export function RegisterPage() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const toast = useToast();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const passwordStrength = getPasswordStrength(password);
  const isEmailValid = isValidEmail(email);
  const passwordsMatch =
    password === confirmPassword && confirmPassword.length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validations
    if (firstName.trim().length < 2) {
      toast.error("El nombre debe tener al menos 2 caracteres.");
      return;
    }
    if (lastName.trim().length < 2) {
      toast.error("El apellido debe tener al menos 2 caracteres.");
      return;
    }
    if (!isEmailValid) {
      toast.error("Por favor ingresa un correo electronico valido.");
      return;
    }
    if (password.length < 8) {
      toast.error("La contrasena debe tener al menos 8 caracteres.");
      return;
    }
    if (passwordStrength.score < 3) {
      toast.error(
        "La contrasena es muy debil. Incluye mayusculas, numeros y caracteres especiales.",
      );
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Las contrasenas no coinciden.");
      return;
    }
    if (!acceptTerms) {
      toast.error("Debes aceptar los terminos y condiciones para continuar.");
      return;
    }

    setIsLoading(true);

    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`;

      // Create account
      const user = await account.create(ID.unique(), email, password, fullName);

      // Manually trigger onUserCreated function (since it's not configured as event trigger)
      // This creates the profile and sends verification email
      try {
        await functions.createExecution(
          functionIds.onUserCreated,
          JSON.stringify({ userId: user.$id }),
          false, // wait for response
        );
      } catch (fnErr) {
        console.error("Error triggering onUserCreated:", fnErr);
        // Continue anyway - user can login and profile will be created on first login
      }

      // DO NOT create session automatically
      // User must verify email first

      // Show success modal
      setShowSuccessModal(true);
      setIsLoading(false);
    } catch (err) {
      console.error("Register error:", err);
      if (err.code === 409) {
        toast.error("Ya existe una cuenta con este correo electronico.");
      } else {
        toast.error("Error al crear la cuenta. Intenta de nuevo.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigateSuccess = () => {
    setShowSuccessModal(false);
    navigate("/auth/login", { replace: true });
  };

  return (
    <div className="animate-fade-in">
      {/* Header con gradiente y efecto brillante */}
      <div className="mb-4 sm:mb-5 relative overflow-hidden">
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

          <PasswordStrengthIndicator password={password} />
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

          {confirmPassword && <PasswordMatchIndicator match={passwordsMatch} />}
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

      <RegisterSuccessModal
        isOpen={showSuccessModal}
        onClose={handleNavigateSuccess}
        onNavigate={handleNavigateSuccess}
      />
    </div>
  );
}
