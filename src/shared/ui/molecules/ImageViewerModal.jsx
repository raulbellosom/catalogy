import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
} from "motion/react";
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  Loader2,
  Maximize2,
  Minimize2,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";

/**
 * A fullscreen image viewer modal with zoom, pan, rotate and mobile gestures support.
 * Refactored to use MotionValues for high-performance 60fps animations.
 */
export function ImageViewerModal({
  isOpen,
  onClose,
  src,
  images = [],
  initialIndex = 0,
  alt = "Image",
  showDownload = true,
  downloadFilename,
}) {
  const imageList = React.useMemo(() => {
    if (images && images.length > 0) return images;
    return src ? [src] : [];
  }, [images, src]);

  const isGalleryMode = imageList.length > 1;

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [scaleDisplay, setScaleDisplay] = useState(1); // Only for UI display

  // Motion Values for performant animations without re-renders
  const scaleMv = useMotionValue(1);
  const rotateMv = useMotionValue(0);
  const xMv = useMotionValue(0);
  const yMv = useMotionValue(0);

  // Refs for gesture tracking
  const stateRef = useRef({
    isDragging: false,
    lastTouch: { x: 0, y: 0 },
    touchStartDist: null,
    initialPinchScale: 1,
  });

  const containerRef = useRef(null);
  const imageRef = useRef(null);

  // Sync index when initialIndex changes
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
    }
  }, [initialIndex, isOpen]);

  // Reset view when image changes or modal opens
  useEffect(() => {
    scaleMv.set(1);
    rotateMv.set(0);
    xMv.set(0);
    yMv.set(0);
    setScaleDisplay(1);
    setLoading(!!(imageList[currentIndex] || src));

    stateRef.current = {
      isDragging: false,
      lastTouch: { x: 0, y: 0 },
      touchStartDist: null,
      initialPinchScale: 1,
    };
  }, [currentIndex, isOpen, src, imageList, scaleMv, rotateMv, xMv, yMv]);

  // Lock body scroll
  useEffect(() => {
    if (!isOpen) return;
    const scrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.touchAction = "none";

    return () => {
      const savedScrollY = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.touchAction = "";
      if (savedScrollY) {
        window.scrollTo(0, parseInt(savedScrollY || "0") * -1);
      }
    };
  }, [isOpen]);

  const nextImage = useCallback(() => {
    if (!isGalleryMode) return;
    setCurrentIndex((prev) => (prev + 1) % imageList.length);
  }, [isGalleryMode, imageList.length]);

  const prevImage = useCallback(() => {
    if (!isGalleryMode) return;
    setCurrentIndex((prev) => (prev - 1 + imageList.length) % imageList.length);
  }, [isGalleryMode, imageList.length]);

  const updateScale = useCallback(
    (newScale) => {
      const clamped = Math.min(5, Math.max(0.5, newScale));
      scaleMv.set(clamped);
      setScaleDisplay(clamped); // Update UI
    },
    [scaleMv],
  );

  const handleWheel = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      const currentScale = scaleMv.get();
      // Regular wheel or pinch-to-zoom on trackpad
      const delta = e.ctrlKey ? -e.deltaY * 0.01 : -e.deltaY * 0.002;
      updateScale(currentScale + delta);
    },
    [scaleMv, updateScale],
  );

  const handleTouchStart = useCallback(
    (e) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY,
        );
        stateRef.current.touchStartDist = dist;
        stateRef.current.initialPinchScale = scaleMv.get();
      } else if (e.touches.length === 1) {
        stateRef.current.lastTouch = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        };
        if (scaleMv.get() > 1) {
          stateRef.current.isDragging = true;
        }
      }
    },
    [scaleMv],
  );

  const handleTouchMove = useCallback(
    (e) => {
      const isDragging = stateRef.current.isDragging;
      const touchStartDist = stateRef.current.touchStartDist;

      if (e.touches.length === 2 && touchStartDist) {
        e.preventDefault();
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY,
        );
        const scaleFactor = dist / touchStartDist;
        updateScale(stateRef.current.initialPinchScale * scaleFactor);
      } else if (e.touches.length === 1 && isDragging) {
        e.preventDefault();
        // Calculate delta
        const deltaX = e.touches[0].clientX - stateRef.current.lastTouch.x;
        const deltaY = e.touches[0].clientY - stateRef.current.lastTouch.y;

        // Apply immediately to motion values
        xMv.set(xMv.get() + deltaX);
        yMv.set(yMv.get() + deltaY);

        stateRef.current.lastTouch = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        };
      }
    },
    [xMv, yMv, updateScale],
  );

  const handleTouchEnd = useCallback(() => {
    stateRef.current.touchStartDist = null;
    stateRef.current.isDragging = false;
  }, []);

  const combinedContainerRef = useCallback(
    (node) => {
      if (containerRef.current) {
        containerRef.current.removeEventListener("wheel", handleWheel);
        containerRef.current.removeEventListener(
          "touchstart",
          handleTouchStart,
        );
        containerRef.current.removeEventListener("touchmove", handleTouchMove);
        containerRef.current.removeEventListener("touchend", handleTouchEnd);
      }
      containerRef.current = node;
      if (node) {
        node.style.touchAction = "none";
        node.addEventListener("wheel", handleWheel, { passive: false });
        node.addEventListener("touchstart", handleTouchStart, {
          passive: false,
        });
        node.addEventListener("touchmove", handleTouchMove, { passive: false });
        node.addEventListener("touchend", handleTouchEnd, { passive: false });
      }
    },
    [handleWheel, handleTouchStart, handleTouchMove, handleTouchEnd],
  );

  const handleMouseDown = useCallback(
    (e) => {
      if (scaleMv.get() > 1) {
        e.preventDefault();
        stateRef.current.lastTouch = { x: e.clientX, y: e.clientY };
        stateRef.current.isDragging = true;
        // Optional: change cursor
        if (containerRef.current)
          containerRef.current.style.cursor = "grabbing";
      }
    },
    [scaleMv],
  );

  const handleMouseMove = useCallback(
    (e) => {
      if (stateRef.current.isDragging && scaleMv.get() > 1) {
        const deltaX = e.clientX - stateRef.current.lastTouch.x;
        const deltaY = e.clientY - stateRef.current.lastTouch.y;

        xMv.set(xMv.get() + deltaX);
        yMv.set(yMv.get() + deltaY);

        stateRef.current.lastTouch = { x: e.clientX, y: e.clientY };
      }
    },
    [scaleMv, xMv, yMv],
  );

  const handleMouseUp = useCallback(() => {
    stateRef.current.isDragging = false;
    if (containerRef.current && scaleMv.get() > 1) {
      containerRef.current.style.cursor = "grab";
    }
  }, [scaleMv]);

  const resetView = useCallback(() => {
    scaleMv.set(1);
    rotateMv.set(0);
    xMv.set(0);
    yMv.set(0);
    setScaleDisplay(1);
  }, [scaleMv, rotateMv, xMv, yMv]);

  const handleClose = useCallback(() => {
    resetView();
    onClose();
  }, [onClose, resetView]);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error(`Fullscreen error: ${err}`);
    }
  }, []);

  const handleDownload = useCallback(
    (e) => {
      e.stopPropagation();
      const currentUrl = imageList[currentIndex] || src;
      if (!currentUrl) return;
      const link = document.createElement("a");
      link.href = currentUrl;
      link.download = downloadFilename || `image-${Date.now()}.jpg`;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    [currentIndex, imageList, src, downloadFilename],
  );

  // Double tap/click
  const lastTapRef = useRef(0);
  const handleDoubleTap = useCallback(
    (e) => {
      const now = Date.now();
      const isDouble = e.type === "dblclick" || now - lastTapRef.current < 300;
      if (e.type === "dblclick") e.preventDefault();

      if (isDouble) {
        if (scaleMv.get() > 1) {
          resetView();
        } else {
          updateScale(2.5);
        }
      }
      lastTapRef.current = now;
    },
    [scaleMv, resetView, updateScale],
  );

  useEffect(() => {
    const handleKey = (e) => {
      if (!isOpen) return;
      if (e.key === "Escape") handleClose();
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "ArrowRight") nextImage();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, handleClose, prevImage, nextImage]);

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence mode="wait">
      <motion.div
        key="image-viewer-root"
        className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden touch-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div
          className="absolute inset-0 bg-black/80 backdrop-blur-2xl"
          onClick={handleClose}
        />

        {/* UI Controls */}
        <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 sm:p-6 z-10 text-white">
          {/* Header */}
          <div className="flex justify-between items-center pointer-events-auto">
            {isGalleryMode && (
              <div className="bg-black/30 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-medium border border-white/10">
                {currentIndex + 1} / {imageList.length}
              </div>
            )}
            {!isGalleryMode && <div />}
            <button
              onClick={handleClose}
              className="p-2.5 bg-white/10 hover:bg-white/20 rounded-full transition-colors border border-white/10"
            >
              <X size={24} />
            </button>
          </div>

          {/* Navigation */}
          {isGalleryMode && (
            <div className="flex-1 flex items-center justify-between pointer-events-none px-4 sm:px-8">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
                className="pointer-events-auto p-3 bg-black/30 hover:bg-black/50 rounded-full transition-all border border-white/10 -ml-2"
              >
                <ChevronLeft size={28} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                className="pointer-events-auto p-3 bg-black/30 hover:bg-black/50 rounded-full transition-all border border-white/10 -mr-2"
              >
                <ChevronRight size={28} />
              </button>
            </div>
          )}

          {/* Toolbar */}
          <div className="flex flex-col items-center gap-3 pointer-events-auto">
            {isGalleryMode && (
              <div className="flex items-center gap-2 bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-2 max-w-full overflow-x-auto no-scrollbar">
                {imageList.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentIndex(idx);
                    }}
                    className={cn(
                      "relative w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden shrink-0 transition-all duration-200",
                      "ring-2 ring-offset-1 ring-offset-black/50",
                      currentIndex === idx
                        ? "ring-white scale-105"
                        : "ring-transparent hover:ring-white/50 opacity-60 hover:opacity-100",
                    )}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-center gap-1 bg-black/50 backdrop-blur-xl border border-white/10 rounded-full p-1.5 sm:p-2 shadow-2xl overflow-x-auto max-w-full">
              <ToolButton
                icon={ZoomOut}
                onClick={() => updateScale(scaleMv.get() - 0.25)}
                label="Zoom Out"
              />
              <div className="px-2 sm:px-3 min-w-[50px] text-center font-mono text-xs sm:text-sm font-medium text-white/90">
                {Math.round(scaleDisplay * 100)}%
              </div>
              <ToolButton
                icon={ZoomIn}
                onClick={() => updateScale(scaleMv.get() + 0.25)}
                label="Zoom In"
              />
              <div className="w-px h-5 sm:h-6 bg-white/10 mx-1 sm:mx-2" />
              <ToolButton
                icon={RotateCw}
                onClick={() => rotateMv.set(rotateMv.get() + 90)}
                label="Rotate"
              />
              <ToolButton icon={RotateCcw} onClick={resetView} label="Reset" />
              <ToolButton
                icon={isFullscreen ? Minimize2 : Maximize2}
                onClick={toggleFullscreen}
                label="Full"
              />
              {showDownload && (
                <>
                  <div className="w-px h-5 sm:h-6 bg-white/10 mx-1 sm:mx-2" />
                  <ToolButton
                    icon={Download}
                    onClick={handleDownload}
                    label="Download"
                  />
                </>
              )}
            </div>
          </div>
        </div>

        {/* Image Container */}
        <div
          ref={combinedContainerRef}
          className="absolute inset-0 flex items-center justify-center p-4 pb-36 sm:p-12 sm:pb-40 pointer-events-auto select-none touch-none cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onDoubleClick={handleDoubleTap}
        >
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <Loader2 size={48} className="animate-spin text-white/30" />
            </div>
          )}

          {imageList[currentIndex] || src ? (
            <motion.img
              ref={imageRef}
              src={imageList[currentIndex] || src}
              alt={alt}
              style={{
                scale: scaleMv,
                rotate: rotateMv,
                x: xMv,
                y: yMv,
                opacity: loading ? 0 : 1,
              }}
              className="max-w-full max-h-full object-contain shadow-2xl rounded-sm transition-opacity duration-300"
              draggable={false}
              onLoad={() => setLoading(false)}
              onError={() => setLoading(false)}
            />
          ) : (
            !loading && (
              <div className="text-white/50 flex flex-col items-center gap-2">
                <Maximize2 size={48} className="opacity-50" />
                <p>No Image Available</p>
              </div>
            )
          )}
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
}

function ToolButton({ icon: Icon, onClick, label, className }) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={cn(
        "p-2 sm:p-2.5 rounded-full transition-all duration-200 group active:scale-95",
        "text-zinc-300 hover:text-white hover:bg-white/10",
        className,
      )}
      title={label}
    >
      <Icon
        size={18}
        className="sm:w-5 sm:h-5 transition-transform group-hover:scale-110"
      />
    </button>
  );
}

export default ImageViewerModal;
