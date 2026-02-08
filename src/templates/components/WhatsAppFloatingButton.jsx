import { MessageCircle } from "lucide-react";

export function WhatsAppFloatingButton({
  phoneNumber,
  message = "Hola! Quisiera más información.",
  tone = "light",
}) {
  if (!phoneNumber) return null;

  const handleClick = () => {
    const cleanNumber = phoneNumber.replace(/\D/g, "");
    const encodedMessage = encodeURIComponent(message);
    window.open(
      `https://wa.me/${cleanNumber}?text=${encodedMessage}`,
      "_blank",
    );
  };

  const isDark = tone === "dark";

  return (
    <button
      onClick={handleClick}
      className={`fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
        isDark ? "focus:ring-offset-black" : "focus:ring-offset-white"
      } bg-[#25D366] hover:bg-[#20bd5a] text-white`}
      aria-label="Contactar por WhatsApp"
      title="Contactar por WhatsApp"
    >
      <MessageCircle size={32} strokeWidth={2} />
    </button>
  );
}
