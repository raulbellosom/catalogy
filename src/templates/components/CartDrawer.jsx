import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Trash2, ShoppingBag, Share2, MessageCircle } from "lucide-react";
import { getProductImageUrl } from "@/shared/services/productService";

const formatPrice = (price, currency = "MXN") => {
  if (typeof price !== "number") return "";
  return price.toLocaleString("es-MX", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

export const CartDrawer = ({
  isOpen,
  onClose,
  cart,
  onRemove,
  onUpdateQty,
  onShareCart,
  onWhatsAppCheckout,
  storeName,
  whatsappNumber,
  tone = "light", // default to light theme
}) => {
  const total = cart.reduce((acc, item) => {
    const price = item.product?.price || 0;
    return acc + price * item.quantity;
  }, 0);

  // Theme styles based on tone
  const isDark = tone === "noir" || tone === "dark";
  const styles = {
    drawer: isDark ? "bg-[#0a0a0a]" : "bg-white",
    header: isDark
      ? "bg-[#111111] border-gray-800"
      : "bg-gray-50 border-gray-200",
    headerText: isDark ? "text-white" : "text-gray-900",
    badge: isDark ? "bg-white text-black" : "bg-black text-white",
    closeBtn: isDark
      ? "hover:bg-gray-800 text-gray-400 hover:text-white"
      : "hover:bg-gray-200 text-gray-600",
    emptyText: isDark ? "text-gray-500" : "text-gray-400",
    emptyIcon: isDark ? "text-gray-700" : "text-gray-300",
    emptyLink: isDark ? "text-blue-400 hover:text-blue-300" : "text-blue-600",
    itemCard: isDark
      ? "bg-[#111111] border-gray-800"
      : "bg-white border-gray-200",
    itemText: isDark ? "text-white" : "text-gray-900",
    itemPrice: isDark ? "text-white" : "text-gray-900",
    imgBg: isDark ? "bg-gray-800" : "bg-gray-100",
    imgPlaceholder: isDark ? "text-gray-600" : "text-gray-300",
    qtyBtn: isDark
      ? "hover:bg-gray-800 text-gray-400 border-gray-700"
      : "hover:bg-gray-100 text-gray-600 border-gray-300",
    qtyText: isDark ? "text-white" : "text-gray-900",
    deleteBtn: isDark
      ? "text-red-400 hover:bg-red-950"
      : "text-red-500 hover:bg-red-50",
    footer: isDark
      ? "border-gray-800 bg-[#111111]"
      : "border-gray-200 bg-gray-50",
    footerText: isDark ? "text-white" : "text-gray-900",
    shareBtn: isDark
      ? "border-gray-700 bg-[#0a0a0a] hover:bg-gray-800 text-white"
      : "border-gray-300 bg-white hover:bg-gray-50 text-gray-900",
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`fixed inset-y-0 right-0 z-[160] w-full max-w-md shadow-2xl flex flex-col ${styles.drawer}`}
          >
            {/* Header */}
            <div
              className={`p-4 border-b flex items-center justify-between ${styles.header}`}
            >
              <h2
                className={`text-lg font-bold flex items-center gap-2 ${styles.headerText}`}
              >
                <ShoppingBag className="w-5 h-5" />
                Tu Carrito
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${styles.badge}`}
                >
                  {cart.length}
                </span>
              </h2>
              <button
                onClick={onClose}
                className={`p-2 rounded-full transition-colors ${styles.closeBtn}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {cart.length === 0 ? (
                <div
                  className={`h-full flex flex-col items-center justify-center space-y-4 ${styles.emptyText}`}
                >
                  <ShoppingBag
                    className={`w-16 h-16 opacity-20 ${styles.emptyIcon}`}
                  />
                  <p>Tu carrito está vacío</p>
                  <button
                    onClick={onClose}
                    className={`font-bold text-sm hover:underline ${styles.emptyLink}`}
                  >
                    Seguir comprando
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.id}
                    className={`flex gap-4 p-3 border rounded-xl shadow-sm ${styles.itemCard}`}
                  >
                    {/* Image */}
                    <div
                      className={`w-20 h-20 rounded-lg overflow-hidden shrink-0 ${styles.imgBg}`}
                    >
                      {item.product?.imageFileIds?.[0] ? (
                        <img
                          src={getProductImageUrl(item.product.imageFileIds[0])}
                          alt={item.product?.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div
                          className={`w-full h-full flex items-center justify-center ${styles.imgPlaceholder}`}
                        >
                          <ShoppingBag size={20} />
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <h3
                          className={`font-semibold text-sm line-clamp-1 ${styles.itemText}`}
                        >
                          {item.product?.name || "Producto desconocido"}
                        </h3>
                        <p
                          className={`text-sm font-bold mt-1 ${styles.itemPrice}`}
                        >
                          {formatPrice(item.product?.price)}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <div
                          className={`flex items-center border rounded-lg overflow-hidden ${isDark ? "border-gray-700" : "border-gray-300"}`}
                        >
                          <button
                            onClick={() => onUpdateQty(item.id, -1)}
                            className={`px-2 py-1 ${styles.qtyBtn}`}
                          >
                            -
                          </button>
                          <span
                            className={`px-2 text-sm font-bold min-w-[1.5rem] text-center ${styles.qtyText}`}
                          >
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQty(item.id, 1)}
                            className={`px-2 py-1 ${styles.qtyBtn}`}
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => onRemove(item.id)}
                          className={`p-1.5 rounded-lg transition-colors ${styles.deleteBtn}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className={`border-t p-4 space-y-4 ${styles.footer}`}>
                <div
                  className={`flex items-center justify-between text-lg font-bold ${styles.footerText}`}
                >
                  <span>Total:</span>
                  <span>{formatPrice(total)}</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={onShareCart}
                    className={`py-3 px-4 rounded-xl border font-bold text-sm flex items-center justify-center gap-2 transition-colors ${styles.shareBtn}`}
                  >
                    <Share2 size={18} />
                    Compartir Lista
                  </button>

                  <a
                    href={`https://wa.me/${whatsappNumber ? whatsappNumber.replace(/\D/g, "") : ""}?text=${onWhatsAppCheckout(storeName)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-3 px-4 rounded-xl bg-green-600 text-white hover:bg-green-700 font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-lg shadow-green-200"
                  >
                    <MessageCircle size={18} />
                    Enviar Pedido
                  </a>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
