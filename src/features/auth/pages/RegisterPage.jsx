import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, User } from "lucide-react";
import { Button } from "@/shared/ui/atoms/Button";
import { Input } from "@/shared/ui/atoms/Input";
import { useAuth } from "@/app/providers";
import { account } from "@/shared/lib/appwrite";
import { ID } from "appwrite";

/**
 * Register page
 */
export function RegisterPage() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

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
    if (password.length < 8) {
      setError("La contrasena debe tener al menos 8 caracteres.");
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
    <div>
      <h1 className="text-2xl font-bold text-[var(--color-fg)] mb-2">
        Crea tu cuenta
      </h1>
      <p className="text-[var(--color-fg-secondary)] mb-6">
        Empieza a crear tu catalogo hoy
      </p>

      {error && (
        <div className="mb-4 p-3 bg-[var(--color-error-bg)] border border-[var(--color-error)] rounded-lg text-[var(--color-error)] text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative">
            <Input
              type="text"
              label="Nombre"
              placeholder="Juan"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              minLength={2}
              autoComplete="given-name"
            />
            <User className="absolute right-4 top-[38px] w-5 h-5 text-[var(--color-fg-muted)]" />
          </div>

          <div className="relative">
            <Input
              type="text"
              label="Apellido"
              placeholder="Perez"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              minLength={2}
              autoComplete="family-name"
            />
            <User className="absolute right-4 top-[38px] w-5 h-5 text-[var(--color-fg-muted)]" />
          </div>
        </div>

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
            placeholder="Minimo 8 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
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

        <Button type="submit" isLoading={isLoading} className="w-full">
          Crear cuenta
        </Button>
      </form>

      <p className="mt-6 text-center text-[var(--color-fg-secondary)]">
        Ya tienes cuenta?{" "}
        <Link
          to="/auth/login"
          className="text-[var(--color-primary)] hover:underline"
        >
          Inicia sesion
        </Link>
      </p>
    </div>
  );
}
