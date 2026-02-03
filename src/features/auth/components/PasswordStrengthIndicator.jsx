import { CheckCircle2, AlertCircle } from "lucide-react";

/**
 * Check password strength
 */
export function getPasswordStrength(password) {
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

export function PasswordStrengthIndicator({ password }) {
  const strength = getPasswordStrength(password);

  if (!password) return null;

  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              level <= strength.score
                ? strength.bgColor
                : "bg-gray-200 dark:bg-gray-700"
            }`}
          />
        ))}
      </div>
      <p className={`text-xs font-medium ${strength.color}`}>
        Fortaleza: {strength.text}
      </p>
    </div>
  );
}

export function PasswordMatchIndicator({ match }) {
  if (match === null) return null;

  return (
    <p
      className={`mt-2 text-xs font-medium ${match ? "text-green-500" : "text-red-500"}`}
    >
      {match ? (
        <span className="flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" /> Las contrasenas coinciden
        </span>
      ) : (
        <span className="flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> Las contrasenas no coinciden
        </span>
      )}
    </p>
  );
}
