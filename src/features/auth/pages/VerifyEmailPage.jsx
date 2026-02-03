import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/shared/ui/atoms/Button";
import { functions } from "@/shared/lib/appwrite";
import { functions as functionIds } from "@/shared/lib/env";

/**
 * Email verification page
 * Receives token from URL and verifies it with the backend
 */
export function VerifyEmailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [isVerifying, setIsVerifying] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setError("Token de verificación no encontrado en la URL.");
        setIsVerifying(false);
        return;
      }

      try {
        const response = await functions.createExecution(
          functionIds.emailVerification,
          JSON.stringify({
            action: "verify",
            token: token,
          }),
          false,
        );

        const result = JSON.parse(response.responseBody);

        if (result.ok) {
          setIsSuccess(true);
          setError("");
        } else {
          setError(result.error || "Error al verificar el correo.");
          setIsSuccess(false);
        }
      } catch (err) {
        console.error("Verification error:", err);
        setError("Error al verificar el correo. Por favor intenta de nuevo.");
        setIsSuccess(false);
      } finally {
        setIsVerifying(false);
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--color-bg)]">
      <div className="w-full max-w-md mx-auto">
        <div className="relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-lg">
          {/* Background decoration */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-accent)] to-[var(--color-primary)]"></div>

          <div className="p-6 sm:p-8 min-h-[300px] flex items-center justify-center">
            <div className="w-full max-w-sm mx-auto">
              {/* Loading state */}
              {isVerifying && (
                <div className="text-center space-y-6 py-4">
                  <div className="relative inline-block">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-blue-500/10 flex items-center justify-center">
                      <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 text-blue-500 animate-spin" />
                    </div>
                    <div className="absolute inset-0 rounded-full bg-blue-500/10 blur-sm"></div>
                  </div>

                  <div className="space-y-2">
                    <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-fg)]">
                      Verificando tu correo
                    </h1>
                    <p className="text-sm text-[var(--color-fg-secondary)]">
                      Por favor espera un momento...
                    </p>
                  </div>
                </div>
              )}

              {/* Success state */}
              {!isVerifying && isSuccess && (
                <div className="text-center space-y-6 py-4">
                  <div className="relative inline-block">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-green-500/10 flex items-center justify-center animate-scale-in">
                      <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 text-green-500" />
                    </div>
                    <div className="absolute inset-0 rounded-full bg-green-500/10 blur-sm"></div>
                  </div>

                  <div className="space-y-2">
                    <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-fg)]">
                      ¡Correo verificado!
                    </h1>
                    <p className="text-sm text-[var(--color-fg-secondary)]">
                      Tu correo ha sido verificado exitosamente. Ahora puedes
                      iniciar sesión.
                    </p>
                  </div>

                  <Button
                    onClick={() => navigate("/auth/login")}
                    className="w-full"
                  >
                    Ir a iniciar sesión
                  </Button>
                </div>
              )}

              {/* Error state */}
              {!isVerifying && !isSuccess && (
                <div className="text-center space-y-6 py-4">
                  <div className="relative inline-block">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-500/10 flex items-center justify-center">
                      <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 text-red-500" />
                    </div>
                    <div className="absolute inset-0 rounded-full bg-red-500/10 blur-sm"></div>
                  </div>

                  <div className="space-y-3">
                    <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-fg)]">
                      Error al verificar
                    </h1>
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {error}
                    </p>
                    <p className="text-xs text-[var(--color-fg-muted)]">
                      El enlace puede haber expirado o ya fue usado.
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={() => navigate("/auth/login")}
                      variant="outline"
                      className="w-full"
                    >
                      Ir a iniciar sesión
                    </Button>
                    <Button
                      onClick={() => navigate("/auth/register")}
                      variant="ghost"
                      className="w-full"
                    >
                      Registrarse de nuevo
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <style>{`
        @keyframes scale-in {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        .animate-scale-in {
          animation: scale-in 0.5s ease-out;
        }
      `}</style>
        </div>
      </div>
    </div>
  );
}
