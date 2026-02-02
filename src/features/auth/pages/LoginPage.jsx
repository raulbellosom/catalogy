import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/shared/ui/atoms/Button";
import { Input } from "@/shared/ui/atoms/Input";
import { useAuth } from "@/app/providers";
import { account } from "@/shared/lib/appwrite";

/**
 * Login page
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
    <div>
      <h1 className="text-2xl font-bold text-[var(--color-fg)] mb-2">
        Bienvenido de vuelta
      </h1>
      <p className="text-[var(--color-fg-secondary)] mb-6">
        Inicia sesion para acceder a tu catalogo
      </p>

      {error && (
        <div className="mb-4 p-3 bg-[var(--color-error-bg)] border border-[var(--color-error)] rounded-lg text-[var(--color-error)] text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Input
            type="email"
            label="Correo electronico"
            placeholder="tu@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <Mail className="absolute right-4 top-[38px] w-5 h-5 text-[var(--color-fg-muted)]" />
        </div>

        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            label="Contrasena"
            placeholder="Tu contrasena"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-[38px] text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"
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
            className="text-sm text-[var(--color-primary)] hover:underline"
          >
            Olvidaste tu contrasena?
          </Link>
        </div>

        <Button type="submit" isLoading={isLoading} className="w-full">
          Iniciar sesion
        </Button>
      </form>

      <p className="mt-6 text-center text-[var(--color-fg-secondary)]">
        No tienes cuenta?{" "}
        <Link
          to="/auth/register"
          className="text-[var(--color-primary)] hover:underline"
        >
          Registrate
        </Link>
      </p>
    </div>
  );
}
