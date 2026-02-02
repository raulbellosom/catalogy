import { Link } from "react-router-dom";
import {
  FileQuestion,
  Home,
  ArrowLeft,
  Mail,
  HelpCircle,
  ServerCrash,
  ShieldAlert,
  Lock,
} from "lucide-react";
import { Button } from "@/shared/ui/atoms/Button";
import { useEffect, useState } from "react";

/**
 * Error page with animations and support for different error types
 * @param {Object} props
 * @param {number} props.code - Error code (404, 500, 403, etc.)
 * @param {string} props.message - Custom error message
 */
export function NotFoundPage({ code = 404, message = null }) {
  const [floatingElements, setFloatingElements] = useState([]);

  // Generate floating background elements
  useEffect(() => {
    const elements = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      size: Math.random() * 60 + 40,
      left: Math.random() * 100,
      animationDelay: Math.random() * 5,
      duration: Math.random() * 10 + 15,
    }));
    setFloatingElements(elements);
  }, []);

  // Error configurations
  const errorConfigs = {
    404: {
      icon: FileQuestion,
      title: "Página no encontrada",
      description:
        "Ups, parece que esta página no existe o fue movida a otra ubicación.",
      gradient: "from-purple-400 to-purple-600",
      bgGradient: "from-purple-50 to-blue-50",
    },
    403: {
      icon: Lock,
      title: "Acceso denegado",
      description: "No tienes permisos para acceder a esta página.",
      gradient: "from-red-400 to-red-600",
      bgGradient: "from-red-50 to-orange-50",
    },
    500: {
      icon: ServerCrash,
      title: "Error del servidor",
      description:
        "Algo salió mal en nuestros servidores. Estamos trabajando para solucionarlo.",
      gradient: "from-orange-400 to-orange-600",
      bgGradient: "from-orange-50 to-yellow-50",
    },
    401: {
      icon: ShieldAlert,
      title: "No autorizado",
      description: "Necesitas iniciar sesión para acceder a esta página.",
      gradient: "from-yellow-400 to-yellow-600",
      bgGradient: "from-yellow-50 to-amber-50",
    },
  };

  const config = errorConfigs[code] || errorConfigs[404];
  const Icon = config.icon;

  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${config.bgGradient} dark:from-gray-900 dark:to-gray-800 relative overflow-hidden flex items-center justify-center p-6`}
    >
      {/* Floating background elements */}
      {floatingElements.map((element) => (
        <div
          key={element.id}
          className={`absolute rounded-full bg-gradient-to-br ${config.gradient} opacity-10 dark:opacity-5 blur-3xl`}
          style={{
            width: `${element.size}px`,
            height: `${element.size}px`,
            left: `${element.left}%`,
            animation: `float ${element.duration}s ease-in-out infinite`,
            animationDelay: `${element.animationDelay}s`,
          }}
        />
      ))}

      {/* Main content */}
      <div className="relative z-10 max-w-2xl w-full">
        {/* Error code with animation */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            {/* Background circle with pulse animation */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${config.gradient} rounded-full opacity-20 blur-2xl animate-pulse`}
              style={{ transform: "scale(1.5)" }}
            />

            {/* Main circle */}
            <div className="relative bg-white dark:bg-gray-800 rounded-full w-48 h-48 flex items-center justify-center shadow-2xl mx-auto mb-6 animate-bounce-slow">
              <span
                className={`text-7xl font-bold bg-gradient-to-br ${config.gradient} bg-clip-text text-transparent`}
              >
                {code}
              </span>
            </div>

            {/* Icon badge */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-800 rounded-full p-4 shadow-xl animate-float">
              <Icon
                className={`w-8 h-8 text-purple-500 dark:text-purple-400`}
              />
            </div>
          </div>
        </div>

        {/* Text content */}
        <div className="text-center space-y-4 mb-10">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            {config.title}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-md mx-auto">
            {message || config.description}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <Link to="/">
            <Button
              className={`bg-gradient-to-r ${config.gradient} text-white hover:shadow-lg transition-all duration-300 hover:scale-105`}
            >
              <Home className="w-5 h-5 mr-2" />
              Ir al inicio
            </Button>
          </Link>

          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-6 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 transition-all duration-300 hover:shadow-md"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver atrás
          </button>
        </div>

        {/* Additional help section */}
        <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-start gap-4 text-sm text-gray-600 dark:text-gray-300">
            <HelpCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium mb-2">¿Necesitas ayuda?</p>
              <Link
                to="/contact"
                className="text-purple-600 dark:text-purple-400 hover:underline inline-flex items-center gap-1"
              >
                <Mail className="w-4 h-4" />
                Contacta al soporte
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* CSS animations */}
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0) rotate(0deg);
          }
          25% {
            transform: translateY(-20px) rotate(5deg);
          }
          50% {
            transform: translateY(-40px) rotate(0deg);
          }
          75% {
            transform: translateY(-20px) rotate(-5deg);
          }
        }

        @keyframes bounce-slow {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
