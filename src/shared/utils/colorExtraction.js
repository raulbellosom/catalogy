/**
 * Converts a hex color to RGB values
 * @param {string} hex - Hex color string (e.g., "#ff0000" or "ff0000")
 * @returns {{r: number, g: number, b: number}} RGB values
 */
export function hexToRgb(hex) {
  const cleanHex = hex.replace("#", "");
  const bigint = parseInt(cleanHex, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
}

/**
 * Calculates the relative luminance of a color
 * Based on WCAG 2.1 formula: https://www.w3.org/WAI/GL/wiki/Relative_luminance
 * @param {string} hex - Hex color string
 * @returns {number} Luminance value between 0 (darkest) and 1 (lightest)
 */
export function getLuminance(hex) {
  const { r, g, b } = hexToRgb(hex);

  // Convert RGB to sRGB
  const srgb = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });

  // Calculate luminance
  return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
}

/**
 * Calculates the contrast ratio between two colors
 * Based on WCAG 2.1: https://www.w3.org/WAI/GL/wiki/Contrast_ratio
 * @param {string} hex1 - First hex color
 * @param {string} hex2 - Second hex color
 * @returns {number} Contrast ratio (1 to 21)
 */
export function getContrastRatio(hex1, hex2) {
  const l1 = getLuminance(hex1);
  const l2 = getLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Determines if a color is considered "dark" based on its luminance
 * @param {string} hex - Hex color string
 * @param {number} threshold - Luminance threshold (default: 0.5)
 * @returns {boolean} True if the color is dark
 */
export function isColorDark(hex) {
  return getLuminance(hex) < 0.5;
}

/**
 * Gets the appropriate contrasting text color (black or white) for a background
 * @param {string} bgHex - Background hex color
 * @returns {string} "#ffffff" for dark backgrounds, "#000000" for light backgrounds
 */
export function getContrastingTextColor(bgHex) {
  return isColorDark(bgHex) ? "#ffffff" : "#000000";
}

/**
 * Checks if the contrast ratio meets WCAG AA standards
 * @param {string} textHex - Text color hex
 * @param {string} bgHex - Background color hex
 * @param {boolean} isLargeText - Whether it's large text (14pt bold or 18pt+)
 * @returns {boolean} True if contrast meets AA standards
 */
export function meetsContrastAA(textHex, bgHex, isLargeText = false) {
  const ratio = getContrastRatio(textHex, bgHex);
  return isLargeText ? ratio >= 3 : ratio >= 4.5;
}

/**
 * Extracts dominant colors from an image file using an off-screen canvas
 * @param {File} file - The image file to process
 * @param {number} maxColors - Maximum number of colors to extract (default: 5)
 * @returns {Promise<string[]>} Array of hex color strings
 */
export async function extractColorsFromImage(file, maxColors = 5) {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve([]);
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      try {
        // Create canvas
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // Resize for performance (max 200px)
        const scale = Math.min(1, 200 / Math.max(img.width, img.height));
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Get pixel data
        const imageData = ctx.getImageData(
          0,
          0,
          canvas.width,
          canvas.height,
        ).data;
        const pixelCount = canvas.width * canvas.height;
        const colorMap = {};

        // Sample pixels (step by 4 to skip alpha, and step by larger amount for speed)
        // We step by 20 pixels (4 * 5) for performance
        for (let i = 0; i < imageData.length; i += 20) {
          const r = imageData[i];
          const g = imageData[i + 1];
          const b = imageData[i + 2];
          const a = imageData[i + 3];

          // Skip transparent or very white/black pixels
          if (a < 128) continue;
          if (r > 240 && g > 240 && b > 240) continue; // Skip white
          if (r < 15 && g < 15 && b < 15) continue; // Skip black

          // Quantize colors (round to nearest 10) to group similar shades
          const qr = Math.round(r / 10) * 10;
          const qg = Math.round(g / 10) * 10;
          const qb = Math.round(b / 10) * 10;

          const rgb = `${qr},${qg},${qb}`;
          colorMap[rgb] = (colorMap[rgb] || 0) + 1;
        }

        // Sort by frequency
        const sortedColors = Object.entries(colorMap)
          .sort((a, b) => b[1] - a[1])
          .map(([rgb]) => {
            const [r, g, b] = rgb.split(",").map(Number);
            return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
          })
          .slice(0, maxColors);

        URL.revokeObjectURL(objectUrl);
        resolve(sortedColors);
      } catch (error) {
        console.error("Error extracting colors:", error);
        URL.revokeObjectURL(objectUrl);
        resolve([]);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load image for color extraction"));
    };

    img.src = objectUrl;
  });
}
