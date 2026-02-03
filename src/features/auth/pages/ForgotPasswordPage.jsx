import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/shared/ui/atoms/Button";
import { Input } from "@/shared/ui/atoms/Input";
import { account } from "@/shared/lib/appwrite";
import { useToast } from "@/shared/ui/molecules";

/**
 * Forgot password page
 */
export function ForgotPasswordPage() {
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // TODO: Update with actual recovery URL
      await account.createRecovery(
        email,
        `${window.location.origin}/auth/reset-password`,
      );
      setIsSuccess(true);
    } catch (err) {
      console.error("Recovery error:", err);
      toast.error(
        "Error al enviar el correo. Verifica tu direccion e intenta de nuevo.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-[var(--color-success-bg)] rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-[var(--color-success)]" />
        </div>
        <h1 className="text-2xl font-bold text-[var(--color-fg)] mb-2">
          Correo enviado
        </h1>
        <p className="text-[var(--color-fg-secondary)] mb-6">
          Revisa tu bandeja de entrada en <strong>{email}</strong> y sigue las
          instrucciones para restablecer tu contrasena.
        </p>
        <Link to="/auth/login">
          <Button variant="secondary" className="w-full">
            <ArrowLeft className="w-5 h-5" />
            Volver al inicio de sesion
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--color-fg)] mb-2">
        Recuperar contrasena
      </h1>
      <p className="text-[var(--color-fg-secondary)] mb-6">
        Ingresa tu correo y te enviaremos instrucciones para restablecer tu
        contrasena.
      </p>

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

        <Button type="submit" isLoading={isLoading} className="w-full">
          Enviar instrucciones
        </Button>
      </form>

      <p className="mt-6 text-center">
        <Link
          to="/auth/login"
          className="text-[var(--color-primary)] hover:underline inline-flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio de sesion
        </Link>
      </p>
    </div>
  );
}
